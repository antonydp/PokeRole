// components/shared/AIExplanation.tsx

import React from 'react';
import { SparklesIcon } from '../Icons';

interface AIExplanationProps {
    explanation: string | null;
}

const AIExplanation: React.FC<AIExplanationProps> = ({ explanation }) => {
    if (!explanation) {
        return null;
    }

    return (
        <div className="bg-gradient-to-br from-slate-800 to-slate-900/80 p-4 rounded-lg border-2 border-poke-yellow/30 shadow-lg animate-fade-in">
            <div className="flex items-start gap-3">
                <div className="flex-shrink-0">
                    <SparklesIcon className="w-8 h-8 text-poke-yellow mt-1" />
                </div>
                <div>
                    <h4 className="text-lg font-bold text-poke-yellow mb-1">AI Suggestion</h4>
                    <p className="text-gray-300 text-sm italic">{explanation}</p>
                </div>
            </div>
        </div>
    );
};

export default AIExplanation;