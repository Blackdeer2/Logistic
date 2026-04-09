public with sharing class OrderService {
    
    @AuraEnabled
    public static String createOrder(
        String pickUp, String delivery, Date startDate, 
        Decimal weight, Decimal volume, String cargoDesc
    ) {
        try {
            // 1. Шукаємо клієнта (замовника)
            User currentUser = [SELECT ContactId FROM User WHERE Id = :UserInfo.getUserId() LIMIT 1];
            if (currentUser.ContactId == null) {
                throw new AuraHandledException('Користувач не прив\'язаний до Контакту.');
            }

            // 2. СПЕРШУ створюємо Вантаж
            Cargo__c newCargo = new Cargo__c();
            newCargo.Weight_Kg__c = weight;
            newCargo.Volume__c = volume; // Підстав свою точну API-назву для об'єму!
            newCargo.Description__c = cargoDesc;
            insert newCargo;

            // 3. ТОДІ створюємо Замовлення і лінкуємо його до Вантажу та Клієнта
            Order__c newOrder = new Order__c();
            newOrder.Cargo__c = newCargo.Id; // Переконайся, що поле зв'язку називається так
            newOrder.Contact__c = currentUser.ContactId;
            newOrder.Pick_Up_Location__c = pickUp;
            newOrder.Delivery_Location__c = delivery;
            newOrder.Start_Delivery_Date__c = startDate;
            insert newOrder;

            return 'Success';
            
        } catch (Exception e) {
            throw new AuraHandledException('Помилка сервера: ' + e.getMessage());
        }
    }
}