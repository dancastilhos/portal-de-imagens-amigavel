
import { useState, FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Server, RefreshCcw, FileDown } from "lucide-react";
import { HostnameFormData, HostnameRecord } from "@/lib/types";
import { generateHostname } from "@/utils/hostnameGenerator";
import { hostnameDbService } from "@/services/hostnameDatabase";
import { toast } from "sonner";
import FormSection from "@/components/FormSection";

// Import data options
const osTemplateOptions = [
  { value: "windows-server-2019", label: "Windows Server 2019" },
  { value: "windows-server-2022", label: "Windows Server 2022" },
  { value: "windows-server-2025", label: "Windows Server 2025" },
  { value: "redhat-8", label: "Red Hat 8" },
  { value: "redhat-9", label: "Red Hat 9" },
  { value: "mac-apple", label: "Mac Apple (M)" },
  { value: "appliance", label: "Appliance (A)" },
  { value: "centos", label: "CentOS (L)" },
  { value: "cifs-storage", label: "CIFS/Storage (D)" },
  { value: "enclosure", label: "Enclosure (E)" },
  { value: "linux", label: "Linux (L)" },
  { value: "linuxrhel5", label: "Linux RHEL 5 (L)" },
  { value: "linuxrhel6", label: "Linux RHEL 6 (L)" },
  { value: "linuxrhel7", label: "Linux RHEL 7 (L)" },
  { value: "solaris", label: "Solaris (S)" },
  { value: "solaris-10", label: "Solaris 10 (S)" },
  { value: "solaris-11", label: "Solaris 11 (L)" },
  { value: "vmware", label: "VMware (V)" },
  { value: "freebsd", label: "FreeBSD (F)" }
];

const environmentOptions = [
  { value: "U", label: "UAT" },
  { value: "D", label: "DEVELOPMENT" },
  { value: "P", label: "PRODUCTION" },
  { value: "E", label: "EVALUATION POC" },
  { value: "B", label: "BCM" },
  { value: "F", label: "FACTORY" },
  { value: "T", label: "INTEGRATED TEST" },
  { value: "Q", label: "QUALITY ASSURANCE" },
  { value: "R", label: "RUN THE BANK" }
];

