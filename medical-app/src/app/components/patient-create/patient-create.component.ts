/**
 * Created by yana on 24.03.18.
 */
import {Component, OnInit, OnDestroy} from '@angular/core';
import {PatientService} from "../../services/patient.service";
import {Patient} from "../../domain/Patient";
import {ActivatedRoute, Router} from '@angular/router';
import {FormGroup, Validators, FormControl} from "@angular/forms";
import {PatientCreateInteractionService} from '../component-interaction-service/patient-create-interaction-service';
import {Subscription}   from 'rxjs/Subscription';
import {DatePipe} from "@angular/common";

@Component({
  selector: 'app-patient-create',
  templateUrl: './patient-create.component.html',
  styleUrls: ['./patient-create.component.css'],
  providers: [PatientCreateInteractionService]

})
export class PatientCreateComponent implements OnInit, OnDestroy {

  patient: Patient;
  edit: boolean;

  patientForm: FormGroup;
  subscription: Subscription;

  constructor(private route: ActivatedRoute,
              private router: Router,
              private patientService: PatientService,
              private patientCreateInteractionService: PatientCreateInteractionService) {

    this.subscribeOnControlActions();
    this.patientForm = this.buildFormGroup();
  }

  ngOnInit() {
    this.parseRoute();
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  private parseRoute() {
    this.subscription = this.route.params.subscribe(params => {
      let patientId: number = params['patientId'];
      if (patientId) {
        this.edit = true;
        this.loadPatientDetails(patientId);
      }
    });
  }


  private subscribeOnControlActions() {
    this.patientCreateInteractionService.onSavePatientClicked$.subscribe(
      () => {
        this.createAndSavePatient()
      });

  }

  private buildFormGroup(): FormGroup {

    return new FormGroup({
      firstName: new FormControl('', Validators.required),
      lastName: new FormControl('', Validators.required),
      birthDate: new FormControl('', Validators.required),
      sex: new FormControl('', Validators.required),
      country: new FormControl('', Validators.required),
      state: new FormControl('', Validators.required),
      address: new FormControl('', Validators.required)
    });
  }

  private async loadPatientDetails(patientId: number) {
    this.patient = await this.patientService.findById(patientId);

    this.patientForm.patchValue({
      firstName: this.patient.firstName,
      lastName: this.patient.lastName,
      birthDate: this.formatDate(this.patient.birthDate),
      sex: this.patient.sex,
      country: this.patient.country,
      state: this.patient.state,
      address: this.patient.address
    });

  }

  createAndSavePatient() {
    if (this.patientForm.valid) {

      if (!this.patient) {
        this.patient = new Patient();
      }

      this.patient.firstName = this.patientForm.controls['firstName'].value;
      this.patient.lastName = this.patientForm.controls['lastName'].value;
      this.patient.birthDate = this.patientForm.controls['birthDate'].value;
      this.patient.sex = this.patientForm.controls['sex'].value;
      this.patient.country = this.patientForm.controls['country'].value;
      this.patient.state = this.patientForm.controls['state'].value;
      this.patient.address = this.patientForm.controls['address'].value;

      if (this.edit) {
        this.updatePatient(this.patient);
      } else {
        this.saveNewPatient(this.patient);
      }
    }
  }

  private async saveNewPatient(patient: Patient) {
    this.patient = await this.patientService.savePatient(patient);
    this.router.navigate(['/patient/' + this.patient.id]);
  }

  private async updatePatient(patient: Patient) {
    this.patient = await this.patientService.updatePatient(patient);
    this.redirectToPatientPage(this.patient.id);
  }

  private redirectToPatientPage(patientId: number) {
    this.router.navigate(['/patient/' + patientId]);
  }

  private formatDate(date: Date): string {
    return new DatePipe(navigator.language)
      .transform(date, 'y-MM-dd');
  }


}

