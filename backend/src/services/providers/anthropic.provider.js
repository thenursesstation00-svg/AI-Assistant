const Anthropic = require('@anthropic-ai/sdk');
const BaseAIProvider = require('./base.provider');

/**
 * Anthropic Claude Provider
 * Supports Claude 3.5 Sonnet, Claude 3 Opus, Claude 3 Haiku
 */
class AnthropicProvider extends BaseAIProvider {
  constructor(config) {
    super(config);
    this.client = new Anthropic({ 
      apiKey: this.apiKey,
      baseURL: this.endpoint || 'https://api.anthropic.com/v1'
    });
    
    // Cost per 1M tokens (updated pricing)
    this.pricing = {
      'claude-3-5-sonnet-20241022': { input: 3.00, output: 15.00 },
      'claude-3-5-sonnet-20240620': { input: 3.00, output: 15.00 },
      'claude-3-opus-20240229': { input: 15.00, output: 75.00 },
      'claude-3-sonnet-20240229': { input: 3.00, output: 15.00 },
      'claude-3-haiku-20240307': { input: 0.25, output: 1.25 },
    };
  }
  
  async sendMessage(messages, options = {}) {
    try {
      const model = options.model || this.defaultModel || 'claude-3-5-sonnet-20241022';
      
      const response = await this.client.messages.create({
        model,
        max_tokens: options.max_tokens || this.options.max_tokens || 4096,
        temperature: options.temperature !== undefined ? options.temperature : (this.options.temperature || 1.0),
        messages,
        ...(options.system && { system: options.system }),
      });
      
      return this.normalizeResponse(response);
    } catch (error) {
      console.error(`Anthropic API error:`, error.message);
      throw new Error(`Anthropic request failed: ${error.message}`);
    }
  }
  
  async *streamMessage(messages, options = {}) {
    try {
      const model = options.model || this.defaultModel || 'claude-3-5-sonnet-20241022';
      
      const stream = await this.client.messages.stream({
        model,
        max_tokens: options.max_tokens || this.options.max_tokens || 4096,
        temperature: options.temperature !== undefined ? options.temperature : (this.options.temperature || 1.0),
        messages,
        ...(options.system && { system: options.system }),
      });
      
      for await (const chunk of stream) {
        if (chunk.type === 'content_block_delta' && chunk.delta?.text) {
          yield {
            chunk: chunk.delta.text,
            done: false,
          };
        }
      }
      
      yield { chunk: '', done: true };
    } catch (error) {
      console.error(`Anthropic streaming error:`, error.message);
      throw new Error(`Anthropic streaming failed: ${error.message}`);
    }
  }
  
  async validateConfig() {
    try {
      // Make minimal API call to verify key works
      await this.client.messages.create({
        model: 'claude-3-haiku-20240307',
        max_tokens: 10,
        messages: [{ role: 'user', content: 'test' }],
      });
      return true;
    } catch (error) {
      console.error('Anthropic validation failed:', error.message);
      return false;
    }
  }
  
  async getSupportedModels() {
    return [
      {
        id: 'claude-3-5-sonnet-20241022',
        name: 'Claude 3.5 Sonnet (New)',
        context_window: 200000,
        cost_per_1k_tokens: { input: 0.003, output: 0.015 },
        capabilities: ['text', 'vision', 'tool_use'],
      },
      {
        id: 'claude-3-5-sonnet-20240620',
        name: 'Claude 3.5 Sonnet',
        context_window: 200000,
        cost_per_1k_tokens: { input: 0.003, output: 0.015 },
        capabilities: ['text', 'vision', 'tool_use'],
      },
      {
        id: 'claude-3-opus-20240229',
        name: 'Claude 3 Opus',
        context_window: 200000,
        cost_per_1k_tokens: { input: 0.015, output: 0.075 },
        capabilities: ['text', 'vision', 'tool_use'],
      },
      {
        id: 'claude-3-sonnet-20240229',
        name: 'Claude 3 Sonnet',
        context_window: 200000,
        cost_per_1k_tokens: { input: 0.003, output: 0.015 },
        capabilities: ['text', 'vision'],
      },
      {
        id: 'claude-3-haiku-20240307',
        name: 'Claude 3 Haiku',
        context_window: 200000,
        cost_per_1k_tokens: { input: 0.00025, output: 0.00125 },
        capabilities: ['text', 'vision'],
      },
    ];
  }
  
  normalizeResponse(response) {
    const content = response.content[0]?.text || '';
    const usage = {
      prompt_tokens: response.usage.input_tokens,
      completion_tokens: response.usage.output_tokens,
      total_tokens: response.usage.input_tokens + response.usage.output_tokens,
    };
    
    return {
      content,
      usage,
      model: response.model,
      cost: this.calculateCost(usage, response.model),
    };
  }
  
  calculateCost(usage, model) {
    const pricing = this.pricing[model];
    if (!pricing) return 0;
    
    const inputCost = (usage.prompt_tokens / 1000000) * pricing.input;
    const outputCost = (usage.completion_tokens / 1000000) * pricing.output;
    return inputCost + outputCost;
  }
}

module.exports = AnthropicProvider;
