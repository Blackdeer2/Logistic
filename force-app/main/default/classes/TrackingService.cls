public without sharing class TrackingService {
    @AuraEnabled(cacheable=true)
    public static List<Tracking_Event__c> getTrackingEvents(Id orderId) {
        try {
            return [
                SELECT Id, Name, Event_Time__c, Event_Type__c, Location__c, Comments__c 
                FROM Tracking_Event__c 
                WHERE Order__c = :orderId 
                ORDER BY Event_Time__c DESC
            ];
        } catch (Exception e) {
            throw new AuraHandledException('Помилка завантаження трекінгу: ' + e.getMessage());
        }
    }
}