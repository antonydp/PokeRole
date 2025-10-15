import { StateCreator } from 'zustand';
import { TrainerData, Item, ItemInstance } from '../../types';
import { createInitialTrainerData } from '../../logic/initializers';
import { SessionState } from '../useSessionStore';
import useNotificationStore from '../useNotificationStore';

const removeItemFromPocketsUtil = (pockets: { smallPocket: ItemInstance[], mainPocket: ItemInstance[] }, itemName: string) => {
    const newPockets = { ...pockets };
    let itemFoundAndRemoved = false;

    for (const pocketName of ['smallPocket', 'mainPocket'] as const) {
        const pocket = newPockets[pocketName];
        const itemIndex = pocket.findIndex(i => i.name.toLowerCase() === itemName.toLowerCase());

        if (itemIndex > -1) {
            if (pocket[itemIndex].quantity > 1) {
                pocket[itemIndex] = { ...pocket[itemIndex], quantity: pocket[itemIndex].quantity - 1 };
            } else {
                newPockets[pocketName] = pocket.filter((_, i) => i !== itemIndex);
            }
            itemFoundAndRemoved = true;
            break; 
        }
    }
    return { newPockets, itemFoundAndRemoved };
};


export interface TrainerSlice {
    trainerData: TrainerData;
    updateTrainerData: (updater: ((prev: TrainerData) => TrainerData) | TrainerData) => void;
    addItemToPockets: (item: Item) => void;
    removeItemFromPockets: (itemId: string, pocket: 'smallPocket' | 'mainPocket') => void;
    removeItemByName: (itemName: string) => boolean;
}

export const createTrainerSlice: StateCreator<
    SessionState,
    [],
    [],
    TrainerSlice
> = (set, get) => ({
    trainerData: createInitialTrainerData(),
    updateTrainerData: (updater) => {
        set(state => ({
            trainerData: typeof updater === 'function' ? updater(state.trainerData) : updater
        }));
    },
    addItemToPockets: (item) => {
        set(state => {
            const pocketName = item.usable_in_battle ? 'smallPocket' : 'mainPocket';
            const pocket = state.trainerData[pocketName];
            const existingItemIndex = pocket.findIndex(i => i.name === item.name);
            let newPocket;

            if (existingItemIndex > -1) {
                newPocket = pocket.map((i, index) =>
                    index === existingItemIndex ? { ...i, quantity: i.quantity + 1 } : i
                );
            } else {
                const newItemInstance: ItemInstance = {
                    id: crypto.randomUUID(),
                    name: item.name,
                    quantity: 1,
                };
                newPocket = [...pocket, newItemInstance];
            }

            useNotificationStore.getState().addNotification({
                message: `${item.name} added to ${pocketName === 'smallPocket' ? 'Small Pocket' : 'Main Pocket'}.`,
                type: 'success',
            });

            return {
                trainerData: {
                    ...state.trainerData,
                    [pocketName]: newPocket,
                }
            };
        });
    },
    removeItemFromPockets: (itemId, pocketName) => {
        set(state => {
            const pocket = state.trainerData[pocketName];
            const itemToRemove = pocket.find(i => i.id === itemId);
            if (!itemToRemove) return state;

            const newPocket = pocket.filter(i => i.id !== itemId);

            useNotificationStore.getState().addNotification({
                message: `${itemToRemove.name} removed from ${pocketName === 'smallPocket' ? 'Small Pocket' : 'Main Pocket'}.`,
                type: 'success',
            });

            return {
                trainerData: {
                    ...state.trainerData,
                    [pocketName]: newPocket,
                }
            };
        });
    },
    removeItemByName: (itemName: string) => {
        let itemFoundAndRemoved = false;
        set(state => {
            const { newPockets, itemFoundAndRemoved: removed } = removeItemFromPocketsUtil(
                { smallPocket: state.trainerData.smallPocket, mainPocket: state.trainerData.mainPocket },
                itemName
            );
            itemFoundAndRemoved = removed;
            if (removed) {
                return {
                    trainerData: {
                        ...state.trainerData,
                        ...newPockets,
                    }
                };
            }
            return state;
        });
        return itemFoundAndRemoved;
    },
});