import { LightningElement, track } from 'lwc';
import createClient from '@salesforce/apex/ClientService.createClient';

export default class CreateOrderPage extends LightningElement {

    clientInfoList = []; // Store all client info here

    clientName = '';
    contactName = '';
    contactPhone = '';
    contactEmail = '';

    cargoName = '';
    cargoWeight = '';
    cargoVolume = '';
    @track cargoPreferences = {
        liquid: false,
        explosive: false,
        perishable: false
    };

    orderName = '';
    orderStartDate = '';
    orderEndDate = '';
    orderPickUpLocation = '';
    orderDeliveryLocation = '';

    handleClientNameChange(event) {
        this.clientName = event.target.value;
    }

    handleContactNameChange(event) {
        this.contactName = event.target.value;
    }

    handleContactPhoneChange(event) {
        this.contactPhone = event.target.value;
    }

    handleContactEmailChange(event) {
        this.contactEmail = event.target.value;
    }

    handleCargoNameChange(event) {
        this.cargoName = event.target.value;
    }

    handleCargoWeightChange(event) {
        this.cargoWeight = event.target.value;
    }

    handleCargoVolumeChange(event) {
        this.cargoVolume = event.target.value;
    }

    handleOrderNameChange(event) {
        this.orderName = event.target.value;
    }

    handleOrderStartDateChange(event) {
        this.orderStartDate = event.target.value;
    }

    handleOrderEndDateChange(event) {
        this.orderEndDate = event.target.value;
    }

    handleOrderPickUpLocationChange(event) {
        this.orderPickUpLocation = event.target.value;
    }

    handleOrderDeliveryLocationChange(event) {
        this.orderDeliveryLocation = event.target.value;
    }

    handleCheckboxChange(event) {
        const field = event.target.dataset.id;
        this.cargoPreferences[field] = event.target.checked;
    }

    async submit() {
       const newClient = {
            clientName: this.clientName,
            contactName: this.contactName,
            contactPhone: this.contactPhone,
            contactEmail: this.contactEmail
        };
        this.clientInfoList.push(newClient); // Add the new client to the list
        console.log("Client name: ", newClient.clientName);
        // Call the Apex method with the list of clients
        createClient({ clientInfoList: this.clientInfoList })
            .then(clientIds => {
                console.log("Clients created with IDs: ", clientIds);
            })
            .catch(error => {
                console.error("Error creating clients: ", error);
            });
    }
}