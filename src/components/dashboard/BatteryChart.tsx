import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { BatteryData } from "@/types/battery";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { CalendarIcon } from "lucide-react";
import { format, differenceInDays, isWithinInterval, startOfDay, endOfDay, parseISO } from "date-fns";
import { DateRange } from "react-day-picker";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

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

  const [date, setDate] = useState<DateRange | undefined>();
  const [swapAxes, setSwapAxes] = useState(false);

  const toggleMetric = (metric: keyof typeof visibleMetrics) => {
    setVisibleMetrics(prev => ({
      ...prev,
      [metric]: !prev[metric]
    }));
  };

  const filteredData = useMemo(() => {
    if (!data.length) return [];
    
    let processedData = [...data];
    
    if (date?.from) {
      const from = startOfDay(date.from);
      const to = date.to ? endOfDay(date.to) : endOfDay(date.from);
      const daysDifference = differenceInDays(to, from);

      processedData = data.filter(item => {
        try {
          const itemDate = parseISO(item.time);
          return isWithinInterval(itemDate, { start: from, end: to });
        } catch (e) {
          console.error("Invalid date format:", item.time, e);
          return false;
        }
      });

      processedData = processedData.map(item => {
        try {
          const itemDate = parseISO(item.time);
          let formattedTime;

          if (daysDifference === 0) {
            formattedTime = format(itemDate, 'HH:mm');
          } else if (daysDifference <= 7) {
            formattedTime = format(itemDate, 'HH:mm');
          } else if (daysDifference <= 31) {
            formattedTime = format(itemDate, 'dd');
          } else {
            formattedTime = format(itemDate, 'MMM');
          }

          return {
            ...item,
            displayTime: formattedTime,
          };
        } catch (e) {
          console.error("Error formatting date:", item.time, e);
          return {
            ...item,
            displayTime: item.time,
          };
        }
      });
    } else {
      processedData = processedData.map(item => ({
        ...item,
        displayTime: item.time.includes('T') 
          ? format(parseISO(item.time), 'HH:mm') 
          : item.time,
      }));
    }

    return processedData;
  }, [data, date]);

  return (
    <Card className="col-span-1">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Battery Metrics Over Time</CardTitle>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="justify-start text-left font-normal"
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date?.from ? (
                  date.to ? (
                    <>
                      {format(date.from, "LLL dd, y")} -{" "}
                      {format(date.to, "LLL dd, y")}
                    </>
                  ) : (
                    format(date.from, "LLL dd, y")
                  )
                ) : (
                  <span>Pick a date range</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={date?.from}
                selected={date}
                onSelect={setDate}
                numberOfMonths={2}
              />
            </PopoverContent>
          </Popover>
        </div>
        
        <div className="flex justify-between items-center mt-2">
          <div className="flex items-center space-x-2">
            <Switch
              id="axes-toggle"
              checked={swapAxes}
              onCheckedChange={setSwapAxes}
            />
            <Label htmlFor="axes-toggle">
              {swapAxes ? "SOC/SOH on X-axis" : "Time on X-axis"}
            </Label>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-4 mt-2">
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="soc" 
              checked={visibleMetrics.soc}
              onCheckedChange={() => toggleMetric('soc')}
            />
            <label htmlFor="soc" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              Actual SOC (%)
            </label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="soh" 
              checked={visibleMetrics.soh}
              onCheckedChange={() => toggleMetric('soh')}
            />
            <label htmlFor="soh" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              Actual SOH (%)
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
          {swapAxes ? (
            <LineChart 
              data={filteredData}
              layout="vertical"
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" domain={[0, 100]} />
              <YAxis dataKey="displayTime" type="category" />
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
                  stroke="#FFDEE2" 
                  name="Predicted SOC (%)" 
                  strokeWidth={2}
                />
              )}
              {visibleMetrics.sohPredicted && (
                <Line 
                  type="monotone" 
                  dataKey="sohPredicted" 
                  stroke="#DC2626" 
                  name="Predicted SOH (%)" 
                  strokeWidth={2}
                />
              )}
            </LineChart>
          ) : (
            <LineChart data={filteredData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="displayTime" />
              <YAxis domain={[0, 100]} />
              <Tooltip />
              <Legend />
              {visibleMetrics.soc && (
                <Line 
                  type="monotone" 
                  dataKey="soc" 
                  stroke="#60A5FA" 
                  name="Actual SOC (%)" 
                  strokeWidth={2}
                  connectNulls={true}
                />
              )}
              {visibleMetrics.soh && (
                <Line 
                  type="monotone" 
                  dataKey="soh" 
                  stroke="#34D399" 
                  name="Actual SOH (%)" 
                  strokeWidth={2}
                  connectNulls={true}
                />
              )}
              {visibleMetrics.socPredicted && (
                <Line 
                  type="monotone" 
                  dataKey="socPredicted" 
                  stroke="#FFDEE2" 
                  name="Predicted SOC (%)" 
                  strokeWidth={2}
                  connectNulls={true}
                />
              )}
              {visibleMetrics.sohPredicted && (
                <Line 
                  type="monotone" 
                  dataKey="sohPredicted" 
                  stroke="#DC2626" 
                  name="Predicted SOH (%)" 
                  strokeWidth={2}
                  connectNulls={true}
                />
              )}
            </LineChart>
          )}
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};
