import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Lugar } from '../interfaces/lugar';
import { HttpClient } from '@angular/common/http';
import { WebsocketService } from '../services/websocket.service';

@Component({
  selector: 'app-mapa',
  templateUrl: './mapa.component.html',
  styleUrls: ['./mapa.component.css']
})
export class MapaComponent implements OnInit {

  //Referencia a codigo HTML
  @ViewChild('map') mapaElement: ElementRef;

  //Definicion de una propiedad con el tipo de la api de google. para esto instalé @types/googlemaps --save-dev
  map: google.maps.Map;

  //PAra tener referencia a cada uno de los marcadores
  marcadores: google.maps.Marker[] = [];

  //Arreglo de todos los infowindows para tener sus referencias y poder cerrarlos de forma dinamica
  infoWindows: google.maps.InfoWindow[] = [];

  lugares: Lugar[] = [];

  constructor(
    private _http: HttpClient,
    public _wsService: WebsocketService
  ) { }

  ngOnInit() {

    this.getData()

    this.escucharSockets();
  }

  //Todas las funciones del ngOnInit() se ejecutan muy rapido y como getData() tarda un poco, la funcion cargarMapa() ya se ejecutaba y no me mostraba los marcadores en el mapa. por eso quité cargarMapa() del ngOnInit y lo coloqué en getData().
  getData() {
    this._http.get('http://localhost:5000/mapa').subscribe((lugares: Lugar[]) => {
      this.lugares = lugares;
      this.cargarMapa();
    });
  }

  escucharSockets() {

    //MArcador NUEVO
    this._wsService.listen('marcador-nuevo').subscribe((marcador: Lugar) => {
      this.agregarMarcador(marcador);
    });


    //MARCADOR BORRAR
    this._wsService.listen('borrar-marcador').subscribe((id: string) => {

      //Recorro mi arreglo para buscar un marcador
      for (const i in this.marcadores) {

        //el que coincida con el id, le mando null. esto no lo borra del arreglo pero podemos dejarlo asi!
        if (this.marcadores[i].getTitle() === id) {

          this.marcadores[i].setMap(null);
          break;
        }
      }
    });

    //MARCADOR MOVER
    this._wsService.listen('mover-marcador').subscribe((marcador: Lugar) => {
      for (const i in this.marcadores) {
        if (this.marcadores[i].getTitle() === marcador.id) {

          //Si la considicion se cumple, obtengo una nueva posicion basada en el API de google con la latitud y longitud del marcador
          const latLng = new google.maps.LatLng(marcador.lat, marcador.lng);
          //al marcador en la pocision que coincida le mando esas nuevas latitudes y longitudes
          this.marcadores[i].setPosition(latLng);
          break;
        }
      }
    });
  }

  cargarMapa() {

    //Estas latitudes y longitudes son de una ubicacion en estados unidos, pude haberle mandado cualquier otras.
    const latLng = new google.maps.LatLng(37.784679, -122.395936);

    //Opciones para mostrar el mapa que me ofrece google
    const mapaOpciones: google.maps.MapOptions = {
      center: latLng,
      zoom: 13,
      mapTypeId: google.maps.MapTypeId.ROADMAP
    }

    //Le estoy mandando un elemento HTML donde colocará el mapa
    this.map = new google.maps.Map(this.mapaElement.nativeElement, mapaOpciones);

    //para crear nuevos marcadores en el mapa
    //con addListener escucho el mismo mapa
    this.map.addListener('click', (coors) => {

      //Este es el event que se va a disparar cada vez que yo haga click
      const nuevoMarcador: Lugar = {
        nombre: 'Nuevo Lugar',
        lat: coors.latLng.lat(),
        lng: coors.latLng.lng(),
        id: new Date().toISOString() //Para generar un id identificador del marcador
      };

      this.agregarMarcador(nuevoMarcador);

      //Emitir evento de Sockek, AGREGAR marcador

      this._wsService.emit('marcador-nuevo', nuevoMarcador);
    });

    //Recorro el arreglo de objetos y por cada uno lo mando a la funcion de agregar marcadr
    for (const lugar of this.lugares) {
      this.agregarMarcador(lugar)
    }
  }

  agregarMarcador(marcador: Lugar) {

    //Creo la latitud y longitud
    const latLng = new google.maps.LatLng(marcador.lat, marcador.lng);

    //Creo mi marcador...
    //aqui le agrego el id del marcador que trae desde el backend. como la propiedad ID no existe en google.maps.Marker() yo agrego el ID en otra propiedad. en este caso lo agrego en title
    //Necesitamos tener la referencia a este marcador, para hacerle modificaciones o borrarlo
    const marker = new google.maps.Marker({
      map: this.map,
      animation: google.maps.Animation.DROP,
      position: latLng,
      draggable: true,
      title: marcador.id
    });

    this.marcadores.push(marker);

    //Mostrar pantalla de informacion
    const contenido = `<b>${marcador.nombre}</b>`;
    const infoWindow = new google.maps.InfoWindow({
      content: contenido
    });

    //Insertamos el inforwindow en el arreglo de infowindows
    this.infoWindows.push(infoWindow);

    //para mostrar la INFOWINDOWS
    google.maps.event.addDomListener(marker, 'click', () => {

      //Recorro mi arreglo de infoWindows y por cada uno de ellos llamo a la funcion CLOSE()
      this.infoWindows.forEach(infoW => infoW.close())
      //para abrir el infowindow le mando como parametro el mapa y el infowindows que necesito abrir
      infoWindow.open(this.map, marker);
    });

    //escuchar cuando se haga doble click a un marcador
    google.maps.event.addDomListener(marker, 'dblclick', (coors) => {

      //De esta forma puedo borrar el marcador
      marker.setMap(null);


      //Disparar evento de socket para BORRAR el marcador
      this._wsService.emit('borrar-marcador', marcador.id);
    });

    //con addDomListener escucho dentro del mapa
    google.maps.event.addDomListener(marker, 'drag', (coors) => {

      //para conseguir la ubicacion una vez que lo haya movido
      const nuevoMarcador = {
        lat: coors.latLng.lat(),
        lng: coors.latLng.lng(),
        nombre: marcador.nombre,
        id: marker.getTitle()//Para obtener el id del marcador que estoy moviendo. puedo obtenerlo tambien de marcador.id pero lo dejare de esta forma
      }

      //Disparar evento de socket para MOVER el marcador

      this._wsService.emit('mover-marcador', nuevoMarcador);
    });
  }

}
