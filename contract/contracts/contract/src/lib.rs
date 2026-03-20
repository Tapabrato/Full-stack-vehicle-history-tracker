#![no_std]
use soroban_sdk::{contract, contracterror, contractimpl, contracttype, Env, String, Vec};

#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq, PartialOrd, Ord)]
#[repr(u32)]
pub enum Error {
    VehicleNotFound = 1,
    AlreadyRegistered = 2,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct HistoryRecord {
    pub record: String,
    pub record_type: String,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct Vehicle {
    pub vin: String,
    pub owner: String,
    pub make: String,
    pub model: String,
    pub year: u32,
    pub history: Vec<HistoryRecord>,
}

#[contracttype]
pub enum DataKey {
    Vehicle(String),
    VinList,
}

#[contract]
pub struct Contract;

#[contractimpl]
impl Contract {
    // Initialize the contract - sets up empty VIN list
    pub fn init(env: Env) {
        let vin_list = Vec::<String>::new(&env);
        env.storage().instance().set(&DataKey::VinList, &vin_list);
    }

    // Register a new vehicle - PERMISSIONLESS, anyone can call
    pub fn register_vehicle(
        env: Env,
        vin: String,
        owner: String,
        make: String,
        model: String,
        year: u32,
    ) -> Result<(), Error> {
        // Check if VIN already exists
        let vin_list: Vec<String> = env
            .storage()
            .instance()
            .get(&DataKey::VinList)
            .unwrap_or_else(|| Vec::new(&env));

        if vin_list.contains(&vin) {
            return Err(Error::AlreadyRegistered);
        }

        // Create new vehicle with empty history
        let vehicle = Vehicle {
            vin: vin.clone(),
            owner,
            make,
            model,
            year,
            history: Vec::new(&env),
        };

        // Store vehicle data persistently
        env.storage()
            .persistent()
            .set(&DataKey::Vehicle(vin.clone()), &vehicle);

        // Add VIN to global list
        let mut updated_list = vin_list;
        updated_list.push_back(vin);
        env.storage()
            .instance()
            .set(&DataKey::VinList, &updated_list);

        Ok(())
    }

    // Add history record to a vehicle - PERMISSIONLESS, anyone can add records
    pub fn add_history(
        env: Env,
        vin: String,
        record: String,
        record_type: String,
    ) -> Result<(), Error> {
        // Get vehicle or fail
        let vehicle: Vehicle = env
            .storage()
            .persistent()
            .get(&DataKey::Vehicle(vin.clone()))
            .ok_or(Error::VehicleNotFound)?;

        // Create history record
        let history_record = HistoryRecord {
            record,
            record_type,
        };

        // Add to history
        let mut updated_history = vehicle.history;
        updated_history.push_back(history_record);

        // Update vehicle with new history
        let updated_vehicle = Vehicle {
            history: updated_history,
            ..vehicle
        };

        env.storage()
            .persistent()
            .set(&DataKey::Vehicle(vin), &updated_vehicle);

        Ok(())
    }

    // Get full vehicle details - PERMISSIONLESS, anyone can view
    pub fn get_vehicle(env: Env, vin: String) -> Result<Vehicle, Error> {
        env.storage()
            .persistent()
            .get(&DataKey::Vehicle(vin))
            .ok_or(Error::VehicleNotFound)
    }

    // Get vehicle history - PERMISSIONLESS, anyone can view
    pub fn get_history(env: Env, vin: String) -> Result<Vec<HistoryRecord>, Error> {
        let vehicle: Vehicle = env
            .storage()
            .persistent()
            .get(&DataKey::Vehicle(vin))
            .ok_or(Error::VehicleNotFound)?;

        Ok(vehicle.history)
    }

    // Get all registered VINs - PERMISSIONLESS, anyone can view
    pub fn get_all_vins(env: Env) -> Vec<String> {
        env.storage()
            .instance()
            .get(&DataKey::VinList)
            .unwrap_or_else(|| Vec::new(&env))
    }
}

mod test;
