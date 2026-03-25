use actix_web::{get, post, web::{Json, Path}};

#[get("/trades/detail/{id}")]
async fn get_trade_detail(Path(id): Path<String>) -> Json<&'static str> {
    // Implement the logic for fetching trade details here
    Json("Trade details for the given ID")
}

#[post("/trades/verify")]
async fn verify_trade(Json(payload): Json<YourPayloadType>) -> Json<&'static str> {
    // Implement the logic for verifying trades here
    Json("Trade verification logic goes here")
}

// Define your payload type here
#[derive(Deserialize)]
struct YourPayloadType {
    // Fields for your verification payload
}