import { ErrorService } from './../shared/error.service';
import { inject, Injectable, signal } from '@angular/core';

import { Place } from './place.model';
import { catchError, map, pipe, tap, throwError } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class PlacesService {

  private errorService = inject(ErrorService);

  private http = inject(HttpClient);

  private userPlaces = signal<Place[]>([]);

  loadedUserPlaces = this.userPlaces.asReadonly();
  httpClient: any;

  loadAvailablePlaces() {
    return this.fetchPlaces('http://localhost:3000/places', "Something went wrong.");  //231
  }

  loadUserPlaces() {
     return this.fetchPlaces('http://localhost:3000/places', "Something went wrong.")
     .pipe(tap({
      next: (userPlaces) =>this.userPlaces.set(userPlaces)
     }));
  }

  addPlaceToUserPlaces(place: Place) {

    //this.userPlaces.update(prevPlaces => [...prevPlaces, place])  //... --> csinál egy másolatot, de nem teszi tönkre az eredetit + frissíti magát a signalt.

    const prevPlaces = this.userPlaces();

    if(!prevPlaces.some((p) => p.id === place.id)) {
      this.userPlaces.set([...prevPlaces, place]);
    }

    return this.http.put('http://localhost:3000/user-places' , {
      placeId: place.id,
    })
    .pipe(
      catchError((error) => {
        this.userPlaces.set(prevPlaces);
        this.errorService.showError('Failed to store selected place.  ')
        return throwError(() => new Error('Failed to store selected place.'));
      })
    )
    
  }

  removeUserPlace(place: Place) {
    const prevPlaces = this.userPlaces();

    if(!prevPlaces.some((p) => p.id === place.id)) {
      this.userPlaces.set(prevPlaces.filter(p => p.id !== place.id));
    }
    return this.httpClient
    .delete('http://localhost:3000/user-places/' + place.id)
    .pipe(
      catchError((error) => {
        this.userPlaces.set(prevPlaces);
        this.errorService.showError('Failed to remove selected place.  ')
        return throwError(() => new Error('Failed to remove selected place.'));
      })
    )
  }

  private fetchPlaces(url: string, errorMessage: string){
    return this.http
          .get<{ places: Place[] }>(url)
          .pipe(
            map((res) => res.places),
            catchError((error) =>
              throwError(() => new Error(errorMessage))
            )
          )
  }
}
