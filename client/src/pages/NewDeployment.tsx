import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertDeploymentSchema, type InsertDeployment } from "@shared/schema";
import { useCreateDeployment } from "@/hooks/use-deployments";
import { useLocation } from "wouter";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { ProviderCard } from "@/components/ProviderCard";
import { Cloud, Globe, Box, Rocket, ArrowLeft } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Link } from "wouter";

const PROVIDERS = [
  { id: "aws", name: "AWS", icon: <Cloud className="w-8 h-8" /> },
  { id: "azure", name: "Azure", icon: <Globe className="w-8 h-8" /> },
  { id: "gcp", name: "GCP", icon: <Box className="w-8 h-8" /> },
];

const REGIONS = {
  aws: ["us-east-1", "us-west-2", "eu-central-1"],
  azure: ["eastus", "westus", "northeurope"],
  gcp: ["us-central1", "us-west1", "europe-west1"],
};

const SIZES = {
  aws: ["t2.micro", "t3.medium", "m5.large"],
  azure: ["Standard_B1s", "Standard_B2s", "Standard_D2s_v3"],
  gcp: ["e2-micro", "e2-medium", "n1-standard-1"],
};

export default function NewDeployment() {
  const [, setLocation] = useLocation();
  const mutation = useCreateDeployment();

  const form = useForm<InsertDeployment>({
    resolver: zodResolver(insertDeploymentSchema),
    defaultValues: {
      provider: "aws",
      region: "",
      instanceSize: "",
    },
  });

  const selectedProvider = form.watch("provider") as keyof typeof REGIONS;

  const onSubmit = (data: InsertDeployment) => {
    mutation.mutate(data, {
      onSuccess: (res) => {
        setLocation(`/deployments/${res.id}`);
      },
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex items-center gap-4">
        <Link href="/">
          <Button variant="ghost" size="icon" className="h-10 w-10">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">New Deployment</h1>
          <p className="text-muted-foreground">Configure your infrastructure generation parameters.</p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          
          <div className="space-y-4">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <span className="w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-bold">1</span>
              Select Cloud Provider
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <FormField
                control={form.control}
                name="provider"
                render={({ field }) => (
                  <>
                    {PROVIDERS.map((provider) => (
                      <ProviderCard
                        key={provider.id}
                        {...provider}
                        selected={field.value === provider.id}
                        onSelect={(id) => {
                          field.onChange(id);
                          form.setValue("region", "");
                          form.setValue("instanceSize", "");
                        }}
                      />
                    ))}
                  </>
                )}
              />
            </div>
            <FormMessage>{form.formState.errors.provider?.message}</FormMessage>
          </div>

          <Separator className="bg-border/50" />

          <div className="space-y-4">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <span className="w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-bold">2</span>
              Configuration
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <FormField
                control={form.control}
                name="region"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Region</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="h-12 text-base">
                          <SelectValue placeholder="Select a region" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {REGIONS[selectedProvider]?.map((region) => (
                          <SelectItem key={region} value={region}>
                            {region}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="instanceSize"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Instance Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="h-12 text-base">
                          <SelectValue placeholder="Select instance type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {SIZES[selectedProvider]?.map((size) => (
                          <SelectItem key={size} value={size}>
                            {size}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          <div className="flex justify-end pt-8">
            <Button 
              type="submit" 
              size="lg" 
              disabled={mutation.isPending}
              className="text-base px-8 h-12 shadow-xl shadow-primary/20 hover:shadow-primary/30 transition-all hover:-translate-y-0.5"
            >
              {mutation.isPending ? (
                <>
                  <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin mr-2" />
                  Generating...
                </>
              ) : (
                <>
                  <Rocket className="w-5 h-5 mr-2" />
                  Generate Infrastructure
                </>
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
