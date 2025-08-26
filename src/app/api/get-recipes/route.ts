import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

interface RecipeIngredients {
  available: string[];
  missing: string[];
}

interface Recipe {
  name: string;
  ingredients: RecipeIngredients;
  instructions: string[];
  prepTime: string;
  cookTime: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  cuisineType: string;
}

interface RecipeResponse {
  recipes: Recipe[];
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
    const ingredientList = ingredients.map(ing => ing.name).join(', ');

    // Call OpenAI to generate recipes
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "user",
          content: `Based on these available ingredients: [${ingredientList}], suggest 3-5 recipes that can be made primarily with these items. For each recipe provide:
- Recipe name
- All ingredients needed (mark which ones are missing from the available list)
- Step-by-step instructions (5-8 steps max)
- Prep time and cook time
- Difficulty level (Easy/Medium/Hard)
- Cuisine type

Format as JSON with this structure:
{
  "recipes": [
    {
      "name": "Recipe Name",
      "ingredients": {
        "available": ["ingredient1", "ingredient2"],
        "missing": ["ingredient3", "ingredient4"]
      },
      "instructions": ["step1", "step2", ...],
      "prepTime": "15 minutes",
      "cookTime": "30 minutes", 
      "difficulty": "Easy",
      "cuisineType": "Italian"
    }
  ]
}

IMPORTANT: You must respond with ONLY a JSON object. Do not include any other text or explanations.`
        }
      ],
      max_tokens: 2000,
      temperature: 0.3
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No response from OpenAI');
    }

    // Parse the JSON response
    let parsedResponse: RecipeResponse;
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
    if (!parsedResponse.recipes || !Array.isArray(parsedResponse.recipes)) {
      throw new Error('Invalid response structure from OpenAI');
    }

    // Validate each recipe
    const validatedRecipes = parsedResponse.recipes.map((recipe: Recipe, index: number) => {
      if (!recipe.name || typeof recipe.name !== 'string') {
        throw new Error(`Invalid recipe name at index ${index}`);
      }
      if (!recipe.ingredients || !recipe.ingredients.available || !recipe.ingredients.missing) {
        throw new Error(`Invalid ingredients structure at index ${index}`);
      }
      if (!Array.isArray(recipe.ingredients.available) || !Array.isArray(recipe.ingredients.missing)) {
        throw new Error(`Invalid ingredients arrays at index ${index}`);
      }
      if (!recipe.instructions || !Array.isArray(recipe.instructions)) {
        throw new Error(`Invalid instructions at index ${index}`);
      }
      if (!recipe.prepTime || typeof recipe.prepTime !== 'string') {
        throw new Error(`Invalid prep time at index ${index}`);
      }
      if (!recipe.cookTime || typeof recipe.cookTime !== 'string') {
        throw new Error(`Invalid cook time at index ${index}`);
      }
      if (!recipe.difficulty || !['Easy', 'Medium', 'Hard'].includes(recipe.difficulty)) {
        throw new Error(`Invalid difficulty at index ${index}`);
      }
      if (!recipe.cuisineType || typeof recipe.cuisineType !== 'string') {
        throw new Error(`Invalid cuisine type at index ${index}`);
      }

      return {
        name: recipe.name,
        ingredients: {
          available: recipe.ingredients.available,
          missing: recipe.ingredients.missing
        },
        instructions: recipe.instructions,
        prepTime: recipe.prepTime,
        cookTime: recipe.cookTime,
        difficulty: recipe.difficulty,
        cuisineType: recipe.cuisineType
      };
    });

    return NextResponse.json({ 
      recipes: validatedRecipes 
    });

  } catch (error) {
    console.error('Error generating recipes:', error);
    
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
      { error: 'Failed to generate recipes. Please try again or contact support if the problem persists.' },
      { status: 500 }
    );
  }
}
