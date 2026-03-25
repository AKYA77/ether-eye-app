// src/api/settings.rs

use actix_web::{web, HttpResponse, Responder};

struct SettingsManager;

impl SettingsManager {
    pub fn get_settings() -> HttpResponse {
        // Logic to get settings
        HttpResponse::Ok().body("Settings retrieved successfully")
    }

    pub fn update_settings(settings: String) -> HttpResponse {
        // Logic to update settings
        HttpResponse::Ok().body("Settings updated successfully")
    }
}

pub fn config(cfg: &mut web::ServiceConfig) {
    cfg
        .service(web::resource("/settings/get").route(web::get().to(SettingsManager::get_settings)))
        .service(web::resource("/settings/update").route(web::post().to(SettingsManager::update_settings))); 
}
