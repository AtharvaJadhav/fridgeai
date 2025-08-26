'use client';

import { AnalysisResult } from '@/lib/types';
import IngredientCard from './ingredient-card';
import { ArrowLeft } from 'lucide-react';

interface ResultsSectionProps {
    result: AnalysisResult;
    uploadedFile: File;
    onBack: () => void;
}

export default function ResultsSection({ result, uploadedFile, onBack }: ResultsSectionProps) {
    if (!result || !result.ingredients || result.ingredients.length === 0) {
        return null;
    }

    const imageUrl = URL.createObjectURL(uploadedFile);

    return (
        <div className="max-w-6xl mx-auto">
            {/* Back Button */}
            <div className="mb-6">
                <button
                    onClick={onBack}
                    className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Upload
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Image Section */}
                <div className="bg-white rounded-lg shadow-sm border p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">
                        Your Fridge Photo
                    </h3>
                    <div className="relative">
                        <img
                            src={imageUrl}
                            alt="Uploaded fridge photo"
                            className="w-full h-auto rounded-lg"
                        />
                    </div>
                </div>

                {/* Results Section */}
                <div className="bg-white rounded-lg shadow-sm border">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <h2 className="text-lg font-medium text-gray-900">
                            Detected Ingredients ({result.ingredients.length})
                        </h2>
                        <p className="text-sm text-gray-500 mt-1">
                            Here are the food items found in your refrigerator
                        </p>
                    </div>

                    <div className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {result.ingredients.map((ingredient, index) => (
                                <IngredientCard key={index} ingredient={ingredient} />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
