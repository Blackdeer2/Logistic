public with sharing class ClientService {

    @AuraEnabled(cacheable=true)
    public static Client__c getMyProfile() {
        try {
            // Отримуємо ID поточного користувача, який зараз онлайн на порталі
            Id currentUserId = UserInfo.getUserId();
            
            // Шукаємо його профіль Client__c
            return [SELECT Id, Name, Contact_Email__c, Contact_Phone__c, Portal_User__c 
                    FROM Client__c 
                    WHERE Portal_User__c = :currentUserId 
                    LIMIT 1];
                    
        } catch (Exception e) {
            throw new AuraHandledException('Не вдалося завантажити профіль клієнта: ' + e.getMessage());
        }
    }
}