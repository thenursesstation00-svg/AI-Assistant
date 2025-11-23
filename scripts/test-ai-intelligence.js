// scripts/test-ai-intelligence.js
// Test script for AI Intelligence System

const http = require('http');

const API_KEY = process.env.BACKEND_API_KEY || 'test-key';
const BASE_URL = 'http://localhost:3001';

function makeRequest(path, method = 'GET', body = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    
    const options = {
      method,
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      headers: {
        'x-api-key': API_KEY,
        'Content-Type': 'application/json'
      }
    };

    const req = http.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const parsed = data ? JSON.parse(data) : {};
          resolve({ status: res.statusCode, data: parsed });
        } catch (error) {
          resolve({ status: res.statusCode, data: data });
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

async function testSelfAwareness() {
  console.log('\n🧠 Testing Self-Awareness System...');
  
  try {
    // Get self-knowledge
    const knowledge = await makeRequest('/api/ai/self-knowledge');
    console.log('✅ Self-knowledge:', knowledge.status === 200 ? 'PASS' : 'FAIL');
    if (knowledge.data.data) {
      console.log('   - Identity:', knowledge.data.data.identity?.name || 'Not set');
      console.log('   - Skills:', knowledge.data.data.skills?.length || 0);
      console.log('   - Personality traits:', knowledge.data.data.personality?.length || 0);
    }

    // Store a memory
    const memory = await makeRequest('/api/ai/memory', 'POST', {
      type: 'test',
      content: { message: 'Test memory from script' },
      metadata: { importance: 7, tags: ['test'] }
    });
    console.log('✅ Store memory:', memory.status === 200 ? 'PASS' : 'FAIL');

    // Recall memories
    const recalled = await makeRequest('/api/ai/memory?type=test&limit=5');
    console.log('✅ Recall memories:', recalled.status === 200 ? 'PASS' : 'FAIL');
    if (recalled.data.data) {
      console.log('   - Memories found:', recalled.data.data.length);
    }

    // Get personality
    const personality = await makeRequest('/api/ai/personality');
    console.log('✅ Get personality:', personality.status === 200 ? 'PASS' : 'FAIL');

  } catch (error) {
    console.error('❌ Self-Awareness tests failed:', error.message);
  }
}

async function testAutonomousLearning() {
  console.log('\n⚡ Testing Autonomous Learning System...');
  
  try {
    // Learn a concept
    const concept = await makeRequest('/api/ai/learn/concept', 'POST', {
      name: 'test_concept_' + Date.now(),
      description: 'Test concept for validation',
      context: { test: true },
      confidence: 0.8
    });
    console.log('✅ Learn concept:', concept.status === 200 ? 'PASS' : 'FAIL');

    // Acquire a skill
    const skill = await makeRequest('/api/ai/learn/skill', 'POST', {
      name: 'test_skill_' + Date.now(),
      category: 'testing',
      proficiency: 70,
      context: { test: true }
    });
    console.log('✅ Acquire skill:', skill.status === 200 ? 'PASS' : 'FAIL');

    // Learn from interaction
    const interaction = await makeRequest('/api/ai/learn/interaction', 'POST', {
      type: 'test',
      content: 'Test interaction learning',
      success: true,
      metadata: { test: true }
    });
    console.log('✅ Learn from interaction:', interaction.status === 200 ? 'PASS' : 'FAIL');

    // Get analytics
    const analytics = await makeRequest('/api/ai/learn/analytics');
    console.log('✅ Learning analytics:', analytics.status === 200 ? 'PASS' : 'FAIL');
    if (analytics.data.data) {
      console.log('   - Total concepts:', analytics.data.data.total_concepts || 0);
      console.log('   - Avg confidence:', analytics.data.data.avg_confidence || 0);
      console.log('   - Learning rate:', analytics.data.data.learning_rate || 0);
    }

  } catch (error) {
    console.error('❌ Autonomous Learning tests failed:', error.message);
  }
}

async function testAgentFactory() {
  console.log('\n🤖 Testing Agent Factory...');
  
  try {
    // List agents
    const agents = await makeRequest('/api/ai/agents');
    console.log('✅ List agents:', agents.status === 200 ? 'PASS' : 'FAIL');
    const existingAgents = agents.data.data || [];
    console.log('   - Existing agents:', existingAgents.length);

    // Build an agent
    const agent = await makeRequest('/api/ai/agents/build', 'POST', {
      purpose: 'Test agent from validation script',
      capabilities: ['api_calls', 'task_automation'],
      deployment_target: 'local'
    });
    console.log('✅ Build agent:', agent.status === 200 ? 'PASS' : 'FAIL');
    
    if (agent.data.data) {
      const agentId = agent.data.data.agent_id;
      console.log('   - Agent ID:', agentId);
      console.log('   - Agent name:', agent.data.data.name);

      // Deploy the agent
      const deployment = await makeRequest(`/api/ai/agents/${agentId}/deploy`, 'POST', {
        target: 'local',
        config: {}
      });
      console.log('✅ Deploy agent:', deployment.status === 200 ? 'PASS' : 'FAIL');

      // Get agent analytics
      const analytics = await makeRequest(`/api/ai/agents/${agentId}/analytics`);
      console.log('✅ Agent analytics:', analytics.status === 200 ? 'PASS' : 'FAIL');
    }

  } catch (error) {
    console.error('❌ Agent Factory tests failed:', error.message);
  }
}

async function testGoalSystem() {
  console.log('\n🎯 Testing Goal System...');
  
  try {
    // Create user goal
    const userGoal = await makeRequest('/api/ai/goals/user', 'POST', {
      title: 'Test Goal ' + Date.now(),
      description: 'Goal created by validation script',
      priority: 7
    });
    console.log('✅ Create user goal:', userGoal.status === 200 ? 'PASS' : 'FAIL');
    
    if (userGoal.data.data) {
      const goalId = userGoal.data.data.goal_id;
      console.log('   - Goal ID:', goalId);
      console.log('   - Tasks created:', userGoal.data.data.tasks?.length || 0);

      // Get goal details
      const details = await makeRequest(`/api/ai/goals/${goalId}`);
      console.log('✅ Get goal details:', details.status === 200 ? 'PASS' : 'FAIL');

      // Update task status
      if (userGoal.data.data.tasks && userGoal.data.data.tasks.length > 0) {
        const taskId = userGoal.data.data.tasks[0];
        const taskUpdate = await makeRequest(`/api/ai/goals/tasks/${taskId}`, 'PATCH', {
          status: 'in_progress',
          notes: 'Started working on this task'
        });
        console.log('✅ Update task status:', taskUpdate.status === 200 ? 'PASS' : 'FAIL');
      }
    }

    // Get active goals
    const activeGoals = await makeRequest('/api/ai/goals/active');
    console.log('✅ Get active goals:', activeGoals.status === 200 ? 'PASS' : 'FAIL');
    if (activeGoals.data.data) {
      console.log('   - Active goals:', activeGoals.data.data.length);
    }

    // Get AI suggestions
    const suggestions = await makeRequest('/api/ai/goals/suggestions');
    console.log('✅ Goal suggestions:', suggestions.status === 200 ? 'PASS' : 'FAIL');
    if (suggestions.data.data) {
      console.log('   - Suggestions:', suggestions.data.data.length);
    }

  } catch (error) {
    console.error('❌ Goal System tests failed:', error.message);
  }
}

async function testIntegrationFramework() {
  console.log('\n🔗 Testing Integration Framework...');
  
  try {
    // List integrations
    const integrations = await makeRequest('/api/ai/integrations');
    console.log('✅ List integrations:', integrations.status === 200 ? 'PASS' : 'FAIL');
    if (integrations.data.data) {
      console.log('   - Available integrations:', integrations.data.data.length);
      const active = integrations.data.data.filter(i => i.status === 'active').length;
      console.log('   - Active integrations:', active);
    }

    // Note: Not creating actual integrations in test to avoid credential requirements
    console.log('   ⚠️  Skipping integration creation (requires real credentials)');

  } catch (error) {
    console.error('❌ Integration Framework tests failed:', error.message);
  }
}

async function runAllTests() {
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║        AI Intelligence System - Validation Tests           ║');
  console.log('╚════════════════════════════════════════════════════════════╝');
  console.log('\n📍 Testing backend at:', BASE_URL);
  console.log('🔑 Using API key:', API_KEY.substring(0, 8) + '...');

  // Test health endpoint first
  try {
    const health = await makeRequest('/health');
    if (health.status !== 200) {
      console.error('\n❌ Backend server is not responding. Please start it first:');
      console.error('   cd backend && npm run dev');
      process.exit(1);
    }
    console.log('✅ Backend server is running\n');
  } catch (error) {
    console.error('\n❌ Cannot connect to backend server:', error.message);
    console.error('   Make sure backend is running on port 3001');
    process.exit(1);
  }

  // Run all test suites
  await testSelfAwareness();
  await testAutonomousLearning();
  await testAgentFactory();
  await testGoalSystem();
  await testIntegrationFramework();

  console.log('\n╔════════════════════════════════════════════════════════════╗');
  console.log('║                   Tests Complete! ✨                        ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');
  console.log('📚 For full documentation, see:');
  console.log('   - /workspaces/AI-Assistant/docs/AI_INTELLIGENCE_GUIDE.md');
  console.log('   - /workspaces/AI-Assistant/docs/AI_INTELLIGENCE_QUICKSTART.md\n');
}

// Run tests
runAllTests().catch(error => {
  console.error('\n❌ Test execution failed:', error);
  process.exit(1);
});
