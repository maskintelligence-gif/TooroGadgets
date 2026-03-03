import { useEffect, useState } from 'react';
import { Zap } from 'lucide-react';

interface SplashScreenProps {
  onFinish: () => void;
  minimumLoadTime?: number;
}

export function SplashScreen({ onFinish, minimumLoadTime = 2500 }: SplashScreenProps) {
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setFadeOut(true);
      setTimeout(onFinish, 500);
    }, minimumLoadTime);

    return () => clearTimeout(timer);
  }, [onFinish, minimumLoadTime]);

  return (
    <div 
      className={`fixed inset-0 z-[200] flex flex-col items-center justify-center transition-opacity duration-500 ${
        fadeOut ? 'opacity-0' : 'opacity-100'
      }`}
      style={{
        background: 'linear-gradient(135deg, #2563eb 0%, #7c3aed 50%, #db2777 100%)'
      }}
    >
      {/* Animated Logo Container */}
      <div className="relative mb-8">
        <div className="absolute inset-0 animate-ping bg-white/30 rounded-3xl"></div>
        <div className="relative bg-white/20 backdrop-blur-lg rounded-3xl p-8 shadow-2xl">
          <Zap size={80} className="text-white fill-current animate-bounce" />
        </div>
      </div>
      
      {/* Brand Name */}
      <h1 className="text-5xl font-black text-white mb-4 tracking-tight drop-shadow-lg">
        TOOROGADGETS
      </h1>
      
      {/* Loading Bar */}
      <div className="w-64 h-2 bg-white/30 rounded-full overflow-hidden mb-6">
        <div 
          className="h-full bg-white rounded-full animate-loading-bar" 
          style={{ width: '40%' }}
        />
      </div>
      
      {/* Tagline */}
      <p className="text-white/90 text-sm font-medium tracking-wide">
        Fort Portal's Premier Electronics Store
      </p>
      
      {/* Loading Text */}
      <p className="text-white/60 text-xs mt-8 animate-pulse">
        Loading amazing gadgets...
      </p>
    </div>
  );
}
