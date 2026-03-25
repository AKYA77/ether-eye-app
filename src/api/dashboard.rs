use actix_web::{get, web, HttpResponse};

#[get("/dashboard/stats")]
async fn get_dashboard_stats() -> HttpResponse {
    // Logic to get dashboard stats
    HttpResponse::Ok().json("Statistics data")
}

#[get("/dashboard/top-tokens")]
async fn get_top_tokens() -> HttpResponse {
    // Logic to get top tokens
    HttpResponse::Ok().json("Top tokens data")
}

pub fn dashboard_scope() -> actix_web::Scope {
    web::scope("/dashboard")
        .service(get_dashboard_stats)
        .service(get_top_tokens)
}