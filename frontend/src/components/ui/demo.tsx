import React from "react";
import { ConveyorLoop } from "@/components/ui/conveyor-loop";

export default function ConveyorLoopDemo() {
  return (
    <div className="flex min-h-[200px] items-center justify-center">
      <span className="inline-flex items-center gap-2 font-mono text-xl text-foreground">
        <ConveyorLoop />
        Loading
      </span>
    </div>
  );
}

export { ConveyorLoopDemo };
