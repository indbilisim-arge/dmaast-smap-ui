import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
  LabelList,
} from 'recharts';
import { useRole } from '../../contexts/RoleContext';
import { Truck, Package, Clock, MapPin, AlertCircle, CheckCircle, ArrowUpRight } from 'lucide-react';
import Header from '../../components/layout/Header';
import HelpPopover from '../../components/shared/HelpPopover';
import FilterBar from '../../components/shared/FilterBar';
import KpiCard from '../../components/shared/KpiCard';
import type { KpiData } from '../../types';

const logisticsKpis: KpiData[] = [
  {
    id: 'delivery-accuracy',
    label: 'Delivery Accuracy',
    value: 96.8,
    unit: '%',
    trend: 1.5,
    target: 98,
    cluster: 'delivery',
    sparklineData: [93, 94, 94.5, 95, 95.5, 96, 96.5, 96.8],
  },
  {
    id: 'avg-transit-time',
    label: 'Avg Transit Time',
    value: 2.3,
    unit: 'days',
    trend: -0.4,
    target: 2.0,
    cluster: 'delivery',
    sparklineData: [3.0, 2.8, 2.7, 2.6, 2.5, 2.4, 2.3, 2.3],
  },
  {
    id: 'fleet-utilization',
    label: 'Fleet Utilization',
    value: 87.2,
    unit: '%',
    trend: 3.1,
    target: 90,
    cluster: 'cost',
    sparklineData: [80, 82, 83, 84, 85, 86, 87, 87.2],
  },
  {
    id: 'transport-cost',
    label: 'Transport Cost',
    value: 12.4,
    unit: '€/unit',
    trend: -2.1,
    target: 10,
    cluster: 'cost',
    sparklineData: [15, 14.5, 14, 13.5, 13, 12.8, 12.5, 12.4],
  },
];

const shipmentData = [
  { status: 'In Transit', count: 234, color: 'bg-blue-500' },
  { status: 'Delivered', count: 1847, color: 'bg-green-500' },
  { status: 'Pending', count: 89, color: 'bg-amber-500' },
  { status: 'Delayed', count: 23, color: 'bg-red-500' },
];

const transitTimeData = [
  { route: 'Route A', time: 1.8, target: 2.0 },
  { route: 'Route B', time: 2.5, target: 2.0 },
  { route: 'Route C', time: 1.9, target: 2.0 },
  { route: 'Route D', time: 2.8, target: 2.0 },
  { route: 'Route E', time: 2.1, target: 2.0 },
];

const volumeTrendData = [
  { date: 'Mon', inbound: 450, outbound: 420 },
  { date: 'Tue', inbound: 520, outbound: 480 },
  { date: 'Wed', inbound: 480, outbound: 510 },
  { date: 'Thu', inbound: 550, outbound: 530 },
  { date: 'Fri', inbound: 620, outbound: 580 },
  { date: 'Sat', inbound: 380, outbound: 350 },
  { date: 'Sun', inbound: 220, outbound: 200 },
];

const activeShipments = [
  { id: 'SHP-2851', destination: 'Munich DC', eta: '2h 15m', status: 'on-time', progress: 75 },
  { id: 'SHP-2852', destination: 'Berlin DC', eta: '4h 30m', status: 'on-time', progress: 45 },
  { id: 'SHP-2853', destination: 'Hamburg Port', eta: '1h 45m', status: 'delayed', progress: 82 },
  { id: 'SHP-2854', destination: 'Frankfurt Hub', eta: '3h 00m', status: 'on-time', progress: 60 },
  { id: 'SHP-2855', destination: 'Stuttgart DC', eta: '5h 20m', status: 'at-risk', progress: 30 },
];