const serverFunctionOptions = [
  { value: "FSX", label: "AWS FSX" },
  { value: "SCM", label: "SCCM" },
  { value: "APP", label: "APPLICATION" },
  { value: "AUT", label: "AUTOMAÇÃO" },
  { value: "EAC", label: "ATTENDANT CONSOLE" },
  { value: "AGP", label: "AVAILABILITY GROUP" },
  { value: "BKP", label: "BACK SERVER" },
  { value: "CXW", label: "CITRIX XENAPP" },
  { value: "CLT", label: "CLUSTER" },
  { value: "NOD", label: "CLUSTER NODE" },
  { value: "NO1", label: "CLUSTER NODE 09" },
  { value: "NO2", label: "CLUSTER NODE 19" },
  { value: "NO3", label: "CLUSTER NODE 29" },
  { value: "CRO", label: "CLUSTER ROLE" },
  { value: "DOM", label: "DOMAIN CONTROLLER" },
  { value: "MBX", label: "EXCHANGE" },
  { value: "CAS", label: "EXCHANGE CAS" },
  { value: "FLE", label: "FILE SERVER" },
  { value: "MON", label: "MONITOR" },
  { value: "NAS", label: "NAS" },
  { value: "NCE", label: "NICE" },
  { value: "ORA", label: "ORACLE" },
  { value: "ORC", label: "ORACLE CONTAINER" },
  { value: "ORR", label: "ORACLE RAC" },
  { value: "SCAN", label: "SCAN NAME" },
  { value: "LTR", label: "SQL LISTENER" },
  { value: "SQL", label: "SQL SERVER" },
  { value: "VIP", label: "VIRTUAL IP" },
  { value: "ESX", label: "VMWARE ESXI" },
  { value: "AFH", label: "WEBFRAM" },
  { value: "WEB", label: "WEB INTERFACE" },
  { value: "WWW", label: "WEB SERVICE" },
  { value: "DPX", label: "DELPHIX" },
  { value: "VOM", label: "VERITAS OPERATIONS MANAGER" },
  { value: "BIG", label: "BIG IP" },
  { value: "XEN", label: "XEN MOBILE" },
  { value: "NSC", label: "NETSCALER" },
  { value: "EGW", label: "E-MAIL GATEWAY" },
  { value: "ILO", label: "ILO INTERFACE" },
  { value: "VCM", label: "VIRTUAL CONNECT" },
  { value: "VDI", label: "VDI XEN DESKTOP" },
  { value: "STF", label: "STOREFRONT" },
  { value: "HPS", label: "HP STORAGE" },
  { value: "PSP", label: "VMWARE VCENTER" },
  { value: "WMQ", label: "WEBSPHERE MQ" },
  { value: "RSA", label: "RSA" },
  { value: "ADF", label: "ACTIVE DIRECTORY FEDERATION" },
  { value: "BEN", label: "BLADE ENCLOSURE" },
  { value: "EMC", label: "STORAGE EMC" },
  { value: "UFV", label: "UNISPHERRE FOR VMAX" },
  { value: "PSC", label: "PSC" },
  { value: "CON", label: "CONTROLLER" },
  { value: "RDS", label: "REDIS" },
  { value: "RSK", label: "RISCO" },
  { value: "SHP", label: "SHAREPOINT" },
  { value: "VIR", label: "MCAFEE" },
  { value: "MSM", label: "MSMQ" },
  { value: "HYP", label: "HYPER-V" },
  { value: "APG", label: "API GATEWAY" },
  { value: "COM", label: "WCF COM" },
  { value: "RPT", label: "REPORTING SERVICES" },
  { value: "KMS", label: "KMS" },
  { value: "NAC", label: "NAC" },
  { value: "VRA", label: "VRA" }
];

const siteOptions = [
  { value: "SP", label: "São Paulo" },
  { value: "RJ", label: "Rio de Janeiro" },
  { value: "BA", label: "Buenos Aires" },
  { value: "AWS-US-EAST-1", label: "AWS-US-EAST-1" },
  { value: "AWS-SP", label: "AWS São Paulo" },
  { value: "AFRICA", label: "Africa" },
  { value: "ASHBURN", label: "Ashburn" },
  { value: "ASIA", label: "Asia" },
  { value: "ATHENS", label: "Athens" },
  { value: "ATLANTA", label: "Atlanta" },
  { value: "BARRANQUILA", label: "Barranquila" },
  { value: "BH", label: "Belo Horizonte" },
  { value: "BOGOTA", label: "Bogota" },
  { value: "BRASILIA", label: "Brasília" },
  { value: "BRASIL", label: "Brasil" },
  { value: "CALI", label: "Cali" },
  { value: "CURITIBA", label: "Curitiba" },
  { value: "EUROPE", label: "Europe" },
  { value: "GENEVA", label: "Geneva" },
  { value: "HONG-KONG", label: "Hong Kong" },
  { value: "IBAGUE", label: "Ibague" },
  { value: "JOHANNESBOURG", label: "Johannesbourg" },
  { value: "LAS-CONDE", label: "Las Conde" },
  { value: "LIMA", label: "Lima" },
  { value: "LONDON", label: "London" },
  { value: "LOS-ANGELES", label: "Los Angeles" },
  { value: "LUXEMBOURG", label: "Luxembourg" },
  { value: "MEDELLIN", label: "Medellin" },
  { value: "MEXICO-CITY", label: "Mexico City" },
  { value: "NEW-YORK", label: "New York" },
  { value: "PORTO-ALEGRE", label: "Porto Alegre" },
  { value: "RECIFE", label: "Recife" },
  { value: "RIBEIRAO-PRETO", label: "Ribeirão Preto" },
  { value: "SALVADOR", label: "Salvador" },
  { value: "SANTIAGO", label: "Santiago" },
  { value: "XANGAI", label: "Xangai" },
  { value: "SINGAPORE", label: "Singapore" },
  { value: "STAMFORD", label: "Stamford" },
  { value: "UNITED-STATES", label: "United States" },
  { value: "WINSTON-SALEM", label: "Winston-Salem" }
];

