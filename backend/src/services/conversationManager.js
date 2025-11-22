/**
 * Conversation Management System
 * 
 * Manages conversation history, context, and session-based learning
 * 
 * References:
 * - LangChain Memory: https://js.langchain.com/docs/modules/memory/
 * - Redis Session Store: https://github.com/tj/connect-redis
 * - Conversation Design Patterns: https://www.nngroup.com/articles/chatbot-ux/
 */

// Simple UUID generator (for Node.js 14+)
function uuidv4() {
  if (typeof require('crypto').randomUUID === 'function') {
    return require('crypto').randomUUID();
  }
  // Fallback for older Node versions
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

/**
 * Single conversation message
 */
class Message {
  constructor(role, content, metadata = {}) {
    this.id = metadata.id || uuidv4();
    this.role = role; // 'user', 'assistant', 'system'
    this.content = content;
    this.timestamp = metadata.timestamp || new Date().toISOString();
    this.metadata = metadata;
  }

  toJSON() {
    return {
      id: this.id,
      role: this.role,
      content: this.content,
      timestamp: this.timestamp,
      metadata: this.metadata
    };
  }
}

/**
 * Conversation Session
 */
class Conversation {
  constructor(id = null, metadata = {}) {
    this.id = id || uuidv4();
    this.messages = [];
    this.metadata = {
      title: metadata.title || 'New Conversation',
      createdAt: metadata.createdAt || new Date().toISOString(),
      updatedAt: metadata.updatedAt || new Date().toISOString(),
      tags: metadata.tags || [],
      model: metadata.model || 'claude-sonnet-4-20250514',
      provider: metadata.provider || 'anthropic',
      ...metadata
    };
    this.context = {};
    this.userPreferences = {};
  }

  /**
   * Add a message to the conversation
   * @param {String} role - Message role
   * @param {String} content - Message content
   * @param {Object} metadata - Additional metadata
   * @returns {Message} Added message
   */
  addMessage(role, content, metadata = {}) {
    const message = new Message(role, content, metadata);
    this.messages.push(message);
    this.metadata.updatedAt = new Date().toISOString();
    
    // Auto-generate title from first user message
    if (!this.metadata.title && role === 'user' && this.messages.length <= 2) {
      this.metadata.title = content.substring(0, 50) + (content.length > 50 ? '...' : '');
    }
    
    return message;
  }

  /**
   * Get messages in API format
   * @param {Number} limit - Max number of messages to return
   * @returns {Array<Object>} Messages for API
   */
  getMessages(limit = null) {
    const messages = this.messages.map(m => ({
      role: m.role,
      content: m.content
    }));
    
    return limit ? messages.slice(-limit) : messages;
  }

  /**
   * Get conversation context window
   * @param {Number} maxTokens - Approximate token limit
   * @returns {Array<Object>} Recent messages within token limit
   */
  getContextWindow(maxTokens = 4000) {
    // Simple approximation: ~4 characters per token
    const charLimit = maxTokens * 4;
    let totalChars = 0;
    const contextMessages = [];

    // Start from most recent messages
    for (let i = this.messages.length - 1; i >= 0; i--) {
      const message = this.messages[i];
      const messageLength = message.content.length;
      
      if (totalChars + messageLength > charLimit && contextMessages.length > 0) {
        break;
      }
      
      contextMessages.unshift(message);
      totalChars += messageLength;
    }

    return contextMessages.map(m => ({ role: m.role, content: m.content }));
  }

  /**
   * Update user preferences based on conversation
   * @param {String} key - Preference key
   * @param {any} value - Preference value
   */
  updatePreference(key, value) {
    this.userPreferences[key] = value;
  }

  /**
   * Get conversation summary
   * @returns {Object} Conversation summary
   */
  getSummary() {
    return {
      id: this.id,
      title: this.metadata.title,
      messageCount: this.messages.length,
      createdAt: this.metadata.createdAt,
      updatedAt: this.metadata.updatedAt,
      tags: this.metadata.tags,
      model: this.metadata.model,
      provider: this.metadata.provider
    };
  }

  /**
   * Export conversation to JSON
   * @returns {Object} Full conversation data
   */
  toJSON() {
    return {
      id: this.id,
      messages: this.messages.map(m => m.toJSON()),
      metadata: this.metadata,
      context: this.context,
      userPreferences: this.userPreferences
    };
  }

  /**
   * Import conversation from JSON
   * @param {Object} data - Conversation data
   * @returns {Conversation} Conversation instance
   */
  static fromJSON(data) {
    const conversation = new Conversation(data.id, data.metadata);
    conversation.messages = data.messages.map(m => 
      new Message(m.role, m.content, m)
    );
    conversation.context = data.context || {};
    conversation.userPreferences = data.userPreferences || {};
    return conversation;
  }
}

/**
 * Conversation Manager - Handles multiple conversations
 */
class ConversationManager {
  constructor() {
    this.conversations = new Map();
    this.activeConversationId = null;
  }

  /**
   * Create a new conversation
   * @param {Object} metadata - Conversation metadata
   * @returns {Conversation} New conversation
   */
  createConversation(metadata = {}) {
    const conversation = new Conversation(null, metadata);
    this.conversations.set(conversation.id, conversation);
    this.activeConversationId = conversation.id;
    return conversation;
  }

  /**
   * Get a conversation by ID
   * @param {String} id - Conversation ID
   * @returns {Conversation} Conversation instance
   */
  getConversation(id) {
    return this.conversations.get(id);
  }

  /**
   * Get active conversation
   * @returns {Conversation} Active conversation
   */
  getActiveConversation() {
    if (!this.activeConversationId) {
      return this.createConversation();
    }
    return this.conversations.get(this.activeConversationId);
  }

  /**
   * Set active conversation
   * @param {String} id - Conversation ID
   */
  setActiveConversation(id) {
    if (this.conversations.has(id)) {
      this.activeConversationId = id;
    }
  }

  /**
   * List all conversations
   * @param {Object} filters - Filter options
   * @returns {Array<Object>} Conversation summaries
   */
  listConversations(filters = {}) {
    let conversations = Array.from(this.conversations.values());

    // Apply filters
    if (filters.tags && filters.tags.length > 0) {
      conversations = conversations.filter(c => 
        c.metadata.tags.some(tag => filters.tags.includes(tag))
      );
    }

    if (filters.model) {
      conversations = conversations.filter(c => 
        c.metadata.model === filters.model
      );
    }

    // Sort by updated date (most recent first)
    conversations.sort((a, b) => 
      new Date(b.metadata.updatedAt) - new Date(a.metadata.updatedAt)
    );

    return conversations.map(c => c.getSummary());
  }

  /**
   * Delete a conversation
   * @param {String} id - Conversation ID
   */
  deleteConversation(id) {
    if (this.activeConversationId === id) {
      this.activeConversationId = null;
    }
    this.conversations.delete(id);
  }

  /**
   * Search conversations
   * @param {String} query - Search query
   * @returns {Array<Object>} Matching conversations
   */
  searchConversations(query) {
    const lowerQuery = query.toLowerCase();
    const results = [];

    for (const conversation of this.conversations.values()) {
      // Search in title
      if (conversation.metadata.title.toLowerCase().includes(lowerQuery)) {
        results.push(conversation.getSummary());
        continue;
      }

      // Search in messages
      const hasMatch = conversation.messages.some(m => 
        m.content.toLowerCase().includes(lowerQuery)
      );

      if (hasMatch) {
        results.push(conversation.getSummary());
      }
    }

    return results;
  }

  /**
   * Export all conversations
   * @returns {Object} All conversation data
   */
  exportAll() {
    const data = {};
    for (const [id, conversation] of this.conversations) {
      data[id] = conversation.toJSON();
    }
    return data;
  }

  /**
   * Import conversations
   * @param {Object} data - Conversations data
   */
  importAll(data) {
    for (const [id, conversationData] of Object.entries(data)) {
      const conversation = Conversation.fromJSON(conversationData);
      this.conversations.set(id, conversation);
    }
  }

  /**
   * Get conversation statistics
   * @returns {Object} Statistics
   */
  getStatistics() {
    let totalMessages = 0;
    let totalConversations = this.conversations.size;

    for (const conversation of this.conversations.values()) {
      totalMessages += conversation.messages.length;
    }

    return {
      totalConversations,
      totalMessages,
      averageMessagesPerConversation: totalConversations > 0 
        ? (totalMessages / totalConversations).toFixed(2) 
        : 0
    };
  }
}

// Initialize global conversation manager
const conversationManager = new ConversationManager();

module.exports = {
  Message,
  Conversation,
  ConversationManager,
  conversationManager
};
