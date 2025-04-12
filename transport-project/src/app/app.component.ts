import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import {
  FormArray,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { NgFor, NgIf, NgSwitch } from '@angular/common';
import { TripRoute } from './models/trip.model';
import { SnackBarService } from './services/snack-bar.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
    RouterOutlet,
    ReactiveFormsModule,
    NgFor,
    NgSwitch,
    NgIf,
    MatIconModule,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent implements OnInit {
  title = 'transport-project';
  tripForm!: FormGroup;
  designedTrips: TripRoute[] = [];
  regex: string = '^[A-Za-z]+$'; // for accepting letter only
  constructor(private formBuilder: FormBuilder, private snackBarService: SnackBarService
  ) {
    this.tripForm = this.formBuilder.group({
      trips: this.formBuilder.array([this.createTripFormGroup()]),
    });
  }

  createTripFormGroup(): FormGroup {
    return this.formBuilder.group({
      start: [
        '',
        [
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(3),
          Validators.pattern(this.regex),
        ],
      ],
      end: [
        '',
        [
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(3),
          Validators.pattern(this.regex),
        ],
      ],
    });
  }
  ngOnInit(): void {}

  // ======== It shows MatErrors on ui =========
  hasError(errorType: string, controlName: string, index: number): boolean {
    const tripsArray = this.tripForm.get('trips') as FormArray;
    const tripGroup = tripsArray.at(index) as FormGroup;
    const control = tripGroup.get(controlName);
    return !!(
      control &&
      control.hasError(errorType) &&
      (control.dirty || control.touched)
    );
  }

  // ======== For creating dynamically input boxes =========
  get trips(): FormArray {
    return this.tripForm.get('trips') as FormArray;
  }

  removeTrip(index: number) {
    this.trips.removeAt(index);
  }

  addTrip() {
    const lastTrip = this.trips.at(this.trips.length - 1);

    if (lastTrip && lastTrip.valid) {
      this.trips.push(this.createTripFormGroup());
    } else {
      lastTrip?.markAllAsTouched();
    }
  }

  submitTripForm(): void {
    if (this.tripForm.valid) {
      const tripData = this.tripForm.value.trips;
      this.designedTrips = this.calculateTripDesign(tripData);
      this.snackBarService.show('Start and end points saved successfully.');
    } else {
      this.snackBarService.show('Please fill in the start and end points.');
    }
  }


    // ======== calculate visually bars =========
  calculateTripDesign(trips: TripRoute[]): TripRoute[] {
    const result: TripRoute[] = [];

    for (let i = 0; i < trips.length; i++) {
      const current = trips[i];
      let type: 'Straight Line' | 'Arrow Line' = 'Straight Line'; 
      let level: 1 | 2 = 1; // Default to Level 1
      // continued' | 'not-continued' | 'same-location'
      if (current.start === current.end) {
        level = 2; 
        type = 'Straight Line'; 
      } else if (i > 0) {
        const prev = trips[i - 1];

        if (prev.end === current.start) {
          // If the current trip continues from the previous trip
          type = 'Straight Line'; // Continuing trip (Straight line)
          level = 1; // Level 1 as it's continued
        } else {
          // If there is no continuation (Arrow Line)
          type = 'Arrow Line';
          level = 1; // Level 1, disconnected trip
        }
      }

      result.push({
        start: current.start,
        end: current.end,
        type,
        level,
      });
    }

    return result;
  }

  // ======== Convert input value in Uppercase =========
  toUpperCase(event: Event, index: number) {
    const input = event.target as HTMLInputElement;
    const tripsArray = this.tripForm.get('trips') as FormArray;
    const tripGroup = tripsArray.at(index) as FormGroup;

    const controlName = input.getAttribute('formControlName');
    if (controlName) {
      tripGroup
        .get(controlName)
        ?.setValue(input.value.toUpperCase(), { emitEvent: false });
    }
  }
}
