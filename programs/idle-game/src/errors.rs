use anchor_lang::prelude::*;

#[error_code]
pub enum IdleGameError {
    #[msg("Arithmetic overflow occurred")]
    ArithmeticOverflow,

    #[msg("Invalid generator type")]
    InvalidGeneratorType,

    #[msg("Insufficient balance to purchase generator")]
    InsufficientBalance,

    #[msg("Maximum generators reached")]
    MaxGeneratorsReached,

    #[msg("No rewards to claim")]
    NoRewardsToClaim,

    #[msg("Invalid calculation")]
    InvalidCalculation,

    #[msg("Game is paused")]
    GamePaused,

    #[msg("Unauthorized admin action")]
    UnauthorizedAdmin,
}
