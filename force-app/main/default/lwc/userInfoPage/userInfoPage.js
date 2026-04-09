import { LightningElement, wire } from 'lwc';
import getMyProfile from '@salesforce/apex/ClientService.getMyProfile';

export default class UserInfoPage extends LightningElement {
    clientData;
    error;

    // Автоматично викликаємо метод і отримуємо дані
    @wire(getMyProfile)
    wiredProfile({ error, data }) {
        if (data) {
    // Використовуємо ?.value, щоб уникнути помилки, якщо поле порожнє
    this.currentUserName = data.fields.Name?.value;
    this.currentUserEmailId = data.fields.Email?.value;
    this.currentUserCompany = data.fields.CompanyName?.value;
    this.currentUserMobile = data.fields.MobilePhone?.value;
    
    console.log('User phone:', this.currentUserMobile);

    this.error = undefined;
    this.handleApexMethods();
    } else if (error) {
            this.error = error.body ? error.body.message : 'Невідома помилка завантаження';
            this.clientData = undefined;
        }
    }
}