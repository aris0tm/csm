import { useDeployment } from "@/hooks/use-deployments";
import { Link, useRoute } from "wouter";
import { CodeViewer } from "@/components/CodeViewer";
import { ArrowLeft, Download, Terminal, CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

export default function DeploymentDetails() {
  const [, params] = useRoute("/deployments/:id");
  const id = parseInt(params?.id || "0");
  const { data: deployment, isLoading, error } = useDeployment(id);

  if (isLoading) return <div className="space-y-4"><Skeleton className="h-12 w-full" /><Skeleton className="h-96 w-full" /></div>;
  if (error || !deployment) return <div>Error loading deployment</div>;

  const files = deployment.generatedFiles as Record<string, string>;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/">
            <Button variant="ghost" size="icon" className="h-10 w-10">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold tracking-tight font-mono">
                {deployment.provider.toUpperCase()} / {deployment.region}
              </h1>
              <Badge variant={deployment.status === "generated" ? "default" : "destructive"}>
                {deployment.status.toUpperCase()}
              </Badge>
            </div>
            <p className="text-muted-foreground font-mono text-sm mt-1">
              ID: {deployment.id} • Instance: {deployment.instanceSize}
            </p>
          </div>
        </div>

        <Button variant="outline" className="gap-2">
          <Download className="w-4 h-4" />
          Download .zip
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <CodeViewer files={files} />
        </div>

        <div className="space-y-6">
          <Card className="bg-card border-border shadow-lg">
            <CardContent className="p-6 space-y-6">
              <div>
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-primary" />
                  Deployment Steps
                </h3>
                <div className="space-y-6 relative pl-4 border-l-2 border-border/50 ml-2">
                  <div className="relative">
                    <div className="absolute -left-[21px] top-0 w-3 h-3 rounded-full bg-green-500 border-2 border-card" />
                    <p className="text-sm font-medium">Configuration Received</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Parameters validated successfully
                    </p>
                  </div>
                  <div className="relative">
                    <div className="absolute -left-[21px] top-0 w-3 h-3 rounded-full bg-green-500 border-2 border-card" />
                    <p className="text-sm font-medium">Terraform Generation</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      main.tf and variables.tf created
                    </p>
                  </div>
                  <div className="relative">
                    <div className={deployment.status === 'generated' ? "absolute -left-[21px] top-0 w-3 h-3 rounded-full bg-green-500 border-2 border-card animate-pulse" : "absolute -left-[21px] top-0 w-3 h-3 rounded-full bg-destructive border-2 border-card" } />
                    <p className="text-sm font-medium">Complete</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Ready for deployment
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-lg bg-secondary/50 border border-border">
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Next Steps</h4>
                <p className="text-sm mb-3">Run the following command to deploy:</p>
                <code className="block bg-black/50 p-3 rounded text-green-400 font-mono text-xs overflow-x-auto whitespace-nowrap">
                  ./deploy.sh
                </code>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
