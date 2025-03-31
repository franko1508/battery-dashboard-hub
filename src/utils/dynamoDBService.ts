import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, ScanCommand } from "@aws-sdk/lib-dynamodb";
import { BatteryData } from "@/types/battery";
import { AWS_CONFIG } from "./awsConfig";
import { format, parseISO } from "date-fns";

// Initialize the DynamoDB client
const client = new DynamoDBClient({
  region: AWS_CONFIG.region,
  credentials: AWS_CONFIG.credentials
});

const docClient = DynamoDBDocumentClient.from(client);

export async function fetchBatteryData(): Promise<BatteryData[]> {
  try {
    // Using Scan operation since we're getting all items
    // In a production app, you'd use Query for better performance
    const command = new ScanCommand({
      TableName: AWS_CONFIG.tableName,
      // You might want to add a filter expression if you need to filter data
    });

    const response = await docClient.send(command);
    
    if (!response.Items || response.Items.length === 0) {
      console.warn("No data returned from DynamoDB");
      return [];
    }

    // Map DynamoDB items to BatteryData format
    const batteryData: BatteryData[] = response.Items.map(item => ({
      // Assuming key_2 is the timestamp field
      time: item.key_2 || new Date().toISOString(),
      soc: item.soc || null,
      soh: item.soh || null,
      socPredicted: item.socPredicted || null,
      sohPredicted: item.sohPredicted || null,
    }));

    // Sort by timestamp
    return batteryData.sort((a, b) => {
      const dateA = new Date(a.time).getTime();
      const dateB = new Date(b.time).getTime();
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
  const currentData: BatteryData[] = Array.from({ length: points }, (_, i) => ({
    time: format(subHours(now, points - i - 1), "yyyy-MM-dd'T'HH:mm:ss"),
    soc: Math.floor(Math.random() * (100 - 60) + 60),
    soh: Math.floor(Math.random() * (100 - 80) + 80),
    socPredicted: null,
    sohPredicted: null,
  }));

  const predictions: BatteryData[] = Array.from({ length: 12 }, (_, i) => ({
    time: format(addHours(now, i + 1), "yyyy-MM-dd'T'HH:mm:ss"),
    soc: null,
    soh: null,
    socPredicted: Math.floor(Math.random() * (100 - 50) + 50),
    sohPredicted: Math.floor(Math.random() * (100 - 75) + 75),
  }));

  return [...currentData, ...predictions];
};
