
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Battery, Brain } from "lucide-react";
import { BatteryData } from "@/types/battery";

interface BatteryMetricsCardsProps {
  data: BatteryData[];
}

export const BatteryMetricsCards = ({ data }: BatteryMetricsCardsProps) => {
  // Safely get current data and predictions with fallbacks
  const currentData = data && data.length > 0 ? data[0] : { soc: null, soh: null, time: '' };
  const predictions = data && data.length > 0 ? data[data.length - 1] : { socPredicted: null, sohPredicted: null, time: '' };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">State of Charge</CardTitle>
          <Battery className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{currentData.soc ?? 'N/A'}%</div>
          <div className="text-sm text-muted-foreground">
            Predicted in 12h: {predictions.socPredicted ?? 'N/A'}%
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">State of Health</CardTitle>
          <Battery className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{currentData.soh ?? 'N/A'}%</div>
          <div className="text-sm text-muted-foreground">
            Predicted in 12h: {predictions.sohPredicted ?? 'N/A'}%
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">AI Predictions</CardTitle>
          <Brain className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground">
            Next 12 hours forecast available
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
