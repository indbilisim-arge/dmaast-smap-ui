import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface AccessibilitySettings {
  liteMode: boolean;
  highContrast: boolean;
  reducedMotion: boolean;
  fontSize: 'normal' | 'large' | 'xlarge';
  colorBlindMode: 'none' | 'deuteranopia' | 'protanopia' | 'tritanopia';
}

interface AccessibilityContextType {
  settings: AccessibilitySettings;
  toggleLiteMode: () => void;
  toggleHighContrast: () => void;
  toggleReducedMotion: () => void;
  setFontSize: (size: AccessibilitySettings['fontSize']) => void;
  setColorBlindMode: (mode: AccessibilitySettings['colorBlindMode']) => void;
  resetSettings: () => void;
}

const defaultSettings: AccessibilitySettings = {
  liteMode: false,
  highContrast: false,
  reducedMotion: false,
  fontSize: 'normal',
  colorBlindMode: 'none',
};

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined);

export function AccessibilityProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<AccessibilitySettings>(() => {
    const saved = localStorage.getItem('smap-accessibility');
    if (saved) {
      try {
        return { ...defaultSettings, ...JSON.parse(saved) };
      } catch {
        return defaultSettings;
      }
    }
    return defaultSettings;
  });

  useEffect(() => {
    localStorage.setItem('smap-accessibility', JSON.stringify(settings));

    const html = document.documentElement;

    if (settings.liteMode) {
      html.classList.add('lite-mode');
    } else {
      html.classList.remove('lite-mode');
    }

    if (settings.highContrast) {
      html.classList.add('high-contrast');
    } else {
      html.classList.remove('high-contrast');
    }

    if (settings.reducedMotion) {
      html.classList.add('reduce-motion');
    } else {
      html.classList.remove('reduce-motion');
    }

    html.setAttribute('data-font-size', settings.fontSize);

    html.classList.remove('cb-deuteranopia', 'cb-protanopia', 'cb-tritanopia');
    if (settings.colorBlindMode !== 'none') {
      html.classList.add(`cb-${settings.colorBlindMode}`);
    }
  }, [settings]);

  const toggleLiteMode = () => {
    setSettings(prev => ({ ...prev, liteMode: !prev.liteMode }));
  };

  const toggleHighContrast = () => {
    setSettings(prev => ({ ...prev, highContrast: !prev.highContrast }));
  };

  const toggleReducedMotion = () => {
    setSettings(prev => ({ ...prev, reducedMotion: !prev.reducedMotion }));
  };

  const setFontSize = (fontSize: AccessibilitySettings['fontSize']) => {
    setSettings(prev => ({ ...prev, fontSize }));
  };

  const setColorBlindMode = (colorBlindMode: AccessibilitySettings['colorBlindMode']) => {
    setSettings(prev => ({ ...prev, colorBlindMode }));
  };

  const resetSettings = () => {
    setSettings(defaultSettings);
  };

  return (
    <AccessibilityContext.Provider
      value={{
        settings,
        toggleLiteMode,
        toggleHighContrast,
        toggleReducedMotion,
        setFontSize,
        setColorBlindMode,
        resetSettings,
      }}
    >
      {children}
    </AccessibilityContext.Provider>
  );
}

export function useAccessibility() {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error('useAccessibility must be used within an AccessibilityProvider');
  }
  return context;
}

