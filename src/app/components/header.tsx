'use client';

import { Camera } from 'lucide-react';

export default function Header() {
    return (
        <header className="bg-white shadow-sm border-b">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center py-6">
                    <div className="flex items-center">
                        <Camera className="h-8 w-8 text-blue-600 mr-3" />
                        <h1 className="text-2xl font-bold text-gray-900">FridgeAI</h1>
                    </div>
                    <p className="text-sm text-gray-500">
                        Smart refrigerator inventory management
                    </p>
                </div>
            </div>
        </header>
    );
}
