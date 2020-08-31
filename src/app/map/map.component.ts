import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import * as L from 'leaflet';

// Angular Material
import { FlatTreeControl } from '@angular/cdk/tree';
import { MatTreeFlatDataSource, MatTreeFlattener } from '@angular/material/tree';

interface Node {
  name: string;
  children?: Node[];
  checked?: boolean;
}

interface FlatNode {
  expandable: boolean;
  check: boolean;
  name: string;
  level: number;
}

const cubes: Node[] = [
  {
    name: 'Cubes',
    children: [
      { name: 'MOD13Q1', checked: false }
    ]
  }
];

const collections: Node[] = [
  {
    name: 'Collections',
    children: [
      { name: 'Sentinel-1 DN', checked: false },
      { name: 'Landsat-8 SR', checked: false }
    ]
  }
];

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

  private _transformer = (node: Node, level: number) => {
    return {
      expandable: !!node.children && node.children.length > 0,
      check: !node.checked || node.checked,
      name: node.name,
      level: level,
    };
  }

  treeControl = new FlatTreeControl<FlatNode>(
    node => node.level,
    node => node.expandable
  );

  treeFlattener = new MatTreeFlattener(
      this._transformer,
      node => node.level,
      node => node.expandable,
      node => node.children
  );

  dataSourceCollections = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener);
  dataSourceCubes = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener);

  constructor() {
    this.dataSourceCollections.data = collections;
    this.dataSourceCubes.data = cubes;
  }

  hasChild = (_: number, node: FlatNode) => node.expandable;
  hasCheck = (_: number, node: FlatNode) => node.check;

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
    this.map.on('click', function(event){
      document.getElementById('latlng').innerHTML = (
        '<p class = "list-item-side-menu">Lat: ' + parseFloat(event.latlng.lat).toFixed(2) + '&nbsp;' +
        'Long: ' + parseFloat(event.latlng.lng).toFixed(2) + '</p>'
      );
    });
    console.log(this.getFeatureInfoUrl(
      'http://www.terrama2.dpi.inpe.br/chuva/geoserver/terrama2_10/wms?',
      this.map,
      this.overlayMaps.Estados,
      { lat: -17.308687886770024, lng: -58.03949792537339 }
    ));
    L.control.layers(this.basemaps, this.overlayMaps).addTo(this.map);
    this.basemaps.OSM.addTo(this.map);
  }

  getFeatureInfoUrl(url: string, map: any, tileLayer: any, latlng: any):  string {
    var point = map.latLngToContainerPoint(latlng, map.getZoom()),
        size = map.getSize(),
        params = {
          request: 'GetFeatureInfo',
          service: 'WMS',
          srs: 'EPSG:4326',
          styles: '',
          transparent: 'true',
          version: '1.1.0',
          format: 'text/javascript',
          bbox: '',
          height: size.y,
          width: size.x,
          layers: [tileLayer],
          query_layers: [tileLayer],
          info_format: 'text/html'
        };
    params[params.version === '1.3.0' ? 'i' : 'x'] = point.x;
    params[params.version === '1.3.0' ? 'j' : 'y'] = point.y;
    return url + L.Util.getParamString(params, url, true);
  }
}
