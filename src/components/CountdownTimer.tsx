'use client';
import { IoAlertCircleSharp } from "react-icons/io5";
import { useState, useEffect } from 'react';

interface CountdownTimerProps {
  deadline: string | number | Date;
}

interface ParsedTime {
  days: string;
  hours: string;
  minutes: string;
  seconds: string;
  isExpired: boolean;
}

export default function CountdownTimer({ deadline }: CountdownTimerProps) {
  const [hasMounted, setHasMounted] = useState(false);
  const [time, setTime] = useState<ParsedTime>({
    days: '00',
    hours: '00',
    minutes: '00',
    seconds: '00',
    isExpired: false
  });

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setHasMounted(true);

    const calculateTime = () => {
      const difference = new Date(deadline).getTime() - Date.now();

      if (difference <= 0) {
        setTime(prev => ({ ...prev, isExpired: true }));
        return;
      }

      const d = Math.floor(difference / (1000 * 60 * 60 * 24));
      const h = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const m = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const s = Math.floor((difference % (1000 * 60)) / 1000);

      // Pad numbers with leading zeros (e.g., '5' becomes '05') for layout stability
      setTime({
        days: d.toString().padStart(2, '0'),
        hours: h.toString().padStart(2, '0'),
        minutes: m.toString().padStart(2, '0'),
        seconds: s.toString().padStart(2, '0'),
        isExpired: false
      });
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);

    return () => clearInterval(interval);
  }, [deadline]);

  // Loading Placeholder state (Matches the size of the active state to prevent layout shift)
  if (!hasMounted) {
    return (
      <div className="w-full max-w-sm mx-auto p-3 rounded-xl border-2 border-dashed border-zinc-300 bg-white/50 text-center text-zinc-500 animate-pulse text-sm font-semibold">
        Syncing Timer...
      </div>
    );
  }

  // Expired State Layout
  if (time.isExpired) {
    return (
      <div className="flex items-center justify-center gap-2 w-full max-w-sm mx-auto p-3 rounded-xl border-2 border-red-200 bg-red-50 text-red-700 font-bold text-center shadow-sm">
        <IoAlertCircleSharp className="text-xl shrink-0" />
        <span className="text-sm sm:text-base tracking-wide uppercase">Offer Has Expired</span>
      </div>
    );
  }

  // Active Timer Dashboard Layout
  return (
    <div className="w-full max-w-sm mx-auto bg-white/90 backdrop-blur-md border-2 border-palette-beige rounded-xl p-3 sm:p-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
      
      {/* Alert Header Element */}
      <div className="flex items-center gap-2 text-green-700 shrink-0">
        <IoAlertCircleSharp className="text-red-600 text-2xl animate-pulse shrink-0" />
        <span className="text-xs sm:text-sm font-black uppercase tracking-wider font-[Poppins]">
          Ends Soon:
        </span>
      </div>

      {/* Countdown Digits Grid Container */}
      <div className="grid grid-cols-4 gap-2 w-full sm:w-auto text-palette-brown font-mono font-black text-center">
        {/* Days Box */}
        <div className="bg-[#F3E5D8]/40 rounded-lg px-2 py-1 flex flex-col min-w-[50px]">
          <span className="text-lg sm:text-xl leading-none">{time.days}</span>
          <span className="text-[10px] uppercase font-sans font-bold text-palette-brown/60 mt-0.5">days</span>
        </div>
        
        {/* Hours Box */}
        <div className="bg-[#F3E5D8]/40 rounded-lg px-2 py-1 flex flex-col min-w-[50px]">
          <span className="text-lg sm:text-xl leading-none">{time.hours}</span>
          <span className="text-[10px] uppercase font-sans font-bold text-palette-brown/60 mt-0.5">hrs</span>
        </div>

        {/* Minutes Box */}
        <div className="bg-[#F3E5D8]/40 rounded-lg px-2 py-1 flex flex-col min-w-[50px]">
          <span className="text-lg sm:text-xl leading-none">{time.minutes}</span>
          <span className="text-[10px] uppercase font-sans font-bold text-palette-brown/60 mt-0.5">mins</span>
        </div>

        {/* Seconds Box */}
        <div className="bg-[#F3E5D8]/40 rounded-lg px-2 py-1 flex flex-col min-w-[50px]">
          <span className="text-lg sm:text-xl leading-none text-red-600">{time.seconds}</span>
          <span className="text-[10px] uppercase font-sans font-bold text-palette-brown/60 mt-0.5">secs</span>
        </div>
      </div>

    </div>
  );
}
