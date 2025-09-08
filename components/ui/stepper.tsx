'use client';

import { cn } from '@/lib/utils';
import Link from 'next/link';
import { Check, Lock } from 'lucide-react';
import { useTrip } from '@/lib/context/trip-context';

interface StepperProps {
  steps: {
    id: string;
    title: string;
    href: string;
  }[];
  currentStep: string;
}

export function Stepper({ steps, currentStep }: StepperProps) {
  const { trip, hasUnsavedChanges, isStateSynced } = useTrip();

  const getStepStatus = (stepId: string, stepIndex: number) => {
    const currentStepIndex = steps.findIndex((step) => step.id === currentStep);

    if (stepId === currentStep) return 'current';
    if (stepIndex < currentStepIndex) return 'completed';

    // Check if step is accessible
    if (stepId === 'lunch' && trip.vineyards.length === 0) return 'locked';
    if (stepId === 'review' && trip.vineyards.length === 0) return 'locked';
    if (stepId === 'plan' && (trip.vineyards.length === 0 || !isStateSynced()))
      return 'locked';

    return 'available';
  };

  return (
    <div className='my-6 sm:my-8'>
      {/* Desktop Step Indicator */}
      <div className='flex items-center justify-center mb-4 px-4'>
        {steps.map((step, index) => {
          const status = getStepStatus(step.id, index);
          const isLocked = status === 'locked';
          const isCurrent = status === 'current';
          const isCompleted = status === 'completed';

          const StepContent = (
            <div className='flex items-center'>
              <div
                className={cn(
                  'w-10 h-10 lg:w-12 lg:h-12 rounded-full flex items-center justify-center text-sm lg:text-base font-medium transition-all duration-200 shadow-lg',
                  {
                    'bg-vineyard-500 text-white': isCurrent,
                    'bg-vineyard-600 text-white': isCompleted,
                    'bg-gray-300 text-gray-500': isLocked,
                    'bg-gray-200 text-gray-500': status === 'available',
                  }
                )}
              >
                {isCompleted ? (
                  <Check className='w-5 h-5 lg:w-6 lg:h-6' />
                ) : isLocked ? (
                  <Lock className='w-4 h-4 lg:w-5 lg:h-5' />
                ) : (
                  index + 1
                )}
              </div>
              {index < steps.length - 1 && (
                <div
                  className={cn(
                    'w-8 lg:w-16 xl:w-20 h-0.5 mx-2 lg:mx-3 transition-colors duration-200',
                    {
                      'bg-vineyard-500': isCompleted,
                      'bg-gray-200': !isCompleted,
                    }
                  )}
                />
              )}
            </div>
          );

          return (
            <div key={step.id} className='flex items-center'>
              {isLocked ? (
                <div className='cursor-not-allowed opacity-60'>
                  {StepContent}
                </div>
              ) : (
                <Link
                  href={step.href}
                  className='hover:opacity-80 transition-all duration-200'
                >
                  {StepContent}
                </Link>
              )}
            </div>
          );
        })}
      </div>

      {/* Mobile Step Indicator */}
      {/* <div className='md:hidden flex items-center justify-center mb-4 px-4'>
        {steps.map((step, index) => {
          const status = getStepStatus(step.id, index);
          const isLocked = status === 'locked';
          const isCurrent = status === 'current';
          const isCompleted = status === 'completed';

          const StepContent = (
            <div
              className={cn(
                'flex items-center',
                index < steps.length - 1 ? 'flex-1' : 'flex-0'
              )}
            >
              <div
                className={cn(
                  'w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium transition-colors shadow-lg',
                  {
                    'bg-vineyard-500 text-white': isCurrent,
                    'bg-vineyard-600 text-white': isCompleted,
                    'bg-gray-300 text-gray-500': isLocked,
                    'bg-gray-200 text-gray-500': status === 'available',
                  }
                )}
              >
                {isCompleted ? (
                  <Check className='w-3 h-3' />
                ) : isLocked ? (
                  <Lock className='w-3 h-3' />
                ) : (
                  index + 1
                )}
              </div>
              {index < steps.length - 1 && (
                <div
                  className={cn('flex-1 h-0.5 mx-1', {
                    'bg-vineyard-500': isCompleted,
                    'bg-gray-200': !isCompleted,
                  })}
                />
              )}
            </div>
          );

          return (
            <div key={step.id} className='flex items-center'>
              {isLocked ? (
                <div className='cursor-not-allowed opacity-60'>
                  {StepContent}
                </div>
              ) : (
                <Link
                  href={step.href}
                  className='hover:opacity-80 transition-all duration-200'
                >
                  {StepContent}
                </Link>
              )}
            </div>
          );
        })}
      </div> */}

      <div className='text-center px-4'>
        <p className='text-sm sm:text-base text-gray-600 font-medium'>
          Step {steps.findIndex((step) => step.id === currentStep) + 1} of{' '}
          {steps.length}: {steps.find((step) => step.id === currentStep)?.title}
        </p>
      </div>

      {/* Step Validation Message */}
      {currentStep === 'lunch' && trip.vineyards.length === 0 && (
        <div className='text-center text-sm text-amber-600 bg-amber-50 border border-amber-200 rounded-lg p-3 mt-4'>
          Please select at least one vineyard first to access the lunch step.
        </div>
      )}

      {currentStep === 'review' && trip.vineyards.length === 0 && (
        <div className='text-center text-sm text-amber-600 bg-amber-50 border border-amber-200 rounded-lg p-3 mt-4'>
          Please select at least one vineyard first to access the review step.
        </div>
      )}

      {currentStep === 'plan' && trip.vineyards.length === 0 && (
        <div className='text-center text-sm text-amber-600 bg-amber-50 border border-amber-200 rounded-lg p-3 mt-4'>
          Please select at least one vineyard first to access the plan step.
        </div>
      )}
    </div>
  );
}
