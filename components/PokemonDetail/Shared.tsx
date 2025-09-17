import React from 'react';

export const CircleRating: React.FC<{
  value: number;
  max: number;
  onChange: (value: number) => void;
  className?: string;
  circleClassName?: string;
  limit?: number;
  isPoolExhausted?: boolean;
}> = ({ value, max, onChange, className = '', circleClassName = 'w-4 h-4', limit, isPoolExhausted = false }) => {
  return (
    <div className={`flex flex-row flex-nowrap gap-1 items-center ${className}`}>
      {Array.from({ length: max }, (_, i) => {
        const isFilled = i < value;
        const isOverLimit = limit !== undefined && isFilled && i >= limit;
        const isDisabled = !isFilled && isPoolExhausted;
        
        return (
          <button
            key={i}
            type="button"
            aria-label={`Set rating to ${i + 1}`}
            onClick={() => onChange(i < value ? i : i + 1)}
            disabled={isDisabled}
            className={`${circleClassName} rounded-full transition-colors ${
              isOverLimit ? 'bg-red-500' 
              : isFilled ? 'bg-white' 
              : isDisabled ? 'bg-black/20 cursor-not-allowed'
              : 'bg-black/20 hover:bg-white/50'
            }`}
          />
        );
      })}
    </div>
  );
};

export const LabeledInput: React.FC<{
  label: string;
  value: string;
  onChange: (value: string) => void;
  isReadOnly?: boolean;
  id: string;
  containerClassName?: string;
}> = ({ label, id, value, onChange, isReadOnly = false, containerClassName = "" }) => (
    <div className={`relative w-full bg-white rounded-xl px-2 py-1.5 border-2 border-[#3A3A3A] flex justify-between items-center ${containerClassName}`}>
        <label htmlFor={id} className="font-pixel text-[10px] tracking-wider uppercase text-[#3A3A3A] font-bold">
            {label}
        </label>
        <input
            id={id}
            type="text"
            value={value}
            onChange={(e) => !isReadOnly && onChange(e.target.value)}
            readOnly={isReadOnly}
            className={`bg-transparent text-black font-sans text-sm text-right focus:outline-none w-1/2 p-0 ${isReadOnly ? 'cursor-default' : ''}`}
        />
    </div>
);

export const PointTracker: React.FC<{ label: string; spent: number; total: number; }> = ({ label, spent, total }) => (
    <div className="bg-black/20 text-white font-pixel p-2 rounded-lg text-center border-2 border-black/30 mb-2">
        <span className="text-sm tracking-wider opacity-80">{label}</span>
        <div className={`text-base font-bold mt-1 transition-colors ${spent > total ? 'text-red-500 animate-pulse' : 'text-poke-yellow'}`}>
            {spent} / {total}
        </div>
    </div>
);