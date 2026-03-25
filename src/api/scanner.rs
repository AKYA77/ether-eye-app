use actix_web::{web, HttpResponse, Responder};

pub struct TokenScanner;

impl TokenScanner {
    pub fn new() -> Self {
        TokenScanner {}
    }

    pub async fn scan(&self) -> impl Responder {
        // Implementation for scanning
        HttpResponse::Ok().body("Scan initiated.")
    }

    pub async fn progress(&self) -> impl Responder {
        // Implementation for checking progress
        HttpResponse::Ok().body("Progress report.")
    }
}

pub fn configure_routes(cfg: &mut web::ServiceConfig) {
    cfg.service(
        web::resource("/scanner/scan")
            .route(web::post().to(|scanner: web::Data<TokenScanner>| scanner.scan())),
    )
    .service(
        web::resource("/scanner/progress")
            .route(web::get().to(|scanner: web::Data<TokenScanner>| scanner.progress())),
    );
}