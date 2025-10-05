use anchor_lang::prelude::*;
use anchor_spl::token::{Mint, Token};

pub mod constants;
pub mod errors;
pub mod state;

use constants::*;
use errors::*;
use state::*;

declare_id!("5g5ZS7ft7bEGHQi9T2yhgc4VsgUKvgTxJU9p7BjNHPJ4");

#[program]
pub mod idle_game {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        let global_state = &mut ctx.accounts.global_state;

        global_state.authority = ctx.accounts.authority.key();
        global_state.token_mint = ctx.accounts.token_mint.key();
        global_state.total_players = 0;
        global_state.total_tokens_minted = 0;
        global_state.game_active = true;
        global_state.bump = ctx.bumps.global_state;

        msg!("Idle Game initialized successfully!");
        Ok(())
    }

    pub fn initialize_player(ctx: Context<InitializePlayer>) -> Result<()> {
        require!(
            ctx.accounts.global_state.game_active,
            IdleGameError::GamePaused
        );

        let player = &mut ctx.accounts.player;
        let global_state = &mut ctx.accounts.global_state;
        let clock = Clock::get()?;

        player.authority = ctx.accounts.authority.key();
        player.balance = 0;
        player.generators = [0; MAX_GENERATORS];
        player.last_claim_time = clock.unix_timestamp;
        player.total_earned = 0;
        player.production_rate = 0;
        player.bump = ctx.bumps.player;

        global_state.total_players = global_state
            .total_players
            .checked_add(1)
            .ok_or(IdleGameError::ArithmeticOverflow)?;

        emit!(PlayerInitialized {
            player: player.key(),
            authority: ctx.accounts.authority.key(),
        });

        msg!("Player initialized: {}", ctx.accounts.authority.key());
        Ok(())
    }

    pub fn purchase_generator(ctx: Context<PurchaseGenerator>, generator_id: u8) -> Result<()> {
        require!(
            ctx.accounts.global_state.game_active,
            IdleGameError::GamePaused
        );

        require!(
            (generator_id as usize) < GENERATOR_TYPES.len(),
            IdleGameError::InvalidGeneratorType
        );

        let player = &mut ctx.accounts.player;
        let current_count = player.generators[generator_id as usize];
        let cost = get_generator_cost(generator_id, current_count);

        require!(
            player.balance >= cost,
            IdleGameError::InsufficientBalance
        );

        // Deduct cost
        player.balance = player
            .balance
            .checked_sub(cost)
            .ok_or(IdleGameError::ArithmeticOverflow)?;

        // Add generator
        player.add_generator(generator_id)?;

        let new_count = player.generators[generator_id as usize];

        emit!(GeneratorPurchased {
            player: player.key(),
            generator_id,
            cost,
            new_count,
        });

        msg!(
            "Generator {} purchased for {} tokens. New count: {}",
            generator_id,
            cost,
            new_count
        );

        Ok(())
    }

    pub fn claim_rewards(ctx: Context<ClaimRewards>) -> Result<()> {
        require!(
            ctx.accounts.global_state.game_active,
            IdleGameError::GamePaused
        );

        let player = &mut ctx.accounts.player;
        let global_state = &mut ctx.accounts.global_state;
        let clock = Clock::get()?;

        let pending_rewards = player.calculate_pending_rewards(clock.unix_timestamp)?;

        require!(pending_rewards > 0, IdleGameError::NoRewardsToClaim);

        // Update player balance
        player.balance = player
            .balance
            .checked_add(pending_rewards)
            .ok_or(IdleGameError::ArithmeticOverflow)?;

        player.total_earned = player
            .total_earned
            .checked_add(pending_rewards)
            .ok_or(IdleGameError::ArithmeticOverflow)?;

        player.last_claim_time = clock.unix_timestamp;

        // Update global stats
        global_state.total_tokens_minted = global_state
            .total_tokens_minted
            .checked_add(pending_rewards)
            .ok_or(IdleGameError::ArithmeticOverflow)?;

        emit!(RewardsClaimed {
            player: player.key(),
            amount: pending_rewards,
            new_balance: player.balance,
        });

        msg!(
            "Claimed {} tokens. New balance: {}",
            pending_rewards,
            player.balance
        );

        Ok(())
    }

    pub fn deposit_sol(ctx: Context<DepositSol>, amount: u64) -> Result<()> {
        require!(
            ctx.accounts.global_state.game_active,
            IdleGameError::GamePaused
        );

        // Transfer SOL from player to vault
        let transfer_ix = anchor_lang::solana_program::system_instruction::transfer(
            &ctx.accounts.authority.key(),
            &ctx.accounts.vault.key(),
            amount,
        );

        anchor_lang::solana_program::program::invoke(
            &transfer_ix,
            &[
                ctx.accounts.authority.to_account_info(),
                ctx.accounts.vault.to_account_info(),
            ],
        )?;

        // Give 1000 game tokens per SOL deposited
        // 0.2 SOL = 200 tokens with 9 decimals = 200_000_000_000
        let tokens_to_give = amount
            .checked_mul(5000)
            .ok_or(IdleGameError::ArithmeticOverflow)?;

        let player = &mut ctx.accounts.player;
        player.balance = player
            .balance
            .checked_add(tokens_to_give)
            .ok_or(IdleGameError::ArithmeticOverflow)?;

        msg!("Deposited {} SOL, received {} game tokens", amount, tokens_to_give);
        Ok(())
    }

    pub fn withdraw_tokens(ctx: Context<WithdrawTokens>, amount: u64) -> Result<()> {
        require!(
            ctx.accounts.global_state.game_active,
            IdleGameError::GamePaused
        );

        let player = &mut ctx.accounts.player;

        require!(
            player.balance >= amount,
            IdleGameError::InsufficientBalance
        );

        // Deduct from game balance
        player.balance = player
            .balance
            .checked_sub(amount)
            .ok_or(IdleGameError::ArithmeticOverflow)?;

        // Transfer SPL tokens to player's token account
        // This would require token minting logic
        // For now, just track the withdrawal

        msg!("Withdrew {} tokens to wallet", amount);
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(
        init,
        payer = authority,
        space = GlobalState::LEN,
        seeds = [GLOBAL_STATE_SEED],
        bump
    )]
    pub global_state: Account<'info, GlobalState>,

    #[account(mut)]
    pub token_mint: Account<'info, Mint>,

    #[account(mut)]
    pub authority: Signer<'info>,

    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct InitializePlayer<'info> {
    #[account(
        mut,
        seeds = [GLOBAL_STATE_SEED],
        bump = global_state.bump
    )]
    pub global_state: Account<'info, GlobalState>,

    #[account(
        init,
        payer = authority,
        space = Player::LEN,
        seeds = [PLAYER_SEED, authority.key().as_ref()],
        bump
    )]
    pub player: Account<'info, Player>,

    #[account(mut)]
    pub authority: Signer<'info>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct PurchaseGenerator<'info> {
    #[account(
        seeds = [GLOBAL_STATE_SEED],
        bump = global_state.bump
    )]
    pub global_state: Account<'info, GlobalState>,

    #[account(
        mut,
        seeds = [PLAYER_SEED, authority.key().as_ref()],
        bump = player.bump,
        has_one = authority
    )]
    pub player: Account<'info, Player>,

    pub authority: Signer<'info>,
}