function ToggleSwitch({ checked, onChange, label }: { checked: boolean; onChange: () => void; label: string }) {
  return (
    <button
      onClick={onChange}
      className={`relative w-12 h-6 rounded-full transition-colors ${checked ? 'bg-primary-500' : 'bg-surface-300'}`}
      role="switch"
      aria-checked={checked}
      aria-label={label}
    >
      <span
        className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${checked ? 'translate-x-6' : ''}`}
      />
    </button>
  );
}

const colorBlindOptions: { value: AccessibilitySettings['colorBlindMode']; label: string; description: string; swatches: string[] }[] = [
  {
    value: 'none',
    label: 'None',
    description: 'Standard colors',
    swatches: ['#ef4444', '#10b981', '#3b82f6', '#f59e0b'],
  },
  {
    value: 'deuteranopia',
    label: 'Deuteranopia',
    description: 'Red-green (most common)',
    swatches: ['#ee7700', '#0077bb', '#3b82f6', '#f59e0b'],
  },
  {
    value: 'protanopia',
    label: 'Protanopia',
    description: 'Red-green (no red)',
    swatches: ['#ddaa33', '#0077bb', '#33bbee', '#aa3377'],
  },
  {
    value: 'tritanopia',
    label: 'Tritanopia',
    description: 'Blue-yellow',
    swatches: ['#cc3311', '#009988', '#ee3377', '#332288'],
  },
];

export function AccessibilityPanelContent() {
  const { settings, toggleLiteMode, toggleHighContrast, toggleReducedMotion, setFontSize, setColorBlindMode, resetSettings } = useAccessibility();

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="font-medium text-surface-900">Lite Mode</p>
          <p className="text-sm text-surface-500">Larger text, less information density</p>
        </div>
        <ToggleSwitch checked={settings.liteMode} onChange={toggleLiteMode} label="Toggle Lite Mode" />
      </div>

      <div className="flex items-center justify-between">
        <div>
          <p className="font-medium text-surface-900">High Contrast</p>
          <p className="text-sm text-surface-500">Enhanced color contrast for low vision</p>
        </div>
        <ToggleSwitch checked={settings.highContrast} onChange={toggleHighContrast} label="Toggle High Contrast" />
      </div>

      <div className="flex items-center justify-between">
        <div>
          <p className="font-medium text-surface-900">Reduce Motion</p>
          <p className="text-sm text-surface-500">Minimize animations and transitions</p>
        </div>
        <ToggleSwitch checked={settings.reducedMotion} onChange={toggleReducedMotion} label="Toggle Reduce Motion" />
      </div>

      <div>
        <p className="font-medium text-surface-900 mb-2">Font Size</p>
        <div className="flex gap-2">
          {(['normal', 'large', 'xlarge'] as const).map(size => (
            <button
              key={size}
              onClick={() => setFontSize(size)}
              className={`px-4 py-2 text-sm rounded-lg transition-colors ${
                settings.fontSize === size
                  ? 'bg-primary-500 text-white'
                  : 'bg-surface-100 text-surface-600 hover:bg-surface-200'
              }`}
            >
              {size === 'normal' ? 'A' : size === 'large' ? 'A+' : 'A++'}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="font-medium text-surface-900 mb-1">Color Blind Mode</p>
        <p className="text-sm text-surface-500 mb-3">Adjusts UI and chart colors for color vision deficiencies</p>
        <div className="grid grid-cols-2 gap-2">
          {colorBlindOptions.map(opt => (
            <button
              key={opt.value}
              onClick={() => setColorBlindMode(opt.value)}
              className={`text-left p-3 rounded-lg border-2 transition-colors ${
                settings.colorBlindMode === opt.value
                  ? 'border-primary-500 bg-primary-50'
                  : 'border-surface-200 hover:border-surface-300 hover:bg-surface-50'
              }`}
            >
              <div className="flex gap-1 mb-2">
                {opt.swatches.map((color, i) => (
                  <span
                    key={i}
                    className="w-5 h-5 rounded-sm inline-block"
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
              <p className={`text-sm font-medium ${settings.colorBlindMode === opt.value ? 'text-primary-700' : 'text-surface-900'}`}>
                {opt.label}
              </p>
              <p className="text-xs text-surface-500 mt-0.5">{opt.description}</p>
            </button>
          ))}
        </div>
      </div>

      <button
        onClick={resetSettings}
        className="w-full px-4 py-2 text-sm text-surface-600 hover:bg-surface-100 rounded-lg border border-surface-200 transition-colors"
      >
        Reset to Defaults
      </button>
    </div>
  );
}

export function AccessibilityPanel() {
  return (
    <div className="bg-white rounded-xl shadow-card p-6">
      <h3 className="text-lg font-semibold text-surface-900 mb-5">Accessibility Settings</h3>
      <AccessibilityPanelContent />
    </div>
  );
}
