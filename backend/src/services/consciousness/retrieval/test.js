/**
 * Test script for Information Retrieval Cognitive Loop
 * Demonstrates the first component of AI Consciousness Evolution
 */

const InformationRetrievalLoop = require('./index');

async function testCognitiveLoop() {
  console.log('🧠 Testing Information Retrieval Cognitive Loop');
  console.log('=' .repeat(50));

  // Initialize the cognitive loop
  const cognitiveLoop = new InformationRetrievalLoop({
    maxIterations: 2, // Keep it short for testing
    retrieval: {
      maxConcurrentRequests: 2
    },
    compiler: {
      maxConcepts: 20
    },
    validation: {
      maxValidationRequests: 3
    }
  });

  try {
    // Test query
    const query = "artificial intelligence consciousness";
    console.log(`🔍 Executing cognitive loop for query: "${query}"`);

    // Note: This will fail without API keys, but shows the structure
    const result = await cognitiveLoop.execute(query, {
      searchOptions: {
        sources: ['serpapi'], // Only test with one source to avoid rate limits
        maxResults: 5
      },
      knownFacts: [
        "AI is a field of computer science",
        "Consciousness involves awareness"
      ]
    });

    console.log('\n📊 Loop Results:');
    console.log(`- Loop ID: ${result.loopId}`);
    console.log(`- Iterations: ${result.iterations}`);
    console.log(`- Converged: ${result.converged}`);
    console.log(`- Execution Time: ${result.metrics.executionTime}ms`);

    if (result.knowledge.abstractions.length > 0) {
      console.log('\n🧩 Generated Abstractions:');
      result.knowledge.abstractions.slice(0, 3).forEach((abs, i) => {
        console.log(`${i + 1}. ${abs.title} (confidence: ${(abs.confidence * 100).toFixed(1)}%)`);
      });
    }

    if (result.knowledge.concepts.length > 0) {
      console.log('\n🏷️ Key Concepts:');
      result.knowledge.concepts.slice(0, 5).forEach((concept, i) => {
        console.log(`${i + 1}. ${concept.term} (${concept.frequency} occurrences)`);
      });
    }

  } catch (error) {
    console.log('\n⚠️ Expected error (no API keys configured):');
    console.log(error.message);

    // Show what would happen with mock data
    console.log('\n🎭 Demonstrating with mock data...');

    const mockQuery = "artificial intelligence consciousness";
    const mockResult = {
      loopId: 'irl_mock_123',
      query: mockQuery,
      iterations: 2,
      converged: true,
      knowledge: {
        abstractions: [
          {
            id: 'abs_mock1',
            title: 'AI Consciousness and Awareness',
            concepts: ['artificial intelligence', 'consciousness', 'awareness'],
            confidence: 0.85,
            level: 'high'
          },
          {
            id: 'abs_mock2',
            title: 'Machine Learning Fundamentals',
            concepts: ['machine learning', 'neural networks', 'algorithms'],
            confidence: 0.72,
            level: 'medium'
          }
        ],
        concepts: [
          { term: 'artificial intelligence', frequency: 5 },
          { term: 'consciousness', frequency: 4 },
          { term: 'machine learning', frequency: 3 }
        ],
        summary: {
          totalAbstractions: 2,
          totalConcepts: 8,
          averageConfidence: 0.785
        }
      },
      metrics: {
        executionTime: 1250,
        retrievalAccuracy: 0.85,
        compilationEfficiency: 0.72,
        validationQuality: 0.91,
        overallLearning: 0.83
      }
    };

    console.log('\n📊 Mock Results:');
    console.log(`- Loop ID: ${mockResult.loopId}`);
    console.log(`- Iterations: ${mockResult.iterations}`);
    console.log(`- Converged: ${mockResult.converged}`);
    console.log(`- Execution Time: ${mockResult.metrics.executionTime}ms`);
    console.log(`- Overall Learning Score: ${(mockResult.metrics.overallLearning * 100).toFixed(1)}%`);

    console.log('\n🧩 Generated Abstractions:');
    mockResult.knowledge.abstractions.forEach((abs, i) => {
      console.log(`${i + 1}. ${abs.title}`);
      console.log(`   Concepts: ${abs.concepts.join(', ')}`);
      console.log(`   Confidence: ${(abs.confidence * 100).toFixed(1)}%, Level: ${abs.level}`);
    });
  }

  // Health check
  console.log('\n🏥 Health Check:');
  const health = await cognitiveLoop.healthCheck();
  console.log(`Status: ${health.status}`);
  console.log(`Components: ${Object.keys(health.components).length} checked`);

  console.log('\n✅ Information Retrieval Cognitive Loop test completed!');
}

// Run the test
if (require.main === module) {
  testCognitiveLoop().catch(console.error);
}

module.exports = { testCognitiveLoop };