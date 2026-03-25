use std::env;

#[derive(Debug)]
pub struct Config {
    pub birdeye_api_key: String,
    pub helius_rpc_url: String,
    pub supabase_url: String,
    pub supabase_key: String,
    pub log_level: String,
}

impl Config {
    pub fn from_env() -> Self {
        Config {
            birdeye_api_key: env::var("BIRDEYE_API_KEY").expect("BIRDEYE_API_KEY must be set"),
            helius_rpc_url: env::var("HELIUS_RPC_URL").expect("HELIUS_RPC_URL must be set"),
            supabase_url: env::var("SUPABASE_URL").expect("SUPABASE_URL must be set"),
            supabase_key: env::var("SUPABASE_KEY").expect("SUPABASE_KEY must be set"),
            log_level: env::var("LOG_LEVEL").unwrap_or_else(|_| "info".to_string()),
        }
    }
}