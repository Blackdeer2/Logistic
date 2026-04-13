import { LightningElement, wire } from 'lwc';
import getMyCargo from '@salesforce/apex/CargoService.getMyCargo';

export default class CargoListPage extends LightningElement {
    @wire(getMyCargo)
    cargoList;
}