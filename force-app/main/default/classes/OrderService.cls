public with sharing class OrderService {
    
    // ============================================================================
    // МЕТОД 1: СТВОРЕННЯ ЗАМОВЛЕННЯ ТА ВАНТАЖУ (Цей метод у вас вже чудово працює)
    // ============================================================================
    @AuraEnabled
    public static String createOrder(
        String pickUp, String delivery, Datetime startDate, Datetime endDate, 
        Decimal weight, Decimal length, Decimal width, Decimal height, Decimal volume,
        String cargoDesc, Boolean isExplosive, Boolean isLiquid, Boolean isPerishable
    ) {
        try {
            User currentUser = [SELECT ContactId FROM User WHERE Id = :UserInfo.getUserId() LIMIT 1];
            if (currentUser.ContactId == null) {
                return 'Error: Поточний користувач не має прив\'язаного Контакту.';
            }

            Cargo__c newCargo = new Cargo__c();
            newCargo.Weight_Kg__c = weight;
            newCargo.Length__c = length;
            newCargo.Width__c = width;
            newCargo.Height__c = height;
            newCargo.Volume__c = volume; 
            newCargo.Description__c = cargoDesc;
            newCargo.Explosive__c = isExplosive;
            newCargo.Liquid__c = isLiquid;
            newCargo.Perishable__c = isPerishable;
            newCargo.Name = 'Cargo for ' + currentUser.ContactId;
            insert newCargo;

            Order__c newOrder = new Order__c();
            newOrder.Contact__c = currentUser.ContactId;
            newOrder.Cargo__c = newCargo.Id;
            newOrder.Pick_Up_Location__c = pickUp;
            newOrder.Delivery_Location__c = delivery;
            newOrder.Start_Delivery_Date__c = startDate;
            newOrder.End_Delivery_Date__c = endDate;
            newOrder.Name = 'Order ' + Datetime.now().format();
            insert newOrder;

            return 'Success: Записи створено (Cargo ID: ' + newCargo.Id + ')';
        } catch (Exception e) {
            throw new AuraHandledException('Помилка CRM: ' + e.getMessage());
        }
    }

    // ============================================================================
    // МЕТОД 2: ОТРИМАННЯ СПИСКУ ЗАМОВЛЕНЬ ДЛЯ ПОРТАЛУ (Той, якого не вистачало)
    // ============================================================================
    @AuraEnabled(cacheable=true)
    public static List<Order__c> listMyOrders() {
        try {
            // Отримуємо ContactId поточного клієнта
            User currentUser = [SELECT ContactId FROM User WHERE Id = :UserInfo.getUserId() LIMIT 1];
            
            // Якщо це не клієнт порталу (наприклад, Адмін), повертаємо порожній список
            if (currentUser.ContactId == null) {
                return new List<Order__c>(); 
            }

            // Шукаємо ВСІ замовлення, де в полі Contact__c стоїть ID цього клієнта
            // Використовуємо поле Statud__c з вашого XML!
            return [
                SELECT Id, Name, Pick_Up_Location__c, Delivery_Location__c, Start_Delivery_Date__c, Statud__c
                FROM Order__c
                WHERE Contact__c = :currentUser.ContactId
                ORDER BY CreatedDate DESC
            ];
            
        } catch (Exception e) {
            throw new AuraHandledException('Помилка завантаження списку: ' + e.getMessage());
        }
    }
}