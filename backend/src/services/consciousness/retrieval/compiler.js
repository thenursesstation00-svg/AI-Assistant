/**
 * Knowledge Compiler
 * Transforms raw information into meaningful abstractions
 *
 * Part of the Information Retrieval Cognitive Loop
 */

const natural = require('natural');
const crypto = require('crypto');
const { TfIdf } = natural;

/**
 * Knowledge Compiler - Abstraction and meaning extraction engine
 */
class KnowledgeCompiler {
  constructor(config = {}) {
    this.config = {
      minConceptLength: config.minConceptLength || 3,
      maxConcepts: config.maxConcepts || 50,
      embeddingDimensions: config.embeddingDimensions || 384,
      similarityThreshold: config.similarityThreshold || 0.7,
      ...config
    };

    this.tfIdf = new TfIdf();
    this.conceptCache = new Map();
    this.knowledgeGraph = new Map();
  }

  /**
   * Main compilation pipeline
   */
  async compile(rawData, context = {}) {
    try {
      // Step 1: Extract concepts from raw data
      const concepts = await this.extractConcepts(rawData);

      // Step 2: Generate embeddings for semantic understanding
      const embeddings = await this.generateEmbeddings(concepts);

      // Step 3: Build knowledge relationships
      const relationships = await this.buildRelationships(embeddings, concepts);

      // Step 4: Create abstractions
      const abstractions = await this.createAbstractions(relationships, context);

      // Step 5: Update knowledge graph
      await this.updateKnowledgeGraph(abstractions);

      return {
        concepts,
        embeddings,
        relationships,
        abstractions,
        metadata: {
          compiledAt: new Date().toISOString(),
          sourceCount: rawData.length,
          conceptCount: concepts.length,
          abstractionCount: abstractions.length
        }
      };

    } catch (error) {
      console.error('Knowledge compilation failed:', error);
      throw new Error(`Knowledge compilation error: ${error.message}`);
    }
  }

  /**
   * Extract key concepts from raw text data
   */
  async extractConcepts(rawData) {
    const allText = this.concatenateData(rawData);
    const sentences = this.splitIntoSentences(allText);

    // TF-IDF analysis for important terms
    sentences.forEach(sentence => {
      this.tfIdf.addDocument(sentence);
    });

    const tfIdfTerms = this.getTfIdfTerms();

    // Named Entity Recognition (basic implementation)
    const entities = this.extractEntities(sentences);

    // Combine TF-IDF terms and entities
    const concepts = [...new Set([...tfIdfTerms, ...entities])]
      .filter(concept => concept.length >= this.config.minConceptLength)
      .slice(0, this.config.maxConcepts);

    return concepts.map(concept => ({
      term: concept,
      frequency: this.getTermFrequency(concept, sentences),
      type: this.classifyConcept(concept),
      confidence: this.calculateConfidence(concept, sentences)
    }));
  }

  /**
   * Generate semantic embeddings for concepts
   * Note: In production, this would use a proper embedding model like Sentence Transformers
   */
  async generateEmbeddings(concepts) {
    // Simplified embedding generation using basic NLP features
    // In production: Use pre-trained models like sentence-transformers

    const embeddings = [];

    for (const concept of concepts) {
      const embedding = await this.generateSimpleEmbedding(concept.term);
      embeddings.push({
        concept: concept.term,
        vector: embedding,
        dimensions: this.config.embeddingDimensions
      });
    }

    return embeddings;
  }

