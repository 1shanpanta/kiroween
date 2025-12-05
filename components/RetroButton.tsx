import React, { useState } from 'react';
import { TouchableOpacity, Text, TouchableOpacityProps } from 'react-native';
import { triggerHaptic } from '@/utils/haptics';

interface RetroButtonProps extends TouchableOpacityProps {
  title?: string;
  children?: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'danger';
  loading?: boolean;
}

export function RetroButton({ title, children, variant = 'primary', loading, style, ...props }: RetroButtonProps) {
  const [isPressed, setIsPressed] = useState(false);

  const handlePressIn = () => {
    setIsPressed(true);
    triggerHaptic('medium');
  };

  const handlePressOut = () => {
    setIsPressed(false);
  };

  const borderColor = variant === 'danger' ? 'border-fatal-red' : 'border-standard-green';
  
  const containerClasses = `
    border-4 ${borderColor} 
    px-6 py-3 
    items-center justify-center
    ${isPressed ? (variant === 'danger' ? 'bg-fatal-red' : 'bg-standard-green') : 'bg-void-black'}
    ${props.disabled ? 'opacity-50' : ''}
  `;

  const textClasses = `
    text-xs 
    ${isPressed ? 'text-void-black' : (variant === 'danger' ? 'text-fatal-red' : 'text-standard-green')}
  `;

  return (
    <TouchableOpacity
      activeOpacity={1}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      className={containerClasses}
      style={[
        style,
        isPressed && { transform: [{ translateY: 2 }] }
      ]}
      {...props}
    >
      <Text 
        className={textClasses} 
        style={{ fontFamily: 'PressStart2P' }}
      >
        {loading ? 'PROCESSING...' : (title || children)}
      </Text>
    </TouchableOpacity>
  );
}
