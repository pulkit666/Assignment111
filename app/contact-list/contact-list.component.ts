import { Component, OnInit, ViewChild } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { NgForm } from '@angular/forms';
import { ChangeDetectorRef } from "@angular/core";

@Component({
  selector: 'app-contact-list',
  templateUrl: './contact-list.component.html',
  styleUrls: ['./contact-list.component.css']
})
export class ContactListComponent implements OnInit {

  firstName = "";
  lastName = "";
  number = null;
  group = "";
  label = "Add Contact"
  id = 0;

  @ViewChild('myform', { static: false }) formValues;

  constructor(private cd: ChangeDetectorRef, private http: HttpClient) { }

  transform(collection: Array<any>, property: string): Array<any> {
    // prevents the application from breaking if the array of objects doesn't exist yet
    if (!collection) {
      return null;
    }

    const groupedCollection = collection.reduce((previous, current) => {
      if (!previous[current[property]]) {
        previous[current[property]] = [current];
      } else {
        previous[current[property]].push(current);
      }

      return previous;
    }, {});

    // this will return an array of objects, each object containing a group of objects
    return Object.keys(groupedCollection).map(key => ({ key, value: groupedCollection[key] }));
  }

  async ngOnInit() {
    const data = await this.getContacts().then(data => {
      console.log(data);
      this.contacts = data;
    });
    console.log(this.contacts);
    this.transformedData = await this.transform(this.contacts, 'group');
    console.log(this.transformedData[0].value);
  }

  apiUrl = 'http://localhost:3000';
  contacts: any;
  transformedData = [];

  async getContacts() {
    return await this.http.get(this.apiUrl + '/results').toPromise();
  }

  async delete(id: number) {
    console.log(id);
    await this.http.delete(this.apiUrl + '/results/' + id).toPromise();
    this.ngOnInit();
    this.cd.markForCheck();
    location.reload();
  }
  update(id: number) {
    this.id = id;
    this.label = "Update Contact";
    var result = this.contacts.filter(contact => {
      return contact.id === id
    })
    console.log(result);
    this.firstName = result[0].firstName;
    this.lastName = result[0].lastName;
    this.number = result[0].number;
    this.group = result[0].group;
    console.log(this.firstName);
  }
  public trackItem(index: number, item: any) {
    return item.trackId;
  }

  async addContact(form: NgForm) {
    console.log('clicked');
    if (this.label === "Add Contact") {
      this.http.post(this.apiUrl + '/results', form.value).subscribe(data => {
        console.log('Successfully posted');
      });
    }
    else {
      this.http.put(this.apiUrl + '/results/'+this.id, form.value).subscribe(data => {
        console.log('Successfully updated');
      });
    }
    this.formValues.resetForm();
    this.ngOnInit();
    this.cd.markForCheck();
    location.reload();
  }

}
