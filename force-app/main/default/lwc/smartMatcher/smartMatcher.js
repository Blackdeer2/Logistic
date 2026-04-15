import { LightningElement, api, wire, track } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { getRecordNotifyChange } from 'lightning/uiRecordApi';
import getRecommendations from '@salesforce/apex/SmartMatcherService.getRecommendations';
import assignResources from '@salesforce/apex/SmartMatcherService.assignResources';

export default class SmartMatcher extends LightningElement {
    @api recordId;
    @track vehicles = [];
    @track drivers = [];
    @track error;
    
    isLoaded = false;
    selectedVehicleId;
    selectedDriverId;

    @wire(getRecommendations, { orderId: '$recordId' })
    wiredData({ error, data }) {
        if (data) {
            if (data.error) {
                this.error = data.error;
            } else {
                // Додаємо властивості для стилізації карток
                this.vehicles = data.vehicles.map(v => ({ ...v, selected: false, cssClass: 'card-option' }));
                this.drivers = data.drivers.map(d => ({ ...d, selected: false, cssClass: 'card-option' }));
            }
            this.isLoaded = true;
        } else if (error) {
            this.error = error.body ? error.body.message : 'Невідома помилка';
            this.isLoaded = true;
        }
    }

    get isDataReady() {
        return !this.error && this.isLoaded;
    }

    get isSaveDisabled() {
        return !this.selectedVehicleId || !this.selectedDriverId;
    }

    handleSelectVehicle(event) {
        this.selectedVehicleId = event.currentTarget.dataset.id;
        this.vehicles = this.vehicles.map(v => ({
            ...v,
            selected: v.Id === this.selectedVehicleId,
            cssClass: v.Id === this.selectedVehicleId ? 'card-option selected' : 'card-option'
        }));
    }

    handleSelectDriver(event) {
        this.selectedDriverId = event.currentTarget.dataset.id;
        this.drivers = this.drivers.map(d => ({
            ...d,
            selected: d.Id === this.selectedDriverId,
            cssClass: d.Id === this.selectedDriverId ? 'card-option selected' : 'card-option'
        }));
    }

    saveAssignment() {
        this.isLoaded = false; // Показуємо спінер

        assignResources({ 
            orderId: this.recordId, 
            vehicleId: this.selectedVehicleId, 
            driverId: this.selectedDriverId 
        })
        .then(() => {
            this.dispatchEvent(new ShowToastEvent({ title: 'Успіх', message: 'Ресурси призначено!', variant: 'success' }));
            // Оновлюємо стандартну сторінку, щоб зміни одразу відобразилися
            getRecordNotifyChange([{recordId: this.recordId}]);
            this.isLoaded = true;
        })
        .catch(error => {
            this.dispatchEvent(new ShowToastEvent({ title: 'Помилка', message: error.body.message, variant: 'error' }));
            this.isLoaded = true;
        });
    }
}