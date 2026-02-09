import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

interface ProviderCardProps {
  id: string;
  name: string;
  selected: boolean;
  onSelect: (id: string) => void;
  icon: React.ReactNode;
}

export function ProviderCard({ id, name, selected, onSelect, icon }: ProviderCardProps) {
  return (
    <div
      onClick={() => onSelect(id)}
      className={cn(
        "relative flex flex-col items-center justify-center p-6 rounded-xl border-2 cursor-pointer transition-all duration-300",
        "hover:shadow-lg hover:shadow-primary/10 hover:border-primary/50 group bg-card",
        selected 
          ? "border-primary bg-primary/5 shadow-xl shadow-primary/20 scale-[1.02]" 
          : "border-border hover:bg-secondary/50"
      )}
    >
      {selected && (
        <div className="absolute top-3 right-3 w-6 h-6 bg-primary rounded-full flex items-center justify-center text-primary-foreground shadow-sm">
          <Check className="w-4 h-4" />
        </div>
      )}
      
      <div className={cn(
        "w-16 h-16 rounded-2xl flex items-center justify-center mb-4 transition-transform duration-300",
        selected ? "bg-primary/20 text-primary" : "bg-secondary text-muted-foreground group-hover:scale-110 group-hover:text-foreground"
      )}>
        {icon}
      </div>
      
      <h3 className={cn(
        "text-lg font-bold font-mono tracking-tight",
        selected ? "text-primary" : "text-foreground"
      )}>
        {name}
      </h3>
    </div>
  );
}
