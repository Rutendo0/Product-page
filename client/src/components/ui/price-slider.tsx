import React, { useState, useEffect } from "react";

interface PriceSliderProps {
  min: number;
  max: number;
  onChange: (minValue: number, maxValue: number) => void;
  initialMin?: number;
  initialMax?: number;
}

const PriceSlider: React.FC<PriceSliderProps> = ({
  min,
  max,
  onChange,
  initialMin,
  initialMax,
}) => {
  const [minValue, setMinValue] = useState(initialMin || min);
  const [maxValue, setMaxValue] = useState(initialMax || max);

  useEffect(() => {
    if (initialMin !== undefined) setMinValue(initialMin);
    if (initialMax !== undefined) setMaxValue(initialMax);
  }, [initialMin, initialMax]);

  const handleMinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Math.min(Number(e.target.value), maxValue - 1);
    setMinValue(value);
    onChange(value, maxValue);
  };

  const handleMaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Math.max(Number(e.target.value), minValue + 1);
    setMaxValue(value);
    onChange(minValue, value);
  };

  return (
    <div className="mt-4 px-2">
      <div className="flex justify-between mb-2">
        <span id="price-min-display">${minValue.toFixed(2)}</span>
        <span id="price-max-display">${maxValue.toFixed(2)}</span>
      </div>
      <div className="relative">
        <input
          type="range"
          min={min}
          max={max}
          value={minValue}
          onChange={handleMinChange}
          className="w-full accent-secondary"
          id="price-min"
        />
        <input
          type="range"
          min={min}
          max={max}
          value={maxValue}
          onChange={handleMaxChange}
          className="w-full accent-secondary"
          id="price-max"
        />
      </div>
    </div>
  );
};

export default PriceSlider;
