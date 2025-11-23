// backend/src/routes/credentials.js
// Credential management endpoints

const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const { getDatabase } = require('../database/db');

// Encryption key from environment
const ENCRYPTION_KEY = process.env.CREDENTIALS_ENCRYPTION_KEY || crypto.randomBytes(32);

if (!process.env.CREDENTIALS_ENCRYPTION_KEY) {
  console.warn('⚠️  CREDENTIALS_ENCRYPTION_KEY not set, using random key (credentials will not persist across restarts)');
}

function encrypt(text) {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-gcm', Buffer.from(ENCRYPTION_KEY), iv);
  
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  const authTag = cipher.getAuthTag();
  
  return iv.toString('hex') + ':' + authTag.toString('hex') + ':' + encrypted;
}

function decrypt(encryptedData) {
  const parts = encryptedData.split(':');
  const iv = Buffer.from(parts[0], 'hex');
  const authTag = Buffer.from(parts[1], 'hex');
  const encrypted = parts[2];
  
  const decipher = crypto.createDecipheriv('aes-256-gcm', Buffer.from(ENCRYPTION_KEY), iv);
  decipher.setAuthTag(authTag);
  
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  
  return decrypted;
}

// GET /api/credentials - List all credentials (masked)
router.get('/', (req, res) => {
  try {
    const db = getDatabase();
    const credentials = db.prepare(`
      SELECT id, provider, key_name, created_at, updated_at, expires_at, 
             is_active, last_validated_at, validation_status
      FROM credentials
      WHERE is_active = 1
      ORDER BY provider, key_name
    `).all();

    res.json({ credentials });
  } catch (error) {
    console.error('Error listing credentials:', error);
    res.status(500).json({ error: 'server_error', message: error.message });
  }
});

// POST /api/credentials - Add new credential
router.post('/', (req, res) => {
  try {
    const { provider, key_name, value, expires_at } = req.body;

    if (!provider || !key_name || !value) {
      return res.status(400).json({ error: 'missing_required_fields' });
    }

    const encrypted_value = encrypt(value);
    const db = getDatabase();
    
    const stmt = db.prepare(`
      INSERT OR REPLACE INTO credentials 
      (provider, key_name, encrypted_value, expires_at, updated_at, validation_status)
      VALUES (?, ?, ?, ?, datetime('now'), 'unknown')
    `);

    const result = stmt.run(provider, key_name, encrypted_value, expires_at || null);

    res.json({ 
      id: result.lastInsertRowid,
      provider,
      key_name,
      message: 'Credential saved successfully'
    });
  } catch (error) {
    console.error('Error saving credential:', error);
    res.status(500).json({ error: 'server_error', message: error.message });
  }
});

// GET /api/credentials/:id - Get specific credential (decrypted, requires auth)
router.get('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const db = getDatabase();
    
    const credential = db.prepare(`
      SELECT * FROM credentials WHERE id = ? AND is_active = 1
    `).get(id);

    if (!credential) {
      return res.status(404).json({ error: 'credential_not_found' });
    }

    // Decrypt the value for authorized access
    const decrypted_value = decrypt(credential.encrypted_value);

    res.json({
      id: credential.id,
      provider: credential.provider,
      key_name: credential.key_name,
      value: decrypted_value,
      created_at: credential.created_at,
      updated_at: credential.updated_at,
      expires_at: credential.expires_at
    });
  } catch (error) {
    console.error('Error getting credential:', error);
    res.status(500).json({ error: 'server_error', message: error.message });
  }
});

// PUT /api/credentials/:id - Update credential
router.put('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { value, expires_at } = req.body;

    if (!value) {
      return res.status(400).json({ error: 'value_required' });
    }

    const encrypted_value = encrypt(value);
    const db = getDatabase();
    
    const stmt = db.prepare(`
      UPDATE credentials 
      SET encrypted_value = ?, expires_at = ?, updated_at = datetime('now'), validation_status = 'unknown'
      WHERE id = ? AND is_active = 1
    `);

    const result = stmt.run(encrypted_value, expires_at || null, id);

    if (result.changes === 0) {
      return res.status(404).json({ error: 'credential_not_found' });
    }

    res.json({ message: 'Credential updated successfully' });
  } catch (error) {
    console.error('Error updating credential:', error);
    res.status(500).json({ error: 'server_error', message: error.message });
  }
});

// DELETE /api/credentials/:id - Delete credential
router.delete('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const db = getDatabase();
    
    const stmt = db.prepare(`
      UPDATE credentials SET is_active = 0, updated_at = datetime('now')
      WHERE id = ?
    `);

    const result = stmt.run(id);

    if (result.changes === 0) {
      return res.status(404).json({ error: 'credential_not_found' });
    }

    res.json({ message: 'Credential deleted successfully' });
  } catch (error) {
    console.error('Error deleting credential:', error);
    res.status(500).json({ error: 'server_error', message: error.message });
  }
});

// POST /api/credentials/:id/test - Test credential validity
router.post('/:id/test', async (req, res) => {
  try {
    const { id } = req.params;
    const db = getDatabase();
    
    const credential = db.prepare(`
      SELECT * FROM credentials WHERE id = ? AND is_active = 1
    `).get(id);

    if (!credential) {
      return res.status(404).json({ error: 'credential_not_found' });
    }

    // Test the credential based on provider
    let isValid = false;
    try {
      const value = decrypt(credential.encrypted_value);
      
      // Import provider and test
      const providerRegistry = require('../services/ai/registry');
      
      if (providerRegistry.has(credential.provider)) {
        const ProviderClass = require(`../services/ai/providers/${credential.provider}`);
        const provider = new ProviderClass({ apiKey: value });
        isValid = await provider.validateConnection();
      }
    } catch (error) {
      console.error('Validation error:', error);
      isValid = false;
    }

    // Update validation status
    db.prepare(`
      UPDATE credentials 
      SET last_validated_at = datetime('now'), validation_status = ?
      WHERE id = ?
    `).run(isValid ? 'valid' : 'invalid', id);

    res.json({ 
      provider: credential.provider,
      key_name: credential.key_name,
      valid: isValid
    });
  } catch (error) {
    console.error('Error testing credential:', error);
    res.status(500).json({ error: 'server_error', message: error.message });
  }
});

module.exports = router;
