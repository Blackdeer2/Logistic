public with sharing class DriverWorkspaceService {

    @AuraEnabled(cacheable=true)
    public static List<Order__c> getActiveOrders() {
        try {
            User u = [SELECT ContactId FROM User WHERE Id = :UserInfo.getUserId() LIMIT 1];
            if (u.ContactId == null) return new List<Order__c>();

            return [
                SELECT Id, Name, Pick_Up_Location__c, Delivery_Location__c, Statud__c, Start_Delivery_Date__c,
                       Cargo__r.Name, Cargo__r.Weight_Kg__c, Cargo__r.Explosive__c, Cargo__r.Liquid__c, Cargo__r.Perishable__c
                FROM Order__c
                WHERE Driver__r.Contact__c = :u.ContactId
                  AND Statud__c != 'Доставлено' 
                ORDER BY Start_Delivery_Date__c ASC
            ];
        } catch (Exception e) {
            throw new AuraHandledException('Помилка завантаження рейсів: ' + e.getMessage());
        }
    }

    @AuraEnabled
    public static void updateOrderStatus(Id orderId, String newStatus) {
        try {
            User u = [SELECT ContactId FROM User WHERE Id = :UserInfo.getUserId() LIMIT 1];
            Order__c checkOrder = [SELECT Driver__r.Contact__c FROM Order__c WHERE Id = :orderId LIMIT 1];
            
            if (checkOrder.Driver__r.Contact__c != u.ContactId) {
                throw new AuraHandledException('Помилка безпеки: Ви не можете змінити статус чужого рейсу!');
            }

            Order__c ord = new Order__c(Id = orderId, Statud__c = newStatus);
            new ElevatedPrivilege().doUpdateOrder(ord);
            
        } catch (Exception e) {
            throw new AuraHandledException('Не вдалося оновити статус: ' + e.getMessage());
        }
    }

    // НОВИЙ МЕТОД: Створення події трекінгу
    @AuraEnabled
    public static void createTrackingEvent(Id orderId, String location, String eventType, String comments) {
        try {
            // Перевірка: чи цей рейс належить водію?
            User u = [SELECT ContactId FROM User WHERE Id = :UserInfo.getUserId() LIMIT 1];
            Order__c checkOrder = [SELECT Driver__r.Contact__c FROM Order__c WHERE Id = :orderId LIMIT 1];
            
            if (checkOrder.Driver__r.Contact__c != u.ContactId) {
                throw new AuraHandledException('Помилка безпеки: Несанкціонований доступ до рейсу!');
            }

            // Формуємо об'єкт Tracking Event
            Tracking_Event__c newEvent = new Tracking_Event__c();
            newEvent.Order__c = orderId;
            newEvent.Location__c = location;
            newEvent.Event_Type__c = eventType;
            newEvent.Comments__c = comments;
            newEvent.Event_Time__c = Datetime.now(); // Автоматичний час
            newEvent.Name = 'Трекінг - ' + Datetime.now().format('dd.MM.yyyy HH:mm'); // Автоматична назва

            // Зберігаємо через внутрішній клас
            new ElevatedPrivilege().doInsertTracking(newEvent);
            
        } catch (Exception e) {
            throw new AuraHandledException('Помилка створення трекінгу: ' + e.getMessage());
        }
    }

    // ----------------------------------------------------------------------
    // Внутрішній системний клас
    // ----------------------------------------------------------------------
    private without sharing class ElevatedPrivilege {
        public void doUpdateOrder(Order__c ord) {
            update ord;
        }
        
        // НОВИЙ ДОДАТОК: Право на створення події
        public void doInsertTracking(Tracking_Event__c evt) {
            insert evt;
        }
    }
}