
import { GitBranch, GitPullRequestArrow, CloudCog } from "lucide-react";
import AMIForm from "@/components/AMIForm";
import PortalButton from "@/components/PortalButton";

const Index = () => {
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
                <div className="chip bg-accent text-accent-foreground">BTG AMI MANAGEMENT</div>
                <div className="flex items-center mt-1">
                  <h1 className="text-3xl font-semibold">AWS AMI Automator</h1>
                </div>
                <p className="text-muted-foreground mt-1">
                  Create and manage AMI images via terragrunt.hcl
                </p>
              </div>
            </div>
            
            <div className="hidden md:flex items-center space-x-4">
              <PortalButton />
              <div className="flex items-center bg-accent/60 px-3 py-1.5 rounded-md">
                <GitBranch className="h-4 w-4 text-muted-foreground mr-2" />
                <span className="text-sm text-muted-foreground">main</span>
              </div>
              
              <div className="flex items-center bg-accent/60 px-3 py-1.5 rounded-md">
                <GitPullRequestArrow className="h-4 w-4 text-muted-foreground mr-2" />
                <span className="text-sm text-muted-foreground">Last updated: 2h ago</span>
              </div>
              
              <div className="flex items-center bg-green-500/10 px-3 py-1.5 rounded-md">
                <CloudCog className="h-4 w-4 text-green-600 mr-2" />
                <span className="text-sm text-green-600">Connected to AWS</span>
              </div>
            </div>
          </div>
        </div>
      </header>
      
      <main className="container mx-auto py-8 px-4">
        <div className="max-w-screen-2xl mx-auto">
          <div className="glass-panel rounded-xl overflow-hidden shadow-sm">
            <div className="p-6 md:p-8">
              <AMIForm />
            </div>
          </div>
        </div>
      </main>
      
      <footer className="border-t border-border mt-auto">
        <div className="container mx-auto py-6 px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} BTG Pactual - AWS AMI Management
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
                GitHub Repository
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
