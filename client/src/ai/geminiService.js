// GEMINI AI SERVICE
// Google Gemini Pro integration for health insights

class GeminiService {
  constructor() {
    this.apiKey = process.env.REACT_APP_GEMINI_API_KEY;
    this.baseUrl = 'https://generativelanguage.googleapis.com/v1beta';
    this.model = 'gemini-1.5-flash';
    this.configured = !!this.apiKey;
    
    if (this.configured) {
      console.log('🔧 Gemini Pro configured and ready');
    } else {
      console.log('⚠️ Gemini Pro not configured - API key missing');
    }
  }

  isConfigured() {
    return this.configured;
  }

  async generateHealthInsights(prompt) {
    if (!this.configured) {
      throw new Error('Gemini Pro not configured - API key missing');
    }

    try {
      const response = await fetch(`${this.baseUrl}/models/${this.model}:generateContent?key=${this.apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `You are a medical AI assistant. Provide helpful, evidence-based health insights. Be concise and actionable.

${prompt}`
            }]
          }],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 1024,
          }
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        const errorMessage = errorData.error?.message || 'Unknown error';
        
        // Check for quota/rate limit errors
        if (response.status === 429 || 
            errorMessage.includes('quota') || 
            errorMessage.includes('exceeded') ||
            errorMessage.includes('rate limit') ||
            errorMessage.includes('RESOURCE_EXHAUSTED')) {
          console.warn('🚫 Gemini Pro quota/rate limit exceeded, switching to fallback');
          throw new Error('QUOTA_EXCEEDED: ' + errorMessage);
        }
        
        throw new Error(`Gemini API error: ${response.status} - ${errorMessage}`);
      }

      const data = await response.json();
      return data.candidates?.[0]?.content?.parts?.[0]?.text || 'No response generated';
    } catch (error) {
      console.error('Gemini API error:', error);
      throw error;
    }
  }

  async generateHealthAlerts(prompt) {
    return this.generateHealthInsights(`Generate health alerts and warnings based on: ${prompt}`);
  }

  async generateHealthReminders(prompt) {
    return this.generateHealthInsights(`Generate health reminders and tips based on: ${prompt}`);
  }

  async generateHealthTips(prompt) {
    return this.generateHealthInsights(`Generate helpful health tips based on: ${prompt}`);
  }

  async healthCheck() {
    if (!this.configured) {
      return { configured: false, error: 'API key not configured' };
    }

    try {
      const testResponse = await this.generateHealthInsights('Test connection');
      return { 
        configured: true, 
        service: 'Gemini Pro',
        status: 'healthy',
        testResponse: testResponse.substring(0, 100) + '...'
      };
    } catch (error) {
      return { 
        configured: true, 
        service: 'Gemini Pro',
        status: 'error',
        error: error.message
      };
    }
  }
}

export default GeminiService;