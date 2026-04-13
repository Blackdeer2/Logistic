public with sharing class ProfileService {
    
    @AuraEnabled(cacheable=true)
    public static Contact getContactProfile() {
        try {
            User u = [SELECT ContactId FROM User WHERE Id = :UserInfo.getUserId() LIMIT 1];
            if (u.ContactId == null) return null;

            // Додаємо MobilePhone, бо він частіше використовується в профілях
            return [SELECT Id, FirstName, LastName, Email, Phone, MobilePhone, Account.Name 
                    FROM Contact WHERE Id = :u.ContactId LIMIT 1];
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }

    @AuraEnabled
    public static void updateContactProfile(Contact con) {
        try {
            // Перевірка безпеки (IDOR Protection)
            User u = [SELECT ContactId FROM User WHERE Id = :UserInfo.getUserId() LIMIT 1];
            if (u.ContactId != con.Id) {
                throw new AuraHandledException('Помилка безпеки: Несанкціонований доступ.');
            }

            // Використовуємо системний режим для оновлення
            ElevatedPrivilege.doUpdate(con);
            
        } catch (DmlException e) {
            // Виводимо конкретну помилку бази даних (наприклад, невірний формат телефону)
            throw new AuraHandledException('Помилка бази даних: ' + e.getDmlMessage(0));
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }

    // Внутрішній клас для обходу обмежень порталу
    private without sharing class ElevatedPrivilege {
        public static void doUpdate(Contact con) {
            update con;
        }
    }
}