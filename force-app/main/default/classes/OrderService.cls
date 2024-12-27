public with sharing class OrderService {

    @AuraEnabled(cacheable=true)
    public static  List<Order__c> listOrdersByClientID(String clientId) {
        List<Order__c> orderList = [SELECT Id, Name, Cargo__c, 
                                    Client__c, Delivery_Location__c, 
                                    End_Delivery_Date__c, Pick_Up_Location__c, 
                                    Start_Delivery_Date__c, Statud__c  
                                    FROM Order__c WHERE Client__c = :clientId];
        System.debug('orderList: ' + orderList);

        return orderList;
    }
} 