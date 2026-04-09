import { LightningElement } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import createOrder from '@salesforce/apex/OrderService.createOrder';

export default class CreateOrderPage extends LightningElement {
    
    handleCreateOrder() {
        // Збираємо дані
        const weight = this.template.querySelector('[data-id="weight"]').value;
        const volume = this.template.querySelector('[data-id="volume"]').value;
        const cargoDesc = this.template.querySelector('[data-id="cargoDesc"]').value;
        const pickUp = this.template.querySelector('[data-id="pickUp"]').value;
        const delivery = this.template.querySelector('[data-id="delivery"]').value;
        const startDate = this.template.querySelector('[data-id="startDate"]').value;

        // Перевірка обов'язкових полів
        if (!weight || !volume || !pickUp || !delivery || !startDate) {
            this.showToast('Помилка', 'Будь ласка, заповніть всі обов\'язкові поля', 'error');
            return;
        }

        // Відправляємо на бекенд
        createOrder({ 
            pickUp: pickUp, 
            delivery: delivery, 
            startDate: startDate, 
            weight: parseFloat(weight), 
            volume: parseFloat(volume), 
            cargoDesc: cargoDesc
        })
        .then(result => {
            this.showToast('Успіх!', 'Вантаж та замовлення створено!', 'success');
            this.clearForm();
        })
        .catch(error => {
            this.showToast('Помилка сервера', error.body.message, 'error');
        });
    }

    showToast(title, message, variant) {
        this.dispatchEvent(new ShowToastEvent({ title, message, variant }));
    }

    clearForm() {
        this.template.querySelectorAll('lightning-input, lightning-textarea').forEach(field => {
            field.value = '';
        });
    }
}