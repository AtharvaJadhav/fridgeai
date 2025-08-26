'use client';

import { useState, useRef } from 'react';
import { Upload, Camera } from 'lucide-react';
import { UploadState } from '../lib/types';

interface UploadSectionProps {
    onUpload: (file: File) => void;
    uploadState: UploadState;
}

export default function UploadSection({ onUpload, uploadState }: UploadSectionProps) {
    const [dragActive, setDragActive] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            onUpload(e.dataTransfer.files[0]);
        }
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            onUpload(e.target.files[0]);
        }
    };

    const handleClick = () => {
        fileInputRef.current?.click();
    };

    return (
        <div className="max-w-2xl mx-auto">
            <div
                className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${dragActive
                    ? 'border-blue-400 bg-blue-50'
                    : 'border-gray-300 hover:border-gray-400'
                    } ${uploadState.isUploading ? 'opacity-50 pointer-events-none' : ''}`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
            >
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                />

                <div className="space-y-4">
                    <div className="flex justify-center">
                        <div className="p-3 bg-blue-100 rounded-full">
                            {uploadState.isUploading ? (
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                            ) : (
                                <Camera className="h-8 w-8 text-blue-600" />
                            )}
                        </div>
                    </div>

                    <div>
                        <h3 className="text-lg font-medium text-gray-900">
                            {uploadState.isUploading ? 'Analyzing image...' : 'Upload your fridge photo'}
                        </h3>
                        <p className="text-sm text-gray-500 mt-1">
                            Drag and drop an image here, or click to select
                        </p>
                    </div>

                    {!uploadState.isUploading && (
                        <button
                            onClick={handleClick}
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                            <Upload className="h-4 w-4 mr-2" />
                            Choose File
                        </button>
                    )}
                </div>
            </div>

            {uploadState.error && (
                <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
                    <p className="text-sm text-red-600">{uploadState.error}</p>
                </div>
            )}
        </div>
    );
}
