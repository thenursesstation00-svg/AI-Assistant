// backend/src/utils/validateEnv.js
// Startup environment variable validation

const required = [
  { key: 'ANTHROPIC_API_KEY', description: 'Anthropic Claude API key' }
];

const optional = [
  { key: 'OPENAI_API_KEY', description: 'OpenAI API key' },
  { key: 'GOOGLE_GEMINI_API_KEY', description: 'Google Gemini API key' },
  { key: 'GITHUB_TOKEN', description: 'GitHub personal access token' },
  { key: 'SERPAPI_KEY', description: 'SerpAPI key' },
  { key: 'GOOGLE_CSE_KEY', description: 'Google Custom Search Engine key' },
  { key: 'REDIS_URL', description: 'Redis connection URL' }
];

function validateEnvironment({ strict = false } = {}) {
  const errors = [];
  const warnings = [];

  // Check required variables
  for (const { key, description } of required) {
    if (!process.env[key]) {
      errors.push(`Missing required environment variable: ${key} (${description})`);
    }
  }

  // Check optional but recommended variables
  if (strict) {
    for (const { key, description } of optional) {
      if (!process.env[key]) {
        warnings.push(`Missing optional environment variable: ${key} (${description})`);
      }
    }
  }

  // Validate specific formats
  if (process.env.BACKEND_API_KEYS) {
    try {
      JSON.parse(process.env.BACKEND_API_KEYS);
    } catch (e) {
      errors.push('BACKEND_API_KEYS must be valid JSON');
    }
  }

  if (process.env.PORT) {
    const port = parseInt(process.env.PORT, 10);
    if (isNaN(port) || port < 1 || port > 65535) {
      errors.push('PORT must be a valid port number (1-65535)');
    }
  }

  if (process.env.REDIS_URL && !process.env.REDIS_URL.startsWith('redis://')) {
    warnings.push('REDIS_URL should start with redis://');
  }

  // Log results
  if (errors.length > 0) {
    console.error('❌ Environment validation failed:');
    errors.forEach(err => console.error(`  - ${err}`));
    return { valid: false, errors, warnings };
  }

  if (warnings.length > 0 && strict) {
    console.warn('⚠️  Environment warnings:');
    warnings.forEach(warn => console.warn(`  - ${warn}`));
  }

  console.log('✅ Environment validation passed');
  return { valid: true, errors: [], warnings };
}

function requireEnvVar(key, description) {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key} (${description})`);
  }
  return value;
}

module.exports = { validateEnvironment, requireEnvVar };
