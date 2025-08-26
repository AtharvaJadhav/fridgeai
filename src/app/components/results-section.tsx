'use client';

import { useState } from 'react';
import { AnalysisResult } from '../lib/types';
import IngredientCard from './ingredient-card';
import { ArrowLeft, ShoppingCart } from 'lucide-react';
import ShoppingListModal from './shopping-list-modal';

interface ResultsSectionProps {
    result: AnalysisResult;
    uploadedFile: File;
    onBack: () => void;
}

interface ShoppingSuggestion {
    item: string;
    category: string;
    reason: string;
}

export default function ResultsSection({ result, uploadedFile, onBack }: ResultsSectionProps) {
    const [isShoppingListOpen, setIsShoppingListOpen] = useState(false);
    const [shoppingSuggestions, setShoppingSuggestions] = useState<ShoppingSuggestion[]>([]);
    const [isLoadingShoppingList, setIsLoadingShoppingList] = useState(false);

    if (!result || !result.ingredients || result.ingredients.length === 0) {
        return null;
    }

    const imageUrl = URL.createObjectURL(uploadedFile);

    const handleGenerateShoppingList = async () => {
        setIsLoadingShoppingList(true);
        setIsShoppingListOpen(true);

        try {
            const response = await fetch('/api/generate-shopping-list', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ingredients: result.ingredients
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to generate shopping list');
            }

            const data = await response.json();
            setShoppingSuggestions(data.suggestions);
        } catch (error) {
            console.error('Error generating shopping list:', error);
            alert('Failed to generate shopping list. Please try again.');
        } finally {
            setIsLoadingShoppingList(false);
        }
    };

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
                        {/* eslint-disable-next-line @next/next/no-img-element */}
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

                        {/* Shopping List Button */}
                        <div className="mt-6 pt-6 border-t border-gray-200">
                            <button
                                onClick={handleGenerateShoppingList}
                                className="w-full inline-flex items-center justify-center px-4 py-3 border border-transparent text-sm font-medium rounded-md text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-colors"
                            >
                                <ShoppingCart className="h-4 w-4 mr-2" />
                                Generate Shopping List
                            </button>
                            <p className="text-xs text-gray-500 mt-2 text-center">
                                Get AI-powered suggestions for complementary grocery items
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Shopping List Modal */}
            <ShoppingListModal
                isOpen={isShoppingListOpen}
                onClose={() => setIsShoppingListOpen(false)}
                suggestions={shoppingSuggestions}
                isLoading={isLoadingShoppingList}
            />
        </div>
    );
}
