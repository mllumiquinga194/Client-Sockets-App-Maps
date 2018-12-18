import { Injectable } from '@angular/core';
import { Socket } from 'ngx-socket-io';

@Injectable({
  providedIn: 'root'
})
export class WebsocketService {

  public socketStatus = false;

  constructor(
    private socket: Socket
  ) {
    this.ckeckStatus();
  }

  ckeckStatus() {

    this.socket.on('connect', () => {
      this.socketStatus = true;
    });

    this.socket.on('disconnect', () => {
      this.socketStatus = false;

    });
  }

  // EMITIR
  // este metodo se va a encargar de emitir todo
  // event: Lo que uiqero emitir
  // payload: la informacion que quiero enviar
  // callback: la funcion que yo quiero ejecutar despues que se realice este trabajo!
  emit(event: string, payload?: any, callback?: Function) {

    this.socket.emit(event, payload, callback);
  }

  // ESCUCHAR
  // Responsable de escuchar cualquier evento que emita el servidor
  // recibe un string desde el servidor y con fromEvent() retorno un observable. en este caso solo lo estams definiendo.
  // esto lo sigue escuchando en ChatService.getMessages
  listen(event: string) {
    return this.socket.fromEvent(event);
  }

}
