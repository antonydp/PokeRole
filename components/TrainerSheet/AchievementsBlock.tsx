import React from 'react';
import { LabeledInput } from '../shared/LabeledInput.js';
import { PlusIcon, TrashIcon } from '../Icons.js';

interface Achievement {
    text: string;
    completed: boolean;
}

interface AchievementsBlockProps {
    achievements: Achievement[];
    onAchievementChange: (index: number, field: keyof Achievement, value: any) => void;
    onAddAchievement: () => void;
    onRemoveAchievement: (index: number) => void;
}

export const AchievementsBlock: React.FC<AchievementsBlockProps> = ({ achievements, onAchievementChange, onAddAchievement, onRemoveAchievement }) => (
    <div className="bg-slate-800/50 rounded-lg p-2">
        <div className="flex justify-between items-center mb-2">
            <h3 className="text-base font-bold text-poke-yellow font-primary">Achievements & Notes</h3>
            <button
                onClick={onAddAchievement}
                className="flex items-center justify-center px-2 py-1 bg-green-600 text-white font-primary text-xs rounded-md border-b-2 border-green-800 hover:bg-green-500 active:translate-y-px active:border-b-0 transition-all duration-150"
            >
                <PlusIcon className="w-3 h-3" />
                <span className="ml-1">Add</span>
            </button>
        </div>
        <div className="space-y-2">
            {(achievements || []).map((achievement, index) => (
                <div
                    key={index}
                    className={`flex items-center space-x-2 p-1.5 rounded-md transition-all duration-300 ${
                        achievement.completed
                            ? 'bg-gradient-to-r from-green-700 to-green-900 border border-yellow-400 shadow-md'
                            : 'bg-red-800 border border-red-700 shadow-sm'
                    }`}
                >
                    <div className="relative inline-block w-6 h-6 flex-shrink-0">
                        <input
                            type="checkbox"
                            checked={achievement.completed}
                            onChange={(e) => onAchievementChange(index, 'completed', e.target.checked)}
                            className="opacity-0 absolute w-full h-full cursor-pointer"
                            aria-label={achievement.completed ? "Deselect achievement" : "Select achievement"}
                        />
                        <div
                            className={`absolute inset-0 flex items-center justify-center rounded-full cursor-pointer transition-all duration-300 ${
                                achievement.completed
                                    ? 'bg-gradient-to-br from-yellow-300 to-yellow-500 border-2 border-green-400 scale-105 shadow-inner'
                                    : 'bg-gradient-to-br from-gray-300 to-gray-500 border border-gray-400 shadow-inner'
                            }`}
                            onClick={(e) => onAchievementChange(index, 'completed', !achievement.completed)}
                        >
                            {achievement.completed && (
                                <div className="relative w-4 h-4">
                                    <div className="absolute inset-0 bg-white rounded-full border border-gray-800"></div>
                                    <div className="absolute top-0 left-0 right-0 bottom-1/2 bg-red-600 rounded-t-full border-b border-gray-800"></div>
                                    <div className="absolute top-1/2 left-0 right-0 bottom-0 bg-white rounded-b-full"></div>
                                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-gray-800 rounded-full z-10"></div>
                                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full border border-gray-800 z-10"></div>
                                    <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-gray-800 z-10"></div>
                                </div>
                            )}
                        </div>
                    </div>
                    <LabeledInput
                        label=""
                        id={`achievement-${index}`}
                        value={achievement.text}
                        onChange={(value) => onAchievementChange(index, 'text', value)}
                        placeholder="Achievement description"
                        containerClassName={`flex-grow border-0 focus:border-yellow-400 rounded px-2 py-1 text-sm font-bold ${
                            achievement.completed
                                ? 'bg-green-800 text-yellow-100 line-through decoration-yellow-300/70'
                                : 'bg-red-700 text-white'
                        }`}
                        inputClassName="text-center w-full normal-case"
                    />
                    <button
                        onClick={() => onRemoveAchievement(index)}
                        className="p-1.5 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                        aria-label="Remove achievement"
                    >
                        <TrashIcon className="w-4 h-4" />
                    </button>
                </div>
            ))}
        </div>
    </div>
);
