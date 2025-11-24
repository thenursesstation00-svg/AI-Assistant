/**
 * Knowledge Base & RAG (Retrieval Augmented Generation) Foundation
 * 
 * Provides infrastructure for integrating vector databases and knowledge sources
 * to enhance AI responses with custom knowledge
 * 
 * References:
 * - LangChain RAG: https://js.langchain.com/docs/use_cases/question_answering/
 * - Pinecone Vector DB: https://docs.pinecone.io/
 * - Weaviate: https://weaviate.io/developers/weaviate
 * - ChromaDB: https://docs.trychroma.com/
 * - FAISS: https://github.com/facebookresearch/faiss
 */

/**
 * Document representation
 */
class Document {
  constructor(content, metadata = {}) {
    this.id = metadata.id || this.generateId();
    this.content = content;
    this.metadata = {
      source: metadata.source || 'unknown',
      title: metadata.title || '',
      author: metadata.author || '',
      createdAt: metadata.createdAt || new Date().toISOString(),
      tags: metadata.tags || [],
      ...metadata
    };
    this.embedding = null;
  }

  generateId() {
    return `doc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Chunk document into smaller pieces
   * @param {Number} chunkSize - Characters per chunk
   * @param {Number} overlap - Overlap between chunks
   * @returns {Array<Document>} Document chunks
   */
  chunk(chunkSize = 1000, overlap = 200) {
    const chunks = [];
    const contentLength = this.content.length;

    for (let i = 0; i < contentLength; i += chunkSize - overlap) {
      const chunkContent = this.content.substring(i, i + chunkSize);
      const chunkDoc = new Document(chunkContent, {
        ...this.metadata,
        parentId: this.id,
        chunkIndex: chunks.length,
        isChunk: true
      });
      chunks.push(chunkDoc);
    }

    return chunks;
  }

  toJSON() {
    return {
      id: this.id,
      content: this.content,
      metadata: this.metadata,
      embedding: this.embedding
    };
  }
}

/**
 * Base Knowledge Source interface
 */
class KnowledgeSource {
  constructor(config = {}) {
    this.config = config;
    this.name = '';
    this.type = '';
    this.enabled = true;
  }

  /**
   * Index a document
   * @param {Document} document - Document to index
   */
  async index(document) {
    throw new Error('index() must be implemented by source');
  }

  /**
   * Search for relevant documents
   * @param {String} query - Search query
   * @param {Object} options - Search options
   * @returns {Promise<Array<Document>>} Relevant documents
   */
  async search(query, options = {}) {
    throw new Error('search() must be implemented by source');
  }

  /**
   * Delete a document
   * @param {String} documentId - Document ID
   */
  async delete(documentId) {
    throw new Error('delete() must be implemented by source');
  }

  /**
   * Clear all documents
   */
  async clear() {
    throw new Error('clear() must be implemented by source');
  }
}

/**
 * In-Memory Knowledge Source (for development/testing)
 */
class InMemoryKnowledgeSource extends KnowledgeSource {
  constructor(config) {
    super(config);
    this.name = 'in-memory';
    this.type = 'vector';
    this.documents = new Map();
  }

  async index(document) {
    // In production, this would generate embeddings
    // For now, just store the document
    this.documents.set(document.id, document);
    return document.id;
  }

  async search(query, options = {}) {
    const { limit = 5 } = options;
    
    // Simple keyword search (in production, use vector similarity)
    const lowerQuery = query.toLowerCase();
    const results = [];

    for (const doc of this.documents.values()) {
      const content = doc.content.toLowerCase();
      if (content.includes(lowerQuery)) {
        results.push({
          document: doc,
          score: this.calculateScore(query, doc.content)
        });
      }
    }

    // Sort by score and limit
    results.sort((a, b) => b.score - a.score);
    return results.slice(0, limit).map(r => r.document);
  }

  calculateScore(query, content) {
    // Simple scoring based on keyword frequency
    const queryWords = query.toLowerCase().split(/\s+/);
    const contentLower = content.toLowerCase();
    let score = 0;

    for (const word of queryWords) {
      const matches = contentLower.match(new RegExp(word, 'g'));
      score += matches ? matches.length : 0;
    }

    return score;
  }

  async delete(documentId) {
    this.documents.delete(documentId);
  }

  async clear() {
    this.documents.clear();
  }

  async listAll() {
    return Array.from(this.documents.values());
  }
}

/**
 * Pinecone Vector Database (foundation for future implementation)
 */
class PineconeKnowledgeSource extends KnowledgeSource {
  constructor(config) {
    super(config);
    this.name = 'pinecone';
    this.type = 'vector';
  }

  async index(document) {
    // To implement: npm install @pinecone-database/pinecone
    throw new Error('Pinecone integration not yet implemented. Add @pinecone-database/pinecone package.');
  }

  async search(query, options = {}) {
    throw new Error('Pinecone integration not yet implemented.');
  }
}

/**
 * Weaviate Vector Database (foundation for future implementation)
 */
class WeaviateKnowledgeSource extends KnowledgeSource {
  constructor(config) {
    super(config);
    this.name = 'weaviate';
    this.type = 'vector';
  }

  async index(document) {
    // To implement: npm install weaviate-ts-client
    throw new Error('Weaviate integration not yet implemented. Add weaviate-ts-client package.');
  }

  async search(query, options = {}) {
    throw new Error('Weaviate integration not yet implemented.');
  }
}

/**
 * Knowledge Base Manager
 */
class KnowledgeBase {
  constructor() {
    this.sources = new Map();
    this.defaultSource = null;
  }

  /**
   * Add a knowledge source
   * @param {String} name - Source name
   * @param {KnowledgeSource} source - Source instance
   */
  addSource(name, source) {
    this.sources.set(name, source);
    if (!this.defaultSource) {
      this.defaultSource = name;
    }
  }

  /**
   * Get a knowledge source
   * @param {String} name - Source name
   * @returns {KnowledgeSource} Source instance
   */
  getSource(name) {
    return this.sources.get(name || this.defaultSource);
  }

  /**
   * Index a document
   * @param {Document|String} document - Document or content
   * @param {Object} metadata - Document metadata
   * @param {String} sourceName - Source to use
   */
  async indexDocument(document, metadata = {}, sourceName = null) {
    if (typeof document === 'string') {
      document = new Document(document, metadata);
    }

    const source = this.getSource(sourceName);
    if (!source) {
      throw new Error('No knowledge source available');
    }

    // Chunk large documents
    const chunks = document.content.length > 2000 
      ? document.chunk(1000, 200) 
      : [document];

    const indexedIds = [];
    for (const chunk of chunks) {
      const id = await source.index(chunk);
      indexedIds.push(id);
    }

    return indexedIds;
  }

  /**
   * Search across knowledge sources
   * @param {String} query - Search query
   * @param {Object} options - Search options
   * @returns {Promise<Array<Document>>} Relevant documents
   */
  async search(query, options = {}) {
    const { sources = [this.defaultSource], limit = 5 } = options;
    const allResults = [];

    for (const sourceName of sources) {
      const source = this.sources.get(sourceName);
      if (source && source.enabled) {
        const results = await source.search(query, { limit });
        allResults.push(...results);
      }
    }

    // Deduplicate and limit results
    const uniqueResults = [];
    const seenIds = new Set();

    for (const doc of allResults) {
      if (!seenIds.has(doc.id)) {
        uniqueResults.push(doc);
        seenIds.add(doc.id);
      }
    }

    return uniqueResults.slice(0, limit);
  }

  /**
   * Perform RAG (Retrieval Augmented Generation)
   * @param {String} query - User query
   * @param {Object} options - RAG options
   * @returns {Promise<Object>} Context and augmented query
   */
  async performRAG(query, options = {}) {
    const { limit = 3 } = options;
    
    // Retrieve relevant documents
    const documents = await this.search(query, { limit });

    // Build context from documents
    const context = documents.map((doc, index) => 
      `[Source ${index + 1}]: ${doc.content}`
    ).join('\n\n');

    // Augment the query with context
    const augmentedQuery = context 
      ? `Use the following context to answer the question:\n\n${context}\n\nQuestion: ${query}`
      : query;

    return {
      originalQuery: query,
      augmentedQuery,
      context,
      documents,
      documentsUsed: documents.length
    };
  }

  /**
   * List all sources
   * @returns {Array<String>} Source names
   */
  listSources() {
    return Array.from(this.sources.keys());
  }
}

// Initialize global knowledge base
const knowledgeBase = new KnowledgeBase();

// Add in-memory source by default
knowledgeBase.addSource('memory', new InMemoryKnowledgeSource());

module.exports = {
  Document,
  KnowledgeSource,
  InMemoryKnowledgeSource,
  PineconeKnowledgeSource,
  WeaviateKnowledgeSource,
  KnowledgeBase,
  knowledgeBase
};
