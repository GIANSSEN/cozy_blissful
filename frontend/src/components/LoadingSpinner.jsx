import React from 'react';
import { ConveyorLoop } from '@/components/ui/conveyor-loop';

const LoadingSpinner = ({ fullPage = false, message = "Loading" }) => {
  const content = (
    <div className="flex items-center justify-center p-6 text-center select-none">
      <span className="inline-flex items-center gap-2 font-mono text-xl sm:text-2xl text-foreground">
        <ConveyorLoop />
        <span className="font-mono">{message}</span>
      </span>
    </div>
  );

  if (fullPage) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-background text-foreground fixed inset-0 z-50">
        {content}
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center w-full min-h-[16rem] text-foreground">
      {content}
    </div>
  );
};

export default LoadingSpinner;
