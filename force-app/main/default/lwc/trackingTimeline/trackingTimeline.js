import { LightningElement, api, wire } from 'lwc';
import getTrackingEvents from '@salesforce/apex/TrackingService.getTrackingEvents';

export default class TrackingTimeline extends LightningElement {
    @api recordId; // Це ID замовлення, він прийде автоматично, якщо додати компонент на сторінку замовлення

    @wire(getTrackingEvents, { orderId: '$recordId' })
    events;

    get hasEvents() {
        return this.events.data && this.events.data.length > 0;
    }
}