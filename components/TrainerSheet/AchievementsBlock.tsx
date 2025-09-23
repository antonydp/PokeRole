import React from 'react';
import { LabeledInput } from '../shared/LabeledInput.js';

// --- AchievementsBlock Component ---
interface AchievementsBlockProps {
    achievements: { text: string; completed: boolean }[];
    onAchievementChange: (index: number, field: 'text' | 'completed', value: string | boolean) => void;
    onAddAchievement: () => void;
    onRemoveAchievement: (index: number) => void;
}

export const AchievementsBlock: React.FC<AchievementsBlockProps> = ({ achievements, onAchievementChange, onAddAchievement, onRemoveAchievement }) => (
    <div className="bg-gradient-to-br from-red-700 to-red-900 p-3 rounded-md shadow-md border border-red-600">
        <div className="flex justify-between items-center mb-3">
            <h3 className="text-xl font-extrabold text-yellow-300 tracking-wide">ACHIEVEMENTS</h3>
            <button
                onClick={onAddAchievement}
                className="bg-yellow-400 hover:bg-yellow-300 text-red-900 font-extrabold py-1 px-3 rounded-full text-sm shadow-md transition duration-300 ease-in-out transform hover:scale-110 flex items-center justify-center space-x-1"
                aria-label="Add new achievement"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
            </button>
        </div>
        <div className="space-y-3">
            {achievements.map((achievement, index) => (
                <div
                    key={index}
                    className={`flex items-center space-x-3 p-2 rounded-md transition-all duration-300 ${
                        achievement.completed
                            ? 'bg-gradient-to-r from-green-700 to-green-900 border border-yellow-400 shadow-md'
                            : 'bg-red-800 border border-red-700 shadow-sm'
                    }`}
                >
                    <div className="relative inline-block w-7 h-7 flex-shrink-0">
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
                                    ? 'bg-gradient-to-br from-yellow-300 to-yellow-500 border-2 border-green-400 scale-110 shadow-inner'
                                    : 'bg-gradient-to-br from-gray-300 to-gray-500 border border-gray-400 shadow-inner'
                            }`}
                            onClick={(e) => onAchievementChange(index, 'completed', !achievement.completed)}
                        >
                            {achievement.completed && (
                                // Icona Pokéball stilizzata più dettagliata
                                <div className="relative w-5 h-5">
                                    <div className="absolute inset-0 bg-white rounded-full border border-gray-800"></div>
                                    <div className="absolute top-0 left-0 right-0 bottom-1/2 bg-red-600 rounded-t-full border-b border-gray-800"></div>
                                    <div className="absolute top-1/2 left-0 right-0 bottom-0 bg-white rounded-b-full"></div>
                                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-2.5 h-2.5 bg-gray-800 rounded-full z-10"></div>
                                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-5 h-5 rounded-full border border-gray-800 z-10"></div>
                                    <div className="absolute top-1/2 left-0 right-0 h-1 bg-gray-800 z-10"></div>
                                </div>
                            )}
                        </div>
                    </div>
                    <LabeledInput
                        label=""
                        value={achievement.text}
                        onChange={(value) => onAchievementChange(index, 'text', value)}
                        placeholder="Descrizione Achievement"
                        type="text"
                        containerClassName={`flex-grow border-0 focus:border-yellow-400 rounded px-3 py-2 text-base font-extrabold ${
                            achievement.completed
                                ? 'bg-green-800 text-yellow-100 line-through decoration-yellow-300/70'
                                : 'bg-red-700 text-white'
                        }`}
                        inputClassName="text-center w-full normal-case"
                    />
                    <button
                        onClick={() => onRemoveAchievement(index)}
                        className="bg-red-500 hover:bg-red-400 text-white font-bold py-1 px-2 rounded-full text-sm shadow-md transition duration-300 ease-in-out transform hover:scale-110 flex items-center justify-center flex-shrink-0"
                        aria-label="Rimuovi achievement"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                    </button>
                </div>
            ))}
        </div>
    </div>
);
