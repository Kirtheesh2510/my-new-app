import React from 'react';
import { KpiCards } from './KpiCards';
import { PriorityAlertsBanner } from './PriorityAlertsBanner';
import { CampusFloorplan } from './CampusFloorplan';
import { WasteDistributionChart } from './WasteDistributionChart';
import { RoomStatusTable } from './RoomStatusTable';

export const OverviewView: React.FC = () => {
  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Urgent Alerts Notification Banner */}
      <PriorityAlertsBanner />

      {/* Main KPI Cards */}
      <KpiCards />

      {/* Interactive 2D Campus Floorplan & Zone Blueprint (Inspired by Image 3) */}
      <CampusFloorplan />

      {/* Energy Waste Distribution & Potential Savings (Inspired by Image 2 & 4) */}
      <WasteDistributionChart />

      {/* Room Status Table with Equipment Toggles & Decision Engine Meter */}
      <RoomStatusTable />
    </div>
  );
};
