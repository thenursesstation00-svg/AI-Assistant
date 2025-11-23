// backend/src/services/ai/integrationFramework.js
// AI Integration Framework - Connect with Local and Online Apps

const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');
const { getDatabase } = require('../../database/db');
const selfAwareness = require('./selfAwareness');
const autonomousLearning = require('./autonomousLearning');

class IntegrationFramework {
  constructor() {
    this.connectorsPath = path.join(__dirname, '../../../data/connectors');
    this.initializeFramework();
  }

  initializeFramework() {
    // Create connectors directory
    if (!fs.existsSync(this.connectorsPath)) {
      fs.mkdirSync(this.connectorsPath, { recursive: true });
    }

    const db = getDatabase();
    
    db.exec(`
      CREATE TABLE IF NOT EXISTS app_integrations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        integration_id TEXT UNIQUE NOT NULL,
        app_name TEXT NOT NULL,
        app_type TEXT NOT NULL,
        connection_type TEXT NOT NULL,
        status TEXT DEFAULT 'inactive',
        config TEXT,
        credentials TEXT,
        last_sync TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS integration_actions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        action_id TEXT UNIQUE NOT NULL,
        integration_id TEXT NOT NULL,
        action_type TEXT NOT NULL,
        action_name TEXT NOT NULL,
        parameters TEXT,
        response_schema TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (integration_id) REFERENCES app_integrations(integration_id)
      );

      CREATE TABLE IF NOT EXISTS integration_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        integration_id TEXT NOT NULL,
        action_type TEXT,
        direction TEXT NOT NULL,
        data TEXT,
        success BOOLEAN,
        error_message TEXT,
        logged_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (integration_id) REFERENCES app_integrations(integration_id)
      );

      CREATE TABLE IF NOT EXISTS webhooks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        webhook_id TEXT UNIQUE NOT NULL,
        integration_id TEXT,
        url TEXT NOT NULL,
        events TEXT,
        secret TEXT,
        status TEXT DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX IF NOT EXISTS idx_integrations_status ON app_integrations(status);
      CREATE INDEX IF NOT EXISTS idx_logs_integration ON integration_logs(integration_id);
    `);

    this.loadBuiltInConnectors();
  }

  loadBuiltInConnectors() {
    // Pre-configured connectors for popular apps
    const builtInConnectors = [
      {
        name: 'GitHub',
        type: 'development',
        connection_type: 'api',
        actions: ['create_repo', 'create_issue', 'create_pr', 'get_repos']
      },
      {
        name: 'Gmail',
        type: 'communication',
        connection_type: 'api',
        actions: ['send_email', 'read_emails', 'search_emails']
      },
      {
        name: 'Slack',
        type: 'communication',
        connection_type: 'webhook',
        actions: ['send_message', 'create_channel', 'invite_user']
      },
      {
        name: 'Google Calendar',
        type: 'productivity',
        connection_type: 'api',
        actions: ['create_event', 'list_events', 'update_event']
      },
      {
        name: 'Notion',
        type: 'productivity',
        connection_type: 'api',
        actions: ['create_page', 'query_database', 'update_page']
      },
      {
        name: 'Trello',
        type: 'project_management',
        connection_type: 'api',
        actions: ['create_card', 'move_card', 'add_comment']
      },
      {
        name: 'Discord',
        type: 'communication',
        connection_type: 'webhook',
        actions: ['send_message', 'create_channel', 'manage_roles']
      },
      {
        name: 'Zapier',
        type: 'automation',
        connection_type: 'webhook',
        actions: ['trigger_zap', 'create_zap']
      }
    ];

    // Store in database
    const db = getDatabase();
    builtInConnectors.forEach(connector => {
      const integrationId = `builtin_${connector.name.toLowerCase().replace(/\s+/g, '_')}`;
      
      db.prepare(`
        INSERT OR IGNORE INTO app_integrations 
        (integration_id, app_name, app_type, connection_type, status, config)
        VALUES (?, ?, ?, ?, 'available', ?)
      `).run(
        integrationId,
        connector.name,
        connector.type,
        connector.connection_type,
        JSON.stringify({ built_in: true, actions: connector.actions })
      );
    });
  }

  /**
   * Connect to an application
   */
  async connect(appConfig) {
    const {
      app_name,
      app_type,
      connection_type,
      credentials = {},
      custom_config = {}
    } = appConfig;

    console.log(`🔌 Connecting to ${app_name}...`);

    const integrationId = `int_${Date.now()}_${this.generateId()}`;
    const db = getDatabase();

    // Test connection
    const connectionValid = await this.testConnection(connection_type, credentials);
    if (!connectionValid) {
      throw new Error(`Failed to connect to ${app_name}`);
    }

    // Store integration
    db.prepare(`
      INSERT INTO app_integrations 
      (integration_id, app_name, app_type, connection_type, status, config, credentials)
      VALUES (?, ?, ?, ?, 'active', ?, ?)
    `).run(
      integrationId,
      app_name,
      app_type,
      connection_type,
      JSON.stringify(custom_config),
      JSON.stringify(this.encryptCredentials(credentials))
    );

    // AI learns about this integration
    await autonomousLearning.learnConcept({
      name: `integration_${app_name.replace(/\s+/g, '_').toLowerCase()}`,
      description: `Integration with ${app_name} application`,
      context: { integration_id: integrationId, type: app_type },
      confidence: 0.9
    });

    // Store memory
    selfAwareness.storeMemory('integration_connected', {
      integration_id: integrationId,
      app_name
    }, {
      importance: 8,
      tags: ['integration', 'capability_expansion']
    });

    console.log(`✅ Connected to ${app_name} (${integrationId})`);

    return {
      integration_id: integrationId,
      app_name,
      status: 'active',
      connection_type
    };
  }

