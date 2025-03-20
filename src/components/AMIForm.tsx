
import { useState } from "react";
import { toast } from "sonner";
import { FormData, OSType } from "@/lib/types";
import { submitToBackend } from "@/lib/terragruntUtils";
import OSSelector from "./OSSelector";
import FormSection from "./FormSection";
import VersionPreview from "./VersionPreview";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";

const initialFormData: FormData = {
  os: "windows-2022",
  currentVersion: "4.0.0",
  imageName: "",
  test: false,
  sourceAmiId: "",
  org: ["br"],
  deprecate: false,
  ssm: "1.0.0",
  crowdstrike: "1.0.1",
  deepsecurity: "",
  splunk: "1.0.1",
  tenable: "1.0.1",
  zabbix: "",
  others: "1.0.0",
  volumeSize: 30,
};

const regions = [
  { id: "br", label: "Brasil" },
  { id: "bd", label: "Broker Dealer" },
  { id: "cl", label: "Chile" },
  { id: "lux", label: "Luxemburgo" },
];

const AMIForm = () => {
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleOSChange = (os: OSType) => {
    setFormData({ ...formData, os });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    
    if (type === "number") {
      setFormData({ ...formData, [name]: parseInt(value) });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleBooleanChange = (name: string, checked: boolean) => {
    setFormData({ ...formData, [name]: checked });
  };

  const handleOrgChange = (orgId: string, checked: boolean) => {
    let newOrgs = [...formData.org];
    
    if (checked) {
      if (!newOrgs.includes(orgId)) {
        newOrgs.push(orgId);
      }
    } else {
      newOrgs = newOrgs.filter(id => id !== orgId);
    }
    
    setFormData({ ...formData, org: newOrgs });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.imageName) {
      toast.error("Please enter an image name");
      return;
    }
    
    if (!formData.sourceAmiId) {
      toast.error("Please enter a source AMI ID");
      return;
    }
    
    if (formData.org.length === 0) {
      toast.error("Please select at least one organization");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const result = await submitToBackend(formData);
      
      if (result.success) {
        toast.success(result.message);
      } else {
        toast.error(result.message || "Failed to create AMI version");
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error("An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-6xl mx-auto">
      <Tabs defaultValue="create" className="w-full">
        <TabsList className="mb-8">
          <TabsTrigger value="create">Create AMI</TabsTrigger>
          <TabsTrigger value="preview">Preview</TabsTrigger>
        </TabsList>
        
        <TabsContent value="create" className="space-y-8 animate-fade-in">
          <OSSelector value={formData.os as OSType} onChange={handleOSChange} />
          
          <FormSection 
            title="AMI Details" 
            tag="REQUIRED"
            subtitle="Enter the details for the new AMI version"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="currentVersion">Current Version</Label>
                  <Input
                    id="currentVersion"
                    name="currentVersion"
                    value={formData.currentVersion}
                    onChange={handleChange}
                    placeholder="e.g. 4.0.0"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Current highest version in the terragrunt.hcl file
                  </p>
                </div>
                
                <div>
                  <Label htmlFor="imageName">Image Name</Label>
                  <Input
                    id="imageName"
                    name="imageName"
                    value={formData.imageName}
                    onChange={handleChange}
                    placeholder="e.g. Windows_Server-2022-English-Full-Base-2025.02.13"
                    required
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    The full name of the source image
                  </p>
                </div>
                
                <div>
                  <Label htmlFor="sourceAmiId">Source AMI ID</Label>
                  <Input
                    id="sourceAmiId"
                    name="sourceAmiId"
                    value={formData.sourceAmiId}
                    onChange={handleChange}
                    placeholder="e.g. ami-001adaa5c3ee02e10"
                    required
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    The AWS AMI ID of the source image
                  </p>
                </div>
              </div>
              
              <div className="space-y-6">
                <div>
                  <Label className="block mb-2">Organizations</Label>
                  <div className="space-y-2">
                    {regions.map((region) => (
                      <div key={region.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`org-${region.id}`}
                          checked={formData.org.includes(region.id)}
                          onCheckedChange={(checked) => 
                            handleOrgChange(region.id, checked as boolean)
                          }
                        />
                        <label
                          htmlFor={`org-${region.id}`}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          {region.label}
                        </label>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Select the organizations that will use this AMI
                  </p>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="test">Test Mode</Label>
                      <p className="text-xs text-muted-foreground">
                        Enable test mode for validation
                      </p>
                    </div>
                    <Switch
                      id="test"
                      checked={formData.test}
                      onCheckedChange={(checked) => handleBooleanChange("test", checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="deprecate">Deprecate Previous</Label>
                      <p className="text-xs text-muted-foreground">
                        Mark previous version as deprecated
                      </p>
                    </div>
                    <Switch
                      id="deprecate"
                      checked={formData.deprecate}
                      onCheckedChange={(checked) => handleBooleanChange("deprecate", checked)}
                    />
                  </div>
                </div>
              </div>
            </div>
          </FormSection>
          
          <FormSection 
            title="Components" 
            tag="CONFIGURATION"
            subtitle="Configure the component versions"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="ssm">SSM</Label>
                <Input
                  id="ssm"
                  name="ssm"
                  value={formData.ssm}
                  onChange={handleChange}
                  placeholder="e.g. 1.0.0"
                />
              </div>
              
              <div>
                <Label htmlFor="crowdstrike">CrowdStrike</Label>
                <Input
                  id="crowdstrike"
                  name="crowdstrike"
                  value={formData.crowdstrike}
                  onChange={handleChange}
                  placeholder="e.g. 1.0.1"
                />
              </div>
              
              <div>
                <Label htmlFor="deepsecurity">DeepSecurity</Label>
                <Input
                  id="deepsecurity"
                  name="deepsecurity"
                  value={formData.deepsecurity}
                  onChange={handleChange}
                  placeholder="e.g. 1.0.0"
                />
              </div>
              
              <div>
                <Label htmlFor="splunk">Splunk</Label>
                <Input
                  id="splunk"
                  name="splunk"
                  value={formData.splunk}
                  onChange={handleChange}
                  placeholder="e.g. 1.0.1"
                />
              </div>
              
              <div>
                <Label htmlFor="tenable">Tenable</Label>
                <Input
                  id="tenable"
                  name="tenable"
                  value={formData.tenable}
                  onChange={handleChange}
                  placeholder="e.g. 1.0.1"
                />
              </div>
              
              <div>
                <Label htmlFor="zabbix">Zabbix</Label>
                <Input
                  id="zabbix"
                  name="zabbix"
                  value={formData.zabbix}
                  onChange={handleChange}
                  placeholder="e.g. 1.0.0"
                />
              </div>
              
              <div>
                <Label htmlFor="others">Others</Label>
                <Input
                  id="others"
                  name="others"
                  value={formData.others}
                  onChange={handleChange}
                  placeholder="e.g. 1.0.0"
                />
              </div>
              
              <div>
                <Label htmlFor="volumeSize">Volume Size (GB)</Label>
                <Input
                  id="volumeSize"
                  name="volumeSize"
                  type="number"
                  value={formData.volumeSize}
                  onChange={handleChange}
                  min={8}
                  max={500}
                />
              </div>
            </div>
          </FormSection>
          
          <div className="flex justify-end pt-4">
            <Button
              type="submit"
              className="btn-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Processing..." : "Create AMI Version"}
            </Button>
          </div>
        </TabsContent>
        
        <TabsContent value="preview" className="animate-fade-in">
          <div className="space-y-6">
            <div>
              <div className="chip bg-accent text-accent-foreground mb-2">PREVIEW</div>
              <h2 className="text-2xl font-medium">Generated Terragrunt Configuration</h2>
              <p className="text-muted-foreground">
                This is how your configuration will look in the terragrunt.hcl file
              </p>
            </div>
            
            <VersionPreview formData={formData} />
            
            <div className="flex justify-end pt-4">
              <Button
                type="submit"
                className="btn-primary"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Processing..." : "Create AMI Version"}
              </Button>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </form>
  );
};

export default AMIForm;
