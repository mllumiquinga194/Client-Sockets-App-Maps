import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { SocketIoModule, SocketIoConfig } from 'ngx-socket-io';
import { HttpClientModule } from '@angular/common/http';

const config: SocketIoConfig = { url: 'http://localhost:5000', options: {} };

import { ChartsModule } from 'ng2-charts';

import { AppComponent } from './app.component';
import { GraficaComponent } from './components/grafica/grafica.component';
import { MapaComponent } from './mapa/mapa.component';

@NgModule({
  declarations: [
    AppComponent,
    GraficaComponent,
    MapaComponent
  ],
  imports: [
    BrowserModule,
    SocketIoModule.forRoot(config),
    HttpClientModule,
    ChartsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
