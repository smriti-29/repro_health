// OLLAMA SERVICE
// Local, free LLM service using Ollama

class OllamaService {
  constructor() {
    this.baseURL = 'http://localhost:11434/api';
    this.model = 'llama3.1:8b'; // Free, local model
    this.timeout = 45000; // 45 second timeout for slower models
    
    console.log('🤖 OllamaService initialized');
    console.log('🔧 Using model:', this.model);
    console.log('🔧 Local endpoint:', this.baseURL);
    console.log('🔧 Timeout:', this.timeout + 'ms');
    
    // Check if Ollama is running
    this.checkOllamaStatus();
  }

  async checkOllamaStatus() {
    try {
      const response = await fetch(`${this.baseURL}/tags`);
      if (response.ok) {
        console.log('✅ Ollama is running locally');
      } else {
        // Silently return false for fallback service
      }
    } catch (error) {
      // Silently return false for fallback service - no console warnings
    }
  }

  async generateHealthInsights(prompt) {
    try {
      console.log('🤖 Using Ollama for health insights...');

      // Create timeout controller with longer timeout for local model
      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        console.log('⏰ Ollama request timeout, aborting...');
        controller.abort();
      }, 60000); // 60 second timeout for local model

      const response = await fetch(`${this.baseURL}/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: this.model,
          prompt: prompt, // Use the full enhanced prompt directly
          stream: false,
          options: {
            temperature: 0.7,
            top_p: 0.9,
            num_predict: 500 // Increased token limit for comprehensive response
          }
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Ollama API error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log('✅ Ollama response received');

      const content = data.response || '';
      console.log('📝 Ollama content length:', content.length);

      // Return the full content as a single string for the enhanced parser
      return content;
    } catch (error) {
      if (error.name === 'AbortError') {
        console.error('❌ Ollama request timed out after 60 seconds');
        throw new Error('Request timeout: Ollama model is taking too long to respond');
      }
      console.error('❌ Error generating health insights:', error);
      throw error;
    }
  }

  async generateHealthAlerts(prompt) {
    try {
      const response = await fetch(`${this.baseURL}/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: this.model,
          prompt: `You are an expert reproductive health AI assistant. Generate health alerts based on user data. Be medically accurate and actionable.

User request: ${prompt}

Please provide 2-3 important health alerts in a clear, urgent format.`,
          stream: false
        })
      });

      if (!response.ok) {
        throw new Error(`Ollama API error: ${response.status}`);
      }

      const data = await response.json();
      const content = data.response || '';
      const alerts = content.split('\n').filter(line => line.trim().length > 0);
      
      return alerts;
    } catch (error) {
      console.error('❌ Error generating health alerts:', error);
      throw error;
    }
  }

  async generateHealthReminders(prompt) {
    try {
      const response = await fetch(`${this.baseURL}/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: this.model,
          prompt: `You are an expert reproductive health AI assistant. Generate health reminders based on user data. Be helpful and actionable.

User request: ${prompt}

Please provide 3-4 helpful health reminders in a clear, friendly format.`,
          stream: false
        })
      });

      if (!response.ok) {
        throw new Error(`Ollama API error: ${response.status}`);
      }

      const data = await response.json();
      const content = data.response || '';
      const reminders = content.split('\n').filter(line => line.trim().length > 0);
      
      return reminders;
    } catch (error) {
      console.error('❌ Error generating health reminders:', error);
      throw error;
    }
  }

  async generateHealthTips(prompt) {
    try {
      const response = await fetch(`${this.baseURL}/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: this.model,
          prompt: `You are an expert reproductive health AI assistant. Generate health tips based on user data. Be practical and actionable.

User request: ${prompt}

Please provide 3-4 practical health tips in a clear, helpful format.`,
          stream: false
        })
      });

      if (!response.ok) {
        throw new Error(`Ollama API error: ${response.status}`);
      }

      const data = await response.json();
      const content = data.response || '';
      const tips = content.split('\n').filter(line => line.trim().length > 0);
      
      return tips;
    } catch (error) {
      console.error('❌ Error generating health tips:', error);
      throw error;
    }
  }

  async generateSymptomAnalysis(prompt) {
    try {
      const response = await fetch(`${this.baseURL}/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: this.model,
          prompt: `You are an expert reproductive health AI assistant. Analyze symptoms based on user data. Be medically accurate and helpful.

User request: ${prompt}

Please provide a clear symptom analysis with possible causes and next steps.`,
          stream: false
        })
      });

      if (!response.ok) {
        throw new Error(`Ollama API error: ${response.status}`);
      }

      const data = await response.json();
      return data.response || 'Unable to analyze symptoms at this time.';
    } catch (error) {
      console.error('❌ Error generating symptom analysis:', error);
      throw error;
    }
  }

  async generateCycleAnalysis(cycleData) {
    try {
      const response = await fetch(`${this.baseURL}/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: this.model,
          prompt: `You are an expert reproductive health AI assistant. Analyze menstrual cycle data and provide insights.

Cycle Data: ${JSON.stringify(cycleData)}

Please provide a comprehensive cycle analysis with patterns, insights, and recommendations.`,
          stream: false
        })
      });

      if (!response.ok) {
        throw new Error(`Ollama API error: ${response.status}`);
      }

      const data = await response.json();
      return data.response || 'Unable to analyze cycle data at this time.';
    } catch (error) {
      console.error('❌ Error generating cycle analysis:', error);
      throw error;
    }
  }

  async generateFertilityInsights(fertilityData) {
    try {
      const response = await fetch(`${this.baseURL}/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: this.model,
          prompt: `You are an expert reproductive health AI assistant. Analyze fertility data and provide insights.

Fertility Data: ${JSON.stringify(fertilityData)}

Please provide comprehensive fertility insights with recommendations and tracking suggestions.`,
          stream: false
        })
      });

      if (!response.ok) {
        throw new Error(`Ollama API error: ${response.status}`);
      }

      const data = await response.json();
      return data.response || 'Unable to analyze fertility data at this time.';
    } catch (error) {
      console.error('❌ Error generating fertility insights:', error);
      throw error;
    }
  }

  getModelInfo() {
    return {
      provider: 'Ollama (Local)',
      model: this.model,
      status: 'Local, Free',
      capabilities: ['Health analysis', 'Risk assessment', 'Personalized recommendations', 'Cycle analysis', 'Fertility insights']
    };
  }

  async healthCheck() {
    try {
      // Test if Ollama is running by making a simple request
      const response = await fetch(`${this.baseURL}/tags`);
      if (response.ok) {
        return { 
          configured: true, 
          service: 'Ollama (Local)',
          status: 'healthy',
          model: this.model
        };
      } else {
        return { 
          configured: false, 
          service: 'Ollama (Local)',
          status: 'error',
          error: 'Ollama not running'
        };
      }
    } catch (error) {
      return { 
        configured: false, 
        service: 'Ollama (Local)',
        status: 'error',
        error: error.message
      };
    }
  }

  isConfigured() {
    return true; // Always configured since it's local
  }
}

export default OllamaService;










