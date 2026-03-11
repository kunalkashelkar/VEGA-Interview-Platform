"use client";

import React, { useEffect, useState } from 'react';

const Waveform = ({ isActive }: { isActive: boolean }) => {
  const [bars, setBars] = useState<number[]>(new Array(20).fill(10));

  useEffect(() => {
    if (isActive) {
      const interval = setInterval(() => {
        setBars(new Array(20).fill(0).map(() => Math.floor(Math.random() * 40) + 10));
      }, 100);
      return () => clearInterval(interval);
    } else {
      setBars(new Array(20).fill(10));
    }
  }, [isActive]);

  return (
    <div className="flex items-center gap-1 h-12">
      {bars.map((height, i) => (
        <div
          key={i}
          className={`w-1 rounded-full transition-all duration-100 ${
            isActive ? 'bg-orange-500' : 'bg-gray-200'
          }`}
          style={{ height: `${height}%` }}
        />
      ))}
    </div>
  );
};

export default Waveform;
