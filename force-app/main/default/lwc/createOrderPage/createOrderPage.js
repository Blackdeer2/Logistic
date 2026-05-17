import { LightningElement, track } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import createOrder from '@salesforce/apex/OrderService.createOrder';

export default class CreateOrderPage extends LightningElement {
    @track calculatedVolume = 0;

    calculateVolume() {
        const l = parseFloat(this.template.querySelector('[data-id="length"]').value) || 0;
        const w = parseFloat(this.template.querySelector('[data-id="width"]').value) || 0;
        const h = parseFloat(this.template.querySelector('[data-id="height"]').value) || 0;
        this.calculatedVolume = parseFloat((l * w * h).toFixed(2));
    }

    handleCreateOrder() {
        const pickUp = this.template.querySelector('[data-id="pickUp"]').value;
        const delivery = this.template.querySelector('[data-id="delivery"]').value;
        const startDate = this.template.querySelector('[data-id="startDate"]').value;
        const endDate = this.template.querySelector('[data-id="endDate"]').value;

        const weight = parseFloat(this.template.querySelector('[data-id="weight"]').value) || 0;
        const length = parseFloat(this.template.querySelector('[data-id="length"]').value) || 0;
        const width = parseFloat(this.template.querySelector('[data-id="width"]').value) || 0;
        const height = parseFloat(this.template.querySelector('[data-id="height"]').value) || 0;
        const cargoDesc = this.template.querySelector('[data-id="cargoDesc"]').value;

        const isExplosive = this.template.querySelector('[data-id="isExplosive"]').checked;
        const isLiquid = this.template.querySelector('[data-id="isLiquid"]').checked;
        const isPerishable = this.template.querySelector('[data-id="isPerishable"]').checked;

        if (!pickUp || !delivery || !startDate || !weight) {
            this.showToast('Помилка', 'Заповніть обов\'язкові поля (Звідки, Куди, Дату та Вагу)', 'error');
            return;
        }

        createOrder({
            pickUp: pickUp,
            delivery: delivery,
            startDate: startDate,
            endDate: endDate,
            weight: weight,
            length: length,
            width: width,
            height: height,
            volume: this.calculatedVolume,
            cargoDesc: cargoDesc,
            isExplosive: isExplosive,
            isLiquid: isLiquid,
            isPerishable: isPerishable
        })
        .then(() => {
            this.showToast('Успіх', 'Замовлення створено!', 'success');
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
        this.template.querySelectorAll('lightning-input, lightning-textarea').forEach(f => {
            if (f.type === 'checkbox') f.checked = false;
            else f.value = '';
        });
        this.calculatedVolume = 0;
    }
}