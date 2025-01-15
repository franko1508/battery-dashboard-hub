import { BatteryData } from "@/types/battery";

export const generateData = (points: number): BatteryData[] => {
  const currentData: BatteryData[] = Array.from({ length: points }, (_, i) => ({
    time: `${i}h`,
    soc: Math.floor(Math.random() * (100 - 60) + 60),
    soh: Math.floor(Math.random() * (100 - 80) + 80),
    socPredicted: null,
    sohPredicted: null,
  }));

  const predictions: BatteryData[] = Array.from({ length: 12 }, (_, i) => ({
    time: `${points + i}h`,
    soc: null,
    soh: null,
    socPredicted: Math.floor(Math.random() * (100 - 50) + 50),
    sohPredicted: Math.floor(Math.random() * (100 - 75) + 75),
  }));

  return [...currentData, ...predictions];
};