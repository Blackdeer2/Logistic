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

@AuraEnabled(cacheable=true)
    public static List<Cargo__c> getMyCargo() {
        try {
            // Отримуємо контакт поточного користувача
            User u = [SELECT ContactId FROM User WHERE Id = :UserInfo.getUserId() LIMIT 1];
            if (u.ContactId == null) return new List<Cargo__c>();

            // Знаходимо всі Cargo__c, на які посилаються замовлення цього контакту
            return [SELECT Id, Name, Weight_Kg__c, Volume__c, 
                           Explosive__c, Liquid__c, Perishable__c, Description__c,
                           Length__c, Width__c, Height__c
                    FROM Cargo__c 
                    WHERE Id IN (SELECT Cargo__c FROM Order__c WHERE Contact__c = :u.ContactId)
                    ORDER BY CreatedDate DESC];
        } catch (Exception e) {
            throw new AuraHandledException('Помилка отримання списку вантажів: ' + e.getMessage());
        }
    }
}