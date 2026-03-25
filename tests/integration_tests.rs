// integration_tests.rs

#[cfg(test)]
mod tests {
    use super::*;
    use tokio;  

    #[tokio::test]
    async fn test_settings_persistence() {
        // Setup code for the API

        // Example test for fetching settings
        let response = reqwest::get("http://localhost:8080/api/settings").await;
        assert!(response.is_ok());

        // Example test for updating settings
        let new_settings = ...; // Define your new settings here
        let client = reqwest::Client::new();
        let update_response = client
            .post("http://localhost:8080/api/settings/update")
            .json(&new_settings)
            .send()
            .await;
        assert!(update_response.is_ok());
    }
}