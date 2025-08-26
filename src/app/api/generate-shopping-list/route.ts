import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { Ingredient } from '../../lib/types';

interface ShoppingSuggestion {
  item: string;
  category: string;
  reason: string;
}

interface ShoppingListResponse {
  suggestions: ShoppingSuggestion[];
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { ingredients } = body;

    if (!ingredients || !Array.isArray(ingredients) || ingredients.length === 0) {
      return NextResponse.json(
        { error: 'Ingredients array is required and must not be empty' },
        { status: 400 }
      );
    }

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

    // Create ingredient list string
    const ingredientList = ingredients.map(ing => `${ing.name} (${ing.category})`).join(', ');

    // Call OpenAI to generate shopping suggestions
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "user",
          content: `Based on these detected fridge items: [${ingredientList}], suggest 8-12 complementary grocery items that would enable making complete meals. Consider common recipes and missing staples. Group by category (produce, dairy, meat, pantry). Exclude items already detected.

IMPORTANT: You must respond with ONLY a JSON object. Do not include any other text.

Format the response exactly as:
{
  "suggestions": [
    {
      "item": "Onions",
      "category": "produce",
      "reason": "Essential base for most savory dishes"
    },
    {
      "item": "Milk",
      "category": "dairy",
      "reason": "Basic cooking and drinking staple"
    }
  ]
}

Focus on practical items that would enable complete meal preparation with the detected ingredients.`
        }
      ],
      max_tokens: 1000,
      temperature: 0.3
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No response from OpenAI');
    }

    // Parse the JSON response
    let parsedResponse: ShoppingListResponse;
    try {
      // Extract JSON from the response (in case there's additional text)
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsedResponse = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in response');
      }
    } catch (error) {
      console.error('Failed to parse OpenAI response:', content);
      throw new Error('Invalid response format from OpenAI');
    }

    // Validate the response structure
    if (!parsedResponse.suggestions || !Array.isArray(parsedResponse.suggestions)) {
      throw new Error('Invalid response structure from OpenAI');
    }

    // Validate each suggestion
    const validatedSuggestions = parsedResponse.suggestions.map((suggestion: any, index: number) => {
      if (!suggestion.item || typeof suggestion.item !== 'string') {
        throw new Error(`Invalid item name at index ${index}`);
      }
      if (!suggestion.category || typeof suggestion.category !== 'string') {
        throw new Error(`Invalid category at index ${index}`);
      }
      if (!suggestion.reason || typeof suggestion.reason !== 'string') {
        throw new Error(`Invalid reason at index ${index}`);
      }

      return {
        item: suggestion.item,
        category: suggestion.category,
        reason: suggestion.reason
      };
    });

    return NextResponse.json({ 
      suggestions: validatedSuggestions 
    });

  } catch (error) {
    console.error('Error generating shopping list:', error);
    
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
    
    // Handle other errors
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
      { error: 'Failed to generate shopping list. Please try again or contact support if the problem persists.' },
      { status: 500 }
    );
  }
}
