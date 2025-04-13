import { useEffect, useState } from 'react';

// Customizable loading component that can be used throughout your app
export function Loader({ 
  size = 'medium',  // small, medium, large
  type = 'spinner', // spinner, dots, progress
  color = 'indigo', // indigo, blue, green, etc.
  text = 'Loading...',
  showText = true,
  darkMode = false
}) {
  const [progress, setProgress] = useState(0);
  
  // Simulate progress for progress bar type
  useEffect(() => {
    if (type === 'progress') {
      const interval = setInterval(() => {
        setProgress(prev => {
          // Slow down as it approaches 100
          const increment = Math.max(1, 10 - Math.floor(prev / 10));
          const newValue = Math.min(99, prev + increment);
          return newValue;
        });
      }, 300);
      
      return () => clearInterval(interval);
    }
  }, [type]);
  
  // Size mappings
  const sizeMap = {
    small: { spinner: 'w-4 h-4', container: 'text-xs' },
    medium: { spinner: 'w-8 h-8', container: 'text-sm' },
    large: { spinner: 'w-12 h-12', container: 'text-base' }
  };
  
  // Color mappings
  const colorMap = {
    indigo: darkMode ? 'border-indigo-300 border-t-indigo-600' : 'border-indigo-200 border-t-indigo-600',
    blue: darkMode ? 'border-blue-300 border-t-blue-600' : 'border-blue-200 border-t-blue-600',
    green: darkMode ? 'border-green-300 border-t-green-600' : 'border-green-200 border-t-green-600',
    red: darkMode ? 'border-red-300 border-t-red-600' : 'border-red-200 border-t-red-600',
    gray: darkMode ? 'border-gray-300 border-t-gray-600' : 'border-gray-200 border-t-gray-600',
  };
  
  const textColorMap = {
    indigo: darkMode ? 'text-indigo-300' : 'text-indigo-600',
    blue: darkMode ? 'text-blue-300' : 'text-blue-600',
    green: darkMode ? 'text-green-300' : 'text-green-600',
    red: darkMode ? 'text-red-300' : 'text-red-600',
    gray: darkMode ? 'text-gray-300' : 'text-gray-600',
  };
  
  return (
    <div className={`flex flex-col items-center justify-center ${sizeMap[size].container}`}>
      {/* Spinner Type */}
      {type === 'spinner' && (
        <div className={`${sizeMap[size].spinner} border-4 rounded-full ${colorMap[color]} animate-spin`}></div>
      )}
      
      {/* Dots Type */}
      {type === 'dots' && (
        <div className="flex space-x-2">
          <div className={`${size === 'small' ? 'w-2 h-2' : size === 'medium' ? 'w-3 h-3' : 'w-4 h-4'} rounded-full ${textColorMap[color]} animate-bounce`} style={{ animationDelay: '0ms' }}></div>
          <div className={`${size === 'small' ? 'w-2 h-2' : size === 'medium' ? 'w-3 h-3' : 'w-4 h-4'} rounded-full ${textColorMap[color]} animate-bounce`} style={{ animationDelay: '150ms' }}></div>
          <div className={`${size === 'small' ? 'w-2 h-2' : size === 'medium' ? 'w-3 h-3' : 'w-4 h-4'} rounded-full ${textColorMap[color]} animate-bounce`} style={{ animationDelay: '300ms' }}></div>
        </div>
      )}
      
      {/* Progress Bar Type */}
      {type === 'progress' && (
        <div className="w-full">
          <div className={`w-full h-2 ${darkMode ? 'bg-gray-700' : 'bg-gray-200'} rounded-full overflow-hidden`}>
            <div 
              className={`h-full ${color === 'indigo' ? 'bg-indigo-600' : 
                          color === 'blue' ? 'bg-blue-600' : 
                          color === 'green' ? 'bg-green-600' : 
                          color === 'red' ? 'bg-red-600' : 'bg-gray-600'}`} 
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          {showText && (
            <div className={`text-center mt-1 ${textColorMap[color]}`}>
              {progress}%
            </div>
          )}
        </div>
      )}
      
      {/* Loading Text */}
      {showText && type !== 'progress' && (
        <div className={`mt-2 ${textColorMap[color]}`}>
          {text}
        </div>
      )}
    </div>
  );
}

// Fullscreen loader overlay for blocking user interaction
export function FullscreenLoader({ 
  color = 'indigo',
  text = 'Processing your request...',
  darkMode = false
}) {
  return (
    <div className={`fixed inset-0 ${darkMode ? 'bg-gray-900' : 'bg-gray-50'} bg-opacity-80 flex items-center justify-center z-50`}>
      <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} p-6 rounded-lg shadow-xl text-center max-w-sm mx-4`}>
        <Loader 
          size="large" 
          color={color} 
          text={text}
          darkMode={darkMode}
        />
      </div>
    </div>
  );
}

// Inline loader for use within components
export function InlineLoader({ color = 'indigo', darkMode = false }) {
  return (
    <div className="inline-flex items-center">
      <Loader 
        size="small" 
        color={color} 
        showText={false}
        darkMode={darkMode}
      />
    </div>
  );
}

// Button loader
export function ButtonLoader({ color = 'white', size = 'small' }) {
  return (
    <div className="inline-flex items-center justify-center">
      <div className={`${size === 'small' ? 'w-4 h-4' : 'w-5 h-5'} border-2 rounded-full border-t-transparent animate-spin`} 
        style={{ borderColor: `${color === 'white' ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.1)'}`, 
                borderTopColor: color === 'white' ? 'white' : `currentColor` }}></div>
    </div>
  );
}