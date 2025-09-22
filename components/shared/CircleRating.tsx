import React from 'react';

export const CircleRating: React.FC<{
  value: number;
  max: number;
  onChange: (value: number) => void;
  className?: string;
  circleClassName?: string;
  limit?: number;
  isPoolExhausted?: boolean;
  baseValue?: number;
}> = ({ value, max, onChange, className = '', circleClassName = 'w-4 h-4', limit, isPoolExhausted = false, baseValue }) => {
  return (
    <div className={`flex flex-row flex-nowrap gap-1 items-center ${className}`}>
      {Array.from({ length: max }, (_, i) => {
        const isFilled = i < value;
        const isOverLimit = limit !== undefined && isFilled && i >= limit;
        const isDisabled = !isFilled && isPoolExhausted;
        const isBase = baseValue !== undefined && i === baseValue - 1;

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
            } ${isBase ? 'ring-2 ring-offset-2 ring-offset-[#00a6ff99] ring-yellow-400' : ''}`}
          />
        );
      })}
    </div>
  );
};