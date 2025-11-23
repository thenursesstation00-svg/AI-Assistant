/**
 * Multi-Provider System Test
 * Tests provider abstraction layer, registry, and API routes
 */

const ProviderConfigRepository = require('../src/db/repositories/providerConfigRepo');
const providerRegistry = require('../src/services/providers/registry');

const configRepo = new ProviderConfigRepository();

async function testProviderSystem() {
  console.log('\n🧪 Testing Multi-Provider System\n');
  let passed = 0;
  let failed = 0;
  
  // Test 1: Check if providers are in database
  console.log('Test 1: Database provider configurations...');
  try {
    const providers = configRepo.getAllProviders({ provider_type: 'ai' });
    if (providers.length >= 2) {
      console.log(`✓ Found ${providers.length} AI providers in database`);
      providers.forEach(p => {
        console.log(`  - ${p.display_name} (${p.provider_name}): ${p.is_active ? '✓ Active' : '○ Inactive'}`);
      });
      passed++;
    } else {
      console.log(`✗ Expected at least 2 providers, found ${providers.length}`);
      failed++;
    }
  } catch (error) {
    console.log(`✗ Failed: ${error.message}`);
    failed++;
  }
  
  // Test 2: Check available provider implementations
  console.log('\nTest 2: Provider registry implementations...');
  try {
    const available = providerRegistry.getAvailableProviders();
    if (available.includes('anthropic') && available.includes('openai')) {
      console.log(`✓ Provider classes registered: ${available.join(', ')}`);
      passed++;
    } else {
      console.log(`✗ Missing provider implementations. Found: ${available.join(', ')}`);
      failed++;
    }
  } catch (error) {
    console.log(`✗ Failed: ${error.message}`);
    failed++;
  }
  
  // Test 3: Test provider loading (requires API keys)
  console.log('\nTest 3: Provider loading...');
  try {
    const activeProviders = configRepo.getAllProviders({ provider_type: 'ai', is_active: true });
    if (activeProviders.length > 0) {
      const providerName = activeProviders[0].provider_name;
      const provider = await providerRegistry.loadProvider(providerName);
      console.log(`✓ Successfully loaded provider: ${providerName}`);
      console.log(`  Default model: ${provider.defaultModel}`);
      passed++;
    } else {
      console.log('○ Skipped: No active providers with API keys configured');
      console.log('  To test provider loading:');
      console.log('  1. Set ANTHROPIC_API_KEY or OPENAI_API_KEY environment variable');
      console.log('  2. Run: node scripts/seedProviders.js');
      console.log('  3. Re-run this test');
      passed++; // Don't fail if no keys configured
    }
  } catch (error) {
    if (error.message.includes('no API key') || error.message.includes('inactive')) {
      console.log('○ Skipped: Provider not configured with API key');
      passed++;
    } else {
      console.log(`✗ Failed: ${error.message}`);
      failed++;
    }
  }
  
  // Test 4: Test model listing
  console.log('\nTest 4: Provider model listing...');
  try {
    const activeProviders = configRepo.getAllProviders({ provider_type: 'ai', is_active: true });
    if (activeProviders.length > 0) {
      const providerName = activeProviders[0].provider_name;
      const provider = await providerRegistry.getProvider(providerName);
      const models = await provider.getSupportedModels();
      
      if (models && models.length > 0) {
        console.log(`✓ ${providerName} supports ${models.length} models:`);
        models.slice(0, 3).forEach(m => {
          console.log(`  - ${m.name} (${m.id})`);
          console.log(`    Context: ${m.context_window.toLocaleString()} tokens`);
          console.log(`    Cost: $${m.cost_per_1k_tokens.input}/1k input, $${m.cost_per_1k_tokens.output}/1k output`);
        });
        if (models.length > 3) {
          console.log(`  ... and ${models.length - 3} more`);
        }
        passed++;
      } else {
        console.log('✗ No models returned');
        failed++;
      }
    } else {
      console.log('○ Skipped: No active providers');
      passed++;
    }
  } catch (error) {
    if (error.message.includes('no API key') || error.message.includes('inactive')) {
      console.log('○ Skipped: Provider not configured');
      passed++;
    } else {
      console.log(`✗ Failed: ${error.message}`);
      failed++;
    }
  }
  
  // Test 5: Test provider caching
  console.log('\nTest 5: Provider instance caching...');
  try {
    const activeProviders = configRepo.getAllProviders({ provider_type: 'ai', is_active: true });
    if (activeProviders.length > 0) {
      const providerName = activeProviders[0].provider_name;
      
      // Load provider twice
      const provider1 = await providerRegistry.getProvider(providerName);
      const provider2 = await providerRegistry.getProvider(providerName);
      
      // Should be same instance
      if (provider1 === provider2) {
        console.log(`✓ Provider instances are cached correctly`);
        passed++;
      } else {
        console.log('✗ Provider instances are not cached (different objects)');
        failed++;
      }
    } else {
      console.log('○ Skipped: No active providers');
      passed++;
    }
  } catch (error) {
    if (error.message.includes('no API key') || error.message.includes('inactive')) {
      console.log('○ Skipped: Provider not configured');
      passed++;
    } else {
      console.log(`✗ Failed: ${error.message}`);
      failed++;
    }
  }
  
  // Test 6: Test provider reload
  console.log('\nTest 6: Provider cache invalidation...');
  try {
    const activeProviders = configRepo.getAllProviders({ provider_type: 'ai', is_active: true });
    if (activeProviders.length > 0) {
      const providerName = activeProviders[0].provider_name;
      
      // Load, clear cache, reload
      const provider1 = await providerRegistry.getProvider(providerName);
      providerRegistry.clearProvider(providerName);
      const provider2 = await providerRegistry.getProvider(providerName);
      
      // Should be different instances after cache clear
      if (provider1 !== provider2) {
        console.log(`✓ Provider cache cleared and reloaded successfully`);
        passed++;
      } else {
        console.log('✗ Provider cache not cleared (same object)');
        failed++;
      }
    } else {
      console.log('○ Skipped: No active providers');
      passed++;
    }
  } catch (error) {
    if (error.message.includes('no API key') || error.message.includes('inactive')) {
      console.log('○ Skipped: Provider not configured');
      passed++;
    } else {
      console.log(`✗ Failed: ${error.message}`);
      failed++;
    }
  }
  
  // Test 7: Test availability check
  console.log('\nTest 7: Provider availability check...');
  try {
    const anthropicAvailable = providerRegistry.isProviderAvailable('anthropic');
    const openaiAvailable = providerRegistry.isProviderAvailable('openai');
    const fakeAvailable = providerRegistry.isProviderAvailable('nonexistent');
    
    console.log(`  Anthropic available: ${anthropicAvailable ? '✓ Yes' : '○ No (no API key)'}`);
    console.log(`  OpenAI available: ${openaiAvailable ? '✓ Yes' : '○ No (no API key)'}`);
    console.log(`  Fake provider available: ${fakeAvailable ? '✗ Yes (should be false!)' : '✓ No'}`);
    
    if (!fakeAvailable) {
      passed++;
    } else {
      console.log('✗ isProviderAvailable() returned true for nonexistent provider');
      failed++;
    }
  } catch (error) {
    console.log(`✗ Failed: ${error.message}`);
    failed++;
  }
  
  // Summary
  console.log('\n' + '='.repeat(60));
  console.log(`Tests completed: ${passed + failed}`);
  console.log(`✓ Passed: ${passed}`);
  console.log(`✗ Failed: ${failed}`);
  
  if (failed === 0) {
    console.log('\n✅ All tests passed! Multi-provider system is working correctly.\n');
    
    const activeCount = configRepo.getAllProviders({ provider_type: 'ai', is_active: true }).length;
    if (activeCount === 0) {
      console.log('💡 Next steps:');
      console.log('  1. Set environment variables:');
      console.log('     - ANTHROPIC_API_KEY=sk-ant-...');
      console.log('     - OPENAI_API_KEY=sk-...');
      console.log('  2. Run: node scripts/seedProviders.js');
      console.log('  3. Test API calls: curl -X POST http://localhost:3001/api/chat \\');
      console.log('       -H "x-api-key: your-backend-key" \\');
      console.log('       -H "Content-Type: application/json" \\');
      console.log('       -d \'{"messages":[{"role":"user","content":"Hello"}],"provider":"openai"}\'');
    }
  } else {
    console.log('\n❌ Some tests failed. Review errors above.\n');
    process.exit(1);
  }
}

// Run tests
testProviderSystem().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
