export interface NutritionalInfo {
  servingSize: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface Ingredient {
  name: string;
  estimated_quantity: string;
  confidence: number;
  freshness: 'fresh' | 'ripe' | 'overripe' | 'spoiled';
  estimatedExpiryDays: number;
  category: 'produce' | 'dairy' | 'protein' | 'pantry' | 'condiment';
  nutritionalInfo: NutritionalInfo;
}

export interface AnalysisResult {
  ingredients: Ingredient[];
}

export interface RecipeIngredients {
  available: string[];
  missing: string[];
}

export interface Recipe {
  name: string;
  ingredients: RecipeIngredients;
  instructions: string[];
  prepTime: string;
  cookTime: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  cuisineType: string;
}

export interface RecipeResponse {
  recipes: Recipe[];
}

export interface UploadState {
  isUploading: boolean;
  error: string | null;
  result: AnalysisResult | null;
  uploadedFile: File | null;
}
