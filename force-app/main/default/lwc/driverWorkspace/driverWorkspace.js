import { LightningElement, wire, track } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { refreshApex } from '@salesforce/apex';
import getActiveOrders from '@salesforce/apex/DriverWorkspaceService.getActiveOrders';
import createTrackingEvent from '@salesforce/apex/DriverWorkspaceService.createTrackingEvent'; 

export default class DriverWorkspace extends LightningElement {
    @track isTrackingModalOpen = false;
    @track selectedOrderId;
    @track trackingData = { location: '', type: '', comments: '' };

    wiredOrdersResult;

    // Тут ми для Label пишемо українську (що бачить водій), а для Value - точний API Name (для бази)
    trackingTypeOptions = [
        { label: 'Завантажено в авто', value: 'Loaded' },
        { label: 'Виїхав / В дорозі', value: 'In transit' },
        { label: 'Проходження митниці', value: 'Clearing customs' },
        { label: 'Прибув на склад (Чекаю розвантаження)', value: 'Arrived at warehouse' },
        { label: 'Успішно доставлено', value: 'Delivered' }
    ];

    @wire(getActiveOrders)
    wiredOrders(result) {
        this.wiredOrdersResult = result;
    }

    get orders() { return this.wiredOrdersResult?.data; }
    get isOrdersEmpty() { return this.orders && this.orders.length === 0; }

    handleOpenTrackingModal(event) {
        this.selectedOrderId = event.target.dataset.id;
        this.trackingData = { location: '', type: '', comments: '' };
        this.isTrackingModalOpen = true;
    }

    closeModals() {
        this.isTrackingModalOpen = false;
        this.selectedOrderId = null;
    }

    handleTrackingChange(event) {
        const field = event.target.dataset.field;
        this.trackingData[field] = event.target.value;
    }

    saveTrackingEvent() {
        if (!this.trackingData.type || !this.trackingData.location) {
            this.showToast('Помилка', 'Будь ласка, вкажіть тип події та локацію', 'error');
            return;
        }

        createTrackingEvent({ 
            orderId: this.selectedOrderId, 
            location: this.trackingData.location, 
            eventType: this.trackingData.type, 
            comments: this.trackingData.comments 
        })
        .then(() => {
            this.showToast('Успіх', 'Маршрут оновлено!', 'success');
            this.closeModals();
            return refreshApex(this.wiredOrdersResult); // Оновлюємо список, доставлені рейси зникнуть
        })
        .catch(error => {
            this.showToast('Помилка', error.body.message, 'error');
        });
    }

    showToast(title, message, variant) {
        this.dispatchEvent(new ShowToastEvent({ title, message, variant }));
    }
}