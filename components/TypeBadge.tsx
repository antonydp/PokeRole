
import React from 'react';
import { TYPE_COLORS } from '../src/constants/gameConstants.js';

/**
 * @interface TypeBadgeProps
 * @property {string} type - The Pokémon type to display (e.g., "Fire", "Water").
 */

interface TypeBadgeProps {
    type: string;
}

const TypeBadge: React.FC<TypeBadgeProps> = ({ type }) => {
    const colorClass = TYPE_COLORS[type] || 'bg-gray-500 text-white';
    return (
        <span className={`px-2.5 py-1 text-sm font-semibold rounded-full shadow-md ${colorClass}`}>
            {type}
        </span>
    );
};

export default TypeBadge;
