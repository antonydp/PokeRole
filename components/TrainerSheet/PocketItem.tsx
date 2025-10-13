import React from 'react';
import { Item, ItemInstance } from '../../src/types/index.js';
import { MinusIcon, PlusIcon, TrashIcon } from '../Icons.js';

interface PocketItemProps {
    itemInstance: ItemInstance;
    itemDetails?: Item;
    onQuantityChange: (itemId: string, newQuantity: number) => void;
    onRemove: (itemId: string) => void;
    onMouseEnter: (content: { name: string; description: string }, element: HTMLElement) => void;
    onMouseLeave: () => void;
}

const PocketItem: React.FC<PocketItemProps> = ({ itemInstance, itemDetails, onQuantityChange, onRemove, onMouseEnter, onMouseLeave }) => {
    const imageUrl = itemDetails?.image;
    const description = itemDetails?.description || itemInstance.description;

    const handleMouseEnter = (event: React.MouseEvent<HTMLDivElement>) => {
        if (description) {
            onMouseEnter({ name: itemInstance.name, description }, event.currentTarget);
        }
    };

    return (
        <div
            onMouseEnter={handleMouseEnter}
            onMouseLeave={onMouseLeave}
            className="bg-stone-800/10 p-1 rounded-md flex items-center gap-1.5 font-sans animate-fade-in"
        >
            {imageUrl ? (
                <img src={imageUrl} alt={itemInstance.name} className="w-6 h-6 object-contain bg-white/20 rounded-full p-0.5 flex-shrink-0" />
            ) : (
                <div className="w-6 h-6 bg-white/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-gray-600 font-bold text-xs">?</span>
                </div>
            )}
            <p className="flex-grow font-bold text-xs text-stone-800 truncate" title={itemInstance.name}>
                {itemInstance.name}
            </p>
            <div className="flex items-center gap-0.5 flex-shrink-0">
                <button
                    onClick={() => onQuantityChange(itemInstance.id, itemInstance.quantity - 1)}
                    className="w-5 h-5 bg-stone-300 text-stone-800 rounded flex items-center justify-center hover:bg-poke-red hover:text-white transition-colors"
                    aria-label={`Decrease quantity of ${itemInstance.name}`}
                >
                    <MinusIcon className="w-3 h-3" />
                </button>
                <span className="w-6 text-center font-bold text-sm text-stone-900">
                    {itemInstance.quantity}
                </span>
                <button
                    onClick={() => onQuantityChange(itemInstance.id, itemInstance.quantity + 1)}
                    className="w-5 h-5 bg-stone-300 text-stone-800 rounded flex items-center justify-center hover:bg-green-600 hover:text-white transition-colors"
                    aria-label={`Increase quantity of ${itemInstance.name}`}
                >
                    <PlusIcon className="w-3 h-3" />
                </button>
            </div>
            <button
                onClick={() => onRemove(itemInstance.id)}
                className="p-1 text-stone-500 hover:bg-red-600 hover:text-white rounded-md transition-colors"
                aria-label={`Remove ${itemInstance.name} from pocket`}
            >
                <TrashIcon className="w-4 h-4" />
            </button>
        </div>
    );
};

export default React.memo(PocketItem);
