// GEMINI AI SERVICE
// Google Gemini Pro integration for health insights

class GeminiService {
  constructor() {
    // API Key Rotation System - 6 keys for high availability
    this.apiKeys = [
      'AIzaSyAhtc2jceqb7klb2sKT0ZkOOIsDB2o_RX4', // Key 1
      'AIzaSyBhtc2jceqb7klb2sKT0ZkOOIsDB2o_RX5', // Key 2
      'AIzaSyChtc2jceqb7klb2sKT0ZkOOIsDB2o_RX6', // Key 3
      'AIzaSyDhtc2jceqb7klb2sKT0ZkOOIsDB2o_RX7', // Key 4
      'AIzaSyEhtc2jceqb7klb2sKT0ZkOOIsDB2o_RX8', // Key 5
      'AIzaSyFhtc2jceqb7klb2sKT0ZkOOIsDB2o_RX9'  // Key 6
    ];
    
    this.currentKeyIndex = 0;
    this.failedKeys = new Set();
    this.baseUrl = 'https://generativelanguage.googleapis.com/v1beta';
    this.model = 'gemini-1.5-flash';
    this.configured = this.apiKeys.length > 0;
    
    if (this.configured) {
      console.log(`🔧 Gemini (Free) configured with ${this.apiKeys.length} API keys for rotation`);
    } else {
      console.log('⚠️ Gemini (Free) not configured - No API keys available');
    }
  }

  // Get current API key with rotation
  getCurrentApiKey() {
    return this.apiKeys[this.currentKeyIndex];
  }

  // Rotate to next API key
  rotateApiKey() {
    this.failedKeys.add(this.currentKeyIndex);
    this.currentKeyIndex = (this.currentKeyIndex + 1) % this.apiKeys.length;
    
    // If all keys failed, reset failed keys set
    if (this.failedKeys.size >= this.apiKeys.length) {
      console.log('🔄 All API keys exhausted, resetting failed keys');
      this.failedKeys.clear();
    }
    
    console.log(`🔄 Rotated to API key ${this.currentKeyIndex + 1}/${this.apiKeys.length}`);
  }

  isConfigured() {
    return this.configured;
  }

  // Get API key status for debugging
  getApiKeyStatus() {
    return {
      totalKeys: this.apiKeys.length,
      currentKey: this.currentKeyIndex + 1,
      failedKeys: Array.from(this.failedKeys).map(i => i + 1),
      availableKeys: this.apiKeys.length - this.failedKeys.size
    };
  }

  async generateHealthInsights(prompt) {
    if (!this.configured) {
      throw new Error('Gemini Pro not configured - API key missing');
    }

    // Try with current API key, rotate if it fails
    let attempts = 0;
    const maxAttempts = this.apiKeys.length;
    
    while (attempts < maxAttempts) {
      const currentKey = this.getCurrentApiKey();
      
      try {
        const response = await fetch(`${this.baseUrl}/models/${this.model}:generateContent?key=${currentKey}`, {
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
          
          // Check for quota/rate limit/overload errors - rotate API key
          if (response.status === 429 || 
              response.status === 503 ||
              errorMessage.includes('quota') || 
              errorMessage.includes('exceeded') ||
              errorMessage.includes('rate limit') ||
              errorMessage.includes('overloaded') ||
              errorMessage.includes('RESOURCE_EXHAUSTED')) {
            
            console.warn(`🚫 API key ${this.currentKeyIndex + 1} failed: ${errorMessage}`);
            this.rotateApiKey();
            attempts++;
            continue; // Try next API key
          }
          
          throw new Error(`Gemini API error: ${response.status} - ${errorMessage}`);
        }

        const data = await response.json();
        console.log(`✅ API key ${this.currentKeyIndex + 1} success`);
        return data.candidates?.[0]?.content?.parts?.[0]?.text || 'No response generated';
        
      } catch (error) {
        console.warn(`⚠️ API key ${this.currentKeyIndex + 1} failed: ${error.message}`);
        this.rotateApiKey();
        attempts++;
        
        if (attempts >= maxAttempts) {
          console.error('❌ All API keys exhausted');
          throw new Error('All Gemini API keys exhausted');
        }
      }
    }
    
    throw new Error('All API keys failed');
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
      apiKey: this.apiKey ? 'configured' : 'missing'
    };
  }
}

export default GeminiService;