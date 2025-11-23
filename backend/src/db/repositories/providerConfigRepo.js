const { getDatabase } = require('../connection');
const crypto = require('crypto');

// Use environment variable or generate a key (in production, store securely)
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || crypto.randomBytes(32).toString('hex');
const ALGORITHM = 'aes-256-cbc';

class ProviderConfigRepository {
  constructor() {
    this.db = getDatabase();
  }
  
  /**
   * Encrypt sensitive data
   * @param {string} text - Plain text to encrypt
   * @returns {string} Encrypted text with IV prepended
   */
  encrypt(text) {
    if (!text) return null;
    const iv = crypto.randomBytes(16);
    const key = Buffer.from(ENCRYPTION_KEY.slice(0, 64), 'hex');
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return iv.toString('hex') + ':' + encrypted;
  }
  
  /**
   * Decrypt sensitive data
   * @param {string} encrypted - Encrypted text with IV prepended
   * @returns {string} Decrypted plain text
   */
  decrypt(encrypted) {
    if (!encrypted) return null;
    const parts = encrypted.split(':');
    const iv = Buffer.from(parts[0], 'hex');
    const encryptedText = parts[1];
    const key = Buffer.from(ENCRYPTION_KEY.slice(0, 64), 'hex');
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  }
  
  /**
   * Save or update provider configuration
   * @param {Object} config
   * @param {string} config.provider_name - Unique provider identifier
   * @param {string} config.display_name - Display name
   * @param {string} config.provider_type - 'ai' or 'web_search'
   * @param {string} [config.api_key] - API key (will be encrypted)
   * @param {string} [config.api_endpoint] - Custom API endpoint
   * @param {string} [config.default_model] - Default model
   * @param {Object} [config.options] - Additional options
   * @param {boolean} [config.is_active] - Whether provider is active
   */
  saveProviderConfig({ provider_name, display_name, provider_type, api_key, api_endpoint, default_model, options, is_active = true }) {
    const stmt = this.db.prepare(`
      INSERT OR REPLACE INTO provider_configs 
      (provider_name, display_name, provider_type, api_key_encrypted, api_endpoint, default_model, options, is_active, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    `);
    
    const encrypted = api_key ? this.encrypt(api_key) : null;
    const optionsJson = options ? JSON.stringify(options) : null;
    
    return stmt.run(
      provider_name,
      display_name || provider_name,
      provider_type,
      encrypted,
      api_endpoint,
      default_model,
      optionsJson,
      is_active ? 1 : 0
    );
  }
  
  /**
   * Get provider configuration
   * @param {string} provider_name - Provider identifier
   * @returns {Object|null} Provider config with decrypted API key
   */
  getProviderConfig(provider_name) {
    const stmt = this.db.prepare('SELECT * FROM provider_configs WHERE provider_name = ?');
    const row = stmt.get(provider_name);
    
    if (!row) return null;
    
    return {
      ...row,
      api_key: row.api_key_encrypted ? this.decrypt(row.api_key_encrypted) : null,
      options: row.options ? JSON.parse(row.options) : null,
      is_active: row.is_active === 1,
    };
  }
  
  /**
   * Get all providers matching criteria
   * @param {Object} filters
   * @param {string} [filters.provider_type] - 'ai' or 'web_search'
   * @param {boolean} [filters.is_active] - Active status
   * @returns {Array} Array of provider configs
   */
  getAllProviders({ provider_type, is_active } = {}) {
    let query = 'SELECT * FROM provider_configs WHERE 1=1';
    const params = [];
    
    if (provider_type) {
      query += ' AND provider_type = ?';
      params.push(provider_type);
    }
    
    if (is_active !== undefined) {
      query += ' AND is_active = ?';
      params.push(is_active ? 1 : 0);
    }
    
    query += ' ORDER BY provider_name';
    
    const stmt = this.db.prepare(query);
    const rows = stmt.all(...params);
    
    return rows.map(row => ({
      ...row,
      api_key: row.api_key_encrypted ? this.decrypt(row.api_key_encrypted) : null,
      options: row.options ? JSON.parse(row.options) : null,
      is_active: row.is_active === 1,
    }));
  }
  
  /**
   * Delete provider configuration
   * @param {string} provider_name - Provider identifier
   */
  deleteProviderConfig(provider_name) {
    const stmt = this.db.prepare('DELETE FROM provider_configs WHERE provider_name = ?');
    return stmt.run(provider_name);
  }
  
  /**
   * Toggle provider active status
   * @param {string} provider_name - Provider identifier
   * @param {boolean} is_active - New active status
   */
  toggleProviderActive(provider_name, is_active) {
    const stmt = this.db.prepare('UPDATE provider_configs SET is_active = ?, updated_at = CURRENT_TIMESTAMP WHERE provider_name = ?');
    return stmt.run(is_active ? 1 : 0, provider_name);
  }
  
  /**
   * Update API key for provider
   * @param {string} provider_name - Provider identifier
   * @param {string} api_key - New API key
   */
  updateApiKey(provider_name, api_key) {
    const encrypted = this.encrypt(api_key);
    const stmt = this.db.prepare('UPDATE provider_configs SET api_key_encrypted = ?, updated_at = CURRENT_TIMESTAMP WHERE provider_name = ?');
    return stmt.run(encrypted, provider_name);
  }
}

module.exports = ProviderConfigRepository;
