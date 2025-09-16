import { useState, useEffect, useRef } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ExternalLink, Trash2, Plus, LogOut, Edit2, Save, X, Upload, Key, Download, FileUp, LinkIcon, ImageIcon , StickyNote } from "lucide-react";
import { type Link } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { ObjectUploader, type ObjectUploaderRef } from "@/components/ObjectUploader";

export default function Admin() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUsername, setCurrentUsername] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [newUrl, setNewUrl] = useState("");
  const [newNote, setNewNote] = useState("");
  const [newCustomImage, setNewCustomImage] = useState("");
  const [newImagePreview, setNewImagePreview] = useState("");
  const [loginError, setLoginError] = useState("");
  const [editingLink, setEditingLink] = useState<Link | null>(null);
  const [editUrl, setEditUrl] = useState("");
  const [editTitle, setEditTitle] = useState("");
  const [editNote, setEditNote] = useState("");
  const [editCustomImage, setEditCustomImage] = useState("");
  const [editImagePreview, setEditImagePreview] = useState("");
  // 비밀번호 변경 상태
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  // 백업/복원 상태
  const [showRestoreDialog, setShowRestoreDialog] = useState(false);
  const [restoreFile, setRestoreFile] = useState<File | null>(null);
  const { toast } = useToast();
  
  const newImageUploaderRef = useRef<ObjectUploaderRef>(null);
  const editImageUploaderRef = useRef<ObjectUploaderRef>(null);

  // 페이지 로드 시 localStorage에서 로그인 상태 확인
  useEffect(() => {
    const savedUsername = localStorage.getItem('adminUsername');
    if (savedUsername) {
      setIsLoggedIn(true);
      setCurrentUsername(savedUsername);
    }
  }, []);

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
        setCurrentUsername(data.username);
        localStorage.setItem('adminUsername', data.username);
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
        if (uploadResult?.successful?.[0]?.imageUrl) {
          customImageUrl = uploadResult.successful[0].imageUrl;
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
      setNewImagePreview("");
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
    mutationFn: async (data: { oldUrl: string; newUrl: string; title?: string; note?: string; customImage?: string }) => {
      // 편집 중 드래그 앤 드롭된 파일이 있으면 먼저 업로드
      const selectedFile = editImageUploaderRef.current?.getSelectedFile();
      let customImageUrl = data.customImage;
      
      if (selectedFile) {
        const uploadResult = await editImageUploaderRef.current?.uploadSelectedFile();
        if (uploadResult?.successful?.[0]?.imageUrl) {
          customImageUrl = uploadResult.successful[0].imageUrl;
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

  // 비밀번호 변경 뮤테이션
  const changePasswordMutation = useMutation({
    mutationFn: async (data: { username: string; oldPassword: string; newPassword: string }) => {
      const response = await apiRequest("POST", "/api/admin/change-password", data);
      return response.json();
    },
    onSuccess: (data) => {
      if (data.success) {
        toast({
          title: "비밀번호 변경 완료",
          description: data.message,
        });
        setShowPasswordDialog(false);
        setOldPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        toast({
          title: "비밀번호 변경 실패",
          description: data.message,
          variant: "destructive",
        });
      }
    },
    onError: (error: any) => {
      toast({
        title: "비밀번호 변경 실패",
        description: error.message || "비밀번호 변경 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    },
  });

  // 백업 다운로드 뮤테이션
  const downloadBackupMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("GET", "/api/admin/backup");
      return response.blob();
    },
    onSuccess: (blob) => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `links-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast({
        title: "백업 완료",
        description: "데이터 백업이 다운로드되었습니다.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "백업 실패",
        description: error.message || "백업 생성 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    },
  });

  // 백업 복원 뮤테이션
  const restoreBackupMutation = useMutation({
    mutationFn: async (backupData: any) => {
      const response = await apiRequest("POST", "/api/admin/restore", { backupData });
      return response.json();
    },
    onSuccess: (data) => {
      if (data.success) {
        toast({
          title: "복원 완료",
          description: data.message,
        });
        setShowRestoreDialog(false);
        setRestoreFile(null);
        queryClient.invalidateQueries({ queryKey: ["/api/admin/urls"] });
        queryClient.invalidateQueries({ queryKey: ["/api/links"] });
      } else {
        toast({
          title: "복원 실패",
          description: data.message,
          variant: "destructive",
        });
      }
    },
    onError: (error: any) => {
      toast({
        title: "복원 실패",
        description: error.message || "데이터 복원 중 오류가 발생했습니다.",
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

  const handleLogout = async () => {
    try {
      // 서버 세션 무효화
      await apiRequest("POST", "/api/admin/logout");
    } catch (error) {
      // 로그아웃 API 오류는 무시 (클라이언트 로그아웃은 계속 진행)
      console.log('서버 세션 무효화 오류:', error);
    }
    
    // 클라이언트 상태 초기화
    setIsLoggedIn(false);
    setCurrentUsername("");
    setUsername("");
    setPassword("");
    setLoginError("");
    localStorage.removeItem('adminUsername');
    
    // 쿼리 캐시 초기화
    queryClient.clear();
    
    toast({
      title: "로그아웃 완료",
      description: "성공적으로 로그아웃되었습니다.",
    });
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!oldPassword || !newPassword || !confirmPassword) {
      toast({
        title: "입력 오류",
        description: "모든 필드를 입력해주세요.",
        variant: "destructive",
      });
      return;
    }
    
    if (newPassword !== confirmPassword) {
      toast({
        title: "입력 오류", 
        description: "새 비밀번호가 일치하지 않습니다.",
        variant: "destructive",
      });
      return;
    }
    
    changePasswordMutation.mutate({
      username: currentUsername,
      oldPassword,
      newPassword,
    });
  };

  const handleDownloadBackup = () => {
    downloadBackupMutation.mutate();
  };

  const handleRestoreBackup = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!restoreFile) {
      toast({
        title: "파일 선택 필요",
        description: "복원할 백업 파일을 선택해주세요.",
        variant: "destructive",
      });
      return;
    }
    
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const backupData = JSON.parse(event.target?.result as string);
        restoreBackupMutation.mutate(backupData);
      } catch (error) {
        toast({
          title: "파일 형식 오류",
          description: "올바른 JSON 백업 파일을 선택해주세요.",
          variant: "destructive",
        });
      }
    };
    reader.readAsText(restoreFile);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // 파일 확장자와 MIME 타입 모두 확인 (브라우저 호환성)
      const isJsonFile = file.type === "application/json" || 
                       file.type === "text/json" || 
                       file.name.toLowerCase().endsWith('.json');
      
      if (isJsonFile) {
        setRestoreFile(file);
      } else {
        toast({
          title: "파일 형식 오류",
          description: "JSON 파일(.json)만 선택할 수 있습니다.",
          variant: "destructive",
        });
        e.target.value = "";
      }
    }
  };

  const handleEditLink = (link: Link) => {
    setEditingLink(link);
    setEditUrl(link.url);
    setEditTitle(link.title || "");
    setEditNote(link.note || "");
    setEditCustomImage(link.customImage || "");
    setEditImagePreview(link.customImage || "");
  };

  const handleCancelEdit = () => {
    setEditingLink(null);
    setEditUrl("");
    setEditTitle("");
    setEditNote("");
    setEditCustomImage("");
    setEditImagePreview("");
    editImageUploaderRef.current?.clearSelectedFile();
  };

  const handleSaveEdit = () => {
    if (editingLink) {
      updateUrlMutation.mutate({
        oldUrl: editingLink.url,
        newUrl: editUrl.trim(),
        title: editTitle.trim() || undefined,
        note: editNote.trim() || undefined,
        customImage: editCustomImage.trim() || undefined
      });
    }
  };

  // 이미지 업로드 핸들러
  const handleNewImageFileSelected = (file: File | null) => {
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setNewImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setNewImagePreview("");
    }
  };

  const handleEditImageFileSelected = (file: File | null) => {
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setEditImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setEditImagePreview(editingLink?.customImage || "");
    }
  };


  // 로그인 페이지
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md space-y-2 bg-indigo-200 rounded-lg p-2">
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
            <div>
              <h1 className="text-2xl font-bold text-foreground">URL 관리</h1>
              <p className="text-sm text-muted-foreground">{currentUsername}님으로 로그인</p>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownloadBackup}
                disabled={downloadBackupMutation.isPending}
                data-testid="button-download-backup"
              >
                <Download className="w-4 h-4 mr-2" />
                {downloadBackupMutation.isPending ? "다운로드 중..." : "백업"}
              </Button>
              
              <Dialog open={showRestoreDialog} onOpenChange={setShowRestoreDialog}>
                <DialogTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    data-testid="button-restore-backup"
                  >
                    <FileUp className="w-4 h-4 mr-2" />
                    복원
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>백업 데이터 복원</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleRestoreBackup} className="space-y-4">
                    <div>
                      <label htmlFor="backup-file" className="block text-sm font-medium mb-2">
                        백업 파일 선택 (.json)
                      </label>
                      <input
                        id="backup-file"
                        type="file"
                        accept=".json"
                        onChange={handleFileChange}
                        className="w-full p-2 border border-input rounded-md bg-background"
                        data-testid="input-backup-file"
                      />
                      {restoreFile && (
                        <p className="text-sm text-muted-foreground mt-1">
                          선택된 파일: {restoreFile.name}
                        </p>
                      )}
                    </div>
                    <div className="flex justify-end gap-3">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setShowRestoreDialog(false);
                          setRestoreFile(null);
                        }}
                      >
                        취소
                      </Button>
                      <Button
                        type="submit"
                        disabled={restoreBackupMutation.isPending || !restoreFile}
                        data-testid="button-submit-restore"
                      >
                        {restoreBackupMutation.isPending ? "복원 중..." : "복원"}
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
              
              <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
                <DialogTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    data-testid="button-change-password"
                  >
                    <Key className="w-4 h-4 mr-2" />
                    비번 변경
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>비밀번호 변경</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleChangePassword} className="space-y-4">
                    <div>
                      <label htmlFor="old-password" className="block text-sm font-medium mb-2">
                        현재 비밀번호
                      </label>
                      <Input
                        id="old-password"
                        type="password"
                        value={oldPassword}
                        onChange={(e) => setOldPassword(e.target.value)}
                        required
                        data-testid="input-old-password"
                      />
                    </div>
                    <div>
                      <label htmlFor="new-password" className="block text-sm font-medium mb-2">
                        새 비밀번호
                      </label>
                      <Input
                        id="new-password"
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                        data-testid="input-new-password"
                      />
                    </div>
                    <div>
                      <label htmlFor="confirm-password" className="block text-sm font-medium mb-2">
                        새 비밀번호 확인
                      </label>
                      <Input
                        id="confirm-password"
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        data-testid="input-confirm-password"
                      />
                    </div>
                    <div className="flex justify-end gap-3">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setShowPasswordDialog(false)}
                      >
                        취소
                      </Button>
                      <Button
                        type="submit"
                        disabled={changePasswordMutation.isPending}
                        data-testid="button-submit-password-change"
                      >
                        {changePasswordMutation.isPending ? "변경 중..." : "변경"}
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
              
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                data-testid="button-logout"
              >
                <LogOut className="w-4 h-4 mr-2" />
                로그아웃
              </Button>
              
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* URL 추가 폼 */}
        <div className="p-1">
          <div>
            <h1 className="text-2xl font-bold text-foreground">새 URL 추가</h1>
          </div>
          <div>
            <form onSubmit={handleAddUrl} className="space-y-4 bg-indigo-100 rounded-lg p-2">
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
                  showDropZone={true}
                  backgroundImageUrl={newImagePreview}
                  onFileSelected={handleNewImageFileSelected}
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
          </div>
        </div>

        {/* URL 목록 */}
        <div className="p-1">
          <div>
            <h1 className="text-2xl font-bold text-foreground">등록된 URL 목록</h1>               </div>
          <div>
            {links.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                등록된 URL이 없습니다.
              </div>
            ) : (
              <div className="space-y-1">
                {links.map((link) => (
                  <div
                    key={link.id}
                    className="p-1 border border-border rounded-lg"
                    data-testid={`link-item-${link.id}`}
                  >
                    {editingLink && editingLink.id === link.id ? (
                      // 편집 모드
                      <div className="space-y-2 bg-blue-200 rounded-lg p-2">
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className="text-[10px] uppercase tracking-wide">편집 모드</Badge>
                          <span className="text-xs text-muted-foreground">필드를 수정한 뒤 저장하세요</span>
                        </div>

                        <Separator className="my-2" />

                        <div className="grid grid-cols-1 md:grid-cols-12 gap-2 items-center">
                          <label className="md:col-span-2 text-xs text-muted-foreground">URL</label>
                          <div className="md:col-span-10">
                            <Input
                              className="h-8 text-sm"
                              value={editUrl}
                              onChange={(e) => setEditUrl(e.target.value)}
                              placeholder="https://example.com"
                            />
                          </div>

                          <label className="md:col-span-2 text-xs text-muted-foreground">제목</label>
                          <div className="md:col-span-10">
                            <Input
                              className="h-8 text-sm"
                              value={editTitle}
                              onChange={(e) => setEditTitle(e.target.value)}
                              placeholder="상품 제목"
                            />
                          </div>

                          <label className="md:col-span-2 text-xs text-muted-foreground">참고사항</label>
                          <div className="md:col-span-10">
                            <Input
                              className="h-8 text-sm"
                              value={editNote}
                              onChange={(e) => setEditNote(e.target.value)}
                              placeholder="특가, 할인정보, 기타 메모 등..."
                            />
                          </div>

                          <label className="md:col-span-2 text-xs text-muted-foreground">커스텀 이미지</label>
                          <div className="md:col-span-10">
                            <div className="flex items-center gap-2 rounded-lg border border-dashed p-2 text-xs text-muted-foreground">
                              <ObjectUploader 
                                ref={editImageUploaderRef} 
                                showDropZone={true}
                                backgroundImageUrl={editImagePreview}
                                onFileSelected={handleEditImageFileSelected}
                              >
                                <Upload className="w-4 h-4 mr-2" />이미지 업로드
                              </ObjectUploader>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-end gap-2 pt-1">
                          <Button
                            size="sm"
                            onClick={handleSaveEdit}
                            disabled={updateUrlMutation?.isPending}
                          >
                            <Save className="w-4 h-4 mr-1" />
                            {updateUrlMutation?.isPending ? "저장 중..." : "저장"}
                          </Button>
                          <Button 
                            variant="destructive" 
                            size="sm" 
                            onClick={() => handleRemoveUrl(link.url)}
                            disabled={removeUrlMutation?.isPending}
                          >
                            <Trash2 className="w-4 h-4 mr-1" />
                            {removeUrlMutation?.isPending ? "삭제 중..." : "삭제"}
                          </Button>
                          <Button variant="outline" size="sm" onClick={handleCancelEdit}>
                            <X className="w-4 h-4 mr-1" />취소
                          </Button>
                        </div>
                      </div>
                        
                    ) : (
                        // 일반 표시 모드
                        <div className="space-y-2 bg-blue-200 rounded-lg p-2">
                          <div className="flex items-center justify-between gap-2">
                            <a
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-2 min-w-0 flex-1 group"
                              data-testid="link-url"
                            >
                              
                              <div className="min-w-0">
                                {link.title ? (
                                  <div className="text-m text-foreground font-medium truncate" title={link.title}>
                                    {link.title}
                                  </div>
                                ) : (
                                  <div className="text-sm text-foreground font-medium truncate" title={link.url}>
                                    {link.url}
                                  </div>
                                )}
                                <div className="text-xs text-muted-foreground truncate">{link.url}</div>
                              </div>
                            </a>

                            {link.customImage && (
                              <Badge variant="outline" className="shrink-0" title="커스텀 이미지 설정됨">
                                <ImageIcon className="w-3 h-3 mr-1" />
                              </Badge>
                            )}
                          </div>

                          {link.note && (
                            <div className="flex items-start gap-2 rounded-lg bg-muted/50 p-2">
                              <p className="text-m text-foreground line-clamp-2" title={link.note}>
                                <strong className="font-medium">{link.note}</strong> 
                              </p>
                            </div>
                          )}

                          <Separator />

                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEditLink(link)}
                              data-testid={`button-edit-${link.id}`}
                            >
                              <Edit2 className="w-4 h-4 mr-1" />수정
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleRemoveUrl(link.url)}
                              disabled={removeUrlMutation?.isPending}
                              data-testid={`button-remove-${link.id}`}
                            >
                              <Trash2 className="w-4 h-4 mr-1" />
                              {removeUrlMutation?.isPending ? "삭제 중..." : "삭제"}
                            </Button>
                          </div>
                        </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}