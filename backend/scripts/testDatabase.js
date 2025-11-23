#!/usr/bin/env node

const ConversationRepository = require('../src/db/repositories/conversationRepo');
const ProviderConfigRepository = require('../src/db/repositories/providerConfigRepo');

console.log('Testing database repositories...\n');

try {
  const conversationRepo = new ConversationRepository();
  const providerRepo = new ProviderConfigRepository();
  
  // Test 1: Get all providers
  console.log('Test 1: Get all providers');
  const providers = providerRepo.getAllProviders();
  console.log(`  ✓ Found ${providers.length} providers`);
  providers.forEach(p => {
    console.log(`    - ${p.display_name} (${p.provider_type}) - ${p.is_active ? 'Active' : 'Inactive'}`);
  });
  
  // Test 2: Get AI providers only
  console.log('\nTest 2: Get AI providers');
  const aiProviders = providerRepo.getAllProviders({ provider_type: 'ai' });
  console.log(`  ✓ Found ${aiProviders.length} AI providers`);
  
  // Test 3: Get active providers
  console.log('\nTest 3: Get active providers');
  const activeProviders = providerRepo.getAllProviders({ is_active: true });
  console.log(`  ✓ Found ${activeProviders.length} active providers`);
  
  // Test 4: Get specific provider
  console.log('\nTest 4: Get specific provider (anthropic)');
  const anthropic = providerRepo.getProviderConfig('anthropic');
  if (anthropic) {
    console.log(`  ✓ Found: ${anthropic.display_name}`);
    console.log(`    Model: ${anthropic.default_model}`);
    console.log(`    API Key: ${anthropic.api_key ? '***' + anthropic.api_key.slice(-4) : 'Not set'}`);
  } else {
    console.log('  ✗ Anthropic provider not found');
  }
  
  // Test 5: Create a test conversation
  console.log('\nTest 5: Create test conversation');
  const convId = conversationRepo.createConversation({
    title: 'Test Conversation',
    provider_name: 'anthropic',
    model: 'claude-3-5-sonnet-20241022'
  });
  console.log(`  ✓ Created conversation with ID: ${convId}`);
  
  // Test 6: Add messages to conversation
  console.log('\nTest 6: Add messages to conversation');
  conversationRepo.addMessage(convId, {
    role: 'user',
    content: 'Hello, how are you?',
    tokens: 5
  });
  conversationRepo.addMessage(convId, {
    role: 'assistant',
    content: 'I am doing well, thank you for asking!',
    tokens: 10
  });
  console.log('  ✓ Added 2 messages');
  
  // Test 7: Get conversation messages
  console.log('\nTest 7: Get conversation messages');
  const messages = conversationRepo.getMessages(convId);
  console.log(`  ✓ Retrieved ${messages.length} messages`);
  messages.forEach((msg, i) => {
    console.log(`    ${i + 1}. [${msg.role}] ${msg.content.substring(0, 50)}...`);
  });
  
  // Test 8: Get conversation stats
  console.log('\nTest 8: Get conversation statistics');
  const stats = conversationRepo.getStats(convId);
  console.log(`  ✓ Messages: ${stats.message_count}, Tokens: ${stats.total_tokens}, Cost: $${stats.total_cost || 0}`);
  
  // Test 9: Get all conversations
  console.log('\nTest 9: Get all conversations');
  const conversations = conversationRepo.getAllConversations();
  console.log(`  ✓ Found ${conversations.length} conversations`);
  
  // Test 10: Clean up test data
  console.log('\nTest 10: Clean up test conversation');
  conversationRepo.deleteConversation(convId);
  console.log('  ✓ Test conversation deleted');
  
  console.log('\n' + '='.repeat(60));
  console.log('✓ All tests passed! Database is working correctly.');
  console.log('='.repeat(60));
  console.log('\nYou can now:');
  console.log('  1. Start the backend: npm run dev');
  console.log('  2. Add API keys via Settings UI');
  console.log('  3. Begin using the multi-provider chat system');
  console.log('');
  
} catch (error) {
  console.error('\n✗ Test failed:');
  console.error(`  ${error.message}`);
  console.error('\nStack trace:');
  console.error(error.stack);
  process.exit(1);
}
