# AI Services Configuration & Fallback System

## 🤖 **Seamless AI Service Management**

This project implements a robust AI service management system with **Gemini Pro** as the primary service and **Ollama** as the fallback, ensuring uninterrupted AI functionality even when API limits are reached.

## 🔧 **Service Architecture**

### **Primary Service: Gemini Pro (Google)**
- **Provider**: Google's Gemini Pro API
- **Cost**: Free tier available (with daily limits)
- **Speed**: Fast, cloud-based
- **Quality**: High-quality medical insights
- **Configuration**: Requires `REACT_APP_GEMINI_API_KEY`

### **Fallback Service: Ollama (Local)**
- **Provider**: Local Ollama installation
- **Cost**: Completely free
- **Speed**: Depends on local hardware
- **Quality**: Good quality with local models
- **Configuration**: Requires Ollama running on `localhost:11434`

## 🚀 **Automatic Fallback System**

### **How It Works:**
1. **Primary Attempt**: Always tries Gemini Pro first
2. **Quota Detection**: Automatically detects quota/rate limit errors
3. **Seamless Switch**: Switches to Ollama without user intervention
4. **Session Persistence**: Remembers the switch for the entire session
5. **Error Handling**: Graceful degradation if both services fail

### **Quota Detection Triggers:**
- HTTP 429 (Too Many Requests)
- Error messages containing: "quota", "exceeded", "rate limit", "RESOURCE_EXHAUSTED"
- API key issues or authentication failures

## 📋 **Setup Instructions**

### **1. Gemini Pro Setup (Recommended)**
```bash
# Get your API key from: https://makersuite.google.com/app/apikey
# Add to your .env file:
REACT_APP_GEMINI_API_KEY=your_gemini_api_key_here
```

### **2. Ollama Setup (Fallback)**
```bash
# Install Ollama
curl -fsSL https://ollama.ai/install.sh | sh

# Start Ollama service
ollama serve

# Pull the recommended model
ollama pull llama3.1:8b
```

### **3. Environment Configuration**
```bash
# Copy the example environment file
cp env.example .env

# Edit .env to enable AI features
REACT_APP_ENABLE_AI_INSIGHTS=true
REACT_APP_ENABLE_COMPLEX_MODELS=true
```

## 🔄 **Fallback Behavior**

### **Scenario 1: Gemini Pro Available**
```
User Request → Gemini Pro → Response ✅
```

### **Scenario 2: Gemini Pro Quota Exceeded**
```
User Request → Gemini Pro (quota error) → Ollama → Response ✅
```

### **Scenario 3: Gemini Pro Not Configured**
```
User Request → Ollama → Response ✅
```

### **Scenario 4: Both Services Unavailable**
```
User Request → Error with helpful message ❌
```

## 🎯 **Usage Examples**

### **Basic Usage**
```javascript
import AIServiceManager from './ai/aiServiceManager.js';

const aiService = new AIServiceManager();

// This will automatically use the best available service
const insights = await aiService.generateHealthInsights("Analyze my cycle data");
```

### **Service Status Check**
```javascript
const status = await aiService.healthCheck();
console.log('Active service:', status.activeService);
console.log('Quota exceeded:', status.quotaExceeded);
```

### **Manual Service Reset**
```javascript
// Reset to primary service (useful for testing)
aiService.resetToPrimary();
```

## 🛠 **Development & Testing**

### **Test Fallback System**
1. Start with Gemini Pro configured
2. Make multiple requests to exhaust quota
3. Verify automatic switch to Ollama
4. Check console logs for fallback messages

### **Console Logs**
```
🤖 AI Service Manager initialized
🔧 Primary provider: Gemini Pro (Google)
🔧 Fallback provider: Ollama (Local, Free)
🔧 Active service: GeminiService
🔧 Service configured: true

// When quota exceeded:
🚫 Quota/rate limit exceeded, switching to Ollama fallback for this session
```

## 📊 **Performance Monitoring**

### **Health Check Response**
```javascript
{
  primary: {
    configured: true,
    service: "Gemini Pro",
    status: "healthy"
  },
  fallback: {
    configured: true,
    service: "Ollama",
    status: "healthy"
  },
  activeService: "GeminiService",
  quotaExceeded: false,
  configured: true
}
```

## 🔒 **Security & Privacy**

- **Gemini Pro**: Data sent to Google's servers
- **Ollama**: All processing happens locally
- **Fallback**: Automatically switches to local processing when needed
- **No Data Loss**: Seamless transition preserves user experience

## 🚨 **Troubleshooting**

### **Common Issues:**

1. **"Gemini Pro not configured"**
   - Check if `REACT_APP_GEMINI_API_KEY` is set in `.env`
   - Verify API key is valid

2. **"Ollama not accessible"**
   - Ensure Ollama is running: `ollama serve`
   - Check if model is installed: `ollama list`

3. **"Both services failed"**
   - Check internet connection for Gemini Pro
   - Verify Ollama is running for fallback

### **Debug Commands:**
```bash
# Check Ollama status
curl http://localhost:11434/api/tags

# Test Gemini API key
curl -H "Content-Type: application/json" \
  -d '{"contents":[{"parts":[{"text":"test"}]}]}' \
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=YOUR_API_KEY"
```

## 🎉 **Benefits**

✅ **Zero Downtime**: Always have AI functionality available  
✅ **Cost Effective**: Free tier + local fallback  
✅ **Privacy Options**: Local processing when needed  
✅ **Seamless UX**: Users never see service failures  
✅ **Automatic Management**: No manual intervention required  
✅ **Development Friendly**: Works offline with Ollama  

---

**Ready to use!** The system will automatically handle all fallback scenarios, ensuring your AFAB reproductive health app always has AI capabilities available. 🚀
