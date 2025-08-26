'use client';

import { useState } from 'react';
import Header from './components/header';
import UploadSection from './components/upload-section';
import ResultsSection from './components/results-section';
import EmptyState from './components/empty-state';
import { UploadState, AnalysisResult, Recipe } from './lib/types';
import RecipeCard from './components/recipe-card';

export default function Home() {
  const [uploadState, setUploadState] = useState<UploadState>({
    isUploading: false,
    error: null,
    result: null,
    uploadedFile: null,
  });
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [isLoadingRecipes, setIsLoadingRecipes] = useState(false);
  const [recipeError, setRecipeError] = useState<string | null>(null);

  const handleUpload = async (file: File) => {
    setUploadState({
      isUploading: true,
      error: null,
      result: null,
      uploadedFile: file,
    });

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/analyze-image', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        if (errorData.type === 'no_food_detected') {
          throw new Error('no_food_detected');
        }
        throw new Error('Failed to analyze image');
      }

      const result: AnalysisResult = await response.json();

      setUploadState({
        isUploading: false,
        error: null,
        result,
        uploadedFile: file,
      });
    } catch (error) {
      let errorMessage = 'An unexpected error occurred. Please try again.';

      if (error instanceof Error) {
        // Handle specific error types
        if (error.message === 'no_food_detected') {
          errorMessage = 'No food items detected in the image. Please try again with a clearer photo of your refrigerator contents.';
        } else if (error.message.includes('Failed to fetch')) {
          errorMessage = 'Network error. Please check your connection and try again.';
        } else if (error.message.includes('Failed to analyze image')) {
          errorMessage = 'Image analysis failed. Please try with a different image.';
        } else {
          errorMessage = error.message;
        }
      }

      setUploadState({
        isUploading: false,
        error: errorMessage,
        result: null,
        uploadedFile: null,
      });
    }
  };

  const handleBack = () => {
    setUploadState({
      isUploading: false,
      error: null,
      result: null,
      uploadedFile: null,
    });
    setRecipes([]);
    setRecipeError(null);
  };

  const handleGetRecipes = async () => {
    if (!uploadState.result?.ingredients) return;

    setIsLoadingRecipes(true);
    setRecipeError(null);

    try {
      const response = await fetch('/api/get-recipes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ingredients: uploadState.result.ingredients
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get recipes');
      }

      const data = await response.json();
      setRecipes(data.recipes);
    } catch (error) {
      setRecipeError(error instanceof Error ? error.message : 'Failed to get recipes');
    } finally {
      setIsLoadingRecipes(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {!uploadState.result && (
            <UploadSection onUpload={handleUpload} uploadState={uploadState} />
          )}

          {uploadState.result && uploadState.uploadedFile && (
            <>
              <ResultsSection
                result={uploadState.result}
                uploadedFile={uploadState.uploadedFile}
                onBack={handleBack}
              />

              {/* Recipe Test Button */}
              <div className="max-w-6xl mx-auto">
                <div className="bg-gradient-to-r from-emerald-50 to-blue-50 rounded-xl shadow-sm border border-emerald-200 p-6">
                  <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center">
                    <span className="mr-2">🍳</span>
                    Recipe Recommendations
                  </h3>
                  <button
                    onClick={handleGetRecipes}
                    disabled={isLoadingRecipes}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-colors"
                  >
                    {isLoadingRecipes ? 'Generating Recipes...' : 'Get Recipe Suggestions'}
                  </button>

                  {recipeError && (
                    <div className="mt-4 p-4 bg-rose-50 border border-rose-200 rounded-lg">
                      <p className="text-sm text-rose-800">{recipeError}</p>
                    </div>
                  )}

                  {recipes.length > 0 && (
                    <div className="mt-6 space-y-4">
                      <h4 className="text-lg font-semibold text-slate-900 flex items-center">
                        <span className="mr-2">✨</span>
                        Suggested Recipes ({recipes.length})
                      </h4>
                      {recipes.map((recipe, index) => (
                        <RecipeCard key={index} recipe={recipe} />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          {!uploadState.isUploading && !uploadState.result && !uploadState.error && (
            <EmptyState />
          )}
        </div>
      </main>
    </div>
  );
}