const domainOptions = [
  { value: "pactual.net", label: "pactual.net" },
  { value: "develop.net", label: "develop.net" },
  { value: "dmz-pactual.net", label: "dmz-pactual.net" },
  { value: "other", label: "Other" }
];

const objectOptions = [
  { value: "VIRTUAL SERVER", label: "Virtual Server" },
  { value: "PHYSICAL SERVER", label: "Physical Server" },
  { value: "ALIAS", label: "Alias" }
];

const statusOptions = [
  { value: "ACTIVE", label: "Active" },
  { value: "INACTIVE", label: "Inactive" },
  { value: "DECOMMISSIONED", label: "Decommissioned" }
];

const defaultFormData: HostnameFormData = {
  os: "",
  environment: "",
  serverFunction: "",
  node: "0",
  site: "",
  domain: "pactual.net",
  system: "",
  description: "",
  project: "",
  owner: "",
  status: "ACTIVE",
  object: "",
  alias: ""
};

interface HostnameFormProps {
  onSave: (hostname: HostnameRecord) => void;
}

const HostnameForm = ({ onSave }: HostnameFormProps) => {
  const [formData, setFormData] = useState<HostnameFormData>(defaultFormData);
  const [generatedHostname, setGeneratedHostname] = useState<string>("");
  const [ipAddress, setIpAddress] = useState<string>("");
  const [secIpAddress, setSecIpAddress] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  const handleSelectChange = (name: keyof HostnameFormData, value: string) => {
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleGenerateHostname = async () => {
    if (!formData.os || !formData.environment || !formData.serverFunction) {
      toast.error("Please select OS, Environment, and Server Function");
      return;
    }

    setIsGenerating(true);
    try {
      const hostname = await generateHostname(
        formData.os,
        formData.environment,
        formData.serverFunction,
        formData.node
      );
      setGeneratedHostname(hostname);
      toast.success("Hostname generated successfully");
    } catch (error) {
      console.error("Error generating hostname:", error);
      toast.error("Failed to generate hostname");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!generatedHostname) {
      toast.error("Please generate a hostname first");
      return;
    }

    if (!ipAddress) {
      toast.error("Please enter an IP address");
      return;
    }

    if (!formData.site) {
      toast.error("Please select a site");
      return;
    }

    setIsSaving(true);
    try {
      const newHostname: HostnameRecord = {
        code: Math.floor(Math.random() * 1000).toString().padStart(3, '0'),
        hostname: generatedHostname,
        domain: formData.domain,
        os: formData.os,
        environment: formData.environment,
        server_function: formData.serverFunction, // Fixed: Change from server_function to serverFunction
        node: formData.node,
        site: formData.site,
        ip: ipAddress,
        sec_ip: secIpAddress,
        updated_by: "system",
        system: formData.system,
        description: formData.description,
        object: formData.object || "",
        alias: formData.alias || "",
        status: formData.status,
        project: formData.project,
        owner: formData.owner
      };

      const savedRecord = await hostnameDbService.saveHostname(newHostname);
      toast.success("Hostname saved successfully");
      onSave(savedRecord);
      
      // Reset form
      setFormData(defaultFormData);
      setGeneratedHostname("");
      setIpAddress("");
      setSecIpAddress("");
    } catch (error) {
      console.error("Error saving hostname:", error);
      toast.error("Failed to save hostname");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <FormSection
        title="Hostname Configuration"
        tag="REQUIRED"
        subtitle="Configure the hostname generation parameters"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="os">Operating System</Label>
              <Select
                value={formData.os}
                onValueChange={(value) => handleSelectChange("os", value)}
              >
                <SelectTrigger id="os">
                  <SelectValue placeholder="Select an OS" />
                </SelectTrigger>
                <SelectContent>
                  {osTemplateOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="environment">Environment</Label>
              <Select
                value={formData.environment}
                onValueChange={(value) => handleSelectChange("environment", value)}
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

            <div>
              <Label htmlFor="serverFunction">Server Function</Label>
              <Select
                value={formData.serverFunction}
                onValueChange={(value) => handleSelectChange("serverFunction", value)}
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

            <div>
              <Label htmlFor="node">Node Number</Label>
              <Input
                id="node"
                name="node"
                value={formData.node}
                onChange={handleInputChange}
                placeholder="0"
                maxLength={1}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Sequential number (0-9)
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <Label htmlFor="generatedHostname">Generated Hostname</Label>
              <div className="flex gap-2">
                <Input
                  id="generatedHostname"
                  value={generatedHostname}
                  readOnly
                  className="font-mono bg-muted"
                  placeholder="Click Generate to create hostname"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleGenerateHostname}
                  disabled={isGenerating}
                  className="flex-shrink-0"
                >
                  {isGenerating ? (
                    <RefreshCcw className="h-4 w-4 animate-spin" />
                  ) : (
                    <Server className="h-4 w-4 mr-2" />
                  )}
                  Generate
                </Button>
              </div>
            </div>

            <div>
              <Label htmlFor="domain">Domain</Label>
              <Select
                value={formData.domain}
                onValueChange={(value) => handleSelectChange("domain", value)}
              >
                <SelectTrigger id="domain">
                  <SelectValue placeholder="Select domain" />
                </SelectTrigger>
                <SelectContent>
                  {domainOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="site">Site</Label>
              <Select
                value={formData.site}
                onValueChange={(value) => handleSelectChange("site", value)}
              >
                <SelectTrigger id="site">
                  <SelectValue placeholder="Select site" />
                </SelectTrigger>
                <SelectContent>
                  {siteOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => handleSelectChange("status", value)}
              >
                <SelectTrigger id="status">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="ipAddress">IP Address</Label>
              <Input
                id="ipAddress"
                value={ipAddress}
                onChange={(e) => setIpAddress(e.target.value)}
                placeholder="e.g. 10.0.0.1"
              />
            </div>
            
            <div>
              <Label htmlFor="secIpAddress">Secondary IP Address (Optional)</Label>
              <Input
                id="secIpAddress"
                value={secIpAddress}
                onChange={(e) => setSecIpAddress(e.target.value)}
                placeholder="e.g. 10.0.0.2"
              />
            </div>
          </div>
        </div>
      </FormSection>

      <FormSection
        title="System Information"
        subtitle="Additional details about the system"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="system">System</Label>
              <Input
                id="system"
                name="system"
                value={formData.system}
                onChange={handleInputChange}
                placeholder="e.g. CRM"
              />
            </div>
            <div>
              <Label htmlFor="project">Project</Label>
              <Input
                id="project"
                name="project"
                value={formData.project}
                onChange={handleInputChange}
                placeholder="e.g. CRM Implementation"
              />
            </div>
            <div>
              <Label htmlFor="object">Object</Label>
              <Select
                value={formData.object || ""}
                onValueChange={(value) => handleSelectChange("object", value)}
              >
                <SelectTrigger id="object">
                  <SelectValue placeholder="Select object type" />
                </SelectTrigger>
                <SelectContent>
                  {objectOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Brief description of the system"
                rows={3}
              />
            </div>
            <div>
              <Label htmlFor="owner">Owner</Label>
              <Input
                id="owner"
                name="owner"
                value={formData.owner}
                onChange={handleInputChange}
                placeholder="e.g. IT Department"
              />
            </div>
            <div>
              <Label htmlFor="alias">Alias (Optional)</Label>
              <Input
                id="alias"
                name="alias"
                value={formData.alias}
                onChange={handleInputChange}
                placeholder="e.g. crm01"
              />
            </div>
          </div>
        </div>
      </FormSection>

      <div className="flex justify-end mt-6">
        <Button type="submit" disabled={!generatedHostname || isSaving}>
          {isSaving ? "Saving..." : "Save Hostname"}
        </Button>
      </div>
    </form>
  );
};

export default HostnameForm;
