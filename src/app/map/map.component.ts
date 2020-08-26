import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import * as L from 'leaflet';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class MapComponent implements OnInit {

  private map;
  private basemaps;
  private overlayMaps;
  opacity = 50;

  constructor() { }

  ngOnInit(): void {
    this.initLayers();
    this.initMap();
  }

  formatLabel(value: number) {
    return value + '%';
  }

  private initLayers(): void {
    this.basemaps = {
      OSM: L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
      }),
      Topography: L.tileLayer.wms('http://ows.mundialis.de/services/service?', {
        layers: 'TOPO-WMS'
      }),
      Places: L.tileLayer.wms('http://ows.mundialis.de/services/service?', {
        layers: 'OSM-Overlay-WMS'
      })
    };

    this.overlayMaps = {
      Estados: L.tileLayer.wms('http://www.terrama2.dpi.inpe.br/chuva/geoserver/terrama2_10/wms?', {
        layers: 'terrama2_10:view10',
        format: 'image/png',
        transparent: true,
        opacity: this.opacity / 100
      })
    };
  }

  private initMap(): void {
    this.map = L.map('map', {
      center: [-23.204792, -45.862681],
      zoom: 5
    });
    L.control.layers(this.basemaps, this.overlayMaps).addTo(this.map);
    this.basemaps.OSM.addTo(this.map);
  }
}
