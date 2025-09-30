/**
 * Site data from Ghost settings
 * This makes Ghost settings available as @site in templates
 */

const fs = require('fs');
const path = require('path');

module.exports = function() {
  const settingsPath = path.join(__dirname, 'settings.json');
  
  // Check if settings file exists (created by fetch-ghost-content.js)
  if (!fs.existsSync(settingsPath)) {
    console.warn('⚠️  Settings file not found. Run: npm run static:fetch');
    return {
      title: 'My Site',
      description: 'A Ghost blog',
      url: 'http://localhost:8080',
      locale: 'en'
    };
  }
  
  try {
    const settings = JSON.parse(fs.readFileSync(settingsPath, 'utf8'));
    
    // Transform Ghost settings to match template expectations
    return {
      title: settings.title || 'My Site',
      description: settings.description || '',
      logo: settings.logo || null,
      icon: settings.icon || null,
      cover_image: settings.cover_image || null,
      facebook: settings.facebook || null,
      twitter: settings.twitter || null,
      navigation: settings.navigation || [],
      timezone: settings.timezone || 'UTC',
      locale: settings.locale || 'en',
      url: settings.url || 'http://localhost:8080'
    };
  } catch (error) {
    console.error('❌ Error loading settings:', error.message);
    return {
      title: 'My Site',
      description: 'A Ghost blog',
      url: 'http://localhost:8080',
      locale: 'en'
    };
  }
};
