import { LightningElement, wire } from 'lwc';
import listMyOrders from '@salesforce/apex/OrderService.listMyOrders';

// Налаштування колонок для таблиці
const COLUMNS = [
    { label: 'Номер замовлення', fieldName: 'Name', type: 'text' },
    { label: 'Місце завантаження', fieldName: 'Pick_Up_Location__c', type: 'text' },
    { label: 'Місце доставки', fieldName: 'Delivery_Location__c', type: 'text' },
    { label: 'Дата відправки', fieldName: 'Start_Delivery_Date__c', type: 'date' },
    { label: 'Статус', fieldName: 'Statud__c', type: 'text' } // Використовуємо вашу назву поля
];

export default class ListOfOrder extends LightningElement {
    columns = COLUMNS;
    orders = [];
    error;

    // Автоматично викликаємо Apex-метод при завантаженні
    @wire(listMyOrders)
    wiredOrders({ error, data }) {
        if (data) {
            this.orders = data;
            this.error = undefined;
        } else if (error) {
            this.error = error.body ? error.body.message : 'Невідома помилка';
            this.orders = [];
        }
    }

    // Допоміжний метод, щоб перевірити, чи є замовлення взагалі
    get hasOrders() {
        return this.orders && this.orders.length > 0;
    }
}