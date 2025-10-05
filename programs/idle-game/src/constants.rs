// Seeds for PDA derivation
pub const GLOBAL_STATE_SEED: &[u8] = b"global_state";
pub const PLAYER_SEED: &[u8] = b"player";
pub const VAULT_SEED: &[u8] = b"vault";

// Game constants
pub const MAX_GENERATORS: usize = 10;
pub const DECIMALS: u8 = 9;
pub const BASE_PRODUCTION_RATE: u64 = 100; // Base tokens per second

// Generator types with costs and production rates
// Note: We don't derive AnchorSerialize/Deserialize because this is compile-time only
#[derive(Clone, Copy, Debug, PartialEq)]
pub struct GeneratorType {
    pub id: u8,
    pub base_cost: u64,
    pub production_rate: u64, // Tokens per second
}

pub const GENERATOR_TYPES: [GeneratorType; 5] = [
    GeneratorType {
        id: 0,
        base_cost: 10_000_000_000, // 10 tokens
        production_rate: 1_000_000_000, // 1 token/sec
    },
    GeneratorType {
        id: 1,
        base_cost: 100_000_000_000, // 100 tokens
        production_rate: 15_000_000_000, // 15 tokens/sec
    },
    GeneratorType {
        id: 2,
        base_cost: 1_100_000_000_000, // 1,100 tokens
        production_rate: 180_000_000_000, // 180 tokens/sec
    },
    GeneratorType {
        id: 3,
        base_cost: 12_000_000_000_000, // 12,000 tokens
        production_rate: 2_400_000_000_000, // 2,400 tokens/sec
    },
    GeneratorType {
        id: 4,
        base_cost: 130_000_000_000_000, // 130,000 tokens
        production_rate: 33_000_000_000_000, // 33,000 tokens/sec
    },
];

// Cost multiplier for all generators (1.15 = 15% increase per purchase)
pub const COST_MULTIPLIER: f64 = 1.15;

pub fn get_generator_cost(generator_id: u8, current_count: u32) -> u64 {
    let gen = &GENERATOR_TYPES[generator_id as usize];
    let multiplier = COST_MULTIPLIER.powi(current_count as i32);
    (gen.base_cost as f64 * multiplier) as u64
}

pub fn calculate_production_rate(generators: &[u32; MAX_GENERATORS]) -> u64 {
    let mut total_rate = 0u64;
    for (i, &count) in generators.iter().enumerate() {
        if i < GENERATOR_TYPES.len() {
            total_rate += GENERATOR_TYPES[i].production_rate * count as u64;
        }
    }
    total_rate
}
