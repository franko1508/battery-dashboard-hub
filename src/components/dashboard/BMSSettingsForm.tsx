import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { useToast } from "@/components/ui/use-toast";
import { BMSSettings } from "@/types/battery";

export const BMSSettingsForm = () => {
  const { toast } = useToast();
  const form = useForm<BMSSettings>({
    defaultValues: {
      maxVoltage: "4.2",
      minVoltage: "3.0",
      maxTemperature: "45",
      maxChargeCurrent: "10",
      maxDischargeCurrent: "20",
    },
  });

  const onSubmit = (data: BMSSettings) => {
    console.log('BMS Settings:', data);
    toast({
      title: "Settings Updated",
      description: "BMS settings have been successfully updated.",
    });
  };

  return (
    <Card className="col-span-1">
      <CardHeader>
        <CardTitle>BMS Settings</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="maxVoltage"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Maximum Voltage (V)</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.1" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="minVoltage"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Minimum Voltage (V)</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.1" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="maxTemperature"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Maximum Temperature (°C)</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="maxChargeCurrent"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Maximum Charge Current (A)</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.1" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="maxDischargeCurrent"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Maximum Discharge Current (A)</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.1" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full">
              Save BMS Settings
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};