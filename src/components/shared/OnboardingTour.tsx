import { useState, useEffect } from 'react';
import { X, ChevronRight, ChevronLeft, LayoutDashboard, Box, Lightbulb, Bell } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

const steps = [
  { icon: LayoutDashboard, titleKey: 'onboarding.step1.title', descKey: 'onboarding.step1.desc' },
  { icon: Box, titleKey: 'onboarding.step2.title', descKey: 'onboarding.step2.desc' },
  { icon: Lightbulb, titleKey: 'onboarding.step3.title', descKey: 'onboarding.step3.desc' },
  { icon: Bell, titleKey: 'onboarding.step4.title', descKey: 'onboarding.step4.desc' },
];

export default function OnboardingTour() {
  const [isVisible, setIsVisible] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const { t } = useLanguage();

  useEffect(() => {
    const hasSeenTour = localStorage.getItem('smap-onboarding-complete');
    if (!hasSeenTour) {
      setIsVisible(true);
    }
  }, []);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleFinish = () => {
    setIsVisible(false);
  };

  const handleSkip = () => {
    setIsVisible(false);
  };

  if (!isVisible) return null;

  const StepIcon = steps[currentStep].icon;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-surface-900/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden">
        <div className="bg-gradient-to-br from-primary-500 to-primary-600 p-8 text-white relative">
          <button
            onClick={handleSkip}
            className="absolute top-4 right-4 p-1 hover:bg-white/20 rounded-lg transition-colors"
            aria-label={t('onboarding.skip')}
          >
            <X className="w-5 h-5" />
          </button>
          <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mb-4">
            <StepIcon className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold">{t('onboarding.welcome')}</h2>
        </div>

        <div className="p-6">
          <div className="flex gap-2 mb-6">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`h-1.5 flex-1 rounded-full transition-colors ${
                  index <= currentStep ? 'bg-primary-500' : 'bg-surface-200'
                }`}
              />
            ))}
          </div>

          <div className="min-h-[120px]">
            <h3 className="text-lg font-semibold text-surface-900 mb-2">
              {t(steps[currentStep].titleKey)}
            </h3>
            <p className="text-surface-600">
              {t(steps[currentStep].descKey)}
            </p>
          </div>

          <div className="flex items-center justify-between mt-6 pt-4 border-t border-surface-100">
            <button
              onClick={handleSkip}
              className="text-surface-500 hover:text-surface-700 text-sm transition-colors"
            >
              {t('onboarding.skip')}
            </button>
            <div className="flex gap-2">
              {currentStep > 0 && (
                <button
                  onClick={handlePrev}
                  className="flex items-center gap-1 px-4 py-2 text-surface-600 hover:bg-surface-100 rounded-lg transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                  {t('onboarding.prev')}
                </button>
              )}
              {currentStep < steps.length - 1 ? (
                <button
                  onClick={handleNext}
                  className="flex items-center gap-1 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
                >
                  {t('onboarding.next')}
                  <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={handleFinish}
                  className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
                >
                  {t('onboarding.finish')}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