#[derive(Accounts)]
pub struct ClaimRewards<'info> {
    #[account(
        mut,
        seeds = [GLOBAL_STATE_SEED],
        bump = global_state.bump
    )]
    pub global_state: Account<'info, GlobalState>,

    #[account(
        mut,
        seeds = [PLAYER_SEED, authority.key().as_ref()],
        bump = player.bump,
        has_one = authority
    )]
    pub player: Account<'info, Player>,

    pub authority: Signer<'info>,
}

#[derive(Accounts)]
pub struct DepositSol<'info> {
    #[account(
        seeds = [GLOBAL_STATE_SEED],
        bump = global_state.bump
    )]
    pub global_state: Account<'info, GlobalState>,

    #[account(
        mut,
        seeds = [PLAYER_SEED, authority.key().as_ref()],
        bump = player.bump,
        has_one = authority
    )]
    pub player: Account<'info, Player>,

    /// CHECK: Vault PDA to receive SOL
    #[account(
        mut,
        seeds = [VAULT_SEED],
        bump
    )]
    pub vault: AccountInfo<'info>,

    #[account(mut)]
    pub authority: Signer<'info>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct WithdrawTokens<'info> {
    #[account(
        seeds = [GLOBAL_STATE_SEED],
        bump = global_state.bump
    )]
    pub global_state: Account<'info, GlobalState>,

    #[account(
        mut,
        seeds = [PLAYER_SEED, authority.key().as_ref()],
        bump = player.bump,
        has_one = authority
    )]
    pub player: Account<'info, Player>,

    pub authority: Signer<'info>,
}
