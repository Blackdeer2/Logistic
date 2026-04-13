import { LightningElement, wire } from 'lwc';
import { NavigationMixin } from 'lightning/navigation'; // Додаємо модуль навігації
import listMyOrders from '@salesforce/apex/OrderService.listMyOrders';

const COLUMNS = [
    { 
        label: 'Номер замовлення', 
        fieldName: 'recordUrl', 
        type: 'url', 
        typeAttributes: { 
            label: { fieldName: 'Name' }, 
            target: '_self' 
        } 
    },
    { label: 'Місце завантаження', fieldName: 'Pick_Up_Location__c', type: 'text' },
    { label: 'Місце доставки', fieldName: 'Delivery_Location__c', type: 'text' },
    { label: 'Дата відправки', fieldName: 'Start_Delivery_Date__c', type: 'date' },
    { label: 'Статус', fieldName: 'Statud__c', type: 'text' }
];

export default class ListOfOrder extends NavigationMixin(LightningElement) {
    columns = COLUMNS;
    orders = [];
    error;

    @wire(listMyOrders)
    wiredOrders({ error, data }) {
        if (data) {
            // Формуємо список замовлень з правильними посиланнями
            this.orders = data.map(record => {
                return {
                    ...record,
                    // Генеруємо шлях до сторінки деталей об'єкта Order__c
                    recordUrl: `/s/detail/${record.Id}`
                };
            });
            this.error = undefined;
        } else if (error) {
            this.error = error.body ? error.body.message : 'Невідома помилка';
            this.orders = [];
        }
    }

    get hasOrders() {
        return this.orders && this.orders.length > 0;
    }
}