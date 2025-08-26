'use client';

import { Camera } from 'lucide-react';

export default function EmptyState() {
    return (
        <div className="max-w-2xl mx-auto text-center">
            <div className="p-8">
                <div className="flex justify-center mb-4">
                    <div className="p-4 bg-gray-100 rounded-full">
                        <Camera className="h-12 w-12 text-gray-400" />
                    </div>
                </div>

                <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No ingredients detected yet
                </h3>

                <p className="text-gray-500 mb-6">
                    Upload a photo of your refrigerator to get started.
                    We'll analyze the image and identify all the food items for you.
                </p>

                <div className="space-y-2 text-sm text-gray-400">
                    <p>• Take a clear photo of your refrigerator contents</p>
                    <p>• Make sure items are visible and well-lit</p>
                    <p>• We'll detect ingredients and expiry dates automatically</p>
                </div>
            </div>
        </div>
    );
}
