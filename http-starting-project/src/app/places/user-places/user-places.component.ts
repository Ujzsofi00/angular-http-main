import { PlacesService } from './../places.service';
import { PlacesContainerComponent } from '../places-container/places-container.component';
import { PlacesComponent } from '../places.component';
import { Component, inject, OnInit, signal } from '@angular/core';
import { Place } from '../place.model';
import { HttpClient } from '@angular/common/http';
import { catchError, map, throwError } from 'rxjs';


@Component({
  selector: 'app-user-places',
  standalone: true,
  templateUrl: './user-places.component.html',
  styleUrl: './user-places.component.css',
  imports: [PlacesContainerComponent, PlacesComponent],
})
export class UserPlacesComponent implements OnInit{
  places = signal<Place[] | undefined>(undefined);
  error = signal('');

  isLoading = signal(false);
  private http = inject(HttpClient);
  placesService: any;

  ngOnInit(): void {
    this.isLoading.set(true);
    this.http
      .get<{ places: Place[] }>('http://localhost:3000/user-places')
      .pipe(
        map((res) => res.places),
        catchError((error) =>
          throwError(() => new Error('Something went wrong'))
        )
      )

      .subscribe({
        next: (places) => {
          this.places.set(places);
          this.isLoading.set(false);
        },
        error: (error) => {
          console.log(error);

          this.error.set('Something went wrong fetching your fav places');
        },
      });
  }


  onRemovePlace(place: Place){
    const subscription = this.placesService.removeUserPlace(place).subscribe();
  }
}
