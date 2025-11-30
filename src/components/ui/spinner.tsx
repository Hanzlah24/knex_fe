import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SpinnerProps {
  size?: number;
  className?: string;
}

const Spinner: React.FC<SpinnerProps> = ({ 
  size = 24, 
  className 
}) => {
  return (
    <div className="flex justify-center items-center">
      <Loader2 
        className={cn(
          "animate-spin text-primary", 
          className
        )} 
        size={size} 
      />
    </div>
  );
};

export default Spinner;