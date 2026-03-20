#![cfg(test)]

use super::*;
use soroban_sdk::Env;

#[test]
fn test_register_vehicle() {
    let env = Env::default();
    let contract_id = env.register(Contract, ());
    let client = ContractClient::new(&env, &contract_id);

    // Anyone can register a vehicle - permissionless
    client.register_vehicle(
        &String::from_str(&env, "1HGBH41JXMN109186"),
        &String::from_str(&env, "John Doe"),
        &String::from_str(&env, "Honda"),
        &String::from_str(&env, "Civic"),
        &2020u32,
    );

    // Verify vehicle was registered
    let vehicle = client.get_vehicle(&String::from_str(&env, "1HGBH41JXMN109186"));
    assert_eq!(vehicle.vin, String::from_str(&env, "1HGBH41JXMN109186"));
    assert_eq!(vehicle.owner, String::from_str(&env, "John Doe"));
    assert_eq!(vehicle.make, String::from_str(&env, "Honda"));
    assert_eq!(vehicle.model, String::from_str(&env, "Civic"));
    assert_eq!(vehicle.year, 2020);
    assert!(vehicle.history.is_empty());
}

#[test]
fn test_add_history_record() {
    let env = Env::default();
    let contract_id = env.register(Contract, ());
    let client = ContractClient::new(&env, &contract_id);

    // Register vehicle first
    client.register_vehicle(
        &String::from_str(&env, "VIN123456789"),
        &String::from_str(&env, "Jane Smith"),
        &String::from_str(&env, "Toyota"),
        &String::from_str(&env, "Camry"),
        &2021u32,
    );

    // Anyone can add history - permissionless
    client.add_history(
        &String::from_str(&env, "VIN123456789"),
        &String::from_str(&env, "Oil change at 50000 miles"),
        &String::from_str(&env, "service"),
    );

    client.add_history(
        &String::from_str(&env, "VIN123456789"),
        &String::from_str(&env, "Accident reported - minor damage"),
        &String::from_str(&env, "accident"),
    );

    // Verify history was added
    let history = client.get_history(&String::from_str(&env, "VIN123456789"));
    assert_eq!(history.len(), 2);
    assert_eq!(
        history.get(0).unwrap().record,
        String::from_str(&env, "Oil change at 50000 miles")
    );
    assert_eq!(
        history.get(0).unwrap().record_type,
        String::from_str(&env, "service")
    );
    assert_eq!(
        history.get(1).unwrap().record,
        String::from_str(&env, "Accident reported - minor damage")
    );
    assert_eq!(
        history.get(1).unwrap().record_type,
        String::from_str(&env, "accident")
    );
}

#[test]
#[should_panic(expected = "Error(Contract, #1)")]
fn test_add_history_nonexistent_vehicle() {
    let env = Env::default();
    let contract_id = env.register(Contract, ());
    let client = ContractClient::new(&env, &contract_id);

    // Trying to add history to non-existent vehicle should fail
    client.add_history(
        &String::from_str(&env, "FAKE_VIN"),
        &String::from_str(&env, "Some record"),
        &String::from_str(&env, "test"),
    );
}

#[test]
fn test_get_all_vins() {
    let env = Env::default();
    let contract_id = env.register(Contract, ());
    let client = ContractClient::new(&env, &contract_id);

    // Register multiple vehicles
    client.register_vehicle(
        &String::from_str(&env, "VIN111"),
        &String::from_str(&env, "Owner 1"),
        &String::from_str(&env, "Ford"),
        &String::from_str(&env, "F-150"),
        &2022u32,
    );

    client.register_vehicle(
        &String::from_str(&env, "VIN222"),
        &String::from_str(&env, "Owner 2"),
        &String::from_str(&env, "Tesla"),
        &String::from_str(&env, "Model 3"),
        &2023u32,
    );

    // Get all registered VINs
    let all_vins = client.get_all_vins();
    assert_eq!(all_vins.len(), 2);
}

#[test]
fn test_register_duplicate_vin() {
    let env = Env::default();
    let contract_id = env.register(Contract, ());
    let client = ContractClient::new(&env, &contract_id);

    // Register first vehicle
    client.register_vehicle(
        &String::from_str(&env, "UNIQUE_VIN"),
        &String::from_str(&env, "First Owner"),
        &String::from_str(&env, "BMW"),
        &String::from_str(&env, "X5"),
        &2021u32,
    );

    // Trying to register same VIN should fail
    let result = client.try_register_vehicle(
        &String::from_str(&env, "UNIQUE_VIN"),
        &String::from_str(&env, "Second Owner"),
        &String::from_str(&env, "Mercedes"),
        &String::from_str(&env, "C-Class"),
        &2022u32,
    );

    assert_eq!(result, Err(Ok(Error::AlreadyRegistered)));
}

#[test]
#[should_panic(expected = "Error(Contract, #1)")]
fn test_get_nonexistent_vehicle() {
    let env = Env::default();
    let contract_id = env.register(Contract, ());
    let client = ContractClient::new(&env, &contract_id);

    // Trying to get non-existent vehicle should fail
    client.get_vehicle(&String::from_str(&env, "FAKE_VIN"));
}

#[test]
fn test_multiple_history_records_different_types() {
    let env = Env::default();
    let contract_id = env.register(Contract, ());
    let client = ContractClient::new(&env, &contract_id);

    // Register vehicle
    client.register_vehicle(
        &String::from_str(&env, "VIN_ABC123"),
        &String::from_str(&env, "Car Enthusiast"),
        &String::from_str(&env, "Porsche"),
        &String::from_str(&env, "911"),
        &2023u32,
    );

    // Add various types of records
    let record_types = ["service", "accident", "ownership", "inspection", "recall"];

    client.add_history(
        &String::from_str(&env, "VIN_ABC123"),
        &String::from_str(&env, "Regular maintenance"),
        &String::from_str(&env, "service"),
    );
    client.add_history(
        &String::from_str(&env, "VIN_ABC123"),
        &String::from_str(&env, "Rear-ended in parking lot"),
        &String::from_str(&env, "accident"),
    );
    client.add_history(
        &String::from_str(&env, "VIN_ABC123"),
        &String::from_str(&env, "Transferred to new owner"),
        &String::from_str(&env, "ownership"),
    );
    client.add_history(
        &String::from_str(&env, "VIN_ABC123"),
        &String::from_str(&env, "Annual inspection passed"),
        &String::from_str(&env, "inspection"),
    );
    client.add_history(
        &String::from_str(&env, "VIN_ABC123"),
        &String::from_str(&env, "Brake recall resolved"),
        &String::from_str(&env, "recall"),
    );

    let history = client.get_history(&String::from_str(&env, "VIN_ABC123"));
    assert_eq!(history.len(), 5);

    // Verify each record type
    for (i, record_type) in record_types.iter().enumerate() {
        assert_eq!(
            history.get(i as u32).unwrap().record_type,
            String::from_str(&env, record_type)
        );
    }
}

#[test]
fn test_empty_history() {
    let env = Env::default();
    let contract_id = env.register(Contract, ());
    let client = ContractClient::new(&env, &contract_id);

    // Register vehicle with no history
    client.register_vehicle(
        &String::from_str(&env, "NEW_CAR_VIN"),
        &String::from_str(&env, "New Car Owner"),
        &String::from_str(&env, "Honda"),
        &String::from_str(&env, "Accord"),
        &2024u32,
    );

    // Get empty history
    let history = client.get_history(&String::from_str(&env, "NEW_CAR_VIN"));
    assert!(history.is_empty());
}
