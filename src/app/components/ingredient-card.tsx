'use client';

import { useState } from 'react';
import { Ingredient } from '@/lib/types';
import { Package, TrendingUp, Clock, Leaf, UtensilsCrossed, Info, ChevronDown, ChevronUp } from 'lucide-react';

interface IngredientCardProps {
  ingredient: Ingredient;
}

export default function IngredientCard({ ingredient }: IngredientCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-emerald-600';
    if (confidence >= 0.6) return 'text-amber-600';
    return 'text-rose-600';
  };

  const getConfidenceText = (confidence: number) => {
    if (confidence >= 0.8) return 'High confidence';
    if (confidence >= 0.6) return 'Medium confidence';
    return 'Low confidence';
  };

  const getFreshnessColor = (freshness: string) => {
    switch (freshness) {
      case 'fresh': return 'text-emerald-600';
      case 'ripe': return 'text-amber-600';
      case 'overripe': return 'text-orange-600';
      case 'spoiled': return 'text-rose-600';
      default: return 'text-slate-600';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'produce': return <Leaf className="h-4 w-4" />;
      case 'dairy': return <Package className="h-4 w-4" />;
      case 'protein': return <UtensilsCrossed className="h-4 w-4" />;
      case 'pantry': return <Package className="h-4 w-4" />;
      case 'condiment': return <Package className="h-4 w-4" />;
      default: return <Package className="h-4 w-4" />;
    }
  };

  const getExpiryColor = (days: number) => {
    if (days <= 2) return 'text-rose-600';
    if (days <= 5) return 'text-orange-600';
    if (days <= 10) return 'text-amber-600';
    return 'text-emerald-600';
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'produce': return 'bg-emerald-100 text-emerald-800';
      case 'dairy': return 'bg-blue-100 text-blue-800';
      case 'protein': return 'bg-rose-100 text-rose-800';
      case 'pantry': return 'bg-amber-100 text-amber-800';
      case 'condiment': return 'bg-purple-100 text-purple-800';
      default: return 'bg-slate-100 text-slate-800';
    }
  };

  return (
    <div className="bg-white rounded-xl p-4 border border-slate-200 hover:shadow-lg transition-all duration-200 cursor-pointer group">
      <div className="space-y-3">
        {/* Name and Category */}
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-slate-900 truncate flex-1 group-hover:text-blue-600 transition-colors">
            {ingredient.name}
          </h3>
          <div className={`flex items-center px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(ingredient.category)}`}>
            {getCategoryIcon(ingredient.category)}
            <span className="ml-1 capitalize">{ingredient.category}</span>
          </div>
        </div>

        {/* Quantity */}
        <div className="flex items-center text-sm text-slate-600">
          <Package className="h-4 w-4 mr-2 flex-shrink-0 text-blue-500" />
          <span className="truncate">{ingredient.estimated_quantity}</span>
        </div>

        {/* Freshness */}
        <div className="flex items-center text-sm">
          <Leaf className={`h-4 w-4 mr-2 flex-shrink-0 ${getFreshnessColor(ingredient.freshness)}`} />
          <span className={`capitalize font-medium ${getFreshnessColor(ingredient.freshness)}`}>
            {ingredient.freshness}
          </span>
        </div>

        {/* Expiry */}
        <div className="flex items-center text-sm">
          <Clock className={`h-4 w-4 mr-2 flex-shrink-0 ${getExpiryColor(ingredient.estimatedExpiryDays)}`} />
          <span className={`font-medium ${getExpiryColor(ingredient.estimatedExpiryDays)}`}>
            {ingredient.estimatedExpiryDays === 1 ? '1 day' : `${ingredient.estimatedExpiryDays} days`} left
          </span>
        </div>

        {/* Confidence */}
        <div className="flex items-center text-sm">
          <TrendingUp className={`h-4 w-4 mr-2 flex-shrink-0 ${getConfidenceColor(ingredient.confidence)}`} />
          <span className={`font-medium ${getConfidenceColor(ingredient.confidence)}`}>
            {getConfidenceText(ingredient.confidence)} ({(ingredient.confidence * 100).toFixed(0)}%)
          </span>
        </div>

        {/* Expand/Collapse Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            setIsExpanded(!isExpanded);
          }}
          className="flex items-center justify-center w-full pt-2 text-xs text-slate-500 hover:text-blue-600 transition-colors"
        >
          {isExpanded ? (
            <>
              <ChevronUp className="h-4 w-4 mr-1" />
              Show Less
            </>
          ) : (
            <>
              <ChevronDown className="h-4 w-4 mr-1" />
              Show More
            </>
          )}
        </button>

        {/* Expanded Nutritional Info */}
        {isExpanded && (
          <div className="pt-3 border-t border-slate-200 animate-in slide-in-from-top-2 duration-200">
            <div className="flex items-center text-xs text-slate-500 mb-3">
              <Info className="h-3 w-3 mr-1 text-blue-500" />
              <span className="font-medium">Nutrition per {ingredient.nutritionalInfo.servingSize}</span>
            </div>
            <div className="grid grid-cols-3 gap-3 text-xs">
              <div className="text-center bg-emerald-50 rounded-lg p-2">
                <div className="font-bold text-emerald-900 text-sm">{ingredient.nutritionalInfo.calories}</div>
                <div className="text-emerald-600">calories</div>
              </div>
              <div className="text-center bg-blue-50 rounded-lg p-2">
                <div className="font-bold text-blue-900 text-sm">{ingredient.nutritionalInfo.protein}g</div>
                <div className="text-blue-600">protein</div>
              </div>
              <div className="text-center bg-amber-50 rounded-lg p-2">
                <div className="font-bold text-amber-900 text-sm">{ingredient.nutritionalInfo.carbs}g</div>
                <div className="text-amber-600">carbs</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
