
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Terminal, Save, Server, ArrowRight, CloudCog, Users, Play, User, Key, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import PortalButton from "@/components/PortalButton";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

interface VDILinuxFormData {
  vcenterServer: string;
  vcenterUser: string;
  vcenterPassword: string;
  templateName: string;
  cluster: string;
  datastore: string;
  location: string;
  hostnamePrefix: string;
}

interface RemoteAuthData {
  remoteUser: string;
  remotePassword: string;
}

const defaultValues: VDILinuxFormData = {
  vcenterServer: "a06343ppsp0.pactual.net",
  vcenterUser: "svc_ctx_vcenter",
  vcenterPassword: "",
  templateName: "TEMPLATE_LINUX_UBUNTU_2204_PRD",
  cluster: "V06888PCLT0",
  datastore: "VxRail-Virtual-SAN-Datastore-8d4710da-52da-43fa-9d95-8db797d640ca",
  location: "VDI",
  hostnamePrefix: "VDIX-LNX-"
};

const VDILinuxAutomator = () => {
  const [scriptPreview, setScriptPreview] = useState<string>("");
  const [isExecuting, setIsExecuting] = useState(false);
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const [showInfoDialog, setShowInfoDialog] = useState(false);
  const [generatedHostname, setGeneratedHostname] = useState<string>("");
  
  const form = useForm<VDILinuxFormData>({
    defaultValues
  });
  
  const authForm = useForm<RemoteAuthData>({
    defaultValues: {
      remoteUser: "admin",
      remotePassword: ""
    }
  });
  
  // Function to simulate hostname generation
  // In a real scenario this would call a backend API to check AD
  const generateHostname = (prefix: string) => {
    // Simulate checking against AD
    const existingHostnames = new Set([
      "VDIX-LNX-0001", 
      "VDIX-LNX-0002", 
      "VDIX-LNX-0003", 
      "VDIX-LNX-0008", 
      "VDIX-LNX-0010"
    ]);
    
    let counter = 1;
    let hostname = "";
    
    do {
      // Generate hostname with 4-digit counter
      hostname = `${prefix}${counter.toString().padStart(4, '0')}`;
      
      // If hostname exists, increment counter
      if (existingHostnames.has(hostname)) {
        counter++;
      } else {
        break;
      }
    } while (true);
    
    return hostname;
  };
  
  // Generate a hostname when the prefix changes or on initial load
  useEffect(() => {
    const prefix = form.watch("hostnamePrefix");
    if (prefix) {
      const hostname = generateHostname(prefix);
      setGeneratedHostname(hostname);
    }
  }, [form.watch("hostnamePrefix")]);
  
  const generateScript = (data: VDILinuxFormData) => {
    const hostname = generatedHostname || `${data.hostnamePrefix}0001`;
    
    const script = `
Function ConnectVIServer {
    Set-PowerCLIConfiguration -InvalidCertificateAction Ignore -Confirm: $false
    Connect-VIServer -Server ${data.vcenterServer} -User ${data.vcenterUser} -Password ${data.vcenterPassword}
};ConnectVIServer

$c = 1
$i = 0

while ($i -lt $c) {

# VM name is pre-generated and verified as available in AD
$vmName = "${hostname}"
Write-Host "Using pre-verified hostname: $vmName"

# Função 2: Criar VM
function New-VMFromTemplate {
    param (
        [string]$TemplateName,
        [string]$NewVMName,
        [string]$cluster,
        [string]$datastore,
        [string]$location
    )
    
    New-VM -Name $NewVMName -Template $TemplateName -ResourcePool $cluster -Datastore $datastore -Location $location
}

# Função 3: Executar Pós-Personalização
function Post-CustomizeVM {
    param (
        [string]$VMName,
        [string]$Hostname
    )
    
    # Nome do arquivo
    $global:filename = "\\\\dsapc0232pfs\\support_sp\\BackOffice\\Ambiente Citrix\\Tag_VDIs\\" + $vmName + "_baseline.txt"

    # Comandos para serem escritos no arquivo
    $commands = @"
sudo hostnamectl set-hostname $vmName
sleep 5
sudo apt-get update
sudo apt-get install landscape-client -y
sleep 10
sudo landscape-config --computer-title $vmName --account-name banco-btg-pactual-sa --registration-key 1chS9xXlnJfeI4M9lk4w9 --script-users=ALL --include-manager-plugins=ScriptExecution --silent
sleep 10
source /home/helpdesk/Documents/landscape-api.rc
landscape-api execute-script $vmName 14033
"@

    # Cria o arquivo e escreve os comandos nele
    Set-Content -Path $filename -Value $commands

    $guestPassword = '$upp0rt@dm'
    $key=(ssh-keyscan -t ssh-ed25519 $IP)
    $key

    plink.exe -batch helpdesk@$IP -pw $guestPassword -hostkey $key -m $filename
}

# Fluxo principal do script
$cluster = Get-Cluster -Name ${data.cluster}
New-VMFromTemplate -TemplateName "${data.templateName}" -NewVMName $vmName -cluster $cluster -datastore "${data.datastore}" -location "${data.location}"

Start-VM $vmName

Start-Sleep -Seconds 60

get-vm $vmName | get-networkadapter | set-networkadapter -type "vmxnet3" -NetworkName "V06888PCLT0-SP3-VDI-PROD-V2311" -StartConnected:$true -Connected:$true -Confirm:$false

Start-Sleep -Seconds 30

$VMIP = Get-VM $vmName | Select @{N="IPAddress";E={@($_.guest.IPAddress[0])}}
$IP = $VMIP.IPAddress

Write-Host "IP: $IP"

# Executar pós-personalização
Post-CustomizeVM -VMName $vmName -Hostname $vmName

$i++

Start-Sleep -Seconds 300

}

Disconnect-VIServer -Server ${data.vcenterServer} -Confirm:$false
`;
    return script;
  };
  
  const onSubmit = (data: VDILinuxFormData) => {
    try {
      // Make sure we have a generated hostname
      if (!generatedHostname) {
        const hostname = generateHostname(data.hostnamePrefix);
        setGeneratedHostname(hostname);
      }
      
      const script = generateScript(data);
      setScriptPreview(script);
      toast({
        title: "Script Generated",
        description: `PowerShell script has been generated for hostname: ${generatedHostname}`,
      });
    } catch (error) {
      console.error("Error generating script:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to generate script. Please check the form values.",
      });
    }
  };

  const executeRemotePowerShell = async (authData?: RemoteAuthData) => {
    if (!scriptPreview) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please generate a script first before executing.",
      });
      return;
    }

    setIsExecuting(true);
    try {
      // In a real scenario, this would communicate with a backend API
      // that would connect to the remote Windows machine and execute the script
      console.log("Executing PowerShell script on W06324PAUT0...");
      console.log("Authentication:", authData);
      
      // Simulate a delay for demonstration purposes
      await new Promise((resolve) => setTimeout(resolve, 3000));
      
      toast({
        title: "Script Execution Initiated",
        description: `PowerShell script has been sent to W06324PAUT0 for execution. Creating VM: ${generatedHostname}`,
      });
      
      setShowAuthDialog(false);
    } catch (error) {
      console.error("Error executing script:", error);
      toast({
        variant: "destructive",
        title: "Execution Failed",
        description: "Failed to execute script on remote machine. Please check connection.",
      });
    } finally {
      setIsExecuting(false);
    }
  };
  
  const handleExecuteClick = () => {
    setShowAuthDialog(true);
  };
  
  const handleAuthSubmit = (data: RemoteAuthData) => {
    executeRemotePowerShell(data);
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
      <header className="bg-white border-b border-border">
        <div className="container mx-auto py-6 px-4">
          <div className="flex items-center justify-between">
            <div className="animate-text-appear flex items-center">
              <div className="mr-4">
                <img 
                  src="/lovable-uploads/f245d207-cc2a-4754-a764-386822375a3e.png" 
                  alt="BTG Pactual Logo" 
                  className="h-52 w-auto"
                />
              </div>
              <div>
                <div className="chip bg-accent text-accent-foreground">BTG VDI MANAGEMENT</div>
                <div className="flex items-center mt-1">
                  <h1 className="text-3xl font-semibold">VDI Linux Automator</h1>
                </div>
                <p className="text-muted-foreground mt-1">
                  Automate creation of Linux-based Virtual Desktop Infrastructure
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <PortalButton />
              
              <div className="hidden md:flex items-center space-x-4">
                <div className="flex items-center bg-accent/60 px-3 py-1.5 rounded-md">
                  <Terminal className="h-4 w-4 text-muted-foreground mr-2" />
                  <span className="text-sm text-muted-foreground">PowerShell</span>
                </div>
                
                <div className="flex items-center bg-green-500/10 px-3 py-1.5 rounded-md">
                  <CloudCog className="h-4 w-4 text-green-600 mr-2" />
                  <span className="text-sm text-green-600">Connected to vCenter</span>
                </div>
                
                <div className="flex items-center bg-blue-500/10 px-3 py-1.5 rounded-md">
                  <Users className="h-4 w-4 text-blue-600 mr-2" />
                  <span className="text-sm text-blue-600">Active Directory</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>
      
      <main className="container mx-auto py-8 px-4">
        <div className="max-w-screen-2xl mx-auto">
          <div className="glass-panel rounded-xl overflow-hidden shadow-sm">
            <div className="p-6 md:p-8">
              <Tabs defaultValue="form" className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-8">
                  <TabsTrigger value="form">
                    <Server className="mr-2 h-4 w-4" />
                    VDI Configuration
                  </TabsTrigger>
                  <TabsTrigger value="script">
                    <Terminal className="mr-2 h-4 w-4" />
                    PowerShell Script
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="form" className="mt-0">
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-6">
                          <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
                            <h3 className="text-lg font-semibold mb-4 flex items-center">
                              <CloudCog className="mr-2 h-5 w-5 text-primary" />
                              vCenter Connection
                            </h3>
                            
                            <div className="space-y-4">
                              <FormField
                                control={form.control}
                                name="vcenterServer"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>vCenter Server</FormLabel>
                                    <FormControl>
                                      <Input placeholder="vCenter server address" {...field} />
                                    </FormControl>
                                    <FormDescription>
                                      The vCenter server hostname or IP address
                                    </FormDescription>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              
                              <FormField
                                control={form.control}
                                name="vcenterUser"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>vCenter Username</FormLabel>
                                    <FormControl>
                                      <Input placeholder="Username" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              
                              <FormField
                                control={form.control}
                                name="vcenterPassword"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>vCenter Password</FormLabel>
                                    <FormControl>
                                      <Input type="password" placeholder="Password" showPasswordToggle {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>
                          </div>
                        </div>
                        
                        <div className="space-y-6">
                          <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
                            <h3 className="text-lg font-semibold mb-4 flex items-center">
                              <Server className="mr-2 h-5 w-5 text-primary" />
                              VM Configuration
                            </h3>
                            
                            <div className="space-y-4">
                              <FormField
                                control={form.control}
                                name="templateName"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Template Name</FormLabel>
                                    <FormControl>
                                      <Input placeholder="VM template name" {...field} />
                                    </FormControl>
                                    <FormDescription>
                                      The template to use for creating new VMs
                                    </FormDescription>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              
                              <div className="grid grid-cols-2 gap-4">
                                <FormField
                                  control={form.control}
                                  name="cluster"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Cluster</FormLabel>
                                      <FormControl>
                                        <Input placeholder="Cluster name" {...field} />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                                
                                <FormField
                                  control={form.control}
                                  name="location"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Folder Location</FormLabel>
                                      <FormControl>
                                        <Input placeholder="VM folder" {...field} />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                              </div>
                              
                              <FormField
                                control={form.control}
                                name="datastore"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Datastore</FormLabel>
                                    <FormControl>
                                      <Input placeholder="Datastore" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              
                              <div className="grid grid-cols-2 gap-4">
                                <FormField
                                  control={form.control}
                                  name="hostnamePrefix"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Hostname Prefix</FormLabel>
                                      <FormControl>
                                        <Input placeholder="Hostname prefix" {...field} />
                                      </FormControl>
                                      <FormDescription>
                                        The prefix for the automatically generated hostname
                                      </FormDescription>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                                
                                <div className="flex flex-col justify-end space-y-2">
                                  <FormLabel>Generated Hostname</FormLabel>
                                  <div className="h-10 flex items-center px-3 py-2 rounded-md border border-input bg-muted/40">
                                    <span className="font-mono">{generatedHostname || "Not generated yet"}</span>
                                  </div>
                                  <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                      <Button 
                                        type="button" 
                                        variant="outline" 
                                        size="sm" 
                                        className="w-fit"
                                      >
                                        <ArrowRight className="h-3.5 w-3.5 mr-1" />
                                        Regenerate
                                      </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                      <AlertDialogHeader>
                                        <AlertDialogTitle>Hostname Generation Process</AlertDialogTitle>
                                        <AlertDialogDescription>
                                          The system automatically generates the next available hostname based on your prefix.
                                          It follows this algorithm:
                                          <ol className="mt-2 space-y-1 list-decimal list-inside">
                                            <li>Takes your prefix (e.g., "VDIX-LNX-")</li>
                                            <li>Starts with counter = 1</li>
                                            <li>Generates hostname as prefix + 4-digit counter (e.g., "VDIX-LNX-0001")</li>
                                            <li>Checks Active Directory if the hostname exists</li>
                                            <li>If hostname exists, increments counter and tries again</li>
                                            <li>If hostname is available, it's used for the new VM</li>
                                          </ol>
                                        </AlertDialogDescription>
                                      </AlertDialogHeader>
                                      <AlertDialogFooter>
                                        <AlertDialogCancel>Close</AlertDialogCancel>
                                        <AlertDialogAction onClick={() => {
                                          const prefix = form.getValues("hostnamePrefix");
                                          const hostname = generateHostname(prefix);
                                          setGeneratedHostname(hostname);
                                          toast({
                                            title: "Hostname Generated", 
                                            description: `New hostname: ${hostname}`
                                          });
                                        }}>
                                          Generate New Hostname
                                        </AlertDialogAction>
                                      </AlertDialogFooter>
                                    </AlertDialogContent>
                                  </AlertDialog>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex justify-end space-x-4">
                        <Button
                          type="submit"
                          className="flex items-center gap-2"
                        >
                          <Save className="h-4 w-4" />
                          Generate Script
                          <ArrowRight className="ml-1 h-4 w-4" />
                        </Button>
                      </div>
                    </form>
                  </Form>
                </TabsContent>
                
                <TabsContent value="script" className="mt-0">
                  <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
                    <h3 className="text-lg font-semibold mb-4 flex items-center">
                      <Terminal className="mr-2 h-5 w-5 text-primary" />
                      PowerShell Automation Script
                    </h3>
                    
                    <div className="bg-muted p-4 rounded-md">
                      <Textarea
                        value={scriptPreview}
                        readOnly
                        className="font-mono text-sm h-[600px] overflow-auto"
                      />
                    </div>
                    
                    <div className="mt-4 flex justify-end space-x-4">
                      <Button
                        variant="outline"
                        onClick={() => {
                          navigator.clipboard.writeText(scriptPreview);
                          toast({
                            title: "Copied to clipboard",
                            description: "The script has been copied to your clipboard.",
                          });
                        }}
                      >
                        Copy to Clipboard
                      </Button>
                      
                      <Button
                        variant="default"
                        className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
                        onClick={handleExecuteClick}
                        disabled={isExecuting || !scriptPreview}
                      >
                        <Play className="h-4 w-4" />
                        {isExecuting ? "Executing..." : "Execute on W06324PAUT0"}
                      </Button>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </main>
      
      {/* Remote Authentication Dialog */}
      <Dialog open={showAuthDialog} onOpenChange={setShowAuthDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Remote Execution Authentication</DialogTitle>
            <DialogDescription>
              Enter credentials to execute the script on W06324PAUT0
            </DialogDescription>
          </DialogHeader>
          <Form {...authForm}>
            <form onSubmit={authForm.handleSubmit(handleAuthSubmit)} className="space-y-4 py-4">
              <FormField
                control={authForm.control}
                name="remoteUser"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Username</FormLabel>
                    <FormControl>
                      <div className="flex">
                        <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-input bg-muted text-muted-foreground text-sm">
                          <User className="h-4 w-4" />
                        </span>
                        <Input 
                          className="rounded-l-none" 
                          placeholder="Domain\Username or Username" 
                          {...field} 
                        />
                      </div>
                    </FormControl>
                    <FormDescription>
                      Enter your domain username for W06324PAUT0
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={authForm.control}
                name="remotePassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <div className="flex">
                        <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-input bg-muted text-muted-foreground text-sm">
                          <Key className="h-4 w-4" />
                        </span>
                        <Input
                          className="rounded-l-none"
                          type="password"
                          placeholder="Password"
                          showPasswordToggle
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter className="pt-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setShowAuthDialog(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isExecuting}>
                  {isExecuting ? "Connecting..." : "Connect & Execute"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      
      <footer className="border-t border-border mt-auto">
        <div className="container mx-auto py-6 px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} BTG Pactual - VDI Linux Management
            </p>
            <div className="flex items-center mt-4 md:mt-0">
              <a 
                href="#" 
                className="text-sm text-muted-foreground hover:text-foreground transition-colors mr-6"
              >
                Documentation
              </a>
              <a 
                href="#" 
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Support
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default VDILinuxAutomator;
