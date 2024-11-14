// @/features/tours/FloatingTourButton.tsx

import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { HelpCircle } from 'lucide-react';
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import TourGuide, { TourName, TOURS } from './TourGuide';

const TOUR_SEQUENCE: TourName[] = ['layout-manager', 'file-manager', 'monitoring'];

const ROUTE_TOUR_MAP: Record<string, TourName> = {
  '/layouts': 'layout-manager',
  '/files': 'file-manager',
  '/monitoring': 'monitoring'
};

export default function FloatingTourButton() {
  const location = useLocation();
  const [currentTour, setCurrentTour] = useState<TourName | undefined>();
  const [showTourDialog, setShowTourDialog] = useState(false);
  const [currentTourIndex, setCurrentTourIndex] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  const [hasSeenTour, setHasSeenTour] = useState(() => {
    return localStorage.getItem('hasSeenTour') === 'true';
  });

  const getCurrentRouteTour = (): TourName | undefined => {
    return ROUTE_TOUR_MAP[location.pathname];
  };

  // Reset state on route change
  useEffect(() => {
    setCurrentTour(undefined);
    setCurrentStep(0);
  }, [location.pathname]);

  // Check new user on mount
  useEffect(() => {
    if (!hasSeenTour) {
      setShowTourDialog(true);
    }
  }, [hasSeenTour]);

  const startTour = () => {
    const routeTour = getCurrentRouteTour();
    if (routeTour) {
      const index = TOUR_SEQUENCE.indexOf(routeTour);
      setCurrentTourIndex(index >= 0 ? index : 0);
      setCurrentTour(routeTour);
    } else {
      setCurrentTourIndex(0);
      setCurrentTour(TOUR_SEQUENCE[0]);
    }
    setCurrentStep(0);
    setShowTourDialog(false);
  };

  const handleTourComplete = () => {
    const currentTourSteps = currentTour ? TOURS[currentTour].length : 0;
    
    if (currentStep < currentTourSteps - 1) {
      // Continue current tour
      setCurrentStep(currentStep + 1);
    } else {
      // Move to next tour
      const nextIndex = currentTourIndex + 1;
      setCurrentStep(0);
      setCurrentTour(undefined);
      
      if (nextIndex < TOUR_SEQUENCE.length) {
        setCurrentTourIndex(nextIndex);
        setShowTourDialog(true);
      } else {
        finishAllTours();
      }
    }
  };

  const handleTourSkip = () => {
    finishAllTours();
  };

  const finishAllTours = () => {
    setCurrentTour(undefined);
    setCurrentStep(0);
    setShowTourDialog(false);
    setHasSeenTour(true);
    localStorage.setItem('hasSeenTour', 'true');
  };

  const handleDialogClose = () => {
    setShowTourDialog(false);
    setCurrentTour(undefined);
    setCurrentStep(0);
  };

  return (
    <>
      <div className="fixed bottom-6 right-6 z-50">
        <HoverCard>
          <HoverCardTrigger asChild>
            <Button
              size="lg"
              className="h-14 w-14 rounded-full shadow-lg"
              onClick={() => setShowTourDialog(true)}
            >
              <HelpCircle className="h-6 w-6" />
            </Button>
          </HoverCardTrigger>
          <HoverCardContent side="left" align="end">
            <div className="space-y-1">
              <h4 className="text-sm font-semibold">Need help?</h4>
              <p className="text-sm text-muted-foreground">
                Click to start an interactive tour of the features
              </p>
            </div>
          </HoverCardContent>
        </HoverCard>
      </div>

      <TourGuide
        key={`${location.pathname}-${currentTour}-${currentStep}`}
        tour={currentTour}
        onComplete={handleTourComplete}
        onSkip={handleTourSkip}
        currentStep={currentStep}
        onStepChange={setCurrentStep}
      />

      <Dialog 
        open={showTourDialog} 
        onOpenChange={(open) => {
          if (!open) handleDialogClose();
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {currentTourIndex === 0
                ? "Welcome to AxTract!"
                : "Ready for the next feature?"}
            </DialogTitle>
            <DialogDescription>
              {currentTourIndex === 0 ? (
                "Let's take a quick tour to help you get started with the key features."
              ) : (
                <>
                  You've completed the tour of {TOUR_SEQUENCE[currentTourIndex - 1]}.
                  Would you like to explore {TOUR_SEQUENCE[currentTourIndex]}?
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-2">
            <Button variant="outline" onClick={handleDialogClose}>
              Skip tour
            </Button>
            <Button onClick={startTour}>
              {currentTourIndex === 0 ? "Start Tour" : "Continue Tour"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}