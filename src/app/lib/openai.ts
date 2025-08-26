import OpenAI from 'openai';

interface ImageAnalysisResult {
  ingredients: Array<{
    name: string;
    quantity: string;
    expiry: string;
  }>;
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function analyzeImage(imageBase64: string): Promise<ImageAnalysisResult> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4-vision-preview",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Analyze this image of a refrigerator and identify all the food items. For each item, provide: 1) The name of the food item, 2) The approximate quantity, 3) The expiry date if visible. Return the response as a JSON array of objects with 'name', 'quantity', and 'expiry' fields."
            },
            {
              type: "image_url",
              image_url: {
                url: `data:image/jpeg;base64,${imageBase64}`
              }
            }
          ]
        }
      ],
      max_tokens: 1000
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No response from OpenAI');
    }

    // Try to parse JSON from the response
    try {
      return JSON.parse(content);
    } catch {
      // If parsing fails, return a structured response
      return {
        ingredients: [
          { name: 'Unknown item', quantity: 'Unknown', expiry: 'Unknown' }
        ]
      };
    }
  } catch (error) {
    console.error('OpenAI API error:', error);
    throw error;
  }
}
