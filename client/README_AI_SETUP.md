# 🤖 AI Setup Guide

## Step 1: Get OpenAI API Key

1. **Go to [OpenAI Platform](https://platform.openai.com/)**
2. **Sign up/Login** to your account
3. **Go to API Keys** section
4. **Create New Secret Key**
5. **Copy the API key** (starts with `sk-...`)

## Step 2: Set Up Environment Variables

### Option A: Create .env file (Recommended)
Create a file named `.env` in the `client` folder:

```bash
# OpenAI API Configuration
REACT_APP_OPENAI_API_KEY=sk-your_actual_api_key_here

# Feature Flags
REACT_APP_ENABLE_AI_DASHBOARD=true
REACT_APP_ENABLE_AI_CHATBOT=true
REACT_APP_ENABLE_CLINICAL_RULES=true
REACT_APP_ENABLE_AFAB_FEATURES=true
REACT_APP_ENABLE_AMAB_FEATURES=true
REACT_APP_ENABLE_TRANS_FEATURES=true

# Environment
NODE_ENV=development
```

### Option B: Set in terminal (Temporary)
```bash
export REACT_APP_OPENAI_API_KEY=sk-your_actual_api_key_here
```

## Step 3: Verify Setup

1. **Restart your React app** after adding the API key
2. **Check browser console** for any API errors
3. **Test AI Health Score** component

## ⚠️ Important Notes

- **Never commit your API key** to git
- **Keep your API key private** and secure
- **Monitor API usage** to avoid unexpected charges
- **The .env file should be in .gitignore**

## 🔧 Troubleshooting

### API Key Not Working?
- Check if the key starts with `sk-`
- Verify the key is active in OpenAI dashboard
- Ensure you have credits in your OpenAI account
- Check browser console for error messages

### Environment Variables Not Loading?
- Restart your React development server
- Ensure the .env file is in the `client` folder
- Variable names must start with `REACT_APP_`

## 💰 OpenAI Pricing

- **GPT-4**: ~$0.03 per 1K tokens (input) + ~$0.06 per 1K tokens (output)
- **Typical health analysis**: 500-1000 tokens per request
- **Estimated cost**: $0.01-$0.05 per health analysis

## 🚀 Next Steps

Once API key is working:
1. ✅ **LLM Setup** (This step)
2. 🔄 **Smart Dashboard** (AI Health Score, Insights)
3. 🔄 **AFAB Features** (Cycle tracking, fertility)
4. 🔄 **AMAB Features** (Prostate health, fertility)
5. 🔄 **AI Chatbot** (Interactive health guidance)

---

**Need help?** Check the browser console for error messages or OpenAI API response errors.
