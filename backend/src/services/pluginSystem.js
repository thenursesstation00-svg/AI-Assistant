/**
 * Plugin System Architecture
 * 
 * Extensible plugin system allowing third-party extensions for:
 * - Custom tools and capabilities
 * - Knowledge sources
 * - UI components
 * - API integrations
 * 
 * References:
 * - VSCode Extension API: https://code.visualstudio.com/api
 * - WordPress Plugin API: https://developer.wordpress.org/plugins/
 * - Obsidian Plugin API: https://docs.obsidian.md/Plugins/Getting+started/
 */

/**
 * Plugin interface - all plugins must implement this
 * @interface Plugin
 */
class Plugin {
  constructor(manifest) {
    this.manifest = manifest || {};
    this.id = manifest.id || '';
    this.name = manifest.name || '';
    this.version = manifest.version || '1.0.0';
    this.author = manifest.author || '';
    this.description = manifest.description || '';
    this.capabilities = manifest.capabilities || [];
    this.enabled = false;
  }

  /**
   * Initialize the plugin
   * @param {Object} context - Application context
   */
  async initialize(context) {
    throw new Error('initialize() must be implemented by plugin');
  }

  /**
   * Activate the plugin
   */
  async activate() {
    this.enabled = true;
  }

  /**
   * Deactivate the plugin
   */
  async deactivate() {
    this.enabled = false;
  }

  /**
   * Cleanup on plugin unload
   */
  async dispose() {
    await this.deactivate();
  }

  /**
   * Get plugin metadata
   * @returns {Object} Plugin manifest
   */
  getManifest() {
    return this.manifest;
  }
}

/**
 * Tool Plugin - Adds custom tools/functions the AI can use
 */
class ToolPlugin extends Plugin {
  constructor(manifest) {
    super(manifest);
    this.tools = [];
  }

  /**
   * Register tools that the AI can invoke
   * @param {Array<Object>} tools - Tool definitions
   */
  registerTools(tools) {
    this.tools = tools;
  }

  /**
   * Execute a tool
   * @param {String} toolName - Tool to execute
   * @param {Object} parameters - Tool parameters
   * @returns {Promise<Object>} Tool result
   */
  async executeTool(toolName, parameters) {
    const tool = this.tools.find(t => t.name === toolName);
    if (!tool) {
      throw new Error(`Tool ${toolName} not found`);
    }
    return await tool.execute(parameters);
  }

  /**
   * Get tool definitions for AI
   * @returns {Array<Object>} Tool schemas
   */
  getToolDefinitions() {
    return this.tools.map(tool => ({
      name: tool.name,
      description: tool.description,
      parameters: tool.parameters
    }));
  }
}

/**
 * Knowledge Plugin - Adds custom knowledge sources
 */
class KnowledgePlugin extends Plugin {
  constructor(manifest) {
    super(manifest);
    this.sources = [];
  }

  /**
   * Add a knowledge source
   * @param {Object} source - Knowledge source definition
   */
  addSource(source) {
    this.sources.push(source);
  }

  /**
   * Query knowledge sources
   * @param {String} query - Search query
   * @param {Object} options - Query options
   * @returns {Promise<Array>} Relevant knowledge
   */
  async query(query, options = {}) {
    const results = [];
    for (const source of this.sources) {
      if (source.enabled) {
        const sourceResults = await source.search(query, options);
        results.push(...sourceResults);
      }
    }
    return results;
  }
}

/**
 * UI Plugin - Adds custom UI components
 */
class UIPlugin extends Plugin {
  constructor(manifest) {
    super(manifest);
    this.components = [];
  }

  /**
   * Register UI components
   * @param {Array<Object>} components - Component definitions
   */
  registerComponents(components) {
    this.components = components;
  }

  /**
   * Get component by name
   * @param {String} name - Component name
   * @returns {Object} Component definition
   */
  getComponent(name) {
    return this.components.find(c => c.name === name);
  }
}

/**
 * Plugin Registry - Manages all plugins
 */
class PluginRegistry {
  constructor() {
    this.plugins = new Map();
    this.hooks = new Map();
  }

  /**
   * Register a plugin
   * @param {Plugin} plugin - Plugin instance
   */
  async register(plugin) {
    if (!plugin.id) {
      throw new Error('Plugin must have an id');
    }

    this.plugins.set(plugin.id, plugin);
    console.log(`Plugin registered: ${plugin.name} (${plugin.id})`);
  }

