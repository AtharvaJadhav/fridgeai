'use client';

import { useState } from 'react';
import { X, Copy, Printer, CheckCircle, Circle } from 'lucide-react';

interface ShoppingSuggestion {
    item: string;
    category: string;
    reason: string;
}

interface ShoppingListModalProps {
    isOpen: boolean;
    onClose: () => void;
    suggestions: ShoppingSuggestion[];
    isLoading: boolean;
}

interface CheckedItems {
    [key: string]: boolean;
}

export default function ShoppingListModal({
    isOpen,
    onClose,
    suggestions,
    isLoading
}: ShoppingListModalProps) {
    const [checkedItems, setCheckedItems] = useState<CheckedItems>({});

    if (!isOpen) return null;

    const handleItemToggle = (itemName: string) => {
        setCheckedItems(prev => ({
            ...prev,
            [itemName]: !prev[itemName]
        }));
    };

    const handleCopyToClipboard = async () => {
        const text = formatForClipboard();
        try {
            await navigator.clipboard.writeText(text);
            alert('Shopping list copied to clipboard!');
        } catch (err) {
            console.error('Failed to copy to clipboard:', err);
            alert('Failed to copy to clipboard');
        }
    };

    const handlePrint = () => {
        const printWindow = window.open('', '_blank');
        if (printWindow) {
            printWindow.document.write(`
        <html>
          <head>
            <title>Shopping List</title>
            <style>
              body { font-family: Arial, sans-serif; padding: 20px; }
              .category { margin-bottom: 20px; }
              .category-title { font-size: 18px; font-weight: bold; margin-bottom: 10px; }
              .item { margin: 5px 0; }
              .checkbox { margin-right: 10px; }
            </style>
          </head>
          <body>
            <h1>Shopping List</h1>
            ${formatForPrint()}
          </body>
        </html>
      `);
            printWindow.document.close();
            printWindow.print();
        }
    };

    const formatForClipboard = () => {
        let text = 'Shopping List\n\n';

        const categories = ['produce', 'dairy', 'protein', 'pantry', 'condiment'];
        categories.forEach(category => {
            const categoryItems = suggestions.filter(s => s.category === category);
            if (categoryItems.length > 0) {
                text += `${category.toUpperCase()}\n`;
                categoryItems.forEach(item => {
                    const isChecked = checkedItems[item.item] ? '☑' : '☐';
                    text += `${isChecked} ${item.item} - ${item.reason}\n`;
                });
                text += '\n';
            }
        });

        return text;
    };

    const formatForPrint = () => {
        let html = '';

        const categories = ['produce', 'dairy', 'protein', 'pantry', 'condiment'];
        categories.forEach(category => {
            const categoryItems = suggestions.filter(s => s.category === category);
            if (categoryItems.length > 0) {
                html += `<div class="category">
          <div class="category-title">${category.toUpperCase()}</div>
        `;
                categoryItems.forEach(item => {
                    const isChecked = checkedItems[item.item] ? '☑' : '☐';
                    html += `<div class="item">
            <span class="checkbox">${isChecked}</span>
            ${item.item} - ${item.reason}
          </div>`;
                });
                html += '</div>';
            }
        });

        return html;
    };

    const getCategoryIcon = (category: string) => {
        switch (category) {
            case 'produce': return '🥬';
            case 'dairy': return '🥛';
            case 'protein': return '🥩';
            case 'pantry': return '🫙';
            case 'condiment': return '🧂';
            default: return '📦';
        }
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

    const groupedSuggestions = suggestions.reduce((acc, suggestion) => {
        if (!acc[suggestion.category]) {
            acc[suggestion.category] = [];
        }
        acc[suggestion.category].push(suggestion);
        return acc;
    }, {} as Record<string, ShoppingSuggestion[]>);

    const checkedCount = Object.values(checkedItems).filter(Boolean).length;
    const totalItems = suggestions.length;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-slate-200">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-900">Shopping List</h2>
                        <p className="text-slate-600 mt-1">
                            {checkedCount} of {totalItems} items checked
                        </p>
                    </div>
                    <div className="flex items-center space-x-3">
                        <button
                            onClick={handleCopyToClipboard}
                            className="inline-flex items-center px-3 py-2 text-sm font-medium text-slate-700 bg-slate-100 border border-slate-300 rounded-md hover:bg-slate-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500"
                        >
                            <Copy className="h-4 w-4 mr-2" />
                            Copy
                        </button>
                        <button
                            onClick={handlePrint}
                            className="inline-flex items-center px-3 py-2 text-sm font-medium text-slate-700 bg-slate-100 border border-slate-300 rounded-md hover:bg-slate-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500"
                        >
                            <Printer className="h-4 w-4 mr-2" />
                            Print
                        </button>
                        <button
                            onClick={onClose}
                            className="inline-flex items-center p-2 text-slate-400 hover:text-slate-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500"
                        >
                            <X className="h-6 w-6" />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
                    {isLoading ? (
                        <div className="flex items-center justify-center py-12">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                            <span className="ml-3 text-slate-600">Generating shopping suggestions...</span>
                        </div>
                    ) : suggestions.length === 0 ? (
                        <div className="text-center py-12 text-slate-500">
                            No shopping suggestions available
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {Object.entries(groupedSuggestions).map(([category, items]) => (
                                <div key={category} className="bg-slate-50 rounded-lg p-4">
                                    <div className="flex items-center mb-3">
                                        <span className="text-2xl mr-2">{getCategoryIcon(category)}</span>
                                        <h3 className={`text-lg font-semibold px-3 py-1 rounded-full text-sm ${getCategoryColor(category)}`}>
                                            {category.charAt(0).toUpperCase() + category.slice(1)}
                                        </h3>
                                    </div>
                                    <div className="space-y-2">
                                        {items.map((suggestion, index) => (
                                            <div key={index} className="flex items-start space-x-3 p-3 bg-white rounded-md border border-slate-200">
                                                <button
                                                    onClick={() => handleItemToggle(suggestion.item)}
                                                    className="flex-shrink-0 mt-1"
                                                >
                                                    {checkedItems[suggestion.item] ? (
                                                        <CheckCircle className="h-5 w-5 text-emerald-600" />
                                                    ) : (
                                                        <Circle className="h-5 w-5 text-slate-400 hover:text-slate-600" />
                                                    )}
                                                </button>
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="font-medium text-slate-900">{suggestion.item}</h4>
                                                    <p className="text-sm text-slate-600 mt-1">{suggestion.reason}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
