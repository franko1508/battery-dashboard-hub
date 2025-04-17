
import * as React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { BatteryMetricsCards } from '@/components/dashboard/BatteryMetricsCards';
import { BatteryChart } from '@/components/dashboard/BatteryChart';
import { RawBatteryChart } from '@/components/dashboard/RawBatteryChart';
import { BatteryStatusCards } from '@/components/dashboard/BatteryStatusCards';
import { ControlToggleCard } from '@/components/dashboard/ControlToggleCard';
import { 
  fetchBatteryData, 
  fetchRawBatteryData, 
  generateFallbackData, 
  generateRawFallbackData 
} from '@/utils/dynamoDBService';
import { useToast } from "@/hooks/use-toast";

const Dashboard = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Query for primary battery data
  const { data, isLoading, isError } = useQuery({
    queryKey: ['batteryData'],
    queryFn: fetchBatteryData,
    placeholderData: generateFallbackData(24),
    meta: {
      onError: (error: Error) => {
        console.error("Failed to fetch data:", error);
        toast({
          title: "Data Fetch Error",
          description: "Could not load data from DynamoDB. Using fallback data.",
          variant: "destructive",
        });
      }
    },
  });

  // Query for raw battery data
  const { 
    data: rawData, 
    isLoading: isRawLoading, 
    isError: isRawError 
  } = useQuery({
    queryKey: ['rawBatteryData'],
    queryFn: fetchRawBatteryData,
    placeholderData: generateRawFallbackData(24),
    meta: {
      onError: (error: Error) => {
        console.error("Failed to fetch raw data:", error);
        toast({
          title: "Raw Data Fetch Error",
          description: "Could not load raw data from DynamoDB. Using fallback data.",
          variant: "destructive",
        });
      }
    },
  });

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Battery Management System</h1>
          <Button variant="secondary" onClick={logout}>
            Logout
          </Button>
        </div>

        {(isLoading || isRawLoading) && (
          <div className="text-center py-4">
            <p>Loading battery data...</p>
          </div>
        )}

        {(isError || isRawError) && (
          <div className="text-center py-4 text-red-500">
            <p>Error loading data. Using fallback data.</p>
          </div>
        )}

        <BatteryStatusCards data={rawData || []} />

        <BatteryMetricsCards data={data || []} />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <BatteryChart data={data || []} />
          <RawBatteryChart data={rawData || []} />
        </div>

        <div className="grid grid-cols-1 gap-6">
          <ControlToggleCard />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
