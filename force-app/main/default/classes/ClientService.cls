public with sharing class ClientService {
    @AuraEnabled
    public static void createClientFromUser() {
        List<User> userList = [SELECT Id, Name, Email, Phone, ProfileId FROM User WHERE ProfileId IN (SELECT Id FROM Profile WHERE Name = 'Client')];
        // List<Client__c> clientList = [SELECT Id, Name, Contact_Name__c, Contact_Phone__c, Contact_Email__c FROM Client__c];
        List<Client__c> newClientList = new List<Client__c>();

        Map<String, Client__c> existingClients = new Map<String, Client__c>();
        for (Client__c client : [SELECT Id, Name, Contact_Name__c, Contact_Phone__c, Contact_Email__c FROM Client__c]) {
            String uniqueKey = client.Contact_Name__c + ' ' + client.Contact_Phone__c + ' ' + client.Contact_Email__c;
            existingClients.put(uniqueKey, client);
        }
        for (User user : userList){

            String userKey = user.Name + ' ' + user.Phone + ' ' + user.Email;

                if (!existingClients.containsKey(userKey)) {
                    Client__c newClient = new Client__c();
                    newClient.Name = user.Name;
                    newClient.Contact_Name__c = user.Name;
                    newClient.Contact_Phone__c = user.Phone;
                    newClient.Contact_Email__c = user.Email;
                    newClientList.add(newClient);
                }         
        }

        if (!newClientList.isEmpty()) {
            insert newClientList;
        }
    }

    @AuraEnabled
    public static void updateClient(String clientName, String contactName, String contactEmail) {
        System.debug('clientName:' + clientName);
        System.debug('contactName:' + contactName);
        System.debug('contactEmail:' + contactEmail);

        String keyUpdateclinet = contactName + ' ' + contactEmail;
        // List<Client__c> clientList = [SELECT Id, Name, Contact_Name__c, Contact_Phone__c, Contact_Email__c FROM Client__c];
        System.debug('keyUpdateclinet: ' + keyUpdateclinet);
        Map<String, Client__c> existingClients = new Map<String, Client__c>();
        for (Client__c client : [SELECT Id, Name, Contact_Name__c, Contact_Phone__c, Contact_Email__c FROM Client__c]) {
            String uniqueKey = ' ' + client.Contact_Name__c + '  ' + client.Contact_Email__c;
            System.debug('uniqueKey: ' + uniqueKey);
            existingClients.put(uniqueKey, client);
        }
        
        if(existingClients.containsKey(keyUpdateclinet)){
            Client__c clientToUpdate  = existingClients.get(keyUpdateclinet);
            clientToUpdate .Name = clientName;

            update clientToUpdate;
        } else {
            System.debug('Client not found');
        }
    }
    @AuraEnabled(cacheable=true)
    public static String findClientIdByUser(String userEmail){

        if (String.isBlank(userEmail)) {
            System.debug('Error: userEmail is null or empty.');
            return 'Invalid email provided';
        }        

        String clearUserEmail = userEmail.replaceAll(' ', '');
        List<Client__c> clientList = [SELECT Id, Name, Contact_Name__c, Contact_Phone__c, Contact_Email__c FROM Client__c];
        List<User> userList = [SELECT Id, Name, Email, Phone, ProfileId FROM User WHERE Email = :clearUserEmail];
        String clientId = '';
        for (User user : userList){
            for (Client__c client : clientList){
                if(user.Name == client.Contact_Name__c && user.Email == client.Contact_Email__c){
                    System.debug('Client Id: ' + client.Id);
                    clientId = client.Id;
                }
            }
        }
        if(clientId == '' || clientId == null){
            System.debug('Client not found');
            clientId = 'Client not found';  
        }

        return clientId;
    }
}