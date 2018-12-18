import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { WebsocketService } from 'src/app/services/websocket.service';

@Component({
  selector: 'app-grafica',
  templateUrl: './grafica.component.html',
  styleUrls: ['./grafica.component.css']
})
export class GraficaComponent implements OnInit {

  public barChartOptions: any = {
    scaleShowVerticalLines: false,
    responsive: true
  };

  public barChartLabels: Array<any> = ['Pregunta 1', 'Pregunta 2', 'Pregunta 3', 'Pregunta 4'];

  public barChartData: Array<any> = [
    { data: [65, 59, 80, 81], label: 'Entrevistados' }
  ];
  constructor(
    private _http: HttpClient,
    public _WsService: WebsocketService
  ) { }

  ngOnInit() {

    this.getData();
    this.escucharSocket();
  }

  getData() {

    this._http.get('http://localhost:5000/grafica').subscribe((data: any) => this.barChartData = data);
  }

  escucharSocket() {

    this._WsService.listen('cambio-grafica').subscribe((data: any) => this.barChartData = data)
  }

}
