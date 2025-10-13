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
        <div className="bg-white rounded-lg p-1 border-2 border-[#3A3A3A] space-y-0.5">
            <h3 className="font-primary text-xs tracking-wider uppercase text-[#3A3A3A] font-bold text-center border-b-2 border-[#3A3A3A]/50 pb-0 mb-0.5">
                {title}
            </h3>
            <div className="space-y-0.5 max-h-32 overflow-y-auto pr-1">
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
                    <p className="text-center text-xs text-gray-500 py-2">This pocket is empty.</p>
                )}
            </div>
        </div>
    );
};

export default Pocket;
