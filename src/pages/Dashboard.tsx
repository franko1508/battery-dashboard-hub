
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { BatteryMetricsCards } from '@/components/dashboard/BatteryMetricsCards';
import { BatteryChart } from '@/components/dashboard/BatteryChart';
import { RemoteDesktopControl } from '@/components/dashboard/RemoteDesktopControl';
import { generateData } from '@/utils/batteryData';
import { useToast } from "@/components/ui/use-toast";
import { useState, useEffect } from 'react';

const Dashboard = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [data, setData] = useState(generateData(24));
  const [isLoading, setIsLoading] = useState(false);

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Remote System Management</h1>
          <Button variant="secondary" onClick={logout}>
            Logout
          </Button>
        </div>

        {isLoading && (
          <div className="text-center py-4">
            <p>Loading data...</p>
          </div>
        )}

        <BatteryMetricsCards data={data} />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <BatteryChart data={data} />
          <RemoteDesktopControl systemType="raspberry-pi" />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
