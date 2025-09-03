import { useState, useEffect, useRef } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ExternalLink, Trash2, Plus, LogOut, Edit2, Save, X, Upload } from "lucide-react";
import { type Link } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { ObjectUploader, type ObjectUploaderRef } from "@/components/ObjectUploader";

export default function Admin() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [newUrl, setNewUrl] = useState("");
  const [newNote, setNewNote] = useState("");
  const [newCustomImage, setNewCustomImage] = useState("");
  const [loginError, setLoginError] = useState("");
  const [editingLink, setEditingLink] = useState<Link | null>(null);
  const [editUrl, setEditUrl] = useState("");
  const [editNote, setEditNote] = useState("");
  const [editCustomImage, setEditCustomImage] = useState("");
  const { toast } = useToast();
  
  const newImageUploaderRef = useRef<ObjectUploaderRef>(null);
  const editImageUploaderRef = useRef<ObjectUploaderRef>(null);

  // URLs 조회
  const { data: urls = [], refetch: refetchUrls } = useQuery<string[]>({
    queryKey: ["/api/admin/urls"],
    enabled: isLoggedIn,
  });

  // Links 조회 (참고사항 포함)
  const { data: links = [], refetch: refetchLinks } = useQuery<Link[]>({
    queryKey: ["/api/links"],
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
    mutationFn: async (data: { url: string; note?: string; customImage?: string }) => {
      // 드래그 앤 드롭된 파일이 있으면 먼저 업로드
      const selectedFile = newImageUploaderRef.current?.getSelectedFile();
      let customImageUrl = data.customImage;
      
      if (selectedFile) {
        const uploadResult = await newImageUploaderRef.current?.uploadSelectedFile();
        if (uploadResult?.successful?.[0]?.uploadURL) {
          customImageUrl = uploadResult.successful[0].uploadURL;
        }
      }
      
      const response = await apiRequest("POST", "/api/admin/urls", {
        ...data,
        customImage: customImageUrl
      });
      return response.json();
    },
    onSuccess: () => {
      setNewUrl("");
      setNewNote("");
      setNewCustomImage("");
      newImageUploaderRef.current?.clearSelectedFile();
      toast({
        title: "URL 추가 완료",
        description: "새로운 URL이 성공적으로 추가되었습니다.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/urls"] });
      queryClient.invalidateQueries({ queryKey: ["/api/links"] });
    },
    onError: (error: any) => {
      toast({
        title: "URL 추가 실패",
        description: error.message || "URL 추가 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    },
  });

  // URL 수정 뮤테이션
  const updateUrlMutation = useMutation({
    mutationFn: async (data: { oldUrl: string; newUrl: string; note?: string; customImage?: string }) => {
      // 편집 중 드래그 앤 드롭된 파일이 있으면 먼저 업로드
      const selectedFile = editImageUploaderRef.current?.getSelectedFile();
      let customImageUrl = data.customImage;
      
      if (selectedFile) {
        const uploadResult = await editImageUploaderRef.current?.uploadSelectedFile();
        if (uploadResult?.successful?.[0]?.uploadURL) {
          customImageUrl = uploadResult.successful[0].uploadURL;
        }
      }
      
      const response = await apiRequest("PUT", "/api/admin/urls", {
        ...data,
        customImage: customImageUrl
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "URL 수정 완료",
        description: "URL이 성공적으로 수정되었습니다.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/urls"] });
      queryClient.invalidateQueries({ queryKey: ["/api/links"] });
      handleCancelEdit();
    },
    onError: (error: any) => {
      toast({
        title: "URL 수정 실패",
        description: error.message || "URL 수정 중 오류가 발생했습니다.",
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
      queryClient.invalidateQueries({ queryKey: ["/api/links"] });
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
    addUrlMutation.mutate({ 
      url: newUrl, 
      note: newNote.trim() || undefined,
      customImage: newCustomImage.trim() || undefined
    });
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

  const handleEditLink = (link: Link) => {
    setEditingLink(link);
    setEditUrl(link.url);
    setEditNote(link.note || "");
    setEditCustomImage(link.customImage || "");
  };

  const handleCancelEdit = () => {
    setEditingLink(null);
    setEditUrl("");
    setEditNote("");
    setEditCustomImage("");
    editImageUploaderRef.current?.clearSelectedFile();
  };

  const handleSaveEdit = () => {
    if (editingLink && editUrl.trim()) {
      updateUrlMutation.mutate({
        oldUrl: editingLink.url,
        newUrl: editUrl.trim(),
        note: editNote.trim() || undefined,
        customImage: editCustomImage.trim() || undefined
      });
    }
  };

  // 이미지 업로드 핸들러
  const handleGetUploadParameters = async () => {
    const response = await apiRequest("POST", "/api/objects/upload");
    const data = await response.json();
    return {
      method: "PUT" as const,
      url: data.uploadURL,
    };
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
            <form onSubmit={handleAddUrl} className="space-y-4">
              <div>
                <label htmlFor="new-url" className="block text-sm font-medium mb-2">
                  URL
                </label>
                <Input
                  id="new-url"
                  type="url"
                  placeholder="https://example.com"
                  value={newUrl}
                  onChange={(e) => setNewUrl(e.target.value)}
                  required
                  data-testid="input-new-url"
                />
              </div>
              <div>
                <label htmlFor="new-note" className="block text-sm font-medium mb-2">
                  참고사항 (선택사항)
                </label>
                <Input
                  id="new-note"
                  type="text"
                  placeholder="특가, 할인정보, 기타 메모 등..."
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  data-testid="input-new-note"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  커스텀 이미지 (선택사항)
                </label>
                <ObjectUploader
                  ref={newImageUploaderRef}
                  onGetUploadParameters={handleGetUploadParameters}
                  showDropZone={true}
                >
                  <Upload className="w-4 h-4 mr-2" />
                  이미지 업로드
                </ObjectUploader>
              </div>
              <Button
                type="submit"
                disabled={addUrlMutation.isPending}
                data-testid="button-add-url"
                className="w-full"
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
            {links.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                등록된 URL이 없습니다.
              </div>
            ) : (
              <div className="space-y-4">
                {links.map((link) => (
                  <div
                    key={link.id}
                    className="p-4 border border-border rounded-lg"
                    data-testid={`link-item-${link.id}`}
                  >
                    {editingLink && editingLink.id === link.id ? (
                      // 편집 모드
                      <div className="space-y-3">
                        <div>
                          <label className="block text-sm font-medium mb-1">URL</label>
                          <Input
                            value={editUrl}
                            onChange={(e) => setEditUrl(e.target.value)}
                            placeholder="https://example.com"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">참고사항</label>
                          <Input
                            value={editNote}
                            onChange={(e) => setEditNote(e.target.value)}
                            placeholder="특가, 할인정보, 기타 메모 등..."
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">커스텀 이미지</label>
                          <ObjectUploader
                            ref={editImageUploaderRef}
                            onGetUploadParameters={handleGetUploadParameters}
                            showDropZone={true}
                          >
                            <Upload className="w-4 h-4 mr-2" />
                            이미지 업로드
                          </ObjectUploader>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={handleSaveEdit}
                            disabled={!editUrl.trim() || updateUrlMutation.isPending}
                          >
                            <Save className="w-4 h-4 mr-1" />
                            {updateUrlMutation.isPending ? "저장 중..." : "저장"}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={handleCancelEdit}
                          >
                            <X className="w-4 h-4 mr-1" />
                            취소
                          </Button>
                        </div>
                      </div>
                    ) : (
                      // 일반 표시 모드
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <a
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline break-all flex items-center gap-2 flex-1"
                            data-testid="link-url"
                          >
                            <ExternalLink className="w-4 h-4 flex-shrink-0" />
                            {link.url}
                          </a>
                          <div className="flex gap-2 ml-4">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEditLink(link)}
                              data-testid={`button-edit-${link.id}`}
                            >
                              <Edit2 className="w-4 h-4" />
                              수정
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleRemoveUrl(link.url)}
                              disabled={removeUrlMutation.isPending}
                              data-testid={`button-remove-${link.id}`}
                            >
                              <Trash2 className="w-4 h-4" />
                              삭제
                            </Button>
                          </div>
                        </div>
                        {link.note && (
                          <div className="text-sm text-muted-foreground bg-muted/50 p-2 rounded">
                            <strong>참고사항:</strong> {link.note}
                          </div>
                        )}
                        {link.title && (
                          <div className="text-sm text-muted-foreground">
                            <strong>제목:</strong> {link.title}
                          </div>
                        )}
                        {link.customImage && (
                          <div className="text-sm text-muted-foreground">
                            <strong>커스텀 이미지:</strong> 설정됨
                          </div>
                        )}
                      </div>
                    )}
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