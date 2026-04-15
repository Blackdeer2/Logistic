import { LightningElement, api, wire } from 'lwc';
import { getRecord, getFieldValue } from 'lightning/uiRecordApi';
import CARGO_FIELD from '@salesforce/schema/Order__c.Cargo__c';

export default class CargoDetailsWidget extends LightningElement {
    // Отримуємо ID поточного замовлення (Order__c), на сторінці якого знаходимося
    @api recordId;

    // Автоматично витягуємо запис Order__c, щоб дізнатися ID вантажу
    @wire(getRecord, { recordId: '$recordId', fields: [CARGO_FIELD] })
    orderRecord;

    // Геттер, який повертає ID вантажу, коли замовлення завантажиться
    get cargoId() {
        return this.orderRecord.data ? getFieldValue(this.orderRecord.data, CARGO_FIELD) : null;
    }
}