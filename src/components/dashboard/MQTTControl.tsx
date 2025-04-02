
import { useState, useRef, ChangeEvent } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { sendMQTTMessage } from '@/utils/mqttService';

export const MQTTControl = () => {
  const [isEnabled, setIsEnabled] = useState(false);
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
      // Call the MQTT service with the toggle state value
      const value = isEnabled ? "1" : "0";
      await sendMQTTMessage("sdk/test/java", value, files);
      
      toast({
        title: "Message Sent",
        description: `Value ${value} sent to sdk/test/java`,
      });
    } catch (error) {
      console.error("Failed to send MQTT message:", error);
      toast({
        title: "Error",
        description: "Failed to send MQTT message. Check console for details.",
        variant: "destructive",
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>MQTT Control</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center space-x-2">
          <Switch 
            id="mqtt-toggle" 
            checked={isEnabled}
            onCheckedChange={setIsEnabled}
          />
          <Label htmlFor="mqtt-toggle">
            {isEnabled ? "ON" : "OFF"}
          </Label>
        </div>

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
            />
            {files.privateKey && (
              <p className="text-xs text-muted-foreground">{files.privateKey.name}</p>
            )}
          </div>
        </div>

        <Button 
          onClick={handleSendMessage}
          disabled={!files.rootCA || !files.clientCert || !files.privateKey}
        >
          Send
        </Button>
      </CardContent>
    </Card>
  );
};
