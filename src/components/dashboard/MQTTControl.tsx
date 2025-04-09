
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { uploadControlState } from '@/utils/dynamoDBService';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, CheckCircle2 } from "lucide-react";
import { AWS_CONFIG } from '@/utils/awsConfig';

// Rename component to better reflect its new purpose
export const MQTTControl = () => {
  const [isEnabled, setIsEnabled] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [lastSentValue, setLastSentValue] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleSendToDb = async () => {
    try {
      setIsSending(true);
      setError(null);
      
      // Upload the current toggle state to DynamoDB
      await uploadControlState(isEnabled);
      
      // Update the last sent value
      setLastSentValue(isEnabled ? "1" : "0");
      
      toast({
        title: "Data Uploaded",
        description: `Control state "${isEnabled ? 'ON' : 'OFF'}" saved to DynamoDB.`,
      });
    } catch (error) {
      console.error("Failed to upload to DynamoDB:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to upload to DynamoDB";
      setError(errorMessage);
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Control Panel
          <div className="flex items-center gap-2 text-sm font-normal">
            <CheckCircle2 className="h-4 w-4 text-green-500" />
            <span>DynamoDB Upload</span>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center space-x-2">
          <Switch 
            id="control-toggle" 
            checked={isEnabled}
            onCheckedChange={setIsEnabled}
            disabled={isSending}
          />
          <Label htmlFor="control-toggle">
            {isEnabled ? "ON" : "OFF"}
          </Label>
        </div>

        {lastSentValue && (
          <div className="text-sm text-muted-foreground">
            Last sent value: <span className="font-medium">{lastSentValue === "1" ? "ON" : "OFF"}</span>
          </div>
        )}

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Button 
          onClick={handleSendToDb}
          disabled={isSending}
          className="w-full"
        >
          {isSending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Uploading...
            </>
          ) : (
            "Save to DynamoDB"
          )}
        </Button>

        <div className="text-xs text-muted-foreground">
          <p>Table: UserControl</p>
          <p>Region: {AWS_CONFIG.region}</p>
        </div>
      </CardContent>
    </Card>
  );
};
