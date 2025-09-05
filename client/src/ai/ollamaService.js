// OLLAMA SERVICE
// Local, free LLM service using Ollama

class OllamaService {
  constructor() {
    this.baseURL = 'http://localhost:11434/api';
    this.model = 'llama3.1:8b'; // Free, local model
    
    console.log('🤖 OllamaService initialized');
    console.log('🔧 Using model:', this.model);
    console.log('🔧 Local endpoint:', this.baseURL);
    
    // Check if Ollama is running
    this.checkOllamaStatus();
  }

  async checkOllamaStatus() {
    try {
      const response = await fetch(`${this.baseURL}/tags`);
      if (response.ok) {
        console.log('✅ Ollama is running locally');
      } else {
        console.warn('⚠️ Ollama might not be running');
      }
    } catch (error) {
      console.warn('⚠️ Ollama not accessible - make sure it\'s running');
    }
  }

  async generateHealthInsights(prompt) {
    try {
      console.log('🤖 Using Ollama for health insights...');

      const response = await fetch(`${this.baseURL}/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: this.model,
          prompt: `You are an expert reproductive health AI assistant. Generate personalized health insights based on user data. Be medically accurate, inclusive, and actionable.

User request: ${prompt}

Please provide 3-5 actionable health insights in a clear, numbered format.`,
          stream: false
        })
      });

      if (!response.ok) {
        throw new Error(`Ollama API error: ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ Ollama response:', data);

      const content = data.response || '';
      console.log('Ollama content:', content);

      // Parse the response into individual insights
      const insights = content.split('\n').filter(line => line.trim().length > 0);
      console.log('Parsed insights:', insights);

      return insights;
    } catch (error) {
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

  isConfigured() {
    return true; // Always configured since it's local
  }
}

export default OllamaService;





