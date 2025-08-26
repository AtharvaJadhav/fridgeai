'use client';

import { useState } from 'react';
import { Recipe } from '@/lib/types';
import { Clock, ChefHat, Globe, CheckCircle, XCircle, ChevronDown, ChevronUp, Utensils } from 'lucide-react';

interface RecipeCardProps {
    recipe: Recipe;
}

export default function RecipeCard({ recipe }: RecipeCardProps) {
    const [isExpanded, setIsExpanded] = useState(false);

    const getDifficultyColor = (difficulty: string) => {
        switch (difficulty) {
            case 'Easy': return 'bg-emerald-100 text-emerald-800';
            case 'Medium': return 'bg-amber-100 text-amber-800';
            case 'Hard': return 'bg-rose-100 text-rose-800';
            default: return 'bg-slate-100 text-slate-800';
        }
    };

    const getDifficultyIcon = (difficulty: string) => {
        switch (difficulty) {
            case 'Easy': return '🍳';
            case 'Medium': return '👨‍🍳';
            case 'Hard': return '👨‍🍳‍🍳';
            default: return '🍳';
        }
    };

    return (
        <div className="bg-white rounded-xl p-6 border border-slate-200 hover:shadow-lg transition-all duration-200 cursor-pointer group">
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                    <h5 className="font-bold text-slate-900 text-lg mb-2 group-hover:text-blue-600 transition-colors">
                        {recipe.name}
                    </h5>
                    <div className="flex items-center space-x-3 text-sm text-slate-600">
                        <div className="flex items-center">
                            <Clock className="h-4 w-4 mr-1 text-blue-500" />
                            <span>{recipe.prepTime} prep</span>
                        </div>
                        <div className="flex items-center">
                            <ChefHat className="h-4 w-4 mr-1 text-orange-500" />
                            <span>{recipe.cookTime} cook</span>
                        </div>
                        <div className="flex items-center">
                            <Globe className="h-4 w-4 mr-1 text-purple-500" />
                            <span>{recipe.cuisineType}</span>
                        </div>
                    </div>
                </div>
                <div className={`flex items-center px-3 py-1 rounded-full text-sm font-medium ${getDifficultyColor(recipe.difficulty)}`}>
                    <span className="mr-1">{getDifficultyIcon(recipe.difficulty)}</span>
                    {recipe.difficulty}
                </div>
            </div>

            {/* Ingredients Summary */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="bg-emerald-50 rounded-lg p-3">
                    <div className="flex items-center text-sm font-medium text-emerald-800 mb-2">
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Available Ingredients
                    </div>
                    <div className="text-sm text-emerald-700">
                        {recipe.ingredients.available.length > 0 ? (
                            <div className="flex flex-wrap gap-1">
                                {recipe.ingredients.available.map((ingredient, index) => (
                                    <span key={index} className="bg-emerald-100 text-emerald-800 px-2 py-1 rounded-full text-xs">
                                        {ingredient}
                                    </span>
                                ))}
                            </div>
                        ) : (
                            <span className="text-emerald-600 italic">None available</span>
                        )}
                    </div>
                </div>

                <div className="bg-amber-50 rounded-lg p-3">
                    <div className="flex items-center text-sm font-medium text-amber-800 mb-2">
                        <XCircle className="h-4 w-4 mr-2" />
                        Missing Ingredients
                    </div>
                    <div className="text-sm text-amber-700">
                        {recipe.ingredients.missing.length > 0 ? (
                            <div className="flex flex-wrap gap-1">
                                {recipe.ingredients.missing.map((ingredient, index) => (
                                    <span key={index} className="bg-amber-100 text-amber-800 px-2 py-1 rounded-full text-xs">
                                        {ingredient}
                                    </span>
                                ))}
                            </div>
                        ) : (
                            <span className="text-amber-600 italic">All ingredients available!</span>
                        )}
                    </div>
                </div>
            </div>

            {/* Expand/Collapse Button */}
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    setIsExpanded(!isExpanded);
                }}
                className="flex items-center justify-center w-full pt-2 text-sm text-slate-500 hover:text-blue-600 transition-colors font-medium"
            >
                {isExpanded ? (
                    <>
                        <ChevronUp className="h-5 w-5 mr-2" />
                        Hide Instructions
                    </>
                ) : (
                    <>
                        <ChevronDown className="h-5 w-5 mr-2" />
                        Show Instructions
                    </>
                )}
            </button>

            {/* Expanded Instructions */}
            {isExpanded && (
                <div className="mt-4 pt-4 border-t border-slate-200 animate-in slide-in-from-top-2 duration-200">
                    <div className="flex items-center text-slate-700 mb-3">
                        <Utensils className="h-5 w-5 mr-2 text-blue-500" />
                        <span className="font-semibold text-lg">Cooking Instructions</span>
                    </div>
                    <ol className="space-y-3">
                        {recipe.instructions.map((step, stepIndex) => (
                            <li key={stepIndex} className="flex items-start">
                                <div className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-bold mr-3 mt-0.5">
                                    {stepIndex + 1}
                                </div>
                                <p className="text-slate-700 leading-relaxed">{step}</p>
                            </li>
                        ))}
                    </ol>
                </div>
            )}
        </div>
    );
}
