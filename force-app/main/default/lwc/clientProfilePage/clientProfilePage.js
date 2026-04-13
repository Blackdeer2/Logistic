import { LightningElement, wire, track } from 'lwc';
import { refreshApex } from '@salesforce/apex';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import getContactProfile from '@salesforce/apex/ProfileService.getContactProfile';
import updateContactProfile from '@salesforce/apex/ProfileService.updateContactProfile';

export default class ClientProfilePage extends LightningElement {
    @track isEditMode = false;
    @track editFields = {};
    
    // Зберігаємо сиру відповідь від сервера для refreshApex
    wiredContactResult;

    @wire(getContactProfile)
    wiredContact(result) {
        this.wiredContactResult = result;
        if (result.data) {
            this.editFields = { ...result.data };
        }
    }

    // Безпечний геттер для HTML
    get contactData() {
        return this.wiredContactResult ? this.wiredContactResult.data : null;
    }

    handleEdit() {
        this.editFields = { ...this.contactData };
        this.isEditMode = true;
    }

    handleCancel() {
        this.isEditMode = false;
    }

    handleChange(event) {
        const field = event.target.dataset.field;
        this.editFields[field] = event.target.value;
    }

    handleSave() {
        const contactToUpdate = {
            Id: this.contactData.Id,
            FirstName: this.editFields.FirstName,
            LastName: this.editFields.LastName,
            Email: this.editFields.Email,
            Phone: this.editFields.Phone,
            MobilePhone: this.editFields.MobilePhone
        };

        updateContactProfile({ con: contactToUpdate })
            .then(() => {
                this.showToast('Успіх', 'Профіль успішно оновлено', 'success');
                this.isEditMode = false;
                // Оновлюємо дані на сторінці без перезавантаження браузера
                return refreshApex(this.wiredContactResult);
            })
            .catch(error => {
                this.showToast('Помилка', error.body.message, 'error');
            });
    }

    showToast(title, message, variant) {
        this.dispatchEvent(new ShowToastEvent({ title, message, variant }));
    }
}