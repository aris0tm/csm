import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, type InsertDeployment } from "@shared/routes";
import { useToast } from "@/hooks/use-toast";

export function useDeployments() {
  return useQuery({
    queryKey: [api.deployments.list.path],
    queryFn: async () => {
      const res = await fetch(api.deployments.list.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch deployments");
      return api.deployments.list.responses[200].parse(await res.json());
    },
  });
}

export function useDeployment(id: number) {
  return useQuery({
    queryKey: [api.deployments.get.path, id],
    queryFn: async () => {
      // Manually construct URL since we don't have buildUrl exported in the provided snippet
      // In a real scenario, use buildUrl helper from routes.ts
      const url = api.deployments.get.path.replace(":id", id.toString());
      const res = await fetch(url, { credentials: "include" });
      
      if (res.status === 404) return null;
      if (!res.ok) throw new Error("Failed to fetch deployment details");
      
      return api.deployments.get.responses[200].parse(await res.json());
    },
    enabled: !!id && !isNaN(id),
  });
}

export function useCreateDeployment() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: InsertDeployment) => {
      const res = await fetch(api.deployments.create.path, {
        method: api.deployments.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to create deployment");
      }
      return api.deployments.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.deployments.list.path] });
      toast({
        title: "Deployment Initiated",
        description: "Infrastructure code generation has started successfully.",
        variant: "default",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Deployment Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}
