
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Cog, Server } from "lucide-react";
import PortalButton from "@/components/PortalButton";

const Portal = () => {
  return (
    <div className="bg-gradient-to-b from-background to-muted/30 min-h-screen">
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
                <div className="chip bg-green-500/10 text-green-600">PORTAL</div>
                <div className="flex items-center mt-1">
                  <h1 className="text-3xl font-semibold">BTG Automation Portal</h1>
                  <Cog className="ml-2 h-5 w-5 text-muted-foreground" />
                </div>
                <p className="text-muted-foreground mt-1">
                  Centralized hub for automation tools and resources
                </p>
              </div>
            </div>
            <div className="flex items-center">
              <PortalButton />
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto py-12 px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="chip bg-accent text-accent-foreground">AMI AUTOMATOR</div>
              <CardTitle>AWS AMI Automator</CardTitle>
              <CardDescription>
                Create and manage AMI images via terragrunt.hcl
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex justify-center py-2">
                <img src="/lovable-uploads/aws.png" alt="AWS" className="h-16 w-auto" />
              </div>
            </CardContent>
            <CardFooter className="flex justify-between border-t pt-4">
              <div className="text-sm text-muted-foreground">AWS_AMI</div>
              <Button asChild>
                <Link to="/">Open AMI Creator</Link>
              </Button>
            </CardFooter>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="chip bg-orange-500/10 text-orange-600">VMWARE</div>
              <CardTitle>VMware Image Provisioning</CardTitle>
              <CardDescription>
                Create and deploy VMware virtual machine templates
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex justify-center py-2">
                <img src="/lovable-uploads/vmware.png" alt="VMware" className="h-16 w-auto" />
              </div>
            </CardContent>
            <CardFooter className="flex justify-between border-t pt-4">
              <div className="text-sm text-muted-foreground">VMWARE_IMAGES</div>
              <Button asChild>
                <Link to="/vmware-automator">Open Automator</Link>
              </Button>
            </CardFooter>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="chip bg-purple-500/10 text-purple-600">VDI LINUX</div>
              <CardTitle>VDI Linux Image Provisioning</CardTitle>
              <CardDescription>
                Create and deploy VDI Linux virtual machine templates
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex justify-center py-2">
                <img src="/lovable-uploads/a2d6a81d-7fb9-4b2e-ac7b-41fb7c1227e0.png" alt="Linux" className="h-16 w-auto" />
              </div>
            </CardContent>
            <CardFooter className="flex justify-between border-t pt-4">
              <div className="text-sm text-muted-foreground">VDI_LINUX_IMAGES</div>
              <Button asChild>
                <Link to="/vdi-linux-automator">Open Automator</Link>
              </Button>
            </CardFooter>
          </Card>
          
          {/* Hostname Generator card */}
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="chip bg-blue-500/10 text-blue-600">HOSTNAME</div>
              <CardTitle>Hostname Generator</CardTitle>
              <CardDescription>
                Generate and manage standardized hostnames for your infrastructure
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex justify-center py-2">
                <Server className="h-16 w-16 text-blue-500" />
              </div>
            </CardContent>
            <CardFooter className="flex justify-between border-t pt-4">
              <div className="text-sm text-muted-foreground">HOSTNAME_CREATE</div>
              <Button asChild>
                <Link to="/hostname-generator">Open Generator</Link>
              </Button>
            </CardFooter>
          </Card>
        </div>
      </main>

      <footer className="border-t border-border mt-16">
        <div className="container mx-auto py-6 px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} BTG Pactual - Automation Portal
            </p>
            <div className="flex items-center mt-4 md:mt-0">
              {/* Footer links could go here */}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Portal;
