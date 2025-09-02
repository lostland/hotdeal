import { useQuery, useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { Link } from "@shared/schema";
import { queryClient } from "@/lib/queryClient";
import { AppHeader } from "@/components/app-header";
import { LinkCard } from "@/components/link-card";
import { LoadingCard } from "@/components/loading-card";
import { ErrorCard } from "@/components/error-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, ExternalLink } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

const addLinkSchema = z.object({
  url: z.string().url("유효한 URL을 입력해주세요"),
});

type AddLinkForm = z.infer<typeof addLinkSchema>;

export default function Home() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const { toast } = useToast();

  const { data: links = [], isLoading, error, refetch } = useQuery<Link[]>({
    queryKey: ["/api/links"],
  });

  const form = useForm<AddLinkForm>({
    resolver: zodResolver(addLinkSchema),
    defaultValues: {
      url: "",
    },
  });

  const addLinkMutation = useMutation({
    mutationFn: async (data: AddLinkForm) => {
      const response = await apiRequest("POST", "/api/links", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/links"] });
      setIsAddDialogOpen(false);
      form.reset();
      toast({
        title: "링크 추가 완료",
        description: "새로운 링크가 성공적으로 추가되었습니다.",
      });
    },
    onError: (error) => {
      toast({
        title: "링크 추가 실패",
        description: error.message || "링크를 추가하는 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    },
  });

  const deleteLinkMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/links/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/links"] });
      toast({
        title: "링크 삭제 완료",
        description: "링크가 성공적으로 삭제되었습니다.",
      });
    },
    onError: (error) => {
      toast({
        title: "링크 삭제 실패",
        description: error.message || "링크를 삭제하는 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: AddLinkForm) => {
    addLinkMutation.mutate(data);
  };

  const handleLinkClick = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleDeleteLink = (id: string) => {
    deleteLinkMutation.mutate(id);
  };

  const handleRetryLoad = () => {
    refetch();
  };

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <AppHeader />
        <main className="max-w-md mx-auto px-4 py-6">
          <ErrorCard
            title="링크를 불러올 수 없습니다"
            description="네트워크 연결을 확인하고 다시 시도해주세요."
            onRetry={handleRetryLoad}
          />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      
      <main className="max-w-md mx-auto pb-20">
        <div className="px-4 pt-4">
          {isLoading ? (
            // Show loading cards
            Array.from({ length: 3 }).map((_, index) => (
              <LoadingCard key={index} />
            ))
          ) : links.length === 0 ? (
            // Empty state
            <div className="px-4 py-12 text-center" data-testid="empty-state">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <ExternalLink className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium text-foreground mb-2">링크가 없습니다</h3>
              <p className="text-sm text-muted-foreground">새로운 링크를 추가해보세요.</p>
            </div>
          ) : (
            // Render link cards
            links.map((link) => (
              <LinkCard
                key={link.id}
                link={link}
                onClick={() => handleLinkClick(link.url)}
                onDelete={() => handleDeleteLink(link.id)}
                data-testid={`link-card-${link.id}`}
              />
            ))
          )}
        </div>
      </main>

      {/* Floating Action Button */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogTrigger asChild>
          <Button
            className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 active:scale-95"
            size="icon"
            data-testid="button-add-link"
          >
            <Plus className="w-6 h-6" />
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-sm mx-auto">
          <DialogHeader>
            <DialogTitle>새 링크 추가</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>웹사이트 URL</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="https://example.com"
                        {...field}
                        data-testid="input-url"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsAddDialogOpen(false)}
                  className="flex-1"
                  data-testid="button-cancel"
                >
                  취소
                </Button>
                <Button
                  type="submit"
                  className="flex-1"
                  disabled={addLinkMutation.isPending}
                  data-testid="button-submit"
                >
                  {addLinkMutation.isPending ? "추가 중..." : "추가"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
