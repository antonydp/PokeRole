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
            className="bg-white p-0.5 rounded-md flex items-center gap-1.5 font-sans transition-all duration-200 hover:bg-stone-100"
        >
            {imageUrl ? (
                <img src={imageUrl} alt={itemInstance.name} className="w-8 h-8 object-contain bg-white rounded-full p-0.5 flex-shrink-0" />
            ) : (
                <div className="w-8 h-8 bg-stone-200 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-stone-500 font-bold text-sm">?</span>
                </div>
            )}
            <p className="flex-grow font-semibold text-xs text-stone-700 truncate" title={itemInstance.name}>
                {itemInstance.name}
            </p>
            <div className="flex items-center gap-px flex-shrink-0 bg-stone-200/70 rounded-md p-0.5">
                <button
                    onClick={() => onQuantityChange(itemInstance.id, itemInstance.quantity - 1)}
                    className="w-4 h-4 bg-stone-300 text-stone-800 rounded flex items-center justify-center hover:bg-red-500 hover:text-white transition-colors"
                    aria-label={`Decrease quantity of ${itemInstance.name}`}
                >
                    <MinusIcon className="w-2.5 h-2.5" />
                </button>
                <span className="w-5 text-center font-bold text-xs text-stone-900">
                    {itemInstance.quantity}
                </span>
                <button
                    onClick={() => onQuantityChange(itemInstance.id, itemInstance.quantity + 1)}
                    className="w-4 h-4 bg-stone-300 text-stone-800 rounded flex items-center justify-center hover:bg-green-500 hover:text-white transition-colors"
                    aria-label={`Increase quantity of ${itemInstance.name}`}
                >
                    <PlusIcon className="w-2.5 h-2.5" />
                </button>
            </div>
            <button
                onClick={() => onRemove(itemInstance.id)}
                className="w-5 h-5 flex items-center justify-center text-stone-500 hover:bg-red-500 hover:text-white rounded-md transition-colors"
                aria-label={`Remove ${itemInstance.name} from pocket`}
            >
                <TrashIcon className="w-3 h-3" />
            </button>
        </div>
    );
};

export default React.memo(PocketItem);
