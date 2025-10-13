import React from 'react';

export const WarningIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
);

/**
 * A loading spinner icon.
 * @returns {React.FC} The rendered loading spinner.
 */
export const LoadingSpinner: React.FC = () => (
    <svg className="animate-spin -ml-1 mr-3 h-16 w-16 text-poke-yellow" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
);

/**
 * A Pokeball icon.
 * @param {object} props - Component props.
 * @param {string} [props.className] - Optional CSS class name.
 * @returns {React.FC} The rendered Pokeball icon.
 */
export const PokeballIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <g>
            <circle cx="50" cy="50" r="48" fill="#f0f0f0" stroke="#333" strokeWidth="4"/>
            <path d="M 50,2 A 48,48 0 0,1 50,98" fill="currentColor" />
            <path d="M 2,50 A 48,48 1 0,0 98,50" stroke="#333" strokeWidth="4" fill="none" />
            <path d="M 2,50 A 48,48 1 0,1 98,50" stroke="#333" strokeWidth="4" fill="none" />
            <circle cx="50" cy="50" r="15" fill="#f0f0f0" stroke="#333" strokeWidth="4"/>
            <circle cx="50" cy="50" r="8" fill="#d0d0d0" />
        </g>
    </svg>
);

/**
 * A close (X) icon.
 * @param {object} props - Component props.
 * @param {string} [props.className] - Optional CSS class name.
 * @returns {React.FC} The rendered close icon.
 */
export const CloseIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
);

/**
 * A plus (+) icon.
 * @param {object} props - Component props.
 * @param {string} [props.className] - Optional CSS class name.
 * @returns {React.FC} The rendered plus icon.
 */
export const PlusIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
    </svg>
);

/**
 * A minus (-) icon.
 * @param {object} props - Component props.
 * @param {string} [props.className] - Optional CSS class name.
 * @returns {React.FC} The rendered minus icon.
 */
export const MinusIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 12H6" />
    </svg>
);

/**
 * A menu (hamburger) icon.
 * @param {object} props - Component props.
 * @param {string} [props.className] - Optional CSS class name.
 * @returns {React.FC} The rendered menu icon.
 */
export const MenuIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
    </svg>
);

/**
 * A settings (gear) icon.
 * @param {object} props - Component props.
 * @param {string} [props.className] - Optional CSS class name.
 * @returns {React.FC} The rendered settings icon.
 */
export const SettingsIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
);

/**
 * A dice icon.
 * @param {object} props - Component props.
 * @param {string} [props.className] - Optional CSS class name.
 * @returns {React.FC} The rendered dice icon.
 */
export const DiceIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
        <rect width="40" height="40" rx="4" fill="#A8A29E"/>
        <path d="M4 8C4 5.79086 5.79086 4 8 4H32C34.2091 4 36 5.79086 36 8V32C36 34.2091 34.2091 36 32 36H8C5.79086 36 4 34.2091 4 32V8Z" fill="white" />
        <circle cx="12" cy="12" r="3" fill="#44403C"/>
        <circle cx="28" cy="12" r="3" fill="#44403C"/>
        <circle cx="12" cy="20" r="3" fill="#44403C"/>
        <circle cx="28" cy="20"r="3" fill="#44403C"/>
        <circle cx="12" cy="28" r="3" fill="#44403C"/>
        <circle cx="28" cy="28" r="3" fill="#44403C"/>
    </svg>
);

/**
 * A chevron down icon.
 * @param {object} props - Component props.
 * @param {string} [props.className] - Optional CSS class name.
 * @returns {React.FC} The rendered chevron down icon.
 */
export const ChevronDownIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    </svg>
);

/**
 * A trash can icon.
 * @param {object} props - Component props.
 * @param {string} [props.className] - Optional CSS class name.
 * @returns {React.FC} The rendered trash icon.
 */
export const TrashIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
);

/**
 * A lock icon.
 * @param {object} props - Component props.
 * @param {string} [props.className] - Optional CSS class name.
 * @returns {React.FC} The rendered lock icon.
 */
export const LockIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
    </svg>
);

/**
 * A sparkles icon, often used to denote AI or magical effects.
 * @param {object} props - Component props.
 * @param {string} [props.className] - Optional CSS class name.
 * @returns {React.FC} The rendered sparkles icon.
 */
export const SparklesIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M5 2a1 1 0 011 1v1h1a1 1 0 010 2H6v1a1 1 0 01-2 0V6H3a1 1 0 010-2h1V3a1 1 0 011-1zm0 10a1 1 0 011 1v1h1a1 1 0 110 2H6v1a1 1 0 11-2 0v-1H3a1 1 0 110-2h1v-1a1 1 0 011-1zM9 2a1 1 0 011 1v1h1a1 1 0 110 2h-1v1a1 1 0 11-2 0V6H6a1 1 0 010-2h1V3a1 1 0 011-1zm3 1a1 1 0 011 1v1h1a1 1 0 110 2h-1v1a1 1 0 11-2 0V6h-1a1 1 0 110-2h1V3a1 1 0 011-1zm-1 9a1 1 0 011 1v1h1a1 1 0 110 2h-1v1a1 1 0 11-2 0v-1h-1a1 1 0 110-2h1v-1a1 1 0 011-1z" clipRule="evenodd" />
    </svg>
);

/**
 * A search icon.
 * @param {object} props - Component props.
 * @param {string} [props.className] - Optional CSS class name.
 * @returns {React.FC} The rendered search icon.
 */
export const SearchIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
);

/**
 * An exclamation triangle icon.
 * @param {object} props - Component props.
 * @param {string} [props.className] - Optional CSS class name.
 * @returns {React.FC} The rendered exclamation triangle icon.
 */
export const ExclamationTriangleIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
);
