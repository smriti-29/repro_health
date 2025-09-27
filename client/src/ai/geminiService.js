// GEMINI AI SERVICE
// Google Gemini Pro integration for health insights

class GeminiService {
  constructor() {
    // Load API key from env.config explicitly
    this.apiKey = process.env.REACT_APP_GEMINI_API_KEY_PRIMARY || this.loadApiKeyFromConfig();
    this.baseUrl = 'https://generativelanguage.googleapis.com/v1beta';
    this.model = 'gemini-2.0-flash';
    this.configured = !!this.apiKey;
    
    if (this.configured) {
      console.log('🔧 Gemini (Free) configured and ready');
    } else {
      console.log('⚠️ Gemini (Free) not configured - API key missing');
    }
  }

  loadApiKeyFromConfig() {
    try {
      // Fallback to load from env.config if environment variable not set
      return 'AIzaSyAhtc2jceqb7klb2sKT0ZkOOIsDB2o_RX4'; // From env.config
    } catch (error) {
      console.warn('Failed to load API key from config:', error);
      return null;
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