import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {AuthService} from './auth-service';
import {Observable} from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class MapService {

  url = 'http://localhost:8080/api/location/';

  private L: any;
  private map: any;
  private currentMarker: any;

  constructor(private http: HttpClient) { }

  async initLeaflet(): Promise<any> {
    if (!this.L) {
      const leaflet = await import('leaflet');
      this.L = leaflet;

      const DefaultIcon = this.L.icon({
        iconUrl: 'assets/leaflet/marker-icon.png',
        iconRetinaUrl: 'assets/leaflet/marker-icon-2x.png',
        shadowUrl: 'assets/leaflet/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
      });
      this.L.Marker.prototype.options.icon = DefaultIcon;
    }
    return this.L;
  }

  createMap(containerId: string, center: [number, number] = [40.4168, -3.7038], zoom: number = 6): any {
    this.map = this.L.map(containerId).setView(center, zoom);
    this.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(this.map);
    return this.map;
  }

  addMarker(lat: number, lng: number, popupText?: string): any {
    // Eliminar marcador anterior
    if (this.currentMarker) {
      this.map.removeLayer(this.currentMarker);
    }
    this.currentMarker = this.L.marker([lat, lng]).addTo(this.map);
    if (popupText) {
      this.currentMarker.bindPopup(popupText).openPopup();
    }
    return this.currentMarker;
  }

  getLocation(lat: number, lng: number): Observable<any> {
    return this.http.get<any[]>(`${this.url}?lat=${lat}&lng=${lng}`);
  }

  addEventMarkers(events: any[], onClick?: (event: any) => void) {
    events.forEach(event => {
      const marker = this.L.marker([event.latitude, event.longitude])
        .addTo(this.map)
        .bindPopup(`<b>${event.name}</b>`);

      if (onClick) {
        marker.on('click', () => onClick(event));
      }
    });
  }

  onMapClick(callback: (lat: number, lng: number) => void) {
    this.map.on('click', (e: any) => {
      const { lat, lng } = e.latlng;
      callback(lat, lng);
    });
  }


}
