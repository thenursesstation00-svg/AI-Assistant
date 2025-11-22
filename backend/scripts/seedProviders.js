#!/usr/bin/env node

// Load environment variables from .env file
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

const ProviderConfigRepository = require('../src/db/repositories/providerConfigRepo');

console.log('Seeding provider configurations...\n');

const repo = new ProviderConfigRepository();

// Check if Anthropic API key is available
const anthropicKey = process.env.ANTHROPIC_API_KEY;
if (!anthropicKey) {
  console.warn('⚠ Warning: ANTHROPIC_API_KEY not found in environment variables');
  console.warn('  Set it with: $env:ANTHROPIC_API_KEY="your-key-here" (PowerShell)');
  console.warn('  Provider will be created but inactive until you add the key via UI\n');
}

// Seed AI providers
const aiProviders = [
  {
    provider_name: 'anthropic',
    display_name: 'Anthropic Claude',
    provider_type: 'ai',
    api_key: anthropicKey,
    api_endpoint: 'https://api.anthropic.com/v1',
    default_model: 'claude-3-5-sonnet-20241022',
    is_active: !!anthropicKey,
    options: {
      max_tokens: 4096,
      temperature: 1.0,
      supports_streaming: true,
    }
  },
  {
    provider_name: 'openai',
    display_name: 'OpenAI GPT',
    provider_type: 'ai',
    api_key: process.env.OPENAI_API_KEY,
    api_endpoint: 'https://api.openai.com/v1',
    default_model: 'gpt-4o',
    is_active: !!process.env.OPENAI_API_KEY,
    options: {
      max_tokens: 4096,
      temperature: 0.7,
      supports_streaming: true,
    }
  },
  {
    provider_name: 'google',
    display_name: 'Google AI (Gemini)',
    provider_type: 'ai',
    api_key: process.env.GOOGLE_AI_API_KEY,
    default_model: 'gemini-2.0-flash-exp',
    is_active: !!process.env.GOOGLE_AI_API_KEY,
    options: {
      supports_streaming: true,
    }
  },
];

// Seed web search providers
const webProviders = [
  {
    provider_name: 'serpapi',
    display_name: 'SerpAPI',
    provider_type: 'web_search',
    api_key: process.env.SERPAPI_KEY,
    api_endpoint: 'https://serpapi.com/search.json',
    is_active: !!process.env.SERPAPI_KEY,
    options: {
      engine: 'google',
      hl: 'en',
    }
  },
  {
    provider_name: 'google_cse',
    display_name: 'Google Custom Search',
    provider_type: 'web_search',
    api_key: process.env.GOOGLE_CSE_KEY,
    api_endpoint: 'https://www.googleapis.com/customsearch/v1',
    is_active: !!process.env.GOOGLE_CSE_KEY && !!process.env.GOOGLE_CSE_CX,
    options: {
      cx: process.env.GOOGLE_CSE_CX,
    }
  },
  {
    provider_name: 'brave',
    display_name: 'Brave Search',
    provider_type: 'web_search',
    api_key: process.env.BRAVE_API_KEY,
    api_endpoint: 'https://api.search.brave.com/res/v1',
    is_active: !!process.env.BRAVE_API_KEY,
    options: {
      count: 10,
    }
  },
];

let successCount = 0;
let errorCount = 0;

// Seed AI providers
console.log('AI Providers:');
aiProviders.forEach(config => {
  try {
    repo.saveProviderConfig(config);
    const status = config.is_active ? '✓ Active' : '○ Inactive (no API key)';
    console.log(`  ${status} - ${config.display_name}`);
    successCount++;
  } catch (error) {
    console.error(`  ✗ Failed - ${config.display_name}: ${error.message}`);
    errorCount++;
  }
});

// Seed web search providers
console.log('\nWeb Search Providers:');
webProviders.forEach(config => {
  try {
    repo.saveProviderConfig(config);
    const status = config.is_active ? '✓ Active' : '○ Inactive (no API key)';
    console.log(`  ${status} - ${config.display_name}`);
    successCount++;
  } catch (error) {
    console.error(`  ✗ Failed - ${config.display_name}: ${error.message}`);
    errorCount++;
  }
});

console.log('\n' + '='.repeat(60));
console.log(`Seeding complete: ${successCount} providers added, ${errorCount} errors`);
console.log('='.repeat(60));

if (errorCount === 0 && successCount > 0) {
  console.log('\n✓ All providers seeded successfully!');
  console.log('\nTo activate providers, set environment variables:');
  console.log('  $env:ANTHROPIC_API_KEY="sk-ant-..."');
  console.log('  $env:OPENAI_API_KEY="sk-..."');
  console.log('  $env:GOOGLE_AI_API_KEY="..."');
  console.log('  $env:SERPAPI_KEY="..."');
  console.log('\nOr configure via the Settings UI once the frontend is running.');
}

console.log('');
