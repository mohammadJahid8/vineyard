'use client';

import { cn } from '@/lib/utils';
import Link from 'next/link';

interface StepperProps {
  steps: {
    id: string;
    title: string;
    href: string;
  }[];
  currentStep: string;
}

export function Stepper({ steps, currentStep }: StepperProps) {
  return (
    <div className='w-full py-4'>
      <div className='max-w-4xl mx-auto px-4'>
        {/* Tab Navigation */}
        <div className='flex border-b border-gray-200'>
          {steps.map((step) => {
            const isCurrent = step.id === currentStep;

            return (
              <Link
                key={step.id}
                href={step.href}
                className={cn(
                  'flex-1 px-4 py-3 text-center font-medium text-sm transition-all duration-200 border-b-2 hover:text-vineyard-600',
                  {
                    'text-vineyard-600 border-vineyard-500 bg-vineyard-50/50':
                      isCurrent,
                    'text-gray-500 border-transparent hover:border-vineyard-300':
                      !isCurrent,
                  }
                )}
              >
                {step.title}
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
