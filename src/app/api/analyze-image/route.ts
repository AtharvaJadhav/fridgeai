import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

interface RawIngredient {
  name?: string;
  estimated_quantity?: string;
  confidence?: number;
}

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
    if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'your_actual_openai_key_here') {
      return NextResponse.json(
        { error: 'OpenAI API key not configured. Please add your API key to .env.local' },
        { status: 500 }
      );
    }

    // Call OpenAI Vision API
    const response = await openai.chat.completions.create({
      model: "gpt-4-vision-preview",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `Analyze this image of food items. For each food item you detect, provide:
1. The name of the food item
2. An estimated quantity (e.g., '2 apples', '1 liter of milk')  
3. Your confidence level in the detection (0-1)

Format the response as a JSON object with an 'ingredients' array. Each ingredient should have 'name', 'estimated_quantity', and 'confidence' fields.

Important: If you detect multiple varieties of the same item (like different colored bell peppers), list each as a separate ingredient.

Example response format:
{
  "ingredients": [
    {
      "name": "Red Bell Pepper",
      "estimated_quantity": "2 pieces",
      "confidence": 0.95
    },
    {
      "name": "Milk",
      "estimated_quantity": "1 liter",
      "confidence": 0.88
    }
  ]
}`
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
      max_tokens: 1000,
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
        throw new Error('No JSON found in response');
      }
    } catch (parseError) {
      console.error('Failed to parse OpenAI response:', content);
      throw new Error('Invalid response format from OpenAI');
    }

    // Validate the response structure
    if (!parsedResponse.ingredients || !Array.isArray(parsedResponse.ingredients)) {
      throw new Error('Invalid response structure from OpenAI');
    }

    // Validate each ingredient
    const validatedIngredients = parsedResponse.ingredients.map((ingredient: RawIngredient, index: number) => {
      if (!ingredient.name || typeof ingredient.name !== 'string') {
        throw new Error(`Invalid ingredient name at index ${index}`);
      }
      if (!ingredient.estimated_quantity || typeof ingredient.estimated_quantity !== 'string') {
        throw new Error(`Invalid estimated quantity at index ${index}`);
      }
      if (typeof ingredient.confidence !== 'number' || ingredient.confidence < 0 || ingredient.confidence > 1) {
        throw new Error(`Invalid confidence value at index ${index}`);
      }
      
      return {
        name: ingredient.name,
        estimated_quantity: ingredient.estimated_quantity,
        confidence: ingredient.confidence
      };
    });

    // Filter out low confidence detections (below 0.3)
    const filteredIngredients = validatedIngredients.filter((ingredient) => ingredient.confidence >= 0.3);

    if (filteredIngredients.length === 0) {
      return NextResponse.json(
        { error: 'No food items detected with sufficient confidence. Please try with a clearer image.' },
        { status: 400 }
      );
    }

    return NextResponse.json({ 
      ingredients: filteredIngredients 
    });

  } catch (error) {
    console.error('Error processing image:', error);
    
    // Handle specific OpenAI errors
    if (error instanceof Error) {
      if (error.message.includes('rate_limit')) {
        return NextResponse.json(
          { error: 'Rate limit exceeded. Please try again later.' },
          { status: 429 }
        );
      }
      if (error.message.includes('quota')) {
        return NextResponse.json(
          { error: 'OpenAI quota exceeded. Please check your account.' },
          { status: 429 }
        );
      }
      if (error.message.includes('timeout')) {
        return NextResponse.json(
          { error: 'Request timeout. Please try again.' },
          { status: 408 }
        );
      }
    }

    return NextResponse.json(
      { error: 'Failed to process image. Please try again.' },
      { status: 500 }
    );
  }
}
