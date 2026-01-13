import { Component, inject, OnInit, signal } from '@angular/core';

import { Place } from '../place.model';
import { PlacesComponent } from '../places.component';
import { PlacesContainerComponent } from '../places-container/places-container.component';
import { HttpClient } from '@angular/common/http';
import { catchError, map, throwError } from 'rxjs';
import { PlacesService } from '../places.service';

@Component({
  selector: 'app-available-places',
  standalone: true,
  templateUrl: './available-places.component.html',
  styleUrl: './available-places.component.css',
  imports: [PlacesComponent, PlacesContainerComponent],
})
export class AvailablePlacesComponent implements OnInit {
  places = signal<Place[] | undefined>(undefined);
  error= signal ('')

  private placesService = inject(PlacesService);
  private http = inject(HttpClient);

  isLoading=signal(false);

  ngOnInit(){
    this.isLoading.set(true);
    const   subscription = 
    this.placesService.loadAvailablePlaces().subscribe({
      next:(places)=> {
        this.places.set(places);
      },
      error:(error) =>{
        this.error.set('Something went wrong')
      },
      complete: () => {
        this.isLoading.set(false);
      },
    });
  }
  onSelectPlace(selectedPlace:Place){
    this.http.put('http://localhost:3000/user-places', {
      placeId: selectedPlace.id
    }).subscribe({
      next:(res: any)=>console.log(res)
      

    });
  }

}
