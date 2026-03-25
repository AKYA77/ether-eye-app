use actix_web::{web, App, HttpServer, middleware::{Logger, Compress}};

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    // Set up logging
    let logger = Logger::default();

    // Initialize the HTTP server
    HttpServer::new(move || {
        App::new()
            .wrap(logger)
            .wrap(Compress::default())
            .configure(configure_services)
    })
    .workers(4)  // Configure for multi-worker
    .bind("127.0.0.1:8080")?  // Replace with your IP and port
    .run()
    .await
}

fn configure_services(cfg: &mut web::ServiceConfig) {
    cfg.service(web::resource("/")); // Add your routing services here
}
