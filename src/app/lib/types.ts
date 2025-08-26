export interface Ingredient {
  name: string;
  estimated_quantity: string;
  confidence: number;
}

export interface AnalysisResult {
  ingredients: Ingredient[];
}

export interface UploadState {
  isUploading: boolean;
  error: string | null;
  result: AnalysisResult | null;
}
