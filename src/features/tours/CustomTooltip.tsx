// @/features/tours/CustomTooltip.jsx

import { X } from 'lucide-react';
import { TooltipRenderProps } from 'react-joyride';
import { TourStep } from './config';
import { Button } from '@/components/ui/button';

export const CustomTooltip = ({
    index,
    step,
    backProps,
    closeProps,
    primaryProps,
    tooltipProps,
    size,
  }: TooltipRenderProps) => (
    <div
      {...tooltipProps}
      className="bg-white p-4 rounded-lg shadow-lg border max-w-md"
    >
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-lg font-semibold">{(step as TourStep).title}</h3>
        <Button
          variant="ghost"
          size="sm"
          className="h-6 w-6 p-0"
          {...closeProps}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
      
      <div className="text-sm text-muted-foreground mb-4">
        {step.content}
      </div>
  
      <div className="flex justify-between items-center">
        <div className="text-sm text-muted-foreground">
          Step {index + 1} of {size}
        </div>
        <div className="flex gap-2">
          {index > 0 && (
            <Button
              variant="outline"
              size="sm"
              {...backProps}
            >
              Back
            </Button>
          )}
          <Button
            size="sm"
            {...primaryProps}
          >
            {index === size - 1 ? 'Finish' : 'Next'}
          </Button>
        </div>
      </div>
    </div>
  );