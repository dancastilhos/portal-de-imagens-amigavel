
import { OSOption, OSType } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Check, Server } from "lucide-react";

// Helper function to get OS logo path
const getOSLogoPath = (osId: string): string => {
  // Returning a placeholder for all OS types as we're removing custom images
  return "/placeholder.svg";
};

// OS options with metadata
const osOptions: OSOption[] = [
  {
    id: "amzn-linux-2",
    name: "Amazon Linux 2",
    logoPath: getOSLogoPath("amzn-linux-2"),
    description: "AWS's Linux distribution based on RHEL"
  },
  {
    id: "amzn-linux-2023",
    name: "Amazon Linux 2023",
    logoPath: getOSLogoPath("amzn-linux-2023"),
    description: "Latest AWS Linux distribution"
  },
  {
    id: "centos-7",
    name: "CentOS 7",
    logoPath: getOSLogoPath("centos-7"),
    description: "Community Enterprise Linux"
  },
  {
    id: "centos-8",
    name: "CentOS 8",
    logoPath: getOSLogoPath("centos-8"),
    description: "Community Enterprise Linux"
  },
  {
    id: "debian11",
    name: "Debian 11",
    logoPath: getOSLogoPath("debian11"),
    description: "Debian Bullseye"
  },
  {
    id: "debian12",
    name: "Debian 12",
    logoPath: getOSLogoPath("debian12"),
    description: "Debian Bookworm"
  },
  {
    id: "ubuntu20",
    name: "Ubuntu 20.04",
    logoPath: getOSLogoPath("ubuntu20"),
    description: "Ubuntu Focal Fossa LTS"
  },
  {
    id: "ubuntu22",
    name: "Ubuntu 22.04",
    logoPath: getOSLogoPath("ubuntu22"),
    description: "Ubuntu Jammy Jellyfish LTS"
  },
  {
    id: "ubuntu24",
    name: "Ubuntu 24.04",
    logoPath: getOSLogoPath("ubuntu24"),
    description: "Ubuntu Noble Numbat LTS"
  },
  {
    id: "windows-2019",
    name: "Windows 2019",
    logoPath: getOSLogoPath("windows-2019"),
    description: "Windows Server 2019"
  },
  {
    id: "windows-2022",
    name: "Windows 2022",
    logoPath: getOSLogoPath("windows-2022"),
    description: "Windows Server 2022"
  }
];

interface OSSelectorProps {
  value: OSType;
  onChange: (os: OSType) => void;
}

const OSSelector = ({ value, onChange }: OSSelectorProps) => {
  return (
    <div className="w-full">
      <div className="mb-4">
        <div className="chip bg-accent text-accent-foreground mb-2">SELECT OPERATING SYSTEM</div>
        <h2 className="text-2xl font-medium">Choose an operating system</h2>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6 stagger-children">
        {osOptions.map((os) => (
          <div
            key={os.id}
            className={cn(
              "os-card group relative cursor-pointer transition-all p-4 rounded-md border",
              value === os.id 
                ? "border-primary bg-primary/5 shadow-sm" 
                : "border-border hover:border-primary/30 hover:bg-accent/10"
            )}
            onClick={() => onChange(os.id)}
          >
            <div className="flex items-center">
              <div className="h-14 w-14 rounded-md flex items-center justify-center mr-4 transition-all duration-300 group-hover:bg-accent-foreground/5">
                <Server className="h-8 w-8 text-muted-foreground" />
              </div>
              <div>
                <h3 className="font-medium text-sm">{os.name}</h3>
                <p className="text-xs text-muted-foreground">{os.description}</p>
              </div>
              {value === os.id && (
                <div className="absolute top-2 right-2 h-5 w-5 rounded-full bg-primary flex items-center justify-center animate-scale-in">
                  <Check className="h-3 w-3 text-white" />
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OSSelector;
