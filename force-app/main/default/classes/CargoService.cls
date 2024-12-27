public with sharing class CargoService {
    @AuraEnabled(cacheable=true)
    public static String createCargo(String cargoName, 
                                   Decimal cargoWeight,
                                   Decimal cargoVolume, 
                                   Boolean liquid, 
                                   Boolean explosive, 
                                   Boolean perishable, 
                                   String description){

        Cargo__c cargo = new Cargo__c();
        cargo.Name = cargoName;
        cargo.Weight_Kg__c = cargoWeight;
        cargo.Volume__c = cargoVolume;
        cargo.Liquid__c = liquid;
        cargo.Explosive__c = explosive;
        cargo.Perishable__c = perishable;
        cargo.Description__c = description;
        insert cargo;
        return cargo.Id;
    }
}