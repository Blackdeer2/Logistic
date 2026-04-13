import { LightningElement, wire, track } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { refreshApex } from '@salesforce/apex';
import getActiveOrders from '@salesforce/apex/DriverWorkspaceService.getActiveOrders';
import updateOrderStatus from '@salesforce/apex/DriverWorkspaceService.updateOrderStatus';
import createTrackingEvent from '@salesforce/apex/DriverWorkspaceService.createTrackingEvent'; // НОВИЙ ІМПОРТ

export default class DriverWorkspace extends LightningElement {
    @track isStatusModalOpen = false;
    @track isTrackingModalOpen = false;
    
    @track selectedOrderId;
    @track selectedStatus;
    
    // Дані для нової події трекінгу
    @track trackingData = { location: '', type: '', comments: '' };

    wiredOrdersResult;

    statusOptions = [
        { label: 'В процесі завантаження', value: 'В процесі' },
        { label: 'Виїхав / В дорозі', value: 'В дорозі' },
        { label: 'Успішно доставлено', value: 'Доставлено' }
    ];

    // УВАГА: Перевірте ці значення зі своїм полем Event_Type__c у CRM!
    trackingTypeOptions = [
        { label: 'Відправлення', value: 'Відправлення' },
        { label: 'Проходження чекпойнту', value: 'Чекпойнт' },
        { label: 'Митний контроль', value: 'Митниця' },
        { label: 'Затримка в дорозі', value: 'Затримка' },
        { label: 'Прибуття на розвантаження', value: 'Прибуття' }
    ];

    @wire(getActiveOrders)
    wiredOrders(result) {
        this.wiredOrdersResult = result;
    }

    get orders() {
        return this.wiredOrdersResult?.data;
    }

    // Керування вікнами
    handleOpenStatusModal(event) {
        this.selectedOrderId = event.target.dataset.id;
        this.isStatusModalOpen = true;
    }

    handleOpenTrackingModal(event) {
        this.selectedOrderId = event.target.dataset.id;
        // Очищаємо форму перед новим вводом
        this.trackingData = { location: '', type: '', comments: '' };
        this.isTrackingModalOpen = true;
    }

    closeModals() {
        this.isStatusModalOpen = false;
        this.isTrackingModalOpen = false;
        this.selectedOrderId = null;
    }

    // Збереження статусу рейсу
    handleStatusChange(event) {
        this.selectedStatus = event.detail.value;
    }

    saveStatus() {
        if (!this.selectedStatus) return;
        updateOrderStatus({ orderId: this.selectedOrderId, newStatus: this.selectedStatus })
            .then(() => {
                this.showToast('Успіх', 'Статус оновлено', 'success');
                this.closeModals();
                return refreshApex(this.wiredOrdersResult);
            })
            .catch(error => this.showToast('Помилка', error.body.message, 'error'));
    }

    // Логіка для Трекінгу
    handleTrackingChange(event) {
        const field = event.target.dataset.field;
        this.trackingData[field] = event.target.value;
    }

    saveTrackingEvent() {
        // Проста валідація
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
            this.showToast('Успіх', 'Подію трекінгу додано!', 'success');
            this.closeModals();
            // Тут refreshApex не обов'язковий, бо ми не виводимо трекінг на цій сторінці, 
            // але це гарна практика для надійності
            return refreshApex(this.wiredOrdersResult);
        })
        .catch(error => {
            this.showToast('Помилка бази даних', error.body.message, 'error');
        });
    }

    showToast(title, message, variant) {
        this.dispatchEvent(new ShowToastEvent({ title, message, variant }));
    }
}