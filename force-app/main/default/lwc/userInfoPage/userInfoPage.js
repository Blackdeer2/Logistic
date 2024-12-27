import { LightningElement, api, wire, track } from 'lwc';
import Id from '@salesforce/user/Id';
import { getRecord } from 'lightning/uiRecordApi';
import UserNameFld from '@salesforce/schema/User.Name';
import UserEmailFld from '@salesforce/schema/User.Email';
import UserCompanyFld from '@salesforce/schema/User.CompanyName';
import UserMobileFld from '@salesforce/schema/User.MobilePhone';
import createClientFromUser from '@salesforce/apex/ClientService.createClientFromUser';
import findClientIdByUser from '@salesforce/apex/ClientService.findClientIdByUser';
// import updateClient from '@salesforce/apex/ClientService.updateClient';

export default class UserInfoPage extends LightningElement {
    
    userId = Id; 
    currentUserName;
    currentUserEmailId;
    currentUserCompany;
    currentUserMobile;      
    error;     
    @api clientId;   
    @track flowParams = [];

    get userCompany() {
        return this.currentUserCompany ? this.currentUserCompany : 'Not Assigned';
    }
    

    @wire(getRecord, { recordId: Id, fields: [UserNameFld, UserEmailFld, UserCompanyFld, UserMobileFld] })
    wiredUser({ error, data }) {
        if (data) {
            this.currentUserName = data.fields.Name.value;
            this.currentUserEmailId = data.fields.Email.value;
            this.currentUserCompany = data.fields.CompanyName.value;
            this.currentUserMobile = data.fields.MobilePhone.value;
            console.log('User phone:', data.fields.MobilePhone.value);

            this.error = undefined;
            this.handleApexMethods();
        } else if (error) {
            this.error = error;
            this.userId = undefined;
            console.error('Error loading user data:', error);
        }
    }    

    async handleApexMethods() {
        try {
            console.log('Creating and updating client...');
            await createClientFromUser();
            console.log('Client created and updated successfully.');

            console.log('Finding client Id by user email...');
            console.log('User email:', this.currentUserEmailId);
            if (!this.currentUserEmailId || typeof this.currentUserEmailId !== 'string') {
                throw new Error('Invalid email: Expected a non-empty string');
            }
            this.clientId = await findClientIdByUser({ userEmail: this.currentUserEmailId });
            console.log('Client Id:', this.clientId);
            this.prepareFlowParams();
        } catch (err) {
            console.error('Error in Apex method calls:', err);
        }
    }
    prepareFlowParams() {
        if (!this.clientId) {
            console.error('Client ID is undefined. Cannot prepare flowParams.');
            return;
        }
    
        this.flowParams = [
            {
                name: 'clientId',
                type: 'String',
                value: this.clientId
            }
        ];
    
        console.log('Flow parameters prepared:', JSON.stringify(this.flowParams));
    }
}
