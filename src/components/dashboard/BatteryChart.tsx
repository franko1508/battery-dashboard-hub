import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { BatteryData } from "@/types/battery";
import { Checkbox } from "@/components/ui/checkbox";

interface BatteryChartProps {
  data: BatteryData[];
}

export const BatteryChart = ({ data }: BatteryChartProps) => {
  const [visibleMetrics, setVisibleMetrics] = useState({
    soc: true,
    soh: true,
    socPredicted: true,
    sohPredicted: true,
  });

  const toggleMetric = (metric: keyof typeof visibleMetrics) => {
    setVisibleMetrics(prev => ({
      ...prev,
      [metric]: !prev[metric]
    }));
  };

  return (
    <Card className="col-span-1">
      <CardHeader>
        <CardTitle>Battery Metrics Over Time</CardTitle>
        <div className="flex flex-wrap gap-4 mt-2">
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="soc" 
              checked={visibleMetrics.soc}
              onCheckedChange={() => toggleMetric('soc')}
            />
            <label htmlFor="soc" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              SOC (%)
            </label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="soh" 
              checked={visibleMetrics.soh}
              onCheckedChange={() => toggleMetric('soh')}
            />
            <label htmlFor="soh" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              SOH (%)
            </label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="socPredicted" 
              checked={visibleMetrics.socPredicted}
              onCheckedChange={() => toggleMetric('socPredicted')}
            />
            <label htmlFor="socPredicted" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              Predicted SOC (%)
            </label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="sohPredicted" 
              checked={visibleMetrics.sohPredicted}
              onCheckedChange={() => toggleMetric('sohPredicted')}
            />
            <label htmlFor="sohPredicted" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              Predicted SOH (%)
            </label>
          </div>
        </div>
      </CardHeader>
      <CardContent className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="time" />
            <YAxis />
            <Tooltip />
            <Legend />
            {visibleMetrics.soc && (
              <Line 
                type="monotone" 
                dataKey="soc" 
                stroke="#60A5FA" 
                name="SOC (%)" 
                strokeWidth={2}
              />
            )}
            {visibleMetrics.soh && (
              <Line 
                type="monotone" 
                dataKey="soh" 
                stroke="#34D399" 
                name="SOH (%)" 
                strokeWidth={2}
              />
            )}
            {visibleMetrics.socPredicted && (
              <Line 
                type="monotone" 
                dataKey="socPredicted" 
                stroke="#60A5FA" 
                strokeDasharray="5 5" 
                name="Predicted SOC (%)" 
              />
            )}
            {visibleMetrics.sohPredicted && (
              <Line 
                type="monotone" 
                dataKey="sohPredicted" 
                stroke="#34D399" 
                strokeDasharray="5 5" 
                name="Predicted SOH (%)" 
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};