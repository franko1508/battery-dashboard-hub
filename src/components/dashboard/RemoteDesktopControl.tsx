
import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { useToast } from "@/components/ui/use-toast";
import { Monitor, Power, MousePointer, Keyboard, Cpu } from "lucide-react";
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
  const vncScreen = useRef<HTMLDivElement>(null);
  const rfbRef = useRef<any>(null);
  
  const defaultHost = systemType === 'raspberry-pi' ? 'raspberrypi.local' : 'localhost';
  
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
    
    try {
      // Create websockified URL (requires a websockify proxy running on the server)
      const wsUrl = `ws://${config.host}:${config.port}`;
      
      // Disconnect any existing connection
      if (rfbRef.current) {
        rfbRef.current.disconnect();
      }
      
      // Initialize VNC connection
      if (vncScreen.current) {
        // Clear the container first
        vncScreen.current.innerHTML = '';
        
        // Create new RFB connection
        rfbRef.current = new RFB(vncScreen.current, wsUrl, {
          credentials: { password: config.password },
          wsProtocols: ['binary'],
        });
        
        // Set up event handlers
        rfbRef.current.addEventListener('connect', () => {
          setConnected(true);
          setConnecting(false);
          toast({
            title: "Connected",
            description: `Successfully connected to ${config.host}:${config.port}`,
          });
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
    }
  };

  // Clean up on unmount
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
          {systemType === 'raspberry-pi' ? (
            <><Cpu className="h-5 w-5" /> Raspberry Pi Remote Control</>
          ) : (
            <><Monitor className="h-5 w-5" /> Remote Desktop Control</>
          )}
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
                  <FormLabel>Raspberry Pi IP Address or Hostname</FormLabel>
                  <FormControl>
                    <Input placeholder="raspberrypi.local" disabled={connected} {...field} />
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
                    <Input type="password" placeholder="Required for Raspberry Pi VNC" disabled={connected} {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
            
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
          className={`mt-4 border rounded-md overflow-hidden ${connected ? 'h-64' : 'h-0'}`}
        ></div>
        
        {!connected && systemType === 'raspberry-pi' && (
          <div className="mt-4 text-sm text-muted-foreground">
            <p className="mb-2">Setup VNC on your Raspberry Pi:</p>
            <ol className="list-decimal pl-5 space-y-1">
              <li>Enable VNC: <code>sudo raspi-config</code> → Interface Options → VNC → Enable</li>
              <li>Install websockify: <code>sudo apt install websockify</code></li>
              <li>Run VNC Server: <code>vncserver :1</code> (first time will prompt for password)</li>
              <li>Start proxy: <code>websockify 5900 localhost:5901</code></li>
              <li>Find your Pi's IP: <code>hostname -I</code> or use <code>raspberrypi.local</code> with mDNS</li>
            </ol>
          </div>
        )}
        
        {!connected && systemType === 'generic' && (
          <div className="mt-4 text-sm text-muted-foreground">
            <p className="mb-2">Quick Setup for Ubuntu:</p>
            <ol className="list-decimal pl-5 space-y-1">
              <li>Install VNC server: <code>sudo apt install tigervnc-standalone-server</code></li>
              <li>Set a VNC password: <code>vncpasswd</code></li>
              <li>Start VNC server: <code>vncserver :1</code></li>
              <li>Run websockify: <code>websockify 5900 localhost:5901</code></li>
            </ol>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
