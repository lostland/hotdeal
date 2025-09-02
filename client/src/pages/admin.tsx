import { useState, useEffect } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ExternalLink, Trash2, Plus, LogOut } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

export default function Admin() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [newUrl, setNewUrl] = useState("");
  const [loginError, setLoginError] = useState("");
  const { toast } = useToast();

  // URLs 조회
  const { data: urls = [], refetch: refetchUrls } = useQuery<string[]>({
    queryKey: ["/api/admin/urls"],
    enabled: isLoggedIn,
  });

  // 로그인 뮤테이션
  const loginMutation = useMutation({
    mutationFn: async (credentials: { username: string; password: string }) => {
      const response = await apiRequest("POST", "/api/admin/login", credentials);
      return response.json();
    },
    onSuccess: (data) => {
      if (data.success) {
        setIsLoggedIn(true);
        setLoginError("");
        refetchUrls();
      } else {
        setLoginError("잘못된 사용자명 또는 비밀번호입니다.");
      }
    },
    onError: () => {
      setLoginError("로그인 중 오류가 발생했습니다.");
    },
  });

  // URL 추가 뮤테이션
  const addUrlMutation = useMutation({
    mutationFn: async (url: string) => {
      const response = await apiRequest("POST", "/api/admin/urls", { url });
      return response.json();
    },
    onSuccess: () => {
      setNewUrl("");
      toast({
        title: "URL 추가 완료",
        description: "새로운 URL이 성공적으로 추가되었습니다.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/urls"] });
    },
    onError: (error: any) => {
      toast({
        title: "URL 추가 실패",
        description: error.message || "URL 추가 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    },
  });

  // URL 삭제 뮤테이션
  const removeUrlMutation = useMutation({
    mutationFn: async (url: string) => {
      await apiRequest("DELETE", "/api/admin/urls", { url });
    },
    onSuccess: () => {
      toast({
        title: "URL 삭제 완료",
        description: "URL이 성공적으로 삭제되었습니다.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/urls"] });
    },
    onError: (error: any) => {
      toast({
        title: "URL 삭제 실패",
        description: error.message || "URL 삭제 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    },
  });

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    loginMutation.mutate({ username, password });
  };

  const handleAddUrl = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUrl) return;
    addUrlMutation.mutate(newUrl);
  };

  const handleRemoveUrl = (url: string) => {
    if (confirm("이 URL을 삭제하시겠습니까?")) {
      removeUrlMutation.mutate(url);
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUsername("");
    setPassword("");
    setLoginError("");
  };

  // 로그인 페이지
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-2xl text-center">관리자 로그인</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label htmlFor="username" className="block text-sm font-medium mb-2">
                  사용자명
                </label>
                <Input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  data-testid="input-admin-username"
                />
              </div>
              <div>
                <label htmlFor="password" className="block text-sm font-medium mb-2">
                  비밀번호
                </label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  data-testid="input-admin-password"
                />
              </div>
              {loginError && (
                <Alert variant="destructive">
                  <AlertDescription>{loginError}</AlertDescription>
                </Alert>
              )}
              <Button
                type="submit"
                className="w-full"
                disabled={loginMutation.isPending}
                data-testid="button-admin-login"
              >
                {loginMutation.isPending ? "로그인 중..." : "로그인"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  // 관리자 대시보드
  return (
    <div className="min-h-screen bg-background">
      {/* 헤더 */}
      <header className="bg-card border-b border-border">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <h1 className="text-2xl font-bold text-foreground">URL 관리</h1>
            <Button
              variant="outline"
              onClick={handleLogout}
              data-testid="button-admin-logout"
            >
              <LogOut className="w-4 h-4 mr-2" />
              로그아웃
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* URL 추가 폼 */}
        <Card>
          <CardHeader>
            <CardTitle>새 URL 추가</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddUrl} className="flex gap-4">
              <Input
                type="url"
                placeholder="https://example.com"
                value={newUrl}
                onChange={(e) => setNewUrl(e.target.value)}
                className="flex-1"
                required
                data-testid="input-new-url"
              />
              <Button
                type="submit"
                disabled={addUrlMutation.isPending}
                data-testid="button-add-url"
              >
                <Plus className="w-4 h-4 mr-2" />
                {addUrlMutation.isPending ? "추가 중..." : "추가"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* URL 목록 */}
        <Card>
          <CardHeader>
            <CardTitle>등록된 URL 목록</CardTitle>
          </CardHeader>
          <CardContent>
            {urls.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                등록된 URL이 없습니다.
              </div>
            ) : (
              <div className="space-y-4">
                {urls.map((url) => (
                  <div
                    key={url}
                    className="flex items-center justify-between p-4 border border-border rounded-lg"
                    data-testid={`url-item-${btoa(url)}`}
                  >
                    <div className="flex-1 min-w-0">
                      <a
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline break-all flex items-center gap-2"
                        data-testid="link-url"
                      >
                        <ExternalLink className="w-4 h-4 flex-shrink-0" />
                        {url}
                      </a>
                    </div>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleRemoveUrl(url)}
                      disabled={removeUrlMutation.isPending}
                      data-testid={`button-remove-${btoa(url)}`}
                    >
                      <Trash2 className="w-4 h-4" />
                      삭제
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}