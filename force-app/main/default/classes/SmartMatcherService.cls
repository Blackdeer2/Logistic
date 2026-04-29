public with sharing class SmartMatcherService {
    
    @AuraEnabled(cacheable=true)
    public static Map<String, Object> getRecommendations(Id orderId) {
        Map<String, Object> result = new Map<String, Object>();
        
        try {
            // 1. Отримуємо дані про вантаж та ДАТИ поточного замовлення
            Order__c ord = [SELECT Id, Cargo__c, Cargo__r.Weight_Kg__c, Cargo__r.Explosive__c, Cargo__r.Perishable__c,
                                   Start_Delivery_Date__c, End_Delivery_Date__c
                            FROM Order__c 
                            WHERE Id = :orderId LIMIT 1];
                            
            if (ord.Cargo__c == null) {
                result.put('error', 'До цього замовлення ще не додано вантаж.');
                return result;
            }
            
            Decimal weight = ord.Cargo__r.Weight_Kg__c != null ? ord.Cargo__r.Weight_Kg__c : 0;
            Boolean isExplosive = ord.Cargo__r.Explosive__c;
            Boolean isPerishable = ord.Cargo__r.Perishable__c;
            
            // ==========================================
            // ЛОГІКА ДЛЯ МАШИН (Фізичні параметри)
            // ==========================================
            String vQuery = 'SELECT Id, Name, Capacity__c, Type__c, Status__c FROM Vehicle__c WHERE Status__c = \'Available\' AND Capacity__c >= :weight';
            
            if (isExplosive) { vQuery += ' AND Type__c = \'Dangerous goods\''; } 
            else if (isPerishable) { vQuery += ' AND Type__c = \'Refrigerator\''; }
            vQuery += ' ORDER BY Capacity__c ASC LIMIT 5';
            
            List<Vehicle__c> vehicles = Database.query(vQuery);
            result.put('vehicles', vehicles);
            
            // ==========================================
            // НОВА ЛОГІКА ДЛЯ ВОДІЇВ (Календарне планування)
            // ==========================================
            Datetime targetStart = ord.Start_Delivery_Date__c;
            
            // Якщо логіст ще не вказав кінець рейсу, беремо для перевірки +1 день від старту
            Datetime targetEnd = ord.End_Delivery_Date__c != null ? ord.End_Delivery_Date__c : (targetStart != null ? targetStart.addDays(1) : null);
            
            List<Driver__c> drivers = new List<Driver__c>();
            
            if (targetStart != null && targetEnd != null) {
                // Шукаємо всіх водіїв, ЯКІ НЕ МАЮТЬ рейсів, що перетинаються з нашими датами
                drivers = [
                    SELECT Id, Name, Status__c 
                    FROM Driver__c 
                    WHERE Id NOT IN (
                        SELECT Driver__c 
                        FROM Order__c 
                        WHERE Driver__c != null 
                          AND Statud__c NOT IN ('Delivered', 'Cancelled', 'Closed') // Тільки активні рейси
                          AND Id != :orderId // Не враховуємо поточне замовлення
                          AND Start_Delivery_Date__c <= :targetEnd 
                          AND End_Delivery_Date__c >= :targetStart
                    )
                    LIMIT 5
                ];
            } else {
                // Якщо дати взагалі не вказані, повертаємо стару логіку (ті, що вільні прямо зараз)
                drivers = [SELECT Id, Name, Status__c FROM Driver__c WHERE Status__c = 'Free' LIMIT 5];
            }
            
            result.put('drivers', drivers);
            
            return result;
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }

    @AuraEnabled
    public static void assignResources(Id orderId, Id vehicleId, Id driverId) {
        try {
            update new Order__c(Id = orderId, Vehicle__c = vehicleId, Driver__c = driverId, Statud__c = 'Pending Dispatch');
        } catch (Exception e) {
            throw new AuraHandledException('Помилка при призначенні: ' + e.getMessage());
        }
    }
}