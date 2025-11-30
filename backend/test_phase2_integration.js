/**
 * Integration test for Phase Two enhancements:
 * - Multi-hop retrieval
 * - Contextual memory
 * - Dynamic source selection
 * - Enhanced artifact ranking/feedback
 * - Robust error handling/fallbacks
 */

const DualCoreOrchestrator = require('./src/services/consciousness/dualcore/index');

async function runIntegrationTest() {
  console.log('🧪 Phase Two Integration Test Start');
  const orchestrator = new DualCoreOrchestrator({ operationalCapacity: 3, coreSyncInterval: 1000 });
  await orchestrator.initialize();

  // Simulate memory system
  orchestrator.operationalCore.memory = {
    async getRelevantMemories(query, n) {
      if (query.toLowerCase().includes('ai')) {
        return [{ text: 'AI refers to artificial intelligence, the simulation of human intelligence by machines.' }];
      }
      return [];
    }
  };

  // Test 1: Multi-hop retrieval
  console.log('\n🔗 Test 1: Multi-hop retrieval');
  const multiHopResults = await orchestrator.operationalCore.retrievalCoordinator.runMultiHopRetrieval([
    'What is quantum computing?',
    'How does quantum computing relate to AI?'
  ], { topK: 2, maxSources: 2 });
  console.log('Multi-hop results:', multiHopResults.map(r => r.map(a => a.title)));

  // Test 2: Contextual memory integration
  console.log('\n🧠 Test 2: Contextual memory integration');
  const memoryDecision = {
    id: 'test_memory',
    input: 'Explain AI in simple terms',
    type: 'operational',
    timestamp: new Date().toISOString()
  };
  const memoryResult = await orchestrator.processDecision(memoryDecision);
  console.log('Memory result:', memoryResult.retrieval.knowledgeUsed.map(a => a.title));

  // Test 3: Dynamic source selection
  console.log('\n🌐 Test 3: Dynamic source selection');
  const dynamicSources = await orchestrator.operationalCore.retrievalCoordinator.generateCandidateUrls('biology', 2, { preferences: ['https://biology.stackexchange.com/'] });
  console.log('Dynamic sources:', dynamicSources);

  // Test 4: Artifact ranking and feedback
  console.log('\n⭐ Test 4: Artifact ranking and feedback');
  const artifacts = await orchestrator.operationalCore.retrievalCoordinator.runRetrieval('What is machine learning?', { topK: 3, maxSources: 2 });
  const topArtifact = artifacts[0];
  orchestrator.operationalCore.retrievalCoordinator.addArtifactFeedback(topArtifact.id, { score: 1, comment: 'Very helpful!' });
  const reranked = await orchestrator.operationalCore.retrievalCoordinator.runRetrieval('What is machine learning?', { topK: 3, maxSources: 2 });
  console.log('Top artifact after feedback:', reranked[0].title, 'Score:', reranked[0].score);

  // Test 5: Error handling and fallback
  console.log('\n🚨 Test 5: Error handling and fallback');
  const errorArtifacts = await orchestrator.operationalCore.retrievalCoordinator.runRetrieval('Test unreachable source', { topK: 2, maxSources: 1, preferences: ['https://notarealwebsite.abc/'] });
  console.log('Error artifact:', errorArtifacts[0].title, '| Pattern:', errorArtifacts[0].retrieval_pattern);

  await orchestrator.shutdown();
  console.log('\n✅ Phase Two Integration Test Complete!');
}

runIntegrationTest().catch(e => { console.error('❌ Integration test failed:', e); process.exit(1); });
