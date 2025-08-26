# FridgeAI Setup Guide

## Quick Setup

### 1. Get Your OpenAI API Key

1. Go to [OpenAI Platform](https://platform.openai.com/api-keys)
2. Sign in or create an account
3. Click "Create new secret key"
4. Copy the API key (starts with `sk-`)

### 2. Configure Environment Variables

**Option A: Edit .env.local directly**
```bash
# Open .env.local in your editor
nano .env.local

# Replace this line:
OPENAI_API_KEY=your_actual_openai_key_here

# With your actual key:
OPENAI_API_KEY=sk-your-actual-key-here
```

**Option B: Use command line**
```bash
# Replace the placeholder with your actual key
sed -i '' 's/your_actual_openai_key_here/sk-your-actual-key-here/g' .env.local
```

### 3. Restart the Development Server

```bash
# Stop the current server (Ctrl+C)
# Then restart it:
npm run dev
```

### 4. Test the Application

1. Open http://localhost:3000
2. Upload a photo of your refrigerator
3. The AI should now analyze the image successfully

## Troubleshooting

### "Please replace the placeholder API key" Error
- You need to add your real OpenAI API key to `.env.local`
- The current key is just a placeholder

### "Invalid API key" Error
- Make sure your API key starts with `sk-`
- Check that you have credits in your OpenAI account
- Verify the key is copied correctly (no extra spaces)

### "Rate limit exceeded" Error
- Wait a few minutes and try again
- Consider upgrading your OpenAI plan

### "Quota exceeded" Error
- Add credits to your OpenAI account
- Check your usage at https://platform.openai.com/usage

## API Key Security

- Never commit your API key to version control
- `.env.local` is already in `.gitignore`
- Keep your API key secure and don't share it publicly

## Need Help?

If you're still having issues:
1. Check the browser console for errors
2. Check the terminal for server errors
3. Verify your OpenAI account has credits
4. Try with a different image
