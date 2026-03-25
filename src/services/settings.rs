pub struct SettingsManager {
    settings: Settings,
}

impl SettingsManager {
    // Creates a new SettingsManager
    pub fn new() -> Self {
        SettingsManager {
            settings: Settings::default(),
        }
    }

    // Method to get the current settings
    pub fn get(&self) -> &Settings {
        &self.settings
    }

    // Method to update the settings
    pub fn update(&mut self, new_settings: Settings) {
        self.settings = new_settings;
    }
}

#[derive(Default)]
pub struct Settings {
    // Define your settings fields here
    pub example_field: String,
}