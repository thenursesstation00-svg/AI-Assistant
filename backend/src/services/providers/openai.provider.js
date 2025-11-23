const OpenAI = require('openai');
const BaseAIProvider = require('./base.provider');

/**
 * OpenAI GPT Provider
 * Supports GPT-4o, GPT-4 Turbo, GPT-3.5 Turbo
 */
class OpenAIProvider extends BaseAIProvider {
  constructor(config) {
    super(config);
    this.client = new OpenAI({ 
      apiKey: this.apiKey,
      baseURL: this.endpoint || 'https://api.openai.com/v1'
    });
    
    // Cost per 1M tokens (updated pricing as of Nov 2024)
    this.pricing = {
      'gpt-4o': { input: 2.50, output: 10.00 },
      'gpt-4o-2024-11-20': { input: 2.50, output: 10.00 },
      'gpt-4o-2024-08-06': { input: 2.50, output: 10.00 },
      'gpt-4o-mini': { input: 0.15, output: 0.60 },
      'gpt-4-turbo': { input: 10.00, output: 30.00 },
      'gpt-4-turbo-2024-04-09': { input: 10.00, output: 30.00 },
      'gpt-4': { input: 30.00, output: 60.00 },
      'gpt-3.5-turbo': { input: 0.50, output: 1.50 },
      'gpt-3.5-turbo-0125': { input: 0.50, output: 1.50 },
    };
  }
  
  async sendMessage(messages, options = {}) {
    try {
      const model = options.model || this.defaultModel || 'gpt-4o';
      
      const response = await this.client.chat.completions.create({
        model,
        messages,
        temperature: options.temperature !== undefined ? options.temperature : (this.options.temperature || 0.7),
        max_tokens: options.max_tokens || this.options.max_tokens,
        ...(options.system && messages[0]?.role !== 'system' && {
          messages: [{ role: 'system', content: options.system }, ...messages]
        }),
      });
      
      return this.normalizeResponse(response);
    } catch (error) {
      console.error(`OpenAI API error:`, error.message);
      throw new Error(`OpenAI request failed: ${error.message}`);
    }
  }
  
  async *streamMessage(messages, options = {}) {
    try {
      const model = options.model || this.defaultModel || 'gpt-4o';
      
      const stream = await this.client.chat.completions.create({
        model,
        messages,
        temperature: options.temperature !== undefined ? options.temperature : (this.options.temperature || 0.7),
        max_tokens: options.max_tokens || this.options.max_tokens,
        stream: true,
        ...(options.system && messages[0]?.role !== 'system' && {
          messages: [{ role: 'system', content: options.system }, ...messages]
        }),
      });
      
      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content;
        if (content) {
          yield {
            chunk: content,
            done: false,
          };
        }
      }
      
      yield { chunk: '', done: true };
    } catch (error) {
      console.error(`OpenAI streaming error:`, error.message);
      throw new Error(`OpenAI streaming failed: ${error.message}`);
    }
  }
  
  async validateConfig() {
    try {
      // Make minimal API call to verify key works
      await this.client.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: 'test' }],
        max_tokens: 5,
      });
      return true;
    } catch (error) {
      console.error('OpenAI validation failed:', error.message);
      return false;
    }
  }
  
  async getSupportedModels() {
    return [
      {
        id: 'gpt-4o',
        name: 'GPT-4o (Latest)',
        context_window: 128000,
        cost_per_1k_tokens: { input: 0.0025, output: 0.010 },
        capabilities: ['text', 'vision', 'tool_use'],
      },
      {
        id: 'gpt-4o-mini',
        name: 'GPT-4o Mini',
        context_window: 128000,
        cost_per_1k_tokens: { input: 0.00015, output: 0.0006 },
        capabilities: ['text', 'vision', 'tool_use'],
      },
      {
        id: 'gpt-4-turbo',
        name: 'GPT-4 Turbo',
        context_window: 128000,
        cost_per_1k_tokens: { input: 0.010, output: 0.030 },
        capabilities: ['text', 'vision', 'tool_use'],
      },
      {
        id: 'gpt-4',
        name: 'GPT-4',
        context_window: 8192,
        cost_per_1k_tokens: { input: 0.030, output: 0.060 },
        capabilities: ['text'],
      },
      {
        id: 'gpt-3.5-turbo',
        name: 'GPT-3.5 Turbo',
        context_window: 16385,
        cost_per_1k_tokens: { input: 0.0005, output: 0.0015 },
        capabilities: ['text', 'tool_use'],
      },
    ];
  }
  
  normalizeResponse(response) {
    const content = response.choices[0]?.message?.content || '';
    const usage = response.usage || {
      prompt_tokens: 0,
      completion_tokens: 0,
      total_tokens: 0,
    };
    
    return {
      content,
      usage: {
        prompt_tokens: usage.prompt_tokens,
        completion_tokens: usage.completion_tokens,
        total_tokens: usage.total_tokens,
      },
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

module.exports = OpenAIProvider;
