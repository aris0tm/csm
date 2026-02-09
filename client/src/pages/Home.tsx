import { useDeployments } from "@/hooks/use-deployments";
import { Link } from "wouter";
import { Plus, Server, Clock, ArrowRight, Activity, Box } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

export default function Home() {
  const { data: deployments, isLoading, error } = useDeployments();

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="flex justify-between items-center">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid grid-cols-1 gap-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-24 w-full rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center p-8 border border-destructive/20 rounded-2xl bg-destructive/5">
        <Activity className="w-12 h-12 text-destructive mb-4" />
        <h2 className="text-xl font-bold text-destructive mb-2">System Error</h2>
        <p className="text-muted-foreground">{error.message}</p>
      </div>
    );
  }

  const sortedDeployments = deployments?.sort((a, b) => 
    new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime()
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">Deployments</h1>
          <p className="text-muted-foreground">Manage and monitor your infrastructure deployments.</p>
        </div>
        
        <Link href="/new">
          <Button className="shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all">
            <Plus className="w-4 h-4 mr-2" />
            New Deployment
          </Button>
        </Link>
      </div>

      {!sortedDeployments?.length ? (
        <div className="flex flex-col items-center justify-center py-20 border border-dashed border-border rounded-3xl bg-card/50">
          <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mb-6">
            <Box className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-bold mb-2">No deployments yet</h3>
          <p className="text-muted-foreground max-w-md text-center mb-8">
            Start by creating your first infrastructure deployment configuration.
          </p>
          <Link href="/new">
            <Button variant="outline">Create Deployment</Button>
          </Link>
        </div>
      ) : (
        <div className="grid gap-4">
          {sortedDeployments.map((deployment) => (
            <Link key={deployment.id} href={`/deployments/${deployment.id}`}>
              <div className="group relative bg-card border border-border rounded-xl p-6 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 cursor-pointer overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary/10 to-transparent rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity" />
                
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-lg bg-secondary flex items-center justify-center shrink-0 border border-border group-hover:border-primary/30 transition-colors">
                      <Server className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold text-lg group-hover:text-primary transition-colors">
                          {deployment.provider.toUpperCase()} Infrastructure
                        </h3>
                        <Badge variant="outline" className="font-mono text-[10px] uppercase bg-secondary/50">
                          {deployment.region}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1.5">
                          <Box className="w-3.5 h-3.5" />
                          {deployment.instanceSize}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5" />
                          {deployment.createdAt && format(new Date(deployment.createdAt), "MMM d, yyyy • HH:mm")}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between md:justify-end gap-4 w-full md:w-auto">
                    <Badge className={
                      deployment.status === "generated" 
                        ? "bg-green-500/15 text-green-500 hover:bg-green-500/25 border-green-500/20" 
                        : "bg-destructive/15 text-destructive hover:bg-destructive/25 border-destructive/20"
                    }>
                      {deployment.status.toUpperCase()}
                    </Badge>
                    <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
