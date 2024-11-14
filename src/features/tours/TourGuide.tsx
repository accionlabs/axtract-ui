// @/features/tours/TourGuide.tsx

import React from 'react';
import { useNavigate } from 'react-router-dom';
import Joyride, { CallBackProps, STATUS } from 'react-joyride';
import { TOURS, TourName, TourStep } from './config';
import { CustomTooltip } from './CustomTooltip';

interface TourGuideProps {
  tour?: TourName;
  onComplete?: () => void;
  onSkip?: () => void;
  currentStep?: number;
  onStepChange?: (step: number) => void;
}

export default function TourGuide({
  tour,
  onComplete,
  onSkip,
  currentStep = 0,
  onStepChange
}: TourGuideProps) {
  const [run, setRun] = React.useState(false);
  const navigate = useNavigate();

  React.useEffect(() => {
    if (tour) {
      setRun(true);
    }
  }, [tour]);

  const handleCallback = (data: CallBackProps) => {
    const { action, index, status, type } = data;
    console.log('Tour callback:', { action, index, status, type });

    // Handle step changes
    if (type === 'step:after') {
      onStepChange?.(index + 1);
    }

    // Handle completion and skipping
    if (status === STATUS.SKIPPED) {
      setRun(false);
      onSkip?.();
      return;
    }

    if (action === 'close') {
      setRun(false);
      onSkip?.();
      return;
    }

    // Handle tour completion and navigation
    if (type === 'step:after' && tour) {
      const currentTourSteps = TOURS[tour];

      if (index === currentTourSteps.length - 1) {
        const lastStep = currentTourSteps[currentTourSteps.length - 1] as TourStep;
        setRun(false);
        // If there's a next route, navigate to it
        console.log('next route:',lastStep.nextRoute);
        if (lastStep.nextRoute) {
          navigate(lastStep.nextRoute);
        }
      }

      onComplete?.();
    }
  };

  if (!tour || !TOURS[tour]) return null;

  return (
    <Joyride
      callback={handleCallback}
      continuous={true}
      run={run}
      scrollToFirstStep={true}
      showProgress={false}
      showSkipButton={true}
      steps={TOURS[tour]}
      stepIndex={currentStep}
      disableOverlayClose={true}
      disableScrollParentFix={true}
      tooltipComponent={CustomTooltip}
      spotlightClicks={true}
      spotlightPadding={8}
      styles={{
        options: {
          arrowColor: '#ffffff',
          backgroundColor: '#ffffff',
          primaryColor: '#000000',
          textColor: '#000000',
          overlayColor: 'rgba(0, 0, 0, 0.5)',
          zIndex: 9999,
          width: 'auto'
        },
        tooltip: {
          borderRadius: '6px',
          fontSize: '14px'
        },
        tooltipContainer: {
          textAlign: 'left'
        },
        tooltipContent: {
          padding: '16px'
        },
        tooltipFooter: {
          marginTop: '8px'
        },
        buttonNext: {
          backgroundColor: '#000000',
          fontSize: '14px',
          padding: '8px 16px'
        },
        buttonBack: {
          marginRight: '10px',
          fontSize: '14px'
        },
        buttonSkip: {
          color: '#666666',
          fontSize: '14px'
        },
        buttonClose: {
          display: 'none'
        },
        spotlight: {
          background: 'transparent',
          borderRadius: '4px',
          boxShadow: '0 0 0 999vh rgba(0, 0, 0, 0.5)'
        },
        overlay: {
          mixBlendMode: 'hard-light',
          position: 'fixed'
        }
      }}
      floaterProps={{
        disableAnimation: true,
        placement: 'bottom',
        offset: 16
      }}
      locale={{
        back: 'Back',
        close: 'Close',
        last: 'Finish',
        next: 'Next',
        skip: 'Skip tour'
      }}
    />
  );
}