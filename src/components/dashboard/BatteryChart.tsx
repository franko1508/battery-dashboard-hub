import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { BatteryData } from "@/types/battery";

interface BatteryChartProps {
  data: BatteryData[];
}

export const BatteryChart = ({ data }: BatteryChartProps) => {
  return (
    <Card className="col-span-1">
      <CardHeader>
        <CardTitle>Battery Metrics Over Time</CardTitle>
      </CardHeader>
      <CardContent className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="time" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="soc" 
              stroke="#60A5FA" 
              name="SOC (%)" 
              strokeWidth={2}
            />
            <Line 
              type="monotone" 
              dataKey="soh" 
              stroke="#34D399" 
              name="SOH (%)" 
              strokeWidth={2}
            />
            <Line 
              type="monotone" 
              dataKey="socPredicted" 
              stroke="#60A5FA" 
              strokeDasharray="5 5" 
              name="Predicted SOC (%)" 
            />
            <Line 
              type="monotone" 
              dataKey="sohPredicted" 
              stroke="#34D399" 
              strokeDasharray="5 5" 
              name="Predicted SOH (%)" 
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};