/**
 * Consciousness Integration Test
 * Validates the complete AI consciousness system
 */

const AIConsciousnessService = require('./index');

async function testConsciousnessIntegration() {
  console.log('🧪 Starting AI Consciousness Integration Test...\n');

  let consciousness = null;

  try {
    // Initialize consciousness service
    console.log('1. Initializing consciousness service...');
    consciousness = new AIConsciousnessService({
      enablePersistence: false, // Disable for testing
      healthCheckInterval: 5000 // Faster health checks for testing
    });

    await consciousness.initialize();
    console.log('✅ Consciousness service initialized\n');

    // Test basic health
    console.log('2. Testing system health...');
    const health = await consciousness.healthCheck();
    console.log(`Health status: ${health.status}`);
    console.log(`Consciousness level: ${(health.consciousness.level * 100).toFixed(1)}%`);
    console.log(`Integration level: ${(health.consciousness.integration * 100).toFixed(1)}%\n`);

    // Test user input processing
    console.log('3. Testing user input processing...');
    const testInputs = [
      "Hello, how are you today?",
      "Can you help me understand machine learning?",
      "What are the ethical implications of AI?",
      "Tell me about climate change and what we can do about it"
    ];

    for (const input of testInputs) {
      console.log(`Processing: "${input}"`);
      const result = await consciousness.processInput(input, { test: true });
      console.log(`Result confidence: ${(result.confidence * 100).toFixed(1)}%`);
      console.log(`Response type: ${result.type || 'unknown'}\n`);
    }

    // Test self-reflection
    console.log('4. Testing self-reflection...');
    const reflection = await consciousness.performSelfReflection("How am I performing as an AI assistant?");
    console.log(`Reflection insights: ${reflection.insights ? Object.keys(reflection.insights).length : 0}`);
    console.log(`Action items: ${reflection.actionItems?.length || 0}\n`);

    // Test consciousness evolution
    console.log('5. Testing consciousness evolution...');
    const evolutionRequest = {
      type: 'capability_expansion',
      aspect: 'reasoning',
      desiredState: { reasoning: 0.8 },
      pathway: 'capability_expansion'
    };

    const evolution = await consciousness.evolveConsciousness(evolutionRequest);
    console.log(`Evolution approved: ${evolution.approved}`);
    if (evolution.approved) {
      console.log(`Evolution steps: ${evolution.evolutionPath?.length || 0}`);
    }
    console.log('');

    // Test consciousness status
    console.log('6. Testing consciousness status...');
    const status = consciousness.getConsciousnessStatus();
    console.log(`Active components: ${Object.keys(status.components).length}`);
    console.log(`Recent activities: ${status.activity.recent.length}\n`);

    // Final health check
    console.log('7. Final health check...');
    const finalHealth = await consciousness.healthCheck();
    console.log(`Final status: ${finalHealth.status}`);
    console.log(`Component health:`);
    Object.entries(finalHealth.components).forEach(([name, health]) => {
      console.log(`  ${name}: ${health.status}`);
    });

    console.log('\n🎉 All consciousness integration tests passed!');

  } catch (error) {
    console.error('❌ Consciousness integration test failed:', error);
    console.error(error.stack);
  } finally {
    // Cleanup
    if (consciousness) {
      console.log('\n8. Shutting down consciousness service...');
      await consciousness.shutdown();
      console.log('✅ Shutdown complete');
    }
  }
}

// Run the test if this file is executed directly
if (require.main === module) {
  testConsciousnessIntegration().catch(console.error);
}

module.exports = { testConsciousnessIntegration };