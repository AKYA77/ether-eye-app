// src/models.rs

use serde::{Serialize};

#[derive(Serialize)]
pub struct Token {
    pub id: String,
    pub value: String,
}

#[derive(Serialize)]
pub struct Trade {
    pub symbol: String,
    pub quantity: f64,
    pub price: f64,
}

#[derive(Serialize)]
pub struct ScanResult {
    pub trades: Vec<Trade>,
    pub total_value: f64,
}

#[derive(Serialize)]
pub struct Settings {
    pub trade_enabled: bool,
    pub max_loss: f64,
}

#[derive(Serialize)]
pub struct TradeStats {
    pub total_trades: u32,
    pub profit_loss: f64,
}