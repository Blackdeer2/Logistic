import { LightningElement, api, track } from 'lwc';
import listOrdersByClientID from '@salesforce/apex/OrderService.listOrdersByClientID';

export default class ListOfOrder extends LightningElement {
    @api clientId;
    @track orders = [];
    error;
    columns = [
        { label: 'Order Name', fieldName: 'Name' },
        { label: 'Cargo', fieldName: 'Cargo__c' },
        { label: 'Pick Up Location', fieldName: 'Pick_Up_Location__c' },
        { label: 'Delivery Location', fieldName: 'Delivery_Location__c' },
        { label: 'Start Delivery Date', fieldName: 'Start_Delivery_Date__c', type: 'date' },
        { label: 'End Delivery Date', fieldName: 'End_Delivery_Date__c', type: 'date' },
        { label: 'Status', fieldName: 'Statud__c' }
    ];

    get isClientIdAvailable() {
        return this.clientId && typeof this.clientId === 'string';
    }
    
    connectedCallback() {
        if (this.isClientIdAvailable) {
            this.loadOrders();
            console.log('Orders loaded');
            
        }
    }

    loadOrders() {
        if (!this.clientId || typeof this.clientId !== 'string') {
            this.error = 'Invalid client ID: Expected a non-empty string';
            return;
        }
    
        listOrdersByClientID({ clientId: this.clientId })
            .then(result => {
                if (result && result.length > 0) {
                    this.orders = result;
                    this.error = undefined;
                } else {
                    this.orders = [];
                    this.error = 'No orders found for this client.';
                }
            })
            .catch(error => {
                // Перевіряємо, чи має об'єкт error властивість body
                if (error && error.body && error.body.message) {
                    this.error = error.body.message;
                } else if (error && error.message) {
                    this.error = error.message; // Якщо немає body, то використовуємо іншу властивість
                } else {
                    this.error = 'An unknown error occurred';
                }
                this.orders = [];
            });
    }
    
}