export default function LogisticsDT() {
  const { role } = useRole();
  const isOperator = role === 'operator';

  return (
    <div className="min-h-screen">
      <Header
        title="Logistics Digital Twin"
        subtitle="Transportation and distribution monitoring"
      />
      <FilterBar showRoleSelector={false} />

      <div className="p-6 space-y-6">
        <div className="grid grid-cols-4 gap-4">
          {logisticsKpis.map((kpi) => (
            <KpiCard key={kpi.id} kpi={kpi} />
          ))}
        </div>

        <div className="grid grid-cols-4 gap-4">
          {shipmentData.map((item) => (
            <div key={item.status} className="bg-white rounded-xl shadow-card p-4">
              <div className="flex items-center justify-between mb-3">
                <span className={`w-3 h-3 rounded-full ${item.color}`} />
                <span className="text-xs text-surface-500">{item.status}</span>
              </div>
              <div className="text-3xl font-bold text-surface-900">{item.count}</div>
              <div className="text-sm text-surface-500 mt-1">shipments</div>
            </div>
          ))}
        </div>

        {!isOperator && (
        <div className="grid grid-cols-3 gap-6">
          <div className="col-span-2 bg-white rounded-xl shadow-card p-5">
            <h3 className="font-semibold text-surface-900 mb-4">Volume Trend</h3>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={volumeTrendData} margin={{ top: 10, right: 20, bottom: 5, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="#737373" />
                  <YAxis tick={{ fontSize: 12 }} stroke="#737373" width={40} />
                  <Tooltip />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="inbound"
                    stackId="1"
                    stroke="#0066b3"
                    fill="#0066b3"
                    fillOpacity={0.6}
                    name="Inbound"
                  />
                  <Area
                    type="monotone"
                    dataKey="outbound"
                    stackId="2"
                    stroke="#2a9d8f"
                    fill="#2a9d8f"
                    fillOpacity={0.6}
                    name="Outbound"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-card p-5">
            <h3 className="font-semibold text-surface-900 mb-4">Route Performance</h3>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={transitTimeData} layout="vertical" margin={{ top: 5, right: 20, bottom: 5, left: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />
                  <XAxis type="number" tick={{ fontSize: 12 }} stroke="#737373" domain={[0, 4]} />
                  <YAxis dataKey="route" type="category" tick={{ fontSize: 11 }} stroke="#737373" width={55} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="time" fill="#0066b3" name="Time (days)" radius={[0, 4, 4, 0]}>
                    <LabelList position="right" fontSize={10} fill="#333" />
                  </Bar>
                  <Bar dataKey="target" fill="#d4d4d4" name="Target (days)" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
        )}

        <div className="bg-white rounded-xl shadow-card p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-surface-900">Active Shipments</h3>
              <HelpPopover
                text="Monitor real-time logistics data including delivery accuracy, route performance, and active shipments. Status indicators show each shipment's current state — In Transit, Delayed, or Delivered."
                linkTo="/help"
                linkLabel="Logistics DT guide"
                position="bottom-right"
              />
            </div>
            <button className="text-sm text-primary-600 hover:text-primary-700 flex items-center gap-1">
              View All <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-surface-200">
                  <th className="text-left py-3 px-4 text-sm font-medium text-surface-600">Shipment ID</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-surface-600">Destination</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-surface-600">ETA</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-surface-600">Status</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-surface-600">Progress</th>
                </tr>
              </thead>
              <tbody>
                {activeShipments.map((shipment) => (
                  <tr key={shipment.id} className="border-b border-surface-100 hover:bg-surface-50">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <Truck className="w-4 h-4 text-surface-400" />
                        <span className="font-medium text-surface-900">{shipment.id}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-surface-400" />
                        <span className="text-surface-700">{shipment.destination}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-surface-400" />
                        <span className="text-surface-700">{shipment.eta}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`badge ${
                        shipment.status === 'on-time' ? 'badge-success' :
                        shipment.status === 'delayed' ? 'badge-critical' :
                        'badge-warning'
                      }`}>
                        {shipment.status === 'on-time' ? 'On Time' :
                         shipment.status === 'delayed' ? 'Delayed' : 'At Risk'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-2 bg-surface-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              shipment.status === 'on-time' ? 'bg-green-500' :
                              shipment.status === 'delayed' ? 'bg-red-500' :
                              'bg-amber-500'
                            }`}
                            style={{ width: `${shipment.progress}%` }}
                          />
                        </div>
                        <span className="text-sm text-surface-600 w-10">{shipment.progress}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
