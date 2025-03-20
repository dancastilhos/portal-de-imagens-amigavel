import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Code2, Cog, Layers, Terminal, Server } from "lucide-react";
import OSSelector from "@/components/OSSelector";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { generateHostname, getOSPrefix } from "@/utils/hostnameGenerator";
import { hostnameDbService } from "@/services/hostnameDatabase";
import { toast } from "sonner";
import { OSType } from "@/lib/types";

const VMwareAutomator = () => {
  const [selectedOS, setSelectedOS] = useState<OSType>("ubuntu22");
  const [vmName, setVmName] = useState<string>("");
  const [isFetching, setIsFetching] = useState<boolean>(false);
  const [environment, setEnvironment] = useState<string>("D");
  const [serverFunction, setServerFunction] = useState<string>("APP");
  const [node, setNode] = useState<string>("0");
  
  const environmentOptions = [
    { value: "U", label: "UAT" },
    { value: "D", label: "DEVELOPMENT" },
    { value: "P", label: "PRODUCTION" },
    { value: "E", label: "EVALUATION POC" },
    { value: "B", label: "BCM" },
    { value: "F", label: "FACTORY" },
    { value: "T", label: "INTEGRATED TEST" },
    { value: "Q", label: "QUALITY ASSURANCE" },
    { value: "R", label: "RUN THE BANK" },
  ];

  const serverFunctionOptions = [
    { value: "APP", label: "APPLICATION" },
    { value: "WEB", label: "WEB SERVICE" },
    { value: "SQL", label: "SQL SERVER" },
    { value: "DOM", label: "DOMAIN CONTROLLER" },
    { value: "FLE", label: "FILE SERVER" },
    { value: "MON", label: "MONITOR" },
    { value: "ORA", label: "ORACLE" },
  ];

  const generateVmName = async () => {
    if (!selectedOS || !environment || !serverFunction) {
      toast.error("Por favor, selecione OS, Ambiente e Função do Servidor");
      return;
    }

    setIsFetching(true);
    try {
      let osForHostnameGeneration = selectedOS;
      const hostname = await generateHostname(
        osForHostnameGeneration,
        environment,
        serverFunction,
        node
      );
      setVmName(hostname);
      toast.success("Nome de VM gerado com sucesso");
    } catch (error) {
      console.error("Erro ao gerar nome de VM:", error);
      toast.error("Falha ao gerar nome de VM");
    } finally {
      setIsFetching(false);
    }
  };

  useEffect(() => {
    generateVmName();
  }, [selectedOS, environment, serverFunction, node]);

  const handleEnvironmentChange = (value: string) => {
    setEnvironment(value);
  };

  const handleServerFunctionChange = (value: string) => {
    setServerFunction(value);
  };

  const handleNodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (/^[0-9]?$/.test(e.target.value)) {
      setNode(e.target.value);
    }
  };

  const generateAnsibleScript = () => {
    return `---
# Ansible Playbook para criar VM no VMware
- name: Create VMware VM
  hosts: localhost
  gather_facts: no
  vars:
    vcenter_hostname: "vcenter.example.com"
    vcenter_username: "administrator@vsphere.local"
    vcenter_password: "{{ vcenter_password }}"
    datacenter: "Datacenter"
    cluster: "Cluster01"
    datastore: "datastore01"
    vm_name: "${vmName}"
    vm_guest_id: "${getGuestId()}"
    vm_memory_mb: 4096
    vm_cpu: 2
    vm_disk_gb: 100
    vm_network: "VM Network"
    template: "${getTemplate()}"

  tasks:
    - name: Create VM from template
      community.vmware.vmware_guest:
        hostname: "{{ vcenter_hostname }}"
        username: "{{ vcenter_username }}"
        password: "{{ vcenter_password }}"
        validate_certs: no
        datacenter: "{{ datacenter }}"
        cluster: "{{ cluster }}"
        name: "{{ vm_name }}"
        template: "{{ template }}"
        datastore: "{{ datastore }}"
        guest_id: "{{ vm_guest_id }}"
        state: poweredon
        hardware:
          memory_mb: "{{ vm_memory_mb }}"
          num_cpus: "{{ vm_cpu }}"
          hotadd_cpu: true
          hotadd_memory: true
        networks:
          - name: "{{ vm_network }}"
        wait_for_ip_address: yes
      register: deploy_vm

    - name: Display VM details
      debug:
        msg: "VM {{ vm_name }} created with IP: {{ deploy_vm.instance.ipv4 }}"`;
  };

  const generateTerraformScript = () => {
    return `# Terraform script para criar VM no VMware
provider "vsphere" {
  user                 = var.vsphere_user
  password             = var.vsphere_password
  vsphere_server       = var.vsphere_server
  allow_unverified_ssl = true
}

data "vsphere_datacenter" "datacenter" {
  name = var.datacenter
}

data "vsphere_datastore" "datastore" {
  name          = var.datastore
  datacenter_id = data.vsphere_datacenter.datacenter.id
}

data "vsphere_compute_cluster" "cluster" {
  name          = var.cluster
  datacenter_id = data.vsphere_datacenter.datacenter.id
}

data "vsphere_network" "network" {
  name          = var.network
  datacenter_id = data.vsphere_datacenter.datacenter.id
}

data "vsphere_virtual_machine" "template" {
  name          = "${getTemplate()}"
  datacenter_id = data.vsphere_datacenter.datacenter.id
}

resource "vsphere_virtual_machine" "vm" {
  name             = "${vmName}"
  resource_pool_id = data.vsphere_compute_cluster.cluster.resource_pool_id
  datastore_id     = data.vsphere_datastore.datastore.id
  num_cpus         = 2
  memory           = 4096
  guest_id         = "${getGuestId()}"

  network_interface {
    network_id = data.vsphere_network.network.id
  }

  disk {
    label            = "disk0"
    size             = 100
    thin_provisioned = true
  }

  clone {
    template_uuid = data.vsphere_virtual_machine.template.id
  }
}

output "vm_ip" {
  value = vsphere_virtual_machine.vm.guest_ip_addresses[0]
}

# Variables - criar arquivo terraform.tfvars com estes valores
variable "vsphere_user" {
  description = "vSphere username"
}

variable "vsphere_password" {
  description = "vSphere password"
  sensitive   = true
}

variable "vsphere_server" {
  description = "vSphere server"
}

variable "datacenter" {
  description = "vSphere datacenter"
  default     = "Datacenter"
}

variable "datastore" {
  description = "vSphere datastore"
  default     = "datastore01"
}

variable "cluster" {
  description = "vSphere cluster"
  default     = "Cluster01"
}

variable "network" {
  description = "VM network"
  default     = "VM Network"
}`;
  };

  const generatePowerCLIScript = () => {
    return `# VMware PowerCLI script para criar VM
# Conectar ao vCenter
Connect-VIServer -Server vcenter.example.com -User administrator@vsphere.local -Password '<password>'

# Definir parâmetros da VM
$VMName = "${vmName}"
$Template = "${getTemplate()}"
$Datastore = "datastore01"
$Cluster = "Cluster01"
$VMHost = Get-VMHost -Location $Cluster | Get-Random
$Network = "VM Network"
$NumCPU = 2
$MemoryGB = 4
$DiskGB = 100

# Criar VM a partir do template
$VM = New-VM -Name $VMName -Template $Template -VMHost $VMHost -Datastore $Datastore -Location $Cluster

# Configurar hardware da VM
Set-VM -VM $VM -NumCpu $NumCPU -MemoryGB $MemoryGB -Confirm:$false

# Configurar rede
Get-NetworkAdapter -VM $VM | Set-NetworkAdapter -NetworkName $Network -Confirm:$false

# Ligar a VM
Start-VM -VM $VM

# Obter detalhes da VM
$VMDetails = Get-VM -Name $VMName | Select Name, PowerState, NumCpu, MemoryGB, @{N="IP Address";E={@($_.guest.IPAddress[0])}}
Write-Output $VMDetails

# Desconectar do vCenter
Disconnect-VIServer -Server * -Confirm:$false`;
  };

  const getGuestId = () => {
    switch (selectedOS) {
      case "ubuntu20":
        return "ubuntu64Guest";
      case "ubuntu22":
        return "ubuntu64Guest";
      case "ubuntu24":
        return "ubuntu64Guest";
      case "windows-2019":
        return "windows9Server64Guest";
      case "windows-2022":
        return "windows9Server64Guest";
      case "centos-7":
        return "centos7_64Guest";
      case "centos-8":
        return "centos8_64Guest";
      case "amzn-linux-2":
        return "amazonlinux2_64Guest";
      case "amzn-linux-2023":
        return "amazonlinux2_64Guest";
      case "debian11":
        return "debian11_64Guest";
      case "debian12":
        return "debian11_64Guest";
      default:
        return "otherLinux64Guest";
    }
  };

  const getTemplate = () => {
    switch (selectedOS) {
      case "ubuntu20":
        return "TPL-Ubuntu-20.04";
      case "ubuntu22":
        return "TPL-Ubuntu-22.04";
      case "ubuntu24":
        return "TPL-Ubuntu-24.04";
      case "windows-2019":
        return "TPL-Windows-2019";
      case "windows-2022":
        return "TPL-Windows-2022";
      case "centos-7":
        return "TPL-CentOS-7";
      case "centos-8":
        return "TPL-CentOS-8";
      case "amzn-linux-2":
        return "TPL-Amazon-Linux-2";
      case "amzn-linux-2023":
        return "TPL-Amazon-Linux-2023";
      case "debian11":
        return "TPL-Debian-11";
      case "debian12":
        return "TPL-Debian-12";
      default:
        return "TPL-Ubuntu-22.04";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
      <header className="bg-white border-b border-border">
        <div className="container mx-auto py-6 px-4">
          <div className="flex items-center justify-between">
            <div className="animate-text-appear flex items-center">
              <div className="mr-4">
                <img 
                  src="/lovable-uploads/de4049d4-86cc-4abe-a276-91e83e974ee7.png" 
                  alt="BTG Pactual Logo" 
                  className="h-52 w-auto"
                />
              </div>
              <div>
                <div className="chip bg-purple-500/10 text-purple-600">VMWARE AUTOMATOR</div>
                <div className="flex items-center mt-1">
                  <h1 className="text-3xl font-semibold">VMware Image Provisioning</h1>
                </div>
                <p className="text-muted-foreground mt-1">
                  Create VMware infrastructure automation templates using Ansible, Terraform or PowerCLI
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto py-12 px-4">
        <div className="w-full max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row gap-8">
            <div className="w-full md:w-1/3">
              <Card>
                <CardHeader>
                  <CardTitle>Configuration</CardTitle>
                  <CardDescription>
                    Select the operating system and VM settings
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <Label>Operating System</Label>
                    <OSSelector value={selectedOS} onChange={setSelectedOS} />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="environment">Environment</Label>
                    <Select
                      value={environment}
                      onValueChange={handleEnvironmentChange}
                    >
                      <SelectTrigger id="environment">
                        <SelectValue placeholder="Select environment" />
                      </SelectTrigger>
                      <SelectContent>
                        {environmentOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label} ({option.value})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="serverFunction">Server Function</Label>
                    <Select
                      value={serverFunction}
                      onValueChange={handleServerFunctionChange}
                    >
                      <SelectTrigger id="serverFunction">
                        <SelectValue placeholder="Select server function" />
                      </SelectTrigger>
                      <SelectContent>
                        {serverFunctionOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label} ({option.value})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="node">Node Number</Label>
                    <Input
                      id="node"
                      value={node}
                      onChange={handleNodeChange}
                      placeholder="0"
                      maxLength={1}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Sequential number (0-9)
                    </p>
                  </div>
                  
                  <div>
                    <Label>VM Name (Auto-generated)</Label>
                    <div className="flex items-center gap-2 mt-2">
                      <Input
                        value={vmName}
                        readOnly
                        className="font-mono bg-muted"
                      />
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={generateVmName}
                        disabled={isFetching}
                      >
                        <Server className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Gerado usando o mesmo sistema do Hostname Generator
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="w-full md:w-2/3">
              <Card className="h-full">
                <CardHeader>
                  <CardTitle>Script Generator</CardTitle>
                  <CardDescription>
                    Select the automation tool and get ready-to-use scripts
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="ansible">
                    <TabsList className="grid grid-cols-3 mb-4">
                      <TabsTrigger value="ansible" className="flex items-center gap-1">
                        <Cog className="h-4 w-4" />
                        Ansible
                      </TabsTrigger>
                      <TabsTrigger value="terraform" className="flex items-center gap-1">
                        <Layers className="h-4 w-4" />
                        Terraform
                      </TabsTrigger>
                      <TabsTrigger value="powercli" className="flex items-center gap-1">
                        <Terminal className="h-4 w-4" />
                        PowerCLI
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="ansible">
                      <Card>
                        <CardHeader className="py-4">
                          <CardTitle className="text-sm font-medium flex items-center">
                            <Cog className="h-4 w-4 mr-2 text-blue-500" />
                            Ansible Playbook
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="py-0">
                          <pre className="bg-zinc-950 text-zinc-50 p-4 rounded-md overflow-x-auto text-xs">
                            <code>{generateAnsibleScript()}</code>
                          </pre>
                        </CardContent>
                        <CardFooter className="py-4 flex justify-end">
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="text-xs"
                            onClick={() => {
                              navigator.clipboard.writeText(generateAnsibleScript());
                              toast.success("Copiado para a área de transferência");
                            }}
                          >
                            <Code2 className="h-3 w-3 mr-1" />
                            Copy Code
                          </Button>
                        </CardFooter>
                      </Card>
                    </TabsContent>

                    <TabsContent value="terraform">
                      <Card>
                        <CardHeader className="py-4">
                          <CardTitle className="text-sm font-medium flex items-center">
                            <Layers className="h-4 w-4 mr-2 text-emerald-500" />
                            Terraform Script
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="py-0">
                          <pre className="bg-zinc-950 text-zinc-50 p-4 rounded-md overflow-x-auto text-xs">
                            <code>{generateTerraformScript()}</code>
                          </pre>
                        </CardContent>
                        <CardFooter className="py-4 flex justify-end">
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="text-xs"
                            onClick={() => {
                              navigator.clipboard.writeText(generateTerraformScript());
                              toast.success("Copiado para a área de transferência");
                            }}
                          >
                            <Code2 className="h-3 w-3 mr-1" />
                            Copy Code
                          </Button>
                        </CardFooter>
                      </Card>
                    </TabsContent>

                    <TabsContent value="powercli">
                      <Card>
                        <CardHeader className="py-4">
                          <CardTitle className="text-sm font-medium flex items-center">
                            <Terminal className="h-4 w-4 mr-2 text-purple-500" />
                            PowerCLI Script
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="py-0">
                          <pre className="bg-zinc-950 text-zinc-50 p-4 rounded-md overflow-x-auto text-xs">
                            <code>{generatePowerCLIScript()}</code>
                          </pre>
                        </CardContent>
                        <CardFooter className="py-4 flex justify-end">
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="text-xs"
                            onClick={() => {
                              navigator.clipboard.writeText(generatePowerCLIScript());
                              toast.success("Copiado para a área de transferência");
                            }}
                          >
                            <Code2 className="h-3 w-3 mr-1" />
                            Copy Code
                          </Button>
                        </CardFooter>
                      </Card>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
      
      <footer className="border-t border-border mt-auto">
        <div className="container mx-auto py-6 px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} BTG Pactual - VMware Automator
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default VMwareAutomator;

