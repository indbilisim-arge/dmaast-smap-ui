import { useState, ReactNode, createContext, useContext } from 'react';
import { ChevronLeft, ChevronRight, Check, RotateCcw } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

interface WizardStep {
  id: string;
  title: string;
  description?: string;
  content: ReactNode;
  isValid?: boolean;
}

interface WizardContextType {
  currentStep: number;
  totalSteps: number;
  goToStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  isFirstStep: boolean;
  isLastStep: boolean;
}

const WizardContext = createContext<WizardContextType | undefined>(undefined);

export function useWizard() {
  const context = useContext(WizardContext);
  if (!context) {
    throw new Error('useWizard must be used within a Wizard');
  }
  return context;
}

interface WizardProps {
  steps: WizardStep[];
  onComplete: () => void;
  onCancel?: () => void;
  onReset?: () => void;
  title?: string;
}

export default function Wizard({ steps, onComplete, onCancel, onReset, title }: WizardProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const { t } = useLanguage();

  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === steps.length - 1;
  const currentStepData = steps[currentStep];
  const progress = ((currentStep + 1) / steps.length) * 100;

  const goToStep = (step: number) => {
    if (step >= 0 && step < steps.length) {
      setCurrentStep(step);
    }
  };

  const nextStep = () => {
    if (!isLastStep) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const prevStep = () => {
    if (!isFirstStep) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleComplete = () => {
    onComplete();
  };

  const contextValue: WizardContextType = {
    currentStep,
    totalSteps: steps.length,
    goToStep,
    nextStep,
    prevStep,
    isFirstStep,
    isLastStep,
  };

  return (
    <WizardContext.Provider value={contextValue}>
      <div className="bg-white rounded-xl shadow-card overflow-hidden">
        {title && (
          <div className="px-6 py-4 border-b border-surface-200">
            <h2 className="text-lg font-semibold text-surface-900">{title}</h2>
          </div>
        )}

        <div className="px-6 py-4 border-b border-surface-200">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-surface-700">
              Step {currentStep + 1} of {steps.length}
            </span>
            <span className="text-sm text-surface-500">{Math.round(progress)}%</span>
          </div>

          <div className="h-2 bg-surface-100 rounded-full overflow-hidden" role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100}>
            <div
              className="h-full bg-primary-500 transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="flex items-center gap-2 mt-4">
            {steps.map((step, index) => (
              <button
                key={step.id}
                onClick={() => index <= currentStep && goToStep(index)}
                disabled={index > currentStep}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors ${
                  index === currentStep
                    ? 'bg-primary-100 text-primary-700 font-medium'
                    : index < currentStep
                    ? 'bg-green-100 text-green-700 cursor-pointer hover:bg-green-200'
                    : 'bg-surface-100 text-surface-400 cursor-not-allowed'
                }`}
                aria-current={index === currentStep ? 'step' : undefined}
              >
                {index < currentStep ? (
                  <Check className="w-4 h-4" />
                ) : (
                  <span className="w-5 h-5 rounded-full bg-current/20 flex items-center justify-center text-xs">
                    {index + 1}
                  </span>
                )}
                <span className="hidden sm:inline">{step.title}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="p-6">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-surface-900">{currentStepData.title}</h3>
            {currentStepData.description && (
              <p className="text-sm text-surface-600 mt-1">{currentStepData.description}</p>
            )}
          </div>

          <div className="min-h-[200px]">
            {currentStepData.content}
          </div>
        </div>

        <div className="px-6 py-4 border-t border-surface-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {onCancel && (
              <button
                onClick={onCancel}
                className="px-4 py-2 text-sm text-surface-600 hover:text-surface-900 transition-colors"
              >
                Cancel
              </button>
            )}
            {onReset && (
              <button
                onClick={() => {
                  onReset();
                  setCurrentStep(0);
                }}
                className="flex items-center gap-1.5 px-3 py-2 text-sm text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Reset
              </button>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={prevStep}
              disabled={isFirstStep}
              className={`flex items-center gap-2 px-4 py-2 text-sm rounded-lg transition-colors ${
                isFirstStep
                  ? 'text-surface-400 cursor-not-allowed'
                  : 'text-surface-700 hover:bg-surface-100'
              }`}
            >
              <ChevronLeft className="w-4 h-4" />
              {t('onboarding.prev')}
            </button>

            {isLastStep ? (
              <button
                onClick={handleComplete}
                disabled={currentStepData.isValid === false}
                className="flex items-center gap-2 px-4 py-2 text-sm bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Check className="w-4 h-4" />
                Complete
              </button>
            ) : (
              <button
                onClick={nextStep}
                disabled={currentStepData.isValid === false}
                className="flex items-center gap-2 px-4 py-2 text-sm bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {t('onboarding.next')}
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </WizardContext.Provider>
  );
}
