use anchor_lang::prelude::*;
use crate::constants::*;
use crate::errors::*;

#[account]
pub struct GlobalState {
    pub authority: Pubkey,
    pub token_mint: Pubkey,
    pub total_players: u64,
    pub total_tokens_minted: u64,
    pub game_active: bool,
    pub bump: u8,
}

impl GlobalState {
    pub const LEN: usize = 8 + // discriminator
        32 + // authority
        32 + // token_mint
        8 +  // total_players
        8 +  // total_tokens_minted
        1 +  // game_active
        1;   // bump
}

#[account]
pub struct Player {
    pub authority: Pubkey,
    pub balance: u64,
    pub generators: [u32; MAX_GENERATORS],
    pub last_claim_time: i64,
    pub total_earned: u64,
    pub production_rate: u64,
    pub bump: u8,
}

impl Player {
    pub const LEN: usize = 8 + // discriminator
        32 + // authority
        8 +  // balance
        (4 * MAX_GENERATORS) + // generators array
        8 +  // last_claim_time
        8 +  // total_earned
        8 +  // production_rate
        1;   // bump

    pub fn calculate_pending_rewards(&self, current_time: i64) -> Result<u64> {
        let time_elapsed = current_time
            .checked_sub(self.last_claim_time)
            .ok_or(IdleGameError::ArithmeticOverflow)?;

        if time_elapsed < 0 {
            return Ok(0);
        }

        let rewards = (self.production_rate as u128)
            .checked_mul(time_elapsed as u128)
            .ok_or(IdleGameError::ArithmeticOverflow)?;

        Ok(rewards.min(u64::MAX as u128) as u64)
    }

    pub fn update_production_rate(&mut self) {
        self.production_rate = calculate_production_rate(&self.generators);
    }

    pub fn add_generator(&mut self, generator_id: u8) -> Result<()> {
        require!(
            (generator_id as usize) < GENERATOR_TYPES.len(),
            IdleGameError::InvalidGeneratorType
        );

        self.generators[generator_id as usize] = self.generators[generator_id as usize]
            .checked_add(1)
            .ok_or(IdleGameError::MaxGeneratorsReached)?;

        self.update_production_rate();
        Ok(())
    }
}

#[event]
pub struct PlayerInitialized {
    pub player: Pubkey,
    pub authority: Pubkey,
}

#[event]
pub struct GeneratorPurchased {
    pub player: Pubkey,
    pub generator_id: u8,
    pub cost: u64,
    pub new_count: u32,
}

#[event]
pub struct RewardsClaimed {
    pub player: Pubkey,
    pub amount: u64,
    pub new_balance: u64,
}
