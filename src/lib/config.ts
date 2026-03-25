// src/lib/config.ts

import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = 'YOUR_SUPABASE_URL';
const supabaseAnonKey = 'YOUR_SUPABASE_ANON_KEY';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Configuration management module
class ConfigManager {
    constructor() {
        this.settings = this.loadSettings();
    }

    // Load settings from localStorage
    loadSettings() {
        const settings = localStorage.getItem('appSettings');
        return settings ? JSON.parse(settings) : {};
    }

    // Save settings to localStorage
    saveSettings() {
        localStorage.setItem('appSettings', JSON.stringify(this.settings));
    }

    // Validate settings data
    validateSettings(data) {
        // Add validation logic here
        // For example, check required fields and their types
        if (typeof data.someField !== 'string') {
            throw new Error('Invalid data type for someField');
        }
        // Additional validations can be added
    }

    // Fetch settings from Supabase
    async fetchSettingsFromSupabase() {
        const { data, error } = await supabase
            .from('settings')
            .select('*');
        if (error) console.error('Error fetching settings:', error);
        else {
            this.settings = data;
            this.saveSettings();
        }
    }

    // Example method to update a setting
    updateSetting(key, value) {
        this.validateSettings({ [key]: value });
        this.settings[key] = value;
        this.saveSettings();
    }
}

export default new ConfigManager();