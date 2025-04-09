
import { useState, useRef, ChangeEvent, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { 
  sendMQTTMessage, 
  disconnectMQTT, 
  subscribeToStatus,
  type ConnectionStatus 
} from '@/utils/mqttService';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, WifiOff, Wifi, AlertTriangle, CheckCircle2 } from "lucide-react";

export const MQTTControl = () => {
  const [isEnabled, setIsEnabled] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [lastSentValue, setLastSentValue] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('disconnected');
  const [files, setFiles] = useState<{
    rootCA: File | null;
    clientCert: File | null;
    privateKey: File | null;
  }>({
    rootCA: null,
    clientCert: null,
    privateKey: null,
  });
  const { toast } = useToast();
  
  // Refs for file inputs
  const rootCARef = useRef<HTMLInputElement>(null);
  const clientCertRef = useRef<HTMLInputElement>(null);
  const privateKeyRef = useRef<HTMLInputElement>(null);

  // Subscribe to connection status changes
  useEffect(() => {
    const unsubscribe = subscribeToStatus(setConnectionStatus);
    return () => {
      unsubscribe();
      disconnectMQTT();
    };
  }, []);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>, fileType: 'rootCA' | 'clientCert' | 'privateKey') => {
    if (event.target.files && event.target.files.length > 0) {
      setFiles(prev => ({
        ...prev,
        [fileType]: event.target.files![0]
      }));
      
      toast({
        title: "File uploaded",
        description: `${event.target.files[0].name} has been added.`,
      });
    }
  };

  const handleSendMessage = async () => {
    try {
      setIsSending(true);
      setError(null);
      
      // Send the toggle state value (1 for ON, 0 for OFF)
      const value = isEnabled ? "1" : "0";
      
      // Send to the specific topic
      await sendMQTTMessage("sdk/test/java", value, files);
      
      setLastSentValue(value);
      
      toast({
        title: "Message Sent",
        description: `Value ${value} sent to sdk/test/java`,
      });
    } catch (error) {
      console.error("Failed to send MQTT message:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to send MQTT message";
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

  const getStatusIcon = () => {
    switch (connectionStatus) {
      case 'connected':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'connecting':
        return <Loader2 className="h-4 w-4 animate-spin text-yellow-500" />;
      case 'reconnecting':
        return <Loader2 className="h-4 w-4 animate-spin text-yellow-500" />;
      case 'error':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'disconnected':
      default:
        return <WifiOff className="h-4 w-4 text-slate-400" />;
    }
  };

  const getStatusText = () => {
    switch (connectionStatus) {
      case 'connected':
        return "Connected to AWS IoT";
      case 'connecting':
        return "Connecting...";
      case 'reconnecting':
        return "Reconnecting...";
      case 'error':
        return "Connection error";
      case 'disconnected':
      default:
        return "Disconnected";
    }
  };

  const areAllFilesUploaded = files.rootCA && files.clientCert && files.privateKey;
  const isDisabled = isSending || connectionStatus === 'connecting' || connectionStatus === 'reconnecting';

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          MQTT Control
          <div className="flex items-center gap-2 text-sm font-normal">
            {getStatusIcon()}
            <span>{getStatusText()}</span>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center space-x-2">
          <Switch 
            id="mqtt-toggle" 
            checked={isEnabled}
            onCheckedChange={setIsEnabled}
            disabled={isDisabled}
          />
          <Label htmlFor="mqtt-toggle">
            {isEnabled ? "ON" : "OFF"}
          </Label>
        </div>

        {lastSentValue && (
          <div className="text-sm text-muted-foreground">
            Last sent value: <span className="font-medium">{lastSentValue === "1" ? "ON" : "OFF"}</span>
          </div>
        )}

        <div className="space-y-2">
          <h3 className="text-sm font-medium">Certificate Files</h3>
          
          <div className="space-y-1">
            <Label htmlFor="root-ca">Root CA Certificate</Label>
            <Input 
              id="root-ca" 
              type="file" 
              ref={rootCARef}
              onChange={(e) => handleFileChange(e, 'rootCA')}
              accept=".crt,.pem"
              disabled={isDisabled}
            />
            {files.rootCA && (
              <p className="text-xs text-muted-foreground">{files.rootCA.name}</p>
            )}
          </div>
          
          <div className="space-y-1">
            <Label htmlFor="client-cert">Client Certificate</Label>
            <Input 
              id="client-cert" 
              type="file" 
              ref={clientCertRef}
              onChange={(e) => handleFileChange(e, 'clientCert')}
              accept=".pem,.cert"
              disabled={isDisabled}
            />
            {files.clientCert && (
              <p className="text-xs text-muted-foreground">{files.clientCert.name}</p>
            )}
          </div>
          
          <div className="space-y-1">
            <Label htmlFor="private-key">Private Key</Label>
            <Input 
              id="private-key" 
              type="file" 
              ref={privateKeyRef}
              onChange={(e) => handleFileChange(e, 'privateKey')}
              accept=".key"
              disabled={isDisabled}
            />
            {files.privateKey && (
              <p className="text-xs text-muted-foreground">{files.privateKey.name}</p>
            )}
          </div>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Button 
          onClick={handleSendMessage}
          disabled={!areAllFilesUploaded || isDisabled}
          className="w-full"
        >
          {isSending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Sending...
            </>
          ) : (
            "Send"
          )}
        </Button>

        <div className="text-xs text-muted-foreground">
          <p>Connected to: aatjr0tj00iej-ats.iot.us-east-1.amazonaws.com</p>
          <p>Topic: sdk/test/java</p>
        </div>
      </CardContent>
    </Card>
  );
};