  async testConnection(connectionType, credentials) {
    // Simplified connection testing
    switch (connectionType) {
      case 'api':
        return credentials.api_key || credentials.access_token ? true : false;
      case 'webhook':
        return credentials.webhook_url ? true : false;
      case 'oauth':
        return credentials.access_token && credentials.refresh_token ? true : false;
      default:
        return true;
    }
  }

  /**
   * Execute an action on an integrated app
   */
  async executeAction(integrationId, actionType, params = {}) {
    const db = getDatabase();
    
    const integration = db.prepare(`
      SELECT * FROM app_integrations WHERE integration_id = ?
    `).get(integrationId);

    if (!integration) {
      throw new Error('Integration not found');
    }

    if (integration.status !== 'active') {
      throw new Error('Integration is not active');
    }

    console.log(`⚡ Executing ${actionType} on ${integration.app_name}`);

    const startTime = Date.now();
    
    try {
      const result = await this.performAction(
        integration,
        actionType,
        params
      );

      const executionTime = Date.now() - startTime;

      // Log successful action
      db.prepare(`
        INSERT INTO integration_logs 
        (integration_id, action_type, direction, data, success)
        VALUES (?, ?, 'outbound', ?, 1)
      `).run(integrationId, actionType, JSON.stringify({ params, result }));

      // Update last sync
      db.prepare(`
        UPDATE app_integrations SET last_sync = CURRENT_TIMESTAMP
        WHERE integration_id = ?
      `).run(integrationId);

      console.log(`✅ Action completed in ${executionTime}ms`);

      return {
        success: true,
        result,
        execution_time_ms: executionTime
      };
    } catch (error) {
      // Log error
      db.prepare(`
        INSERT INTO integration_logs 
        (integration_id, action_type, direction, success, error_message)
        VALUES (?, ?, 'outbound', 0, ?)
      `).run(integrationId, actionType, error.message);

      throw error;
    }
  }

  async performAction(integration, actionType, params) {
    const config = JSON.parse(integration.config || '{}');
    const credentials = this.decryptCredentials(JSON.parse(integration.credentials || '{}'));

    // Route to appropriate connector
    switch (integration.app_name.toLowerCase()) {
      case 'github':
        return await this.executeGitHubAction(actionType, params, credentials);
      case 'slack':
        return await this.executeSlackAction(actionType, params, credentials);
      case 'discord':
        return await this.executeDiscordAction(actionType, params, credentials);
      default:
        return await this.executeGenericAction(integration, actionType, params, credentials);
    }
  }

  async executeGitHubAction(actionType, params, credentials) {
    const { api_key } = credentials;
    
    switch (actionType) {
      case 'create_issue':
        return await this.makeAPICall({
          method: 'POST',
          url: `https://api.github.com/repos/${params.owner}/${params.repo}/issues`,
          headers: {
            'Authorization': `token ${api_key}`,
            'User-Agent': 'AI-Assistant'
          },
          body: {
            title: params.title,
            body: params.body,
            labels: params.labels || []
          }
        });
      
      case 'get_repos':
        return await this.makeAPICall({
          method: 'GET',
          url: 'https://api.github.com/user/repos',
          headers: {
            'Authorization': `token ${api_key}`,
            'User-Agent': 'AI-Assistant'
          }
        });

      default:
        throw new Error(`Unsupported GitHub action: ${actionType}`);
    }
  }

  async executeSlackAction(actionType, params, credentials) {
    const { webhook_url } = credentials;
    
    switch (actionType) {
      case 'send_message':
        return await this.makeAPICall({
          method: 'POST',
          url: webhook_url,
          body: {
            text: params.text,
            channel: params.channel,
            username: 'AI Assistant'
          }
        });

      default:
        throw new Error(`Unsupported Slack action: ${actionType}`);
    }
  }

  async executeDiscordAction(actionType, params, credentials) {
    const { webhook_url } = credentials;
    
    switch (actionType) {
      case 'send_message':
        return await this.makeAPICall({
          method: 'POST',
          url: webhook_url,
          body: {
            content: params.content,
            username: 'AI Assistant',
            embeds: params.embeds || []
          }
        });

      default:
        throw new Error(`Unsupported Discord action: ${actionType}`);
    }
  }

