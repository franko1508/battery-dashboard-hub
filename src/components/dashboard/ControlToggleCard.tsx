
import * as React from 'react';
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";
import { AWS_CONFIG } from "@/utils/awsConfig";

export const ControlToggleCard = () => {
  const [isOn, setIsOn] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const { toast } = useToast();

  const handleToggleChange = (checked: boolean) => {
    setIsOn(checked);
  };

  const handleSend = async () => {
    setIsSending(true);
    
    try {
      // Initialize the DynamoDB client
      const client = new DynamoDBClient({
        region: AWS_CONFIG.region,
        credentials: AWS_CONFIG.credentials
      });
      
      const docClient = DynamoDBDocumentClient.from(client);
      
      // Prepare the item to be saved
      const controlValue = isOn ? 1 : 0;
      const timestamp = new Date().toISOString();
      
      // Create a command to put the item in the UserControl table
      const command = new PutCommand({
        TableName: "UserControl",
        Item: {
          timestamp,
          controlValue
        },
      });
      
      // Send the command to DynamoDB
      await docClient.send(command);
      
      toast({
        title: "Control Signal Sent",
        description: `Successfully sent control value: ${controlValue}`,
      });
    } catch (error) {
      console.error("Error sending control signal:", error);
      toast({
        title: "Error",
        description: "Failed to send control signal",
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Card className="col-span-1">
      <CardHeader>
        <CardTitle>Control Panel</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between">
          <Label htmlFor="control-toggle" className="text-lg font-medium">
            {isOn ? "On" : "Off"}
          </Label>
          <Switch
            id="control-toggle"
            checked={isOn}
            onCheckedChange={handleToggleChange}
          />
        </div>
        
        <Button 
          className="w-full" 
          onClick={handleSend}
          disabled={isSending}
        >
          {isSending ? "Sending..." : "Send Control Signal"}
        </Button>
      </CardContent>
    </Card>
  );
};
