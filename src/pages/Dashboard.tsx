import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { BatteryMetricsCards } from '@/components/dashboard/BatteryMetricsCards';
import { BatteryChart } from '@/components/dashboard/BatteryChart';
import { BMSSettingsForm } from '@/components/dashboard/BMSSettingsForm';
import { generateData } from '@/utils/batteryData';

const Dashboard = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [data] = useState(generateData(24));

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Battery Management System</h1>
          <Button variant="secondary" onClick={logout}>
            Logout
          </Button>
        </div>

        <BatteryMetricsCards data={data} />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <BatteryChart data={data} />
          <BMSSettingsForm />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;