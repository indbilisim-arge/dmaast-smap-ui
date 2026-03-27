import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LanguageProvider } from './contexts/LanguageContext';
import { ToastProvider } from './contexts/ToastContext';
import { RoleProvider } from './contexts/RoleContext';
import { AccessibilityProvider } from './contexts/AccessibilityContext';
import { ComponentVisibilityProvider } from './contexts/ComponentVisibilityContext';
import Layout from './components/layout/Layout';
import ProtectedRoute from './components/routing/ProtectedRoute';
import Dashboard from './pages/Dashboard';
import ValueChainDT from './pages/digital-twin/ValueChainDT';
import ManufacturingDT from './pages/digital-twin/ManufacturingDT';
import LogisticsDT from './pages/digital-twin/LogisticsDT';
import ProductDT from './pages/digital-twin/ProductDT';
import SustainabilityDT from './pages/digital-twin/SustainabilityDT';
import ValueChainSim from './pages/decision-support/ValueChainSim';
import ManufacturingSim from './pages/decision-support/ManufacturingSim';
import MODSS from './pages/decision-support/MODSS';
import SchedulingAssessment from './pages/decision-support/SchedulingAssessment';
import AlertCenter from './pages/AlertCenter';
import HelpCenter from './pages/HelpCenter';
import TerminologyDictionary from './pages/TerminologyDictionary';
import AdminPanel from './pages/AdminPanel';
import OnboardingTour from './components/shared/OnboardingTour';
import QuickAccess from './components/shared/QuickAccess';

export default function App() {
  return (
    <AccessibilityProvider>
      <LanguageProvider>
        <ToastProvider>
          <RoleProvider>
            <ComponentVisibilityProvider>
            <BrowserRouter>
              <OnboardingTour />
              <Routes>
                <Route path="/" element={<Layout />}>
                  <Route index element={<Dashboard />} />

                  {/* Layer 2: Cognitive Digital Twins (CDT) - value-chain/manufacturing/logistics/product tüm roller */}
                  <Route path="digital-twin">
                    <Route index element={<Navigate to="/digital-twin/value-chain" replace />} />
                    <Route path="value-chain" element={<ValueChainDT />} />
                    <Route path="value-chain-sim" element={<ProtectedRoute permission="canAccessCDTSimulations"><ValueChainSim /></ProtectedRoute>} />
                    <Route path="manufacturing" element={<ManufacturingDT />} />
                    <Route path="manufacturing-sim" element={<ProtectedRoute permission="canAccessCDTSimulations"><ManufacturingSim /></ProtectedRoute>} />
                    <Route path="logistics" element={<LogisticsDT />} />
                    <Route path="product" element={<ProductDT />} />
                  </Route>

                  {/* Layer 3: MO-DSS - Operator erişemez */}
                  <Route path="decision-support">
                    <Route index element={<Navigate to="/decision-support/mo-dss" replace />} />
                    <Route path="mo-dss" element={<ProtectedRoute permission="canAccessMODSS"><MODSS /></ProtectedRoute>} />
                    <Route path="scheduling" element={<ProtectedRoute permission="canAccessMODSS"><SchedulingAssessment /></ProtectedRoute>} />
                  </Route>

                  {/* Sustainability - Operator erişemez */}
                  <Route path="sustainability" element={<ProtectedRoute permission="canAccessSustainability"><SustainabilityDT /></ProtectedRoute>} />

                  <Route path="alerts" element={<AlertCenter />} />
                  <Route path="terminology" element={<TerminologyDictionary />} />
                  <Route path="help" element={<HelpCenter />} />
                  <Route path="admin" element={<ProtectedRoute permission="canManageRoles"><AdminPanel /></ProtectedRoute>} />

                  {/* Backward-compatibility redirects */}
                  <Route path="decision-support/value-chain-sim" element={<Navigate to="/digital-twin/value-chain-sim" replace />} />
                  <Route path="decision-support/manufacturing-sim" element={<Navigate to="/digital-twin/manufacturing-sim" replace />} />
                  <Route path="digital-twin/sustainability" element={<Navigate to="/sustainability" replace />} />
                </Route>
              </Routes>
              <QuickAccess />
            </BrowserRouter>
            </ComponentVisibilityProvider>
          </RoleProvider>
        </ToastProvider>
      </LanguageProvider>
    </AccessibilityProvider>
  );
}
