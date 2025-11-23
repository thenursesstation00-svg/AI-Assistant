// backend/src/services/ai/providers/anthropic.js
// Anthropic Claude provider implementation

const AIProvider = require('./base');
const Anthropic = require('@anthropic-ai/sdk');

class AnthropicProvider extends AIProvider {
  constructor(config = {}) {
    super(config);
    this.client = new Anthropic({
      apiKey: this.apiKey || process.env.ANTHROPIC_API_KEY
    });
  }

  getName() {
    return 'anthropic';
  }

  getSupportedModels() {
    return [
      {
        id: 'claude-3-5-sonnet-20241022',
        name: 'Claude 3.5 Sonnet',
        description: 'Most intelligent model',
        context_window: 200000,
        max_output: 8192
      },
      {
        id: 'claude-3-5-haiku-20241022',
        name: 'Claude 3.5 Haiku',
        description: 'Fastest model',
        context_window: 200000,
        max_output: 8192
      },
      {
        id: 'claude-3-opus-20240229',
        name: 'Claude 3 Opus',
        description: 'Most capable model',
        context_window: 200000,
        max_output: 4096
      }
    ];
  }

  async chat(messages, options = {}) {
    const {
      model = 'claude-3-5-sonnet-20241022',
      temperature = 0.7,
      max_tokens = 4096,
      system = null,
      ...otherOptions
    } = options;

    const params = {
      model,
      messages,
      max_tokens,
      temperature,
      ...otherOptions
    };

    if (system) {
      params.system = system;
    }

    try {
      const response = await this.client.messages.create(params);
      return this.normalizeResponse(response);
    } catch (error) {
      console.error('Anthropic API error:', error);
      throw error;
    }
  }

  async *streamChat(messages, options = {}) {
    const {
      model = 'claude-3-5-sonnet-20241022',
      temperature = 0.7,
      max_tokens = 4096,
      system = null,
      ...otherOptions
    } = options;

    const params = {
      model,
      messages,
      max_tokens,
      temperature,
      stream: true,
      ...otherOptions
    };

    if (system) {
      params.system = system;
    }

    try {
      const stream = await this.client.messages.create(params);
      
      for await (const chunk of stream) {
        if (chunk.type === 'content_block_delta' && chunk.delta?.text) {
          yield {
            content: chunk.delta.text,
            done: false
          };
        } else if (chunk.type === 'message_stop') {
          yield {
            content: '',
            done: true,
            usage: chunk.usage || {}
          };
        }
      }
    } catch (error) {
      console.error('Anthropic streaming error:', error);
      throw error;
    }
  }

  normalizeResponse(response) {
    const content = response.content?.[0]?.text || '';
    
    return {
      content,
      role: 'assistant',
      model: response.model,
      usage: {
        prompt_tokens: response.usage?.input_tokens || 0,
        completion_tokens: response.usage?.output_tokens || 0,
        total_tokens: (response.usage?.input_tokens || 0) + (response.usage?.output_tokens || 0)
      },
      finish_reason: response.stop_reason,
      raw: response
    };
  }

  calculateCost(promptTokens, completionTokens, model) {
    // Pricing as of Nov 2024 (per million tokens)
    const pricing = {
      'claude-3-5-sonnet-20241022': { input: 3.00, output: 15.00 },
      'claude-3-5-haiku-20241022': { input: 1.00, output: 5.00 },
      'claude-3-opus-20240229': { input: 15.00, output: 75.00 }
    };

    const modelPricing = pricing[model] || pricing['claude-3-5-sonnet-20241022'];
    
    const inputCost = (promptTokens / 1000000) * modelPricing.input;
    const outputCost = (completionTokens / 1000000) * modelPricing.output;
    
    return inputCost + outputCost;
  }

  async validateConnection() {
    try {
      // Send minimal test request
      await this.client.messages.create({
        model: 'claude-3-5-haiku-20241022',
        messages: [{ role: 'user', content: 'test' }],
        max_tokens: 10
      });
      return true;
    } catch (error) {
      console.error('Anthropic validation failed:', error.message);
      return false;
    }
  }
}

module.exports = AnthropicProvider;
