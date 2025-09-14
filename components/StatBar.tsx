
import React from 'react';

interface StatBarProps {
  label: string;
  value: number;
  maxValue: number;
}

const StatBar: React.FC<StatBarProps> = ({ label, value, maxValue }) => {
  const percentage = (value / maxValue) * 100;
  let barColor = 'bg-green-500';
  if (percentage < 33) barColor = 'bg-red-500';
  else if (percentage < 66) barColor = 'bg-yellow-500';

  return (
    <div className="flex items-center w-full my-1">
      <span className="w-1/4 text-sm font-medium text-gray-300 pr-2 text-right">{label}</span>
      <div className="w-3/4 bg-gray-600 rounded-full h-4 relative">
        <div 
          className={`h-4 rounded-full ${barColor} transition-all duration-500`} 
          style={{ width: `${percentage}%` }}
        />
        <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-white mix-blend-difference">
          {value} / {maxValue}
        </span>
      </div>
    </div>
  );
};

export default StatBar;
