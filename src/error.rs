use actix_web::{HttpResponse, ResponseError};

// Define the BotError enum
#[derive(Debug)]
pub enum BotError {
    NotFound,
    Unauthorized,
    // Add more errors as needed
}

// Implement std::fmt::Display for BotError
impl std::fmt::Display for BotError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            BotError::NotFound => write!(f, "Resource not found"),
            BotError::Unauthorized => write!(f, "Unauthorized access"),
        }
    }
}

// Implement ResponseError for BotError
impl ResponseError for BotError {
    fn error_response(&self) -> HttpResponse {
        match self {
            BotError::NotFound => HttpResponse::NotFound().finish(),
            BotError::Unauthorized => HttpResponse::Unauthorized().finish(),
        }
    }
}
