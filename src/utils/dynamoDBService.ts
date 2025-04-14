import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, ScanCommand } from "@aws-sdk/lib-dynamodb";
import { BatteryData } from "@/types/battery";
import { AWS_CONFIG } from "./awsConfig";
import { format, parseISO, subHours, addHours } from "date-fns";

// Initialize the DynamoDB client
const client = new DynamoDBClient({
  region: AWS_CONFIG.region,
  credentials: AWS_CONFIG.credentials
});

const docClient = DynamoDBDocumentClient.from(client);

// Helper function to parse the timestamp format "Wed Feb 7 16:34:30 EST 2024"
const parseTimestamp = (timestamp: string): Date => {
  // If it's already in ISO format, use parseISO
  if (timestamp.includes('T')) {
    return parseISO(timestamp);
  }
  
  // Parse the custom format
  return new Date(timestamp);
};

export async function fetchBatteryData(): Promise<BatteryData[]> {
  try {
    const command = new ScanCommand({
      TableName: AWS_CONFIG.tableName,
    });

    const response = await docClient.send(command);
    
    if (!response.Items || response.Items.length === 0) {
      console.warn("No data returned from DynamoDB");
      return [];
    }

    // Map DynamoDB items to BatteryData format
    const batteryData: BatteryData[] = response.Items.map(item => ({
      time: item.key_2 || item.Time || new Date().toISOString(),
      soc: item["Actual SOC"] ? parseFloat(item["Actual SOC"]) : null,
      soh: item["Actual SOH"] ? parseFloat(item["Actual SOH"]) : null,
      socPredicted: item["Predicted SOC"] ? parseFloat(item["Predicted SOC"]) : null,
      sohPredicted: item["Predicted SOH"] ? parseFloat(item["Predicted SOH"]) : null,
    }));

    // Sort by timestamp, using the custom parser
    return batteryData.sort((a, b) => {
      const dateA = parseTimestamp(a.time).getTime();
      const dateB = parseTimestamp(b.time).getTime();
      return dateA - dateB;
    });
  } catch (error) {
    console.error("Error fetching data from DynamoDB:", error);
    throw error;
  }
}

// Fallback function that generates mock data if DynamoDB fetch fails
export const generateFallbackData = (points: number): BatteryData[] => {
  const now = new Date();
  // Generate historical data points
  const currentData: BatteryData[] = Array.from({ length: points }, (_, i) => {
    const pointTime = format(subHours(now, points - i - 1), "yyyy-MM-dd'T'HH:mm:ss");
    const socValue = Math.floor(Math.random() * (100 - 60) + 60);
    const sohValue = Math.floor(Math.random() * (100 - 80) + 80);
    
    return {
      time: pointTime,
      soc: socValue,
      soh: sohValue,
      // Add predictions for the same historical points
      socPredicted: socValue + (Math.random() * 6 - 3), // slight variation for visual difference
      sohPredicted: sohValue + (Math.random() * 4 - 2), // slight variation for visual difference
    };
  });

  // Generate future predictions (where actual values are null)
  const predictions: BatteryData[] = Array.from({ length: 12 }, (_, i) => ({
    time: format(addHours(now, i + 1), "yyyy-MM-dd'T'HH:mm:ss"),
    soc: null,
    soh: null,
    socPredicted: Math.floor(Math.random() * (100 - 50) + 50),
    sohPredicted: Math.floor(Math.random() * (100 - 75) + 75),
  }));

  return [...currentData, ...predictions];
};
