
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, ScanCommand, PutCommand } from "@aws-sdk/lib-dynamodb";
import { BatteryData } from "@/types/battery";
import { AWS_CONFIG } from "./awsConfig";
import { format, parseISO, subHours, addHours } from "date-fns";

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
    });

    const response = await docClient.send(command);
    
    if (!response.Items || response.Items.length === 0) {
      console.warn("No data returned from DynamoDB");
      return [];
    }

    // Map DynamoDB items to BatteryData format using the correct field names
    const batteryData: BatteryData[] = response.Items.map(item => ({
      // Use key_2 or Time for the timestamp field
      time: item.key_2 || item.Time || new Date().toISOString(),
      // Use Actual SOC for soc
      soc: item["Actual SOC"] ? parseFloat(item["Actual SOC"]) : null,
      // Use Actual SOH for soh
      soh: item["Actual SOH"] ? parseFloat(item["Actual SOH"]) : null,
      // Use Predicted SOC for socPredicted
      socPredicted: item["Predicted SOC"] ? parseFloat(item["Predicted SOC"]) : null,
      // Use Predicted SOH for sohPredicted
      sohPredicted: item["Predicted SOH"] ? parseFloat(item["Predicted SOH"]) : null,
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

/**
 * Upload control state to DynamoDB
 * @param isEnabled Boolean indicating if the control is ON (true) or OFF (false)
 * @returns Promise that resolves when upload is complete
 */
export async function uploadControlState(isEnabled: boolean): Promise<void> {
  try {
    const timestamp = new Date().toISOString();
    const value = isEnabled ? "1" : "0";
    
    console.log(`[DynamoDB] Uploading control state: ${value} at ${timestamp}`);
    
    // Create the item to be stored in DynamoDB
    const item = {
      // Use timestamp as a unique identifier
      id: timestamp,
      timestamp: timestamp,
      controlValue: value,
      // Add any additional metadata you want to store
      source: "web-dashboard"
    };
    
    // Using PutCommand to insert a new item
    const command = new PutCommand({
      TableName: "UserControl", // Using the UserControl table
      Item: item,
    });
    
    await docClient.send(command);
    console.log("[DynamoDB] Control state uploaded successfully");
    
    return;
  } catch (error) {
    console.error("[DynamoDB] Error uploading control state:", error);
    throw error;
  }
}
