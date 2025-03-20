
import { useState } from "react";
import { cn } from "@/lib/utils";

interface FormSectionProps {
  title: string;
  subtitle?: string;
  tag?: string;
  expanded?: boolean;
  children: React.ReactNode;
}

const FormSection = ({ 
  title, 
  subtitle, 
  tag, 
  expanded = true, 
  children 
}: FormSectionProps) => {
  const [isExpanded, setIsExpanded] = useState(expanded);

  return (
    <div className="mb-8 border border-border rounded-lg overflow-hidden bg-white">
      <div 
        className="flex items-center justify-between p-4 cursor-pointer hover:bg-accent/30 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div>
          {tag && <div className="chip bg-accent text-accent-foreground mb-1">{tag}</div>}
          <h3 className="text-lg font-medium">{title}</h3>
          {subtitle && <p className="text-sm text-muted-foreground mt-0.5">{subtitle}</p>}
        </div>
        <button
          type="button"
          className="h-8 w-8 rounded-full flex items-center justify-center text-muted-foreground hover:bg-accent transition-colors"
        >
          <svg 
            width="16" 
            height="16" 
            viewBox="0 0 16 16" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
            className={cn("transition-transform duration-300", isExpanded ? "rotate-180" : "")}
          >
            <path 
              d="M4 6L8 10L12 6" 
              stroke="currentColor" 
              strokeWidth="1.5" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>
      
      <div 
        className={cn(
          "transition-all duration-300 overflow-hidden",
          isExpanded ? "max-h-screen opacity-100" : "max-h-0 opacity-0"
        )}
      >
        <div className="p-4 border-t border-border">
          {children}
        </div>
      </div>
    </div>
  );
};

export default FormSection;
