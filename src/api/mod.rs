use std::sync::Arc;

pub struct AppState {
    pub scanner: Arc<Scanner>,
    pub verifier: Arc<Verifier>,
    pub settings: Arc<Settings>,
    pub cache_services: Arc<CacheServices>,
}