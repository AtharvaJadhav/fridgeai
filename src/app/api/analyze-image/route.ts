import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { Ingredient } from '../../lib/types';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { error: 'Invalid file type. Please upload an image.' },
        { status: 400 }
      );
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File too large. Please upload an image smaller than 10MB.' },
        { status: 400 }
      );
    }

    // Convert image to base64
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64Image = buffer.toString('base64');

    // Check if OpenAI API key is configured
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'OpenAI API key not configured. Please add your API key to .env.local' },
        { status: 500 }
      );
    }
    
    if (process.env.OPENAI_API_KEY === 'your_actual_openai_key_here') {
      return NextResponse.json(
        { error: 'Please replace the placeholder API key with your actual OpenAI API key in .env.local' },
        { status: 500 }
      );
    }

    // Call OpenAI Vision API
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `Analyze this image of food items in a refrigerator. For each food item you detect, provide comprehensive information:

1. **Name**: The specific name of the food item
2. **Estimated Quantity**: Approximate amount (e.g., '2 apples', '1 liter of milk', '3 slices')
3. **Confidence Level**: Your confidence in the detection (0-1 scale)
4. **Freshness Assessment**: Visual assessment of freshness (fresh/ripe/overripe/spoiled)
5. **Estimated Days Until Expiration**: Based on visual appearance and typical shelf life
6. **Food Category**: Classify as produce/dairy/protein/pantry/condiment
7. **Nutritional Information**: Per typical serving size including:
   - Serving size description
   - Calories
   - Protein (grams)
   - Carbohydrates (grams)
   - Fat (grams)

IMPORTANT: You must respond with ONLY a JSON object. Do not include any other text.

Format the response exactly as:
{
  "ingredients": [
    {
      "name": "Red Bell Pepper",
      "estimated_quantity": "2 pieces",
      "confidence": 0.95,
      "freshness": "fresh",
      "estimatedExpiryDays": 7,
      "category": "produce",
      "nutritionalInfo": {
        "servingSize": "1 medium pepper",
        "calories": 30,
        "protein": 1,
        "carbs": 7,
        "fat": 0.2
      }
    }
  ]
}

If you detect NO food items in the image, respond with:
{
  "ingredients": []
}

Do not include any explanatory text - only the JSON response.`
            },
            {
              type: "image_url",
              image_url: {
                url: `data:${file.type};base64,${base64Image}`
              }
            }
          ]
        }
      ],
      max_tokens: 1500,
      temperature: 0.1
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No response from OpenAI');
    }

    // Parse the JSON response
    let parsedResponse;
    try {
      // Extract JSON from the response (in case there's additional text)
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsedResponse = JSON.parse(jsonMatch[0]);
      } else {
        // Check if the AI detected no food items
        if (content.toLowerCase().includes('no food') || 
            content.toLowerCase().includes('unable to detect') ||
            content.toLowerCase().includes('no food items') ||
            content.toLowerCase().includes('empty') ||
            content.toLowerCase().includes('nothing') ||
            content.toLowerCase().includes('no ingredients')) {
          return NextResponse.json(
            { 
              error: 'No food items detected in the image. Please try again with a clearer photo of your refrigerator contents.',
              type: 'no_food_detected'
            },
            { status: 400 }
          );
        }
        throw new Error('No JSON found in response');
      }
    } catch (parseError) {
      console.error('Failed to parse OpenAI response:', content);
      
      // Check if the AI detected no food items in the error response
      if (content.toLowerCase().includes('no food') || 
          content.toLowerCase().includes('unable to detect') ||
          content.toLowerCase().includes('no food items') ||
          content.toLowerCase().includes('empty') ||
          content.toLowerCase().includes('nothing') ||
          content.toLowerCase().includes('no ingredients')) {
        return NextResponse.json(
          { 
            error: 'No food items detected in the image. Please try again with a clearer photo of your refrigerator contents.',
            type: 'no_food_detected'
          },
          { status: 400 }
        );
      }
      
      throw new Error('Invalid response format from OpenAI');
    }

    // Validate the response structure
    if (!parsedResponse.ingredients || !Array.isArray(parsedResponse.ingredients)) {
      throw new Error('Invalid response structure from OpenAI');
    }

    // Check if no ingredients were detected
    if (parsedResponse.ingredients.length === 0) {
      return NextResponse.json(
        { 
          error: 'No food items were detected in the image. Please try again with a clearer photo showing your refrigerator contents.',
          type: 'no_food_detected'
        },
        { status: 400 }
      );
    }

    // Validate each ingredient
    const validatedIngredients = parsedResponse.ingredients.map((ingredient: Ingredient, index: number) => {
      if (!ingredient.name || typeof ingredient.name !== 'string') {
        throw new Error(`Invalid ingredient name at index ${index}`);
      }
      if (!ingredient.estimated_quantity || typeof ingredient.estimated_quantity !== 'string') {
        throw new Error(`Invalid estimated quantity at index ${index}`);
      }
      if (typeof ingredient.confidence !== 'number' || ingredient.confidence < 0 || ingredient.confidence > 1) {
        throw new Error(`Invalid confidence value at index ${index}`);
      }
      if (!ingredient.freshness || !['fresh', 'ripe', 'overripe', 'spoiled'].includes(ingredient.freshness)) {
        throw new Error(`Invalid freshness value at index ${index}`);
      }
      if (typeof ingredient.estimatedExpiryDays !== 'number' || ingredient.estimatedExpiryDays < 0) {
        throw new Error(`Invalid estimated expiry days at index ${index}`);
      }
      if (!ingredient.category || !['produce', 'dairy', 'protein', 'pantry', 'condiment'].includes(ingredient.category)) {
        throw new Error(`Invalid category at index ${index}`);
      }
      if (!ingredient.nutritionalInfo) {
        throw new Error(`Missing nutritional info at index ${index}`);
      }
      if (!ingredient.nutritionalInfo.servingSize || typeof ingredient.nutritionalInfo.servingSize !== 'string') {
        throw new Error(`Invalid serving size at index ${index}`);
      }
      if (typeof ingredient.nutritionalInfo.calories !== 'number' || ingredient.nutritionalInfo.calories < 0) {
        throw new Error(`Invalid calories at index ${index}`);
      }
      if (typeof ingredient.nutritionalInfo.protein !== 'number' || ingredient.nutritionalInfo.protein < 0) {
        throw new Error(`Invalid protein at index ${index}`);
      }
      if (typeof ingredient.nutritionalInfo.carbs !== 'number' || ingredient.nutritionalInfo.carbs < 0) {
        throw new Error(`Invalid carbs at index ${index}`);
      }
      if (typeof ingredient.nutritionalInfo.fat !== 'number' || ingredient.nutritionalInfo.fat < 0) {
        throw new Error(`Invalid fat at index ${index}`);
      }
      
      return {
        name: ingredient.name,
        estimated_quantity: ingredient.estimated_quantity,
        confidence: ingredient.confidence,
        freshness: ingredient.freshness,
        estimatedExpiryDays: ingredient.estimatedExpiryDays,
        category: ingredient.category,
        nutritionalInfo: {
          servingSize: ingredient.nutritionalInfo.servingSize,
          calories: ingredient.nutritionalInfo.calories,
          protein: ingredient.nutritionalInfo.protein,
          carbs: ingredient.nutritionalInfo.carbs,
          fat: ingredient.nutritionalInfo.fat
        }
      };
    });

    // Filter out low confidence detections (below 0.3)
    const filteredIngredients = validatedIngredients.filter((ingredient: Ingredient) => ingredient.confidence >= 0.3);

    if (filteredIngredients.length === 0) {
      return NextResponse.json(
        { error: 'No food items detected in the image. Please upload a photo of your refrigerator contents.' },
        { status: 400 }
      );
    }

    return NextResponse.json({ 
      ingredients: filteredIngredients 
    });

  } catch (error) {
    console.error('Error processing image:', error);
    
    // Handle specific OpenAI errors
    if (error && typeof error === 'object' && 'code' in error) {
      interface OpenAIError {
        code: string;
        message?: string;
      }
      const openaiError = error as OpenAIError;
      
      switch (openaiError.code) {
        case 'rate_limit_exceeded':
          return NextResponse.json(
            { error: 'Rate limit exceeded. Please try again in a few minutes.' },
            { status: 429 }
          );
        case 'quota_exceeded':
          return NextResponse.json(
            { error: 'OpenAI quota exceeded. Please check your account billing.' },
            { status: 429 }
          );
        case 'model_not_found':
          return NextResponse.json(
            { error: 'AI model temporarily unavailable. Please try again later.' },
            { status: 503 }
          );
        case 'invalid_api_key':
          return NextResponse.json(
            { error: 'Invalid OpenAI API key. Please check your configuration.' },
            { status: 401 }
          );
        case 'insufficient_quota':
          return NextResponse.json(
            { error: 'Insufficient OpenAI credits. Please add funds to your account.' },
            { status: 402 }
          );
        default:
          return NextResponse.json(
            { error: `OpenAI API error: ${openaiError.message || 'Unknown error'}` },
            { status: 500 }
          );
      }
    }
    
    // Handle network and other errors
    if (error instanceof Error) {
      if (error.message.includes('timeout')) {
        return NextResponse.json(
          { error: 'Request timeout. Please try again.' },
          { status: 408 }
        );
      }
      if (error.message.includes('network')) {
        return NextResponse.json(
          { error: 'Network error. Please check your connection and try again.' },
          { status: 503 }
        );
      }
    }

    return NextResponse.json(
      { error: 'Failed to process image. Please try again or contact support if the problem persists.' },
      { status: 500 }
    );
  }
}