  async executeGenericAction(integration, actionType, params, credentials) {
    // Generic action executor for custom integrations
    const config = JSON.parse(integration.config || '{}');
    
    if (config.endpoint) {
      return await this.makeAPICall({
        method: params.method || 'POST',
        url: config.endpoint,
        headers: {
          ...config.headers,
          'Authorization': `Bearer ${credentials.api_key || credentials.access_token}`
        },
        body: params
      });
    }

    throw new Error('No endpoint configured for this integration');
  }

  makeAPICall(options) {
    return new Promise((resolve, reject) => {
      const { method, url, headers = {}, body } = options;
      const urlObj = new URL(url);
      const protocol = urlObj.protocol === 'https:' ? https : http;

      const requestOptions = {
        method,
        hostname: urlObj.hostname,
        path: urlObj.pathname + urlObj.search,
        headers: {
          'Content-Type': 'application/json',
          ...headers
        }
      };

      const req = protocol.request(requestOptions, (res) => {
        let data = '';

        res.on('data', (chunk) => {
          data += chunk;
        });

        res.on('end', () => {
          try {
            const parsed = data ? JSON.parse(data) : {};
            if (res.statusCode >= 200 && res.statusCode < 300) {
              resolve(parsed);
            } else {
              reject(new Error(`API call failed: ${res.statusCode} ${data}`));
            }
          } catch (error) {
            reject(new Error(`Failed to parse response: ${error.message}`));
          }
        });
      });

      req.on('error', reject);

      if (body) {
        req.write(JSON.stringify(body));
      }

      req.end();
    });
  }

  /**
   * Create a webhook receiver
   */
  async createWebhook(webhookConfig) {
    const {
      integration_id = null,
      events = ['all'],
      callback_url
    } = webhookConfig;

    const webhookId = `webhook_${Date.now()}_${this.generateId()}`;
    const secret = this.generateSecret();
    const db = getDatabase();

    db.prepare(`
      INSERT INTO webhooks 
      (webhook_id, integration_id, url, events, secret)
      VALUES (?, ?, ?, ?, ?)
    `).run(
      webhookId,
      integration_id,
      callback_url,
      JSON.stringify(events),
      secret
    );

    console.log(`📥 Webhook created: ${webhookId}`);

    return {
      webhook_id: webhookId,
      url: callback_url,
      secret,
      events
    };
  }

  /**
   * Handle incoming webhook
   */
  async handleWebhook(webhookId, payload, signature = null) {
    const db = getDatabase();
    
    const webhook = db.prepare('SELECT * FROM webhooks WHERE webhook_id = ?').get(webhookId);
    if (!webhook) {
      throw new Error('Webhook not found');
    }

    // Verify signature if provided
    if (signature && !this.verifySignature(payload, signature, webhook.secret)) {
      throw new Error('Invalid webhook signature');
    }

    console.log(`📨 Webhook received: ${webhookId}`);

    // Log webhook
    if (webhook.integration_id) {
      db.prepare(`
        INSERT INTO integration_logs 
        (integration_id, action_type, direction, data, success)
        VALUES (?, 'webhook_received', 'inbound', ?, 1)
      `).run(webhook.integration_id, JSON.stringify(payload));
    }

    // AI learns from webhook data
    await autonomousLearning.learnFromInteraction({
      type: 'webhook',
      content: JSON.stringify(payload),
      metadata: { webhook_id: webhookId }
    });

    return { received: true, webhook_id: webhookId };
  }

  /**
   * List all integrations
   */
  listIntegrations(filter = {}) {
    const db = getDatabase();
    
    let query = 'SELECT * FROM app_integrations WHERE 1=1';
    const params = [];

    if (filter.status) {
      query += ' AND status = ?';
      params.push(filter.status);
    }

    if (filter.app_type) {
      query += ' AND app_type = ?';
      params.push(filter.app_type);
    }

    query += ' ORDER BY created_at DESC';

    return db.prepare(query).all(...params);
  }

  /**
   * Get integration details
   */
  getIntegrationDetails(integrationId) {
    const db = getDatabase();
    
    const integration = db.prepare(`
      SELECT * FROM app_integrations WHERE integration_id = ?
    `).get(integrationId);

    if (!integration) {
      throw new Error('Integration not found');
    }

    const actions = db.prepare(`
      SELECT * FROM integration_actions WHERE integration_id = ?
    `).all(integrationId);

    const recentLogs = db.prepare(`
      SELECT * FROM integration_logs 
      WHERE integration_id = ?
      ORDER BY logged_at DESC
      LIMIT 10
    `).all(integrationId);

    return {
      ...integration,
      config: JSON.parse(integration.config || '{}'),
      actions,
      recent_activity: recentLogs
    };
  }

  // Security helpers
  encryptCredentials(credentials) {
    // In production, use proper encryption
    return credentials;
  }

  decryptCredentials(encryptedCreds) {
    // In production, use proper decryption
    return encryptedCreds;
  }

  verifySignature(payload, signature, secret) {
    // In production, implement proper HMAC verification
    return true;
  }

  generateSecret() {
    return Math.random().toString(36).substring(2, 15) +
           Math.random().toString(36).substring(2, 15);
  }

  generateId() {
    return Math.random().toString(36).substring(2, 10);
  }
}

module.exports = new IntegrationFramework();
