// GEMINI AI SERVICE
// Google Gemini Pro integration for health insights

class GeminiService {
  constructor() {
    // 3 API keys for maximum reliability and quota distribution
    this.apiKeys = [
      process.env.REACT_APP_GEMINI_API_KEY || 'AIzaSyAhtc2jceqb7klb2sKT0ZkOOIsDB2o_RX4', // Key 1
      'AIzaSyACLccKOQOHEMtfw9IDhXalE2yIaO0GFcY', // Key 2
      'AIzaSyDcz_uayb2q5ShAkxWAQNsTHg5X9d5HFnU'  // Key 3
    ];
    this.currentKeyIndex = 0;
    this.baseUrl = 'https://generativelanguage.googleapis.com/v1beta';
    this.model = 'gemini-2.0-flash'; // Using 2.0-flash for all keys (most reliable)
    this.configured = this.apiKeys.some(key => !!key);
    
    if (this.configured) {
      console.log('🔧 Gemini configured with 3 API keys for maximum reliability');
    } else {
      console.log('⚠️ Gemini not configured - API keys missing');
    }
  }

  getCurrentApiKey() {
    return this.apiKeys[this.currentKeyIndex];
  }

  getCurrentModel() {
    return this.model; // All keys use the same model
  }

  switchToNextKey() {
    const nextIndex = (this.currentKeyIndex + 1) % this.apiKeys.length;
    if (nextIndex !== this.currentKeyIndex) {
      this.currentKeyIndex = nextIndex;
      console.log(`🔄 Switched to API key ${this.currentKeyIndex + 1}/${this.apiKeys.length}`);
      return true;
    }
    return false;
  }

  isConfigured() {
    return this.configured;
  }

  async generateHealthInsights(prompt) {
    if (!this.configured) {
      throw new Error('Gemini Pro not configured - API key missing');
    }

    try {
      const currentKey = this.getCurrentApiKey();
      const currentModel = this.getCurrentModel();
      const response = await fetch(`${this.baseUrl}/models/${currentModel}:generateContent?key=${currentKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `You are an advanced AI assistant with expertise in women's reproductive health and medical analysis.

MEDICAL EXPERTISE:
- Menstrual cycle disorders, PCOS, endometriosis
- Fertility tracking and optimization
- Pregnancy and prenatal care
- Menopause management
- Pelvic pain and reproductive health

RESPONSE GUIDELINES:
1. Provide medically accurate, evidence-based insights
2. Use empathetic, supportive tone
3. Give specific, actionable recommendations
4. Always recommend professional consultation for serious concerns
5. Explain medical concepts clearly and accessibly
6. Never provide definitive diagnoses - guide users to seek professional care

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
        
        // Check for quota/rate limit errors or 404 errors
        if (response.status === 429 || 
            response.status === 404 ||
            errorMessage.includes('quota') || 
            errorMessage.includes('exceeded') ||
            errorMessage.includes('rate limit') ||
            errorMessage.includes('RESOURCE_EXHAUSTED') ||
            errorMessage.includes('not found') ||
            errorMessage.includes('does not have access')) {
          
          // Try switching to next key if available
          if (this.switchToNextKey()) {
            console.warn('🔄 Current key failed, retrying with next key...');
            return this.generateHealthInsights(prompt); // Retry with next key
          } else {
            console.warn('🚫 All API keys exhausted, switching to fallback');
            throw new Error('QUOTA_EXCEEDED: ' + errorMessage);
          }
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

    // Don't make actual API calls for health check - just verify configuration
    return { 
      configured: true, 
      service: 'Gemini Pro',
      status: 'healthy',
      totalKeys: this.apiKeys.length,
      activeKey: this.currentKeyIndex + 1,
      key1: this.apiKeys[0] ? 'configured' : 'missing',
      key2: this.apiKeys[1] ? 'configured' : 'missing',
      key3: this.apiKeys[2] ? 'configured' : 'missing',
      currentModel: this.getCurrentModel()
    };
  }
}

export default GeminiService;