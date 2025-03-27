
import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { useToast } from "@/components/ui/use-toast";
import { Monitor, Power, MousePointer, Keyboard, Server, AlertTriangle } from "lucide-react";
import { RFB } from "@/utils/vnc-utils";

interface RemoteDesktopConfig {
  host: string;
  port: string;
  password: string;
}

interface RemoteDesktopControlProps {
  systemType?: 'generic' | 'raspberry-pi';
}

export const RemoteDesktopControl = ({ systemType = 'generic' }: RemoteDesktopControlProps) => {
  const { toast } = useToast();
  const [connected, setConnected] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const vncScreen = useRef<HTMLDivElement>(null);
  const rfbRef = useRef<any>(null);
  
  const defaultHost = 'localhost';
  
  const form = useForm<RemoteDesktopConfig>({
    defaultValues: {
      host: defaultHost,
      port: "5900",
      password: "",
    },
  });

  const onSubmit = (data: RemoteDesktopConfig) => {
    if (connected) {
      disconnectVNC();
      return;
    }
    
    connectVNC(data);
  };

  const connectVNC = (config: RemoteDesktopConfig) => {
    setConnecting(true);
    setConnectionError(null);
    
    try {
      // Validate input
      if (!config.host) {
        setConnectionError("Host is required");
        setConnecting(false);
        return;
      }
      
      const wsUrl = `ws://${config.host}:${config.port}`;
      console.log(`Attempting connection to ${wsUrl}`);
      
      if (rfbRef.current) {
        rfbRef.current.disconnect();
      }
      
      if (vncScreen.current) {
        vncScreen.current.innerHTML = '';
        
        rfbRef.current = new RFB(vncScreen.current, wsUrl, {
          credentials: { password: config.password },
          wsProtocols: ['binary'],
        });
        
        rfbRef.current.addEventListener('connect', () => {
          setConnected(true);
          setConnecting(false);
          setConnectionError(null);
          toast({
            title: "Connected",
            description: `Successfully connected to ${config.host}:${config.port}`,
          });
        });
        
        rfbRef.current.addEventListener('error', (e: any) => {
          console.error('VNC error:', e.detail);
          setConnectionError(`Connection error: ${e.detail.message || 'Unknown error'}`);
          setConnecting(false);
        });
        
        rfbRef.current.addEventListener('disconnect', (e: any) => {
          setConnected(false);
          setConnecting(false);
          if (e.detail.clean) {
            toast({
              title: "Disconnected",
              description: "Connection closed",
            });
          } else {
            setConnectionError(`Could not connect to ${config.host}:${config.port}`);
            toast({
              title: "Connection Failed",
              description: `Could not connect to ${config.host}:${config.port}`,
              variant: "destructive",
            });
          }
        });
      }
    } catch (error) {
      console.error("VNC connection error:", error);
      setConnecting(false);
      setConnectionError("Failed to establish VNC connection");
      toast({
        title: "Connection Error",
        description: "Failed to establish VNC connection",
        variant: "destructive",
      });
    }
  };

  const disconnectVNC = () => {
    if (rfbRef.current) {
      rfbRef.current.disconnect();
      rfbRef.current = null;
      setConnected(false);
      setConnectionError(null);
    }
  };

  useEffect(() => {
    return () => {
      if (rfbRef.current) {
        rfbRef.current.disconnect();
      }
    };
  }, []);

  return (
    <Card className="col-span-1">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Server className="h-5 w-5" /> Ubuntu Server Remote Control
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="host"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Server IP Address or Hostname</FormLabel>
                  <FormControl>
                    <Input placeholder={defaultHost} disabled={connected} {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="port"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>VNC Port</FormLabel>
                  <FormControl>
                    <Input disabled={connected} {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>VNC Password</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="VNC Session Password" disabled={connected} {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
            
            {connectionError && (
              <div className="flex items-center gap-2 text-destructive text-sm p-2 bg-destructive/10 rounded">
                <AlertTriangle className="h-4 w-4" />
                <span>{connectionError}</span>
              </div>
            )}
            
            <Button 
              type="submit" 
              className="w-full"
              variant={connected ? "destructive" : "default"}
              disabled={connecting}
            >
              {connecting ? (
                "Connecting..."
              ) : connected ? (
                <span className="flex items-center gap-2"><Power /> Disconnect</span>
              ) : (
                <span className="flex items-center gap-2"><Monitor /> Connect</span>
              )}
            </Button>
          </form>
        </Form>
        
        {connected && (
          <div className="mt-4">
            <div className="flex justify-between text-sm text-muted-foreground mb-2">
              <span className="flex items-center gap-1"><MousePointer className="h-3 w-3" /> Mouse control enabled</span>
              <span className="flex items-center gap-1"><Keyboard className="h-3 w-3" /> Keyboard enabled</span>
            </div>
          </div>
        )}
        
        <div 
          ref={vncScreen} 
          className={`mt-4 border rounded-md overflow-hidden ${connected || connecting ? 'h-64' : 'h-0'}`}
        ></div>
        
        {!connected && !connecting && (
          <div className="mt-4 text-sm text-muted-foreground">
            <p className="mb-2">Ubuntu VNC Setup Options:</p>
            <div className="space-y-4">
              <div>
                <p className="font-medium">Option 1: Share existing display (recommended for desktop environments)</p>
                <ol className="list-decimal pl-5 space-y-1 mt-1">
                  <li>Install x11vnc: <code>sudo apt install x11vnc websockify</code></li>
                  <li>Set a VNC password: <code>x11vnc -storepasswd</code></li>
                  <li>Start sharing your display: <code>x11vnc -display :0 -auth guess -forever -loop -noxdamage -repeat -rfbauth ~/.vnc/passwd -rfbport 5900 -shared</code></li>
                  <li>Start websockify: <code>websockify 5900 localhost:5900</code></li>
                </ol>
              </div>
              
              <div>
                <p className="font-medium">Option 2: Create a new VNC session (better for headless servers)</p>
                <ol className="list-decimal pl-5 space-y-1 mt-1">
                  <li>Install TigerVNC: <code>sudo apt install tigervnc-standalone-server websockify</code></li>
                  <li>Set a VNC password: <code>vncpasswd</code></li>
                  <li>Start a new VNC session: <code>vncserver :1</code></li>
                  <li>Run websockify: <code>websockify 5900 localhost:5901</code></li>
                </ol>
              </div>
              
              <div>
                <p className="text-xs mt-2">Additional tips:</p>
                <ul className="list-disc pl-5 space-y-1 mt-1 text-xs">
                  <li>Find your server's IP: <code>hostname -I</code></li>
                  <li>Allow VNC ports in firewall: <code>sudo ufw allow 5900/tcp</code></li>
                  <li>For VM access, ensure networking is configured to allow connections</li>
                  <li>For secure access, consider setting up an SSH tunnel</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
