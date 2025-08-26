import { Ingredient } from '@/app/lib/types';

export interface ShoppingItem {
  name: string;
  category: 'produce' | 'dairy' | 'protein' | 'pantry' | 'condiment';
  priority: 'high' | 'medium' | 'low';
  reason: string;
}

export interface ShoppingList {
  produce: ShoppingItem[];
  dairy: ShoppingItem[];
  protein: ShoppingItem[];
  pantry: ShoppingItem[];
  condiment: ShoppingItem[];
}

export interface ShoppingSuggestion {
  item: string;
  category: string;
  reason: string;
}

// Common staple items that are often missing
const STAPLE_ITEMS = {
  produce: [
    { name: 'Onions', priority: 'high', reason: 'Basic cooking ingredient' },
    { name: 'Garlic', priority: 'high', reason: 'Essential flavor base' },
    { name: 'Potatoes', priority: 'medium', reason: 'Versatile staple' },
    { name: 'Carrots', priority: 'medium', reason: 'Good for soups and sides' },
  ],
  dairy: [
    { name: 'Milk', priority: 'high', reason: 'Basic cooking and drinking' },
    { name: 'Eggs', priority: 'high', reason: 'Essential for baking and cooking' },
    { name: 'Butter', priority: 'high', reason: 'Cooking and baking staple' },
  ],
  protein: [
    { name: 'Chicken Breast', priority: 'medium', reason: 'Versatile protein' },
    { name: 'Ground Beef', priority: 'medium', reason: 'Good for various dishes' },
  ],
  pantry: [
    { name: 'Cooking Oil', priority: 'high', reason: 'Essential for cooking' },
    { name: 'Salt', priority: 'high', reason: 'Basic seasoning' },
    { name: 'Black Pepper', priority: 'high', reason: 'Essential seasoning' },
    { name: 'Flour', priority: 'medium', reason: 'Baking and thickening' },
    { name: 'Rice', priority: 'medium', reason: 'Versatile side dish' },
    { name: 'Pasta', priority: 'medium', reason: 'Quick meal base' },
  ],
  condiment: [
    { name: 'Ketchup', priority: 'low', reason: 'Common condiment' },
    { name: 'Mustard', priority: 'low', reason: 'Sandwich and cooking' },
  ],
};

// Recipe pattern analysis for smart suggestions
const RECIPE_PATTERNS = {
  'tomato + cheese': {
    produce: ['Basil', 'Onions', 'Garlic'],
    pantry: ['Pasta', 'Olive Oil'],
    condiment: ['Balsamic Vinegar'],
  },
  'chicken + vegetables': {
    produce: ['Onions', 'Carrots', 'Celery'],
    pantry: ['Rice', 'Chicken Broth'],
    condiment: ['Soy Sauce'],
  },
  'beef + potatoes': {
    produce: ['Onions', 'Carrots', 'Garlic'],
    pantry: ['Beef Broth', 'Worcestershire Sauce'],
    condiment: ['Ketchup', 'Mustard'],
  },
  'fish + citrus': {
    produce: ['Lemon', 'Lime', 'Herbs'],
    pantry: ['Olive Oil', 'White Wine'],
    condiment: ['Capers'],
  },
};

export function analyzeIngredients(ingredients: Ingredient[]): ShoppingList {
  const detectedCategories = new Set(ingredients.map(ing => ing.category));
  const detectedNames = new Set(ingredients.map(ing => ing.name.toLowerCase()));
  
  const shoppingList: ShoppingList = {
    produce: [],
    dairy: [],
    protein: [],
    pantry: [],
    condiment: [],
  };

  // Add staple items based on what's missing
  Object.entries(STAPLE_ITEMS).forEach(([category, items]) => {
    items.forEach(item => {
      if (!detectedNames.has(item.name.toLowerCase())) {
        shoppingList[category as keyof ShoppingList].push({
          ...item,
          category: category as keyof ShoppingList,
          priority: item.priority as 'high' | 'medium' | 'low',
        });
      }
    });
  });

  // Analyze recipe patterns
  ingredients.forEach(ingredient => {
    const name = ingredient.name.toLowerCase();
    
    // Check for tomato + cheese pattern
    if ((name.includes('tomato') || name.includes('cheese')) && 
        ingredients.some(other => other.name.toLowerCase().includes('cheese') || other.name.toLowerCase().includes('tomato'))) {
      const pattern = RECIPE_PATTERNS['tomato + cheese'];
      pattern.produce.forEach(item => {
        if (!detectedNames.has(item.toLowerCase())) {
          shoppingList.produce.push({
            name: item,
            category: 'produce',
            priority: 'medium',
            reason: 'Complements tomato and cheese dishes',
          });
        }
      });
    }

    // Check for chicken + vegetables pattern
    if (name.includes('chicken') && 
        ingredients.some(other => other.category === 'produce')) {
      const pattern = RECIPE_PATTERNS['chicken + vegetables'];
      pattern.produce.forEach(item => {
        if (!detectedNames.has(item.toLowerCase())) {
          shoppingList.produce.push({
            name: item,
            category: 'produce',
            priority: 'medium',
            reason: 'Complements chicken dishes',
          });
        }
      });
    }
  });

  // Remove duplicates and sort by priority
  Object.keys(shoppingList).forEach(category => {
    const key = category as keyof ShoppingList;
    shoppingList[key] = shoppingList[key]
      .filter((item, index, self) => 
        index === self.findIndex(t => t.name.toLowerCase() === item.name.toLowerCase())
      )
      .sort((a, b) => {
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      });
  });

  return shoppingList;
}

export function formatShoppingListForExport(shoppingList: ShoppingList): string {
  let exportText = 'Shopping List\n';
  exportText += '='.repeat(20) + '\n\n';

  Object.entries(shoppingList).forEach(([category, items]) => {
    if (items.length > 0) {
      exportText += `${category.toUpperCase()}\n`;
      exportText += '-'.repeat(category.length) + '\n';
      items.forEach(item => {
        exportText += `☐ ${item.name} - ${item.reason}\n`;
      });
      exportText += '\n';
    }
  });

  return exportText;
}

export function getTotalItems(shoppingList: ShoppingList): number {
  return Object.values(shoppingList).reduce((total, category) => total + category.length, 0);
}
