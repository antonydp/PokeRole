import React from 'react';
import { TrainerData } from '../../src/types/index.js';
import { LabeledInput } from '../shared/LabeledInput.js';
import { CircleRating } from '../shared/CircleRating.js';

// --- CoreAttribute Component ---
interface CoreAttributeProps {
    name: string;
    value: number;
    onChange: (value: number) => void;
    isPoolExhausted: boolean;
}

export const CoreAttribute: React.FC<CoreAttributeProps> = ({ name, value, onChange, isPoolExhausted }) => (
    <div className="flex items-center justify-between bg-gray-700 p-2 rounded">
        <span className="font-bold text-white">{name}</span>
        <div className="flex items-center space-x-2">
            <button 
                onClick={() => onChange(value - 1)} 
                disabled={value <= 0}
                className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded disabled:opacity-50"
            >
                -
            </button>
            <span className="text-white">{value}</span>
            <button 
                onClick={() => onChange(value + 1)} 
                disabled={isPoolExhausted}
                className="bg-green-500 hover:bg-green-700 text-white font-bold py-1 px-2 rounded disabled:opacity-50"
            >
                +
            </button>
        </div>
    </div>
);



// --- AchievementsBlock Component ---
interface AchievementsBlockProps {
    achievements: { text: string; completed: boolean }[];
    onAchievementChange: (index: number, field: 'text' | 'completed', value: string | boolean) => void;
}

export const AchievementsBlock: React.FC<AchievementsBlockProps> = ({ achievements, onAchievementChange }) => (
    <div className="bg-gray-800 p-4 rounded shadow">
        <h3 className="text-lg font-bold text-white mb-3">ACHIEVEMENTS</h3>
        <div className="space-y-2">
            {achievements.map((achievement, index) => (
                <div key={index} className="flex items-center">
                    <input 
                        type="checkbox" 
                        checked={achievement.completed} 
                        onChange={(e) => onAchievementChange(index, 'completed', e.target.checked)} 
                        className="mr-2"
                    />
                    <LabeledInput 
                        label="" 
                        value={achievement.text} 
                        onChange={(e) => onAchievementChange(index, 'text', e.target.value)} 
                        placeholder="Achievement Description" 
                        type="text"
                        className="flex-grow"
                    />
                </div>
            ))}
        </div>
    </div>
);
