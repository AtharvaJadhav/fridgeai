'use client';

import { Ingredient } from '@/lib/types';
import { Package, TrendingUp } from 'lucide-react';

interface IngredientCardProps {
  ingredient: Ingredient;
}

export default function IngredientCard({ ingredient }: IngredientCardProps) {
  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-600';
    if (confidence >= 0.6) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getConfidenceText = (confidence: number) => {
    if (confidence >= 0.8) return 'High confidence';
    if (confidence >= 0.6) return 'Medium confidence';
    return 'Low confidence';
  };

  return (
    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 hover:shadow-md transition-shadow">
      <div className="space-y-3">
        <div>
          <h3 className="font-medium text-gray-900 truncate">
            {ingredient.name}
          </h3>
        </div>
        
        <div className="flex items-center text-sm text-gray-600">
          <Package className="h-4 w-4 mr-2 flex-shrink-0" />
          <span className="truncate">{ingredient.estimated_quantity}</span>
        </div>
        
        <div className="flex items-center text-sm">
          <TrendingUp className={`h-4 w-4 mr-2 flex-shrink-0 ${getConfidenceColor(ingredient.confidence)}`} />
          <span className={getConfidenceColor(ingredient.confidence)}>
            {getConfidenceText(ingredient.confidence)} ({(ingredient.confidence * 100).toFixed(0)}%)
          </span>
        </div>
      </div>
    </div>
  );
}
