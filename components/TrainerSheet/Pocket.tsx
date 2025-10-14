import React from 'react';
import { Item, ItemInstance } from '../../src/types/index.js';
import PocketItem from './PocketItem.js';

interface PocketProps {
    title: string;
    items: ItemInstance[];
    itemMap: Map<string, Item>;
    onUpdate: (updatedItems: ItemInstance[]) => void;
    onItemMouseEnter: (content: { name: string; description: string }, element: HTMLElement) => void;
    onItemMouseLeave: () => void;
    onRemoveItem: (itemId: string) => void;
}

const Pocket: React.FC<PocketProps> = ({ title, items, itemMap, onUpdate, onItemMouseEnter, onItemMouseLeave, onRemoveItem }) => {
    
    const handleQuantityChange = (itemId: string, newQuantity: number) => {
        if (newQuantity <= 0) {
            onRemoveItem(itemId);
        } else {
            const updatedItems = items.map(item =>
                item.id === itemId ? { ...item, quantity: newQuantity } : item
            );
            onUpdate(updatedItems);
        }
    };

    return (
        <div className="bg-stone-50 rounded-lg p-1 border border-stone-200 shadow-sm">
            <h3 className="font-primary text-xs font-bold text-stone-700 text-center mb-1 border-b border-stone-200 pb-1">
                {title}
            </h3>
            <div className="space-y-0.5 max-h-36 overflow-y-auto pr-1">
                {items && items.length > 0 ? (
                    items.map(itemInstance => (
                        <PocketItem
                            key={itemInstance.id}
                            itemInstance={itemInstance}
                            itemDetails={itemMap.get(itemInstance.name)}
                            onQuantityChange={handleQuantityChange}
                            onRemove={onRemoveItem}
                            onMouseEnter={onItemMouseEnter}
                            onMouseLeave={onItemMouseLeave}
                        />
                    ))
                ) : (
                    <p className="text-center text-xs text-stone-500 py-2">This pocket is empty.</p>
                )}
            </div>
        </div>
    );
};

export default Pocket;
