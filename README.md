# FridgeAI

**Smart refrigerator inventory management powered by AI**

[Live Demo](https://fridgeai.onrender.com/)

## Features

- **AI Ingredient Detection**: Upload a fridge photo to automatically identify food items
- **Nutritional Analysis**: Get detailed nutrition info, freshness status, and expiry dates
- **Recipe Recommendations**: AI-generated recipes based on your available ingredients
- **Shopping List Generator**: Smart suggestions for complementary grocery items
- **Modern UI**: Clean, responsive interface with interactive elements

## Tech Stack

- Next.js 15, React 19, TypeScript
- Tailwind CSS 4
- OpenAI GPT-4o Vision API
- Deployed on Render

## Quick Start

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

## Environment Variables

Create a `.env.local` file with your OpenAI API key:

```bash
OPENAI_API_KEY=your_openai_api_key_here
```

## How It Works

1. Upload a photo of your refrigerator contents
2. AI analyzes the image and identifies food items
3. Get detailed insights about freshness, nutrition, and expiry
4. Generate personalized recipe suggestions
5. Create smart shopping lists for complementary items

