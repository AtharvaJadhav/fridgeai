'use client';

import { AnalysisResult } from '@/lib/types';
import IngredientCard from './ingredient-card';

interface ResultsSectionProps {
    result: AnalysisResult;
}

export default function ResultsSection({ result }: ResultsSectionProps) {
    if (!result || !result.ingredients || result.ingredients.length === 0) {
        return null;
    }

    return (
        <div className="max-w-4xl mx-auto">
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
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {result.ingredients.map((ingredient, index) => (
                            <IngredientCard key={index} ingredient={ingredient} />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
