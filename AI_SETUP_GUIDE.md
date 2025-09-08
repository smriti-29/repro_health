# 🤖 AI Setup Guide - Free AI APIs for Health Insights

## 🆓 **Recommended: Groq API (Free & Fast)**

### **Step 1: Get Groq API Key**
1. Go to [https://console.groq.com/](https://console.groq.com/)
2. Create a free account if you don't have one
3. Go to "API Keys" section
4. Click "Create API Key"
5. Give it a name like "Health App"
6. Copy the token

### **Step 2: Add to Environment**
Add this line to your `client/.env` file:
```
REACT_APP_GROQ_API_KEY=your_token_here
```

### **Step 3: Restart Your App**
```bash
npm start
```

## 🔄 **Fallback Options**

### **Option 1: Ollama (Local, Completely Free)**
- Already configured in your project
- No API key needed
- Runs locally on your computer
- Install: `ollama run llama2`

### **Option 2: Hugging Face (Free Tier)**
- 1,000 requests/month free
- Good for development
- Get API key: [https://huggingface.co/settings/tokens](https://huggingface.co/settings/tokens)

### **Option 3: Together AI**
- $5 free credit monthly
- Good for development
- Get API key: [https://api.together.xyz/](https://api.together.xyz/)

## 🚀 **How It Works**

1. **Primary**: Groq API (free, 14,400 requests/day!)
2. **Fallback**: Ollama (local, unlimited)
3. **Automatic switching** if API limits are reached

## 📊 **AI Features Available**

- ✅ **Health Insights** for all 8 AMAB modules
- ✅ **Personalized Recommendations** based on your data
- ✅ **Smart Analysis** of your health trends
- ✅ **Medical Education** content generation
- ✅ **Risk Assessment** and alerts

## 🔧 **Testing Your Setup**

1. Go to any health module
2. Fill out the form
3. Submit your data
4. You should see AI insights appear automatically

## 🆘 **Troubleshooting**

### **If AI insights don't appear:**
1. Check browser console for errors
2. Verify API key is correct
3. Make sure `.env` file is in `client/` folder
4. Restart the development server

### **If you get rate limit errors:**
- The system will automatically switch to Ollama
- Or you can get a Hugging Face Pro account for more requests

## 💡 **Pro Tips**

1. **Groq** is perfect for production - 14,400 requests/day is more than enough!
2. **Ollama** is great for unlimited local testing
3. **Hugging Face** is good for development but limited requests
4. You can switch between providers anytime

## 🎯 **Next Steps**

1. Get your Groq API key
2. Add it to your `.env` file
3. Test the AI insights in your modules
4. Enjoy personalized health recommendations!

---

**Need help?** The AI system will work even without any API keys (using fallback insights), but you'll get much better results with a real AI service.
