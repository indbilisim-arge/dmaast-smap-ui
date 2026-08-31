import { Leaf } from 'lucide-react';
import PlannedModule from '../../components/shared/PlannedModule';

export default function SustainabilityDT() {
  return (
    <PlannedModule
      icon={Leaf}
      title="Sustainability Digital Twin"
      heading="Sustainability Assessment"
      reason="Planned — environmental indicators (energy, carbon, water, waste) require MES/SCADA/IoT sources outside the current ERP integration scope."
    />
  );
}