  /**
   * Simple embedding generation (placeholder for real embeddings)
   * In production: Replace with actual embedding model
   */
  async generateSimpleEmbedding(text) {
    // Create a deterministic hash-based embedding
    const hash = crypto.createHash('sha256').update(text).digest();
    const embedding = [];

    for (let i = 0; i < this.config.embeddingDimensions; i++) {
      // Convert hash bytes to float values between -1 and 1
      const byte = hash[i % hash.length];
      embedding.push((byte / 127.5) - 1);
    }

    // Normalize the embedding
    const magnitude = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0));
    return embedding.map(val => val / magnitude);
  }

  /**
   * Build relationships between concepts
   */
  async buildRelationships(embeddings, concepts) {
    const relationships = [];

    for (let i = 0; i < embeddings.length; i++) {
      for (let j = i + 1; j < embeddings.length; j++) {
        const similarity = this.cosineSimilarity(
          embeddings[i].vector,
          embeddings[j].vector
        );

        if (similarity >= this.config.similarityThreshold) {
          relationships.push({
            source: embeddings[i].concept,
            target: embeddings[j].concept,
            type: this.classifyRelationship(concepts[i], concepts[j]),
            strength: similarity,
            confidence: Math.min(concepts[i].confidence, concepts[j].confidence)
          });
        }
      }
    }

    return relationships.sort((a, b) => b.strength - a.strength);
  }

  /**
   * Create higher-level abstractions from relationships
   */
  async createAbstractions(relationships, context) {
    const abstractions = [];
    const conceptGroups = this.groupRelatedConcepts(relationships);

    for (const group of conceptGroups) {
      if (group.length >= 3) { // Minimum concepts for abstraction
        const abstraction = await this.generateAbstraction(group, context);
        abstractions.push(abstraction);
      }
    }

    return abstractions;
  }

  /**
   * Generate a single abstraction from a group of concepts
   */
  async generateAbstraction(conceptGroup, context) {
    const concepts = conceptGroup.map(rel => rel.source);
    const centralConcept = this.findCentralConcept(conceptGroup);

    return {
      id: this.generateAbstractionId(concepts),
      title: await this.generateAbstractionTitle(concepts, centralConcept),
      concepts: concepts,
      centralConcept: centralConcept,
      description: await this.generateDescription(concepts, context),
      level: this.determineAbstractionLevel(concepts),
      createdAt: new Date().toISOString(),
      context: context
    };
  }

  /**
   * Update the persistent knowledge graph
   */
  async updateKnowledgeGraph(abstractions) {
    for (const abstraction of abstractions) {
      // Add abstraction to graph
      this.knowledgeGraph.set(abstraction.id, abstraction);

      // Update concept connections
      for (const concept of abstraction.concepts) {
        if (!this.knowledgeGraph.has(concept)) {
          this.knowledgeGraph.set(concept, {
            type: 'concept',
            abstractions: [abstraction.id],
            connections: []
          });
        } else {
          const conceptData = this.knowledgeGraph.get(concept);
          if (!conceptData.abstractions.includes(abstraction.id)) {
            conceptData.abstractions.push(abstraction.id);
          }
        }
      }
    }

    // Clean up old entries if graph gets too large
    if (this.knowledgeGraph.size > 10000) {
      await this.consolidateKnowledgeGraph();
    }
  }

  /**
   * Query the knowledge graph
   */
  async queryKnowledge(concept, depth = 2) {
    const results = [];
    const visited = new Set();

    const traverse = (currentConcept, currentDepth) => {
      if (currentDepth > depth || visited.has(currentConcept)) return;

      visited.add(currentConcept);
      const data = this.knowledgeGraph.get(currentConcept);

      if (data) {
        results.push({
          concept: currentConcept,
          data: data,
          depth: currentDepth
        });

        if (data.abstractions) {
          for (const abstractionId of data.abstractions) {
            const abstraction = this.knowledgeGraph.get(abstractionId);
            if (abstraction) {
              results.push({
                concept: abstractionId,
                data: abstraction,
                depth: currentDepth + 1
              });
            }
          }
        }
      }
    };

    traverse(concept, 0);
    return results;
  }

  // Helper methods

  concatenateData(rawData) {
    return rawData.map(item =>
      typeof item === 'string' ? item : item.content || item.snippet || ''
    ).join(' ');
  }

  splitIntoSentences(text) {
    return text.split(/[.!?]+/).filter(s => s.trim().length > 0);
  }

  getTfIdfTerms() {
    const terms = [];
    this.tfIdf.documents.forEach((doc, docIndex) => {
      this.tfIdf.listTerms(docIndex).forEach(item => {
        if (item.tfidf > 0.5) { // Threshold for important terms
          terms.push(item.term);
        }
      });
    });
    return [...new Set(terms)];
  }

  extractEntities(sentences) {
    // Basic NER - in production, use spaCy or similar
    const entities = [];
    const entityPatterns = [
      /\b[A-Z][a-z]+ [A-Z][a-z]+\b/g, // Proper names
      /\b\d{4}\b/g, // Years
      /\b[A-Z]{2,}\b/g // Acronyms
    ];

    sentences.forEach(sentence => {
      entityPatterns.forEach(pattern => {
        const matches = sentence.match(pattern);
        if (matches) entities.push(...matches);
      });
    });

    return [...new Set(entities)];
  }

  getTermFrequency(term, sentences) {
    return sentences.reduce((count, sentence) =>
      count + (sentence.toLowerCase().includes(term.toLowerCase()) ? 1 : 0), 0);
  }

  classifyConcept(concept) {
    // Basic classification - in production, use ML model
    if (concept.match(/^\d/)) return 'number';
    if (concept.match(/^[A-Z]{2,}$/)) return 'acronym';
    if (concept.match(/^[A-Z]/)) return 'proper_noun';
    return 'common_noun';
  }

  calculateConfidence(concept, sentences) {
    const frequency = this.getTermFrequency(concept, sentences);
    const length = concept.length;
    return Math.min(frequency / sentences.length + length / 50, 1);
  }

  cosineSimilarity(vecA, vecB) {
    const dotProduct = vecA.reduce((sum, a, i) => sum + a * vecB[i], 0);
    const magnitudeA = Math.sqrt(vecA.reduce((sum, a) => sum + a * a, 0));
    const magnitudeB = Math.sqrt(vecB.reduce((sum, a) => sum + a * a, 0));
    return dotProduct / (magnitudeA * magnitudeB);
  }

  classifyRelationship(conceptA, conceptB) {
    // Basic relationship classification
    if (conceptA.type === 'proper_noun' && conceptB.type === 'proper_noun') {
      return 'entity_relation';
    }
    if (conceptA.type === 'number' || conceptB.type === 'number') {
      return 'quantitative';
    }
    return 'semantic';
  }

  groupRelatedConcepts(relationships) {
    const groups = [];
    const processed = new Set();

    for (const rel of relationships) {
      if (processed.has(rel.source) || processed.has(rel.target)) continue;

      const group = [rel];
      const groupConcepts = new Set([rel.source, rel.target]);

      // Find connected relationships
      for (const otherRel of relationships) {
        if (!processed.has(otherRel.source) && !processed.has(otherRel.target)) {
          const connects = groupConcepts.has(otherRel.source) || groupConcepts.has(otherRel.target);
          if (connects) {
            group.push(otherRel);
            groupConcepts.add(otherRel.source);
            groupConcepts.add(otherRel.target);
          }
        }
      }

      groups.push(group);
      group.forEach(r => {
        processed.add(r.source);
        processed.add(r.target);
      });
    }

    return groups;
  }

  findCentralConcept(relationshipGroup) {
    const conceptScores = new Map();

    relationshipGroup.forEach(rel => {
      conceptScores.set(rel.source, (conceptScores.get(rel.source) || 0) + rel.strength);
      conceptScores.set(rel.target, (conceptScores.get(rel.target) || 0) + rel.strength);
    });

    let maxScore = 0;
    let centralConcept = null;

    conceptScores.forEach((score, concept) => {
      if (score > maxScore) {
        maxScore = score;
        centralConcept = concept;
      }
    });

    return centralConcept;
  }

  async generateAbstractionTitle(concepts, centralConcept) {
    // Simple title generation - in production, use LLM
    return `${centralConcept} and Related Concepts`;
  }

  async generateDescription(concepts, context) {
    // Simple description - in production, use LLM
    return `An abstraction encompassing: ${concepts.join(', ')}`;
  }

  determineAbstractionLevel(concepts) {
    if (concepts.length >= 10) return 'high';
    if (concepts.length >= 5) return 'medium';
    return 'low';
  }

  generateAbstractionId(concepts) {
    const sortedConcepts = concepts.sort();
    const hash = crypto.createHash('md5').update(sortedConcepts.join('|')).digest('hex');
    return `abs_${hash.substring(0, 8)}`;
  }

  async consolidateKnowledgeGraph() {
    // Remove least connected entries to maintain size
    const entries = Array.from(this.knowledgeGraph.entries());
    const sortedByConnections = entries.sort((a, b) => {
      const aConnections = a[1].abstractions?.length || 0;
      const bConnections = b[1].abstractions?.length || 0;
      return bConnections - aConnections;
    });

    // Keep top 80% most connected
    const keepCount = Math.floor(sortedByConnections.length * 0.8);
    const newGraph = new Map(sortedByConnections.slice(0, keepCount));

    this.knowledgeGraph = newGraph;
  }

  /**
   * Health check for the knowledge compiler
   */
  async healthCheck() {
    try {
      const testData = [
        "Machine learning is a subset of artificial intelligence.",
        "Neural networks are inspired by biological brains.",
        "Deep learning uses multiple layers of neural networks."
      ];

      const result = await this.compile(testData);

      return {
        status: 'healthy',
        conceptsExtracted: result.concepts.length,
        abstractionsCreated: result.abstractions.length,
        graphSize: this.knowledgeGraph.size,
        lastTest: new Date().toISOString()
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        error: error.message,
        lastTest: new Date().toISOString()
      };
    }
  }
}

module.exports = KnowledgeCompiler;