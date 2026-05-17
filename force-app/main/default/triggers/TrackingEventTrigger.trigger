trigger TrackingEventTrigger on Tracking_Event__c (after insert) {
    Map<Id, String> ordersToUpdate = new Map<Id, String>();

    for (Tracking_Event__c evt : Trigger.new) {
        if (evt.Event_Type__c == 'Loaded') {
            ordersToUpdate.put(evt.Order__c, 'Pending Dispatch');
        } else if (evt.Event_Type__c == 'In transit') {
            ordersToUpdate.put(evt.Order__c, 'In Transit');
        } else if (evt.Event_Type__c == 'Arrived at warehouse') {
            ordersToUpdate.put(evt.Order__c, 'Awaiting Unloading');
        } else if (evt.Event_Type__c == 'Delivered') {
            ordersToUpdate.put(evt.Order__c, 'Delivered');
        }
    }

    if (!ordersToUpdate.isEmpty()) {
        List<Order__c> ordersList = new List<Order__c>();
        for (Id orderId : ordersToUpdate.keySet()) {
            ordersList.add(new Order__c(
                Id = orderId, 
                Statud__c = ordersToUpdate.get(orderId)
            ));
        }
        update ordersList;
    }
}