  /**
   * Unregister a plugin
   * @param {String} pluginId - Plugin ID
   */
  async unregister(pluginId) {
    const plugin = this.plugins.get(pluginId);
    if (plugin) {
      await plugin.dispose();
      this.plugins.delete(pluginId);
      console.log(`Plugin unregistered: ${pluginId}`);
    }
  }

  /**
   * Get a plugin by ID
   * @param {String} pluginId - Plugin ID
   * @returns {Plugin} Plugin instance
   */
  get(pluginId) {
    return this.plugins.get(pluginId);
  }

  /**
   * List all plugins
   * @returns {Array<Plugin>} All registered plugins
   */
  list() {
    return Array.from(this.plugins.values());
  }

  /**
   * Get plugins by capability
   * @param {String} capability - Capability name
   * @returns {Array<Plugin>} Matching plugins
   */
  getByCapability(capability) {
    return this.list().filter(plugin => 
      plugin.capabilities.includes(capability)
    );
  }

  /**
   * Enable a plugin
   * @param {String} pluginId - Plugin ID
   */
  async enable(pluginId) {
    const plugin = this.plugins.get(pluginId);
    if (plugin) {
      await plugin.activate();
    }
  }

  /**
   * Disable a plugin
   * @param {String} pluginId - Plugin ID
   */
  async disable(pluginId) {
    const plugin = this.plugins.get(pluginId);
    if (plugin) {
      await plugin.deactivate();
    }
  }

  /**
   * Register a hook
   * @param {String} hookName - Hook name
   * @param {Function} callback - Hook callback
   */
  registerHook(hookName, callback) {
    if (!this.hooks.has(hookName)) {
      this.hooks.set(hookName, []);
    }
    this.hooks.get(hookName).push(callback);
  }

  /**
   * Execute hooks
   * @param {String} hookName - Hook name
   * @param {any} data - Data to pass to hooks
   * @returns {Promise<any>} Modified data
   */
  async executeHooks(hookName, data) {
    const hooks = this.hooks.get(hookName) || [];
    let result = data;
    
    for (const hook of hooks) {
      result = await hook(result);
    }
    
    return result;
  }
}

/**
 * Plugin Loader - Loads plugins from various sources
 */
class PluginLoader {
  constructor(registry) {
    this.registry = registry;
    this.pluginPaths = [];
  }

  /**
   * Add a plugin directory
   * @param {String} path - Directory path
   */
  addPluginPath(path) {
    this.pluginPaths.push(path);
  }

  /**
   * Load all plugins from registered paths
   */
  async loadAll() {
    const fs = require('fs').promises;
    const path = require('path');

    for (const pluginPath of this.pluginPaths) {
      try {
        const exists = await fs.access(pluginPath).then(() => true).catch(() => false);
        if (!exists) continue;

        const entries = await fs.readdir(pluginPath, { withFileTypes: true });
        
        for (const entry of entries) {
          if (entry.isDirectory()) {
            await this.loadPlugin(path.join(pluginPath, entry.name));
          }
        }
      } catch (error) {
        console.error(`Error loading plugins from ${pluginPath}:`, error);
      }
    }
  }

  /**
   * Load a single plugin
   * @param {String} pluginPath - Plugin directory path
   */
  async loadPlugin(pluginPath) {
    const fs = require('fs').promises;
    const path = require('path');

    try {
      // Read plugin manifest
      const manifestPath = path.join(pluginPath, 'manifest.json');
      const manifestData = await fs.readFile(manifestPath, 'utf-8');
      const manifest = JSON.parse(manifestData);

      // Load plugin code
      const pluginFile = path.join(pluginPath, manifest.main || 'index.js');
      const PluginClass = require(pluginFile);

      // Create and register plugin instance
      const plugin = new PluginClass(manifest);
      await this.registry.register(plugin);

    } catch (error) {
      console.error(`Error loading plugin from ${pluginPath}:`, error);
    }
  }
}

// Initialize global plugin system
const pluginRegistry = new PluginRegistry();
const pluginLoader = new PluginLoader(pluginRegistry);

module.exports = {
  Plugin,
  ToolPlugin,
  KnowledgePlugin,
  UIPlugin,
  PluginRegistry,
  PluginLoader,
  pluginRegistry,
  pluginLoader
};
