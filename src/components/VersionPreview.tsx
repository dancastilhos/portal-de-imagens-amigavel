
import { useEffect, useState } from "react";
import { formatToTerragrunt, createAMIVersionBlock, createFullTerragruntHCL } from "@/lib/terragruntUtils";
import { FormData } from "@/lib/types";

interface VersionPreviewProps {
  formData: FormData;
}

const VersionPreview = ({ formData }: VersionPreviewProps) => {
  const [preview, setPreview] = useState("");
  const [fullPreview, setFullPreview] = useState("");
  const [nextVersion, setNextVersion] = useState("");
  
  useEffect(() => {
    if (formData.currentVersion && formData.imageName) {
      const amiVersion = createAMIVersionBlock(formData);
      setNextVersion(amiVersion.version);
      setPreview(formatToTerragrunt(amiVersion));
      setFullPreview(createFullTerragruntHCL(formData.os, amiVersion));
    }
  }, [formData]);

  if (!formData.currentVersion || !formData.imageName) {
    return (
      <div className="p-6 bg-secondary/50 rounded-lg border border-border">
        <p className="text-center text-muted-foreground text-sm">
          Complete o formulário para ver a pré-visualização
        </p>
      </div>
    );
  }

  return (
    <div className="bg-secondary/50 rounded-lg border border-border overflow-hidden">
      <div className="px-4 py-3 bg-secondary border-b border-border flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 rounded-full bg-destructive/70"></div>
          <div className="w-3 h-3 rounded-full bg-amber-400/70"></div>
          <div className="w-3 h-3 rounded-full bg-green-500/70"></div>
        </div>
        <div className="text-xs font-medium text-muted-foreground flex items-center gap-2">
          <img src="/lovable-uploads/aws.png" alt="AWS Logo" className="h-5 w-auto" />
          Versão {nextVersion} - Arquivo terragrunt.hcl completo
        </div>
        <div className="w-16"></div>
      </div>
      <pre className="overflow-auto p-4 text-sm font-mono text-foreground/80 max-h-[400px]">
        <code>{fullPreview}</code>
      </pre>
    </div>
  );
};

export default VersionPreview;
