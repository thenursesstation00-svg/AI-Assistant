const { getDatabase } = require('../connection');

class ConversationRepository {
  constructor() {
    this.db = getDatabase();
  }
  
  /**
   * Create a new conversation
   * @param {Object} params
   * @param {string} params.title - Conversation title
   * @param {string} params.provider_name - AI provider name
   * @param {string} params.model - Model name
   * @returns {number} Conversation ID
   */
  createConversation({ title, provider_name, model }) {
    const stmt = this.db.prepare(`
      INSERT INTO conversations (title, provider_name, model)
      VALUES (?, ?, ?)
    `);
    const result = stmt.run(title || 'New Conversation', provider_name, model);
    return result.lastInsertRowid;
  }
  
  /**
   * Get conversation by ID
   * @param {number} id - Conversation ID
   * @returns {Object|null} Conversation object
   */
  getConversation(id) {
    const stmt = this.db.prepare('SELECT * FROM conversations WHERE id = ?');
    return stmt.get(id);
  }
  
  /**
   * Get all conversations
   * @param {Object} options
   * @param {number} options.limit - Maximum results
   * @param {number} options.archived - 0=active, 1=archived
   * @returns {Array} Conversations array
   */
  getAllConversations({ limit = 50, archived = 0 } = {}) {
    const stmt = this.db.prepare(`
      SELECT * FROM conversations 
      WHERE archived = ?
      ORDER BY updated_at DESC 
      LIMIT ?
    `);
    return stmt.all(archived, limit);
  }
  
  /**
   * Add a message to conversation
   * @param {number} conversationId - Conversation ID
   * @param {Object} message
   * @param {string} message.role - 'user', 'assistant', or 'system'
   * @param {string} message.content - Message content
   * @param {number} [message.tokens] - Token count
   * @param {number} [message.cost] - Cost in USD
   * @returns {number} Message ID
   */
  addMessage(conversationId, { role, content, tokens, cost }) {
    const stmt = this.db.prepare(`
      INSERT INTO messages (conversation_id, role, content, tokens, cost)
      VALUES (?, ?, ?, ?, ?)
    `);
    const result = stmt.run(conversationId, role, content, tokens, cost);
    
    // Update conversation timestamp
    const updateStmt = this.db.prepare(`
      UPDATE conversations SET updated_at = CURRENT_TIMESTAMP WHERE id = ?
    `);
    updateStmt.run(conversationId);
    
    return result.lastInsertRowid;
  }
  
  /**
   * Get all messages in a conversation
   * @param {number} conversationId - Conversation ID
   * @returns {Array} Messages array
   */
  getMessages(conversationId) {
    const stmt = this.db.prepare(`
      SELECT * FROM messages 
      WHERE conversation_id = ? 
      ORDER BY created_at ASC
    `);
    return stmt.all(conversationId);
  }
  
  /**
   * Update conversation title
   * @param {number} id - Conversation ID
   * @param {string} title - New title
   */
  updateTitle(id, title) {
    const stmt = this.db.prepare('UPDATE conversations SET title = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?');
    return stmt.run(title, id);
  }
  
  /**
   * Delete a conversation and all its messages
   * @param {number} id - Conversation ID
   */
  deleteConversation(id) {
    const stmt = this.db.prepare('DELETE FROM conversations WHERE id = ?');
    return stmt.run(id);
  }
  
  /**
   * Archive a conversation
   * @param {number} id - Conversation ID
   */
  archiveConversation(id) {
    const stmt = this.db.prepare('UPDATE conversations SET archived = 1, updated_at = CURRENT_TIMESTAMP WHERE id = ?');
    return stmt.run(id);
  }
  
  /**
   * Unarchive a conversation
   * @param {number} id - Conversation ID
   */
  unarchiveConversation(id) {
    const stmt = this.db.prepare('UPDATE conversations SET archived = 0, updated_at = CURRENT_TIMESTAMP WHERE id = ?');
    return stmt.run(id);
  }
  
  /**
   * Get conversation statistics
   * @param {number} conversationId - Conversation ID
   * @returns {Object} Stats object with message count, total tokens, total cost
   */
  getStats(conversationId) {
    const stmt = this.db.prepare(`
      SELECT 
        COUNT(*) as message_count,
        SUM(tokens) as total_tokens,
        SUM(cost) as total_cost
      FROM messages 
      WHERE conversation_id = ?
    `);
    return stmt.get(conversationId);
  }
}

module.exports = ConversationRepository;
