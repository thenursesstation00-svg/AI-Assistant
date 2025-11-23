// backend/src/services/ai/providers/openai.js
// OpenAI GPT provider implementation

const AIProvider = require('./base');

class OpenAIProvider extends AIProvider {
  constructor(config = {}) {
    super(config);
    // Lazy load OpenAI SDK
    this.OpenAI = null;
    this.client = null;
  }

  _ensureClient() {
    if (!this.client) {
      if (!this.OpenAI) {
        this.OpenAI = require('openai');
      }
      this.client = new this.OpenAI({
        apiKey: this.apiKey || process.env.OPENAI_API_KEY
      });
    }
    return this.client;
  }

  getName() {
    return 'openai';
  }

  getSupportedModels() {
    return [
      {
        id: 'gpt-4-turbo-preview',
        name: 'GPT-4 Turbo',
        description: 'Latest GPT-4 with 128k context',
        context_window: 128000,
        max_output: 4096
      },
      {
        id: 'gpt-4',
        name: 'GPT-4',
        description: 'Most capable model',
        context_window: 8192,
        max_output: 4096
      },
      {
        id: 'gpt-3.5-turbo',
        name: 'GPT-3.5 Turbo',
        description: 'Fast and efficient',
        context_window: 16385,
        max_output: 4096
      },
      {
        id: 'gpt-4o',
        name: 'GPT-4o',
        description: 'Optimized GPT-4 variant',
        context_window: 128000,
        max_output: 4096
      }
    ];
  }

  async chat(messages, options = {}) {
    const client = this._ensureClient();
    
    const {
      model = 'gpt-4-turbo-preview',
      temperature = 0.7,
      max_tokens = 4096,
      ...otherOptions
    } = options;

    try {
      const response = await client.chat.completions.create({
        model,
        messages,
        temperature,
        max_tokens,
        ...otherOptions
      });

      return this.normalizeResponse(response);
    } catch (error) {
      console.error('OpenAI API error:', error);
      throw error;
    }
  }

  async *streamChat(messages, options = {}) {
    const client = this._ensureClient();
    
    const {
      model = 'gpt-4-turbo-preview',
      temperature = 0.7,
      max_tokens = 4096,
      ...otherOptions
    } = options;

    try {
      const stream = await client.chat.completions.create({
        model,
        messages,
        temperature,
        max_tokens,
        stream: true,
        ...otherOptions
      });

      for await (const chunk of stream) {
        const delta = chunk.choices?.[0]?.delta;
        
        if (delta?.content) {
          yield {
            content: delta.content,
            done: false
          };
        }
        
        if (chunk.choices?.[0]?.finish_reason) {
          yield {
            content: '',
            done: true,
            finish_reason: chunk.choices[0].finish_reason,
            usage: chunk.usage || {}
          };
        }
      }
    } catch (error) {
      console.error('OpenAI streaming error:', error);
      throw error;
    }
  }

  normalizeResponse(response) {
    const choice = response.choices?.[0];
    const content = choice?.message?.content || '';

    return {
      content,
      role: 'assistant',
      model: response.model,
      usage: {
        prompt_tokens: response.usage?.prompt_tokens || 0,
        completion_tokens: response.usage?.completion_tokens || 0,
        total_tokens: response.usage?.total_tokens || 0
      },
      finish_reason: choice?.finish_reason,
      raw: response
    };
  }

  calculateCost(promptTokens, completionTokens, model) {
    // Pricing as of Nov 2024 (per million tokens)
    const pricing = {
      'gpt-4-turbo-preview': { input: 10.00, output: 30.00 },
      'gpt-4': { input: 30.00, output: 60.00 },
      'gpt-3.5-turbo': { input: 0.50, output: 1.50 },
      'gpt-4o': { input: 5.00, output: 15.00 }
    };

    const modelPricing = pricing[model] || pricing['gpt-4-turbo-preview'];
    
    const inputCost = (promptTokens / 1000000) * modelPricing.input;
    const outputCost = (completionTokens / 1000000) * modelPricing.output;
    
    return inputCost + outputCost;
  }

  async validateConnection() {
    try {
      const client = this._ensureClient();
      
      await client.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: 'test' }],
        max_tokens: 5
      });
      
      return true;
    } catch (error) {
      console.error('OpenAI validation failed:', error.message);
      return false;
    }
  }

  isConfigured() {
    return !!(this.apiKey || process.env.OPENAI_API_KEY);
  }
}

module.exports = OpenAIProvider;
