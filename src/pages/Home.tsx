import { useState, useEffect } from 'react';
import { useOrganisms, usePhylums, useKingdoms, useUpdateOrganism, useDeleteOrganism } from '@/hooks/use-organisms';
import { useAuth } from '@/hooks/use-auth';
import { Organism, OrganismInsert } from '@/lib/supabase';
import { Link } from 'wouter';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Textarea } from '@/components/ui/textarea';
import { OrganismCard } from '@/components/OrganismCard';
import { HamburgerMenu } from '@/components/HamburgerMenu';
import { Leaf, Search, Trees, LogIn } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function Home() {
  const { session } = useAuth();
  const { toast } = useToast();
  const isAdmin = !!session;

  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchTerm), 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const [kingdom, setKingdom] = useState('All');
  const [phylum, setPhylum] = useState('All');
  const [imagesOnly, setImagesOnly] = useState(false);
  const [noImagesOnly, setNoImagesOnly] = useState(false);

  const { data: organisms, isLoading, error } = useOrganisms({
    search: debouncedSearch,
    kingdom,
    phylum,
    imagesOnly,
    noImagesOnly
  });

  const { data: phylums } = usePhylums();
  const { data: kingdoms } = useKingdoms();

  // Login prompt state (shown to non-admin users who try to edit/delete)
  const [loginPromptOpen, setLoginPromptOpen] = useState(false);

  // Wrapped handlers: show login prompt if not admin
  const handleEditClick = (org: Organism) => {
    if (isAdmin) openEdit(org);
    else setLoginPromptOpen(true);
  };
  const handleDeleteClick = (org: Organism) => {
    if (isAdmin) setDeletingOrg(org);
    else setLoginPromptOpen(true);
  };

  // Edit state
  const [editingOrg, setEditingOrg] = useState<Organism | null>(null);
  const [editForm, setEditForm] = useState<Partial<OrganismInsert>>({});
  const updateMutation = useUpdateOrganism();

  const openEdit = (org: Organism) => {
    setEditingOrg(org);
    setEditForm({
      name_ar: org.name_ar,
      scientific_name: org.scientific_name,
      kingdom: org.kingdom,
      phylum: org.phylum ?? '',
      family: org.family ?? '',
      conservation_status: org.conservation_status ?? '',
      image_url: org.image_url ?? '',
      description: org.description ?? '',
    });
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingOrg) return;
    try {
      await updateMutation.mutateAsync({ id: editingOrg.id, data: editForm });
      toast({ title: 'تم التحديث بنجاح' });
      setEditingOrg(null);
    } catch (err: any) {
      toast({ title: 'حدث خطأ', description: err.message, variant: 'destructive' });
    }
  };

  // Delete state
  const [deletingOrg, setDeletingOrg] = useState<Organism | null>(null);
  const deleteMutation = useDeleteOrganism();

  const handleDelete = async () => {
    if (!deletingOrg) return;
    try {
      await deleteMutation.mutateAsync(deletingOrg.id);
      toast({ title: 'تم الحذف بنجاح' });
      setDeletingOrg(null);
    } catch (err: any) {
      toast({ title: 'حدث خطأ', description: err.message, variant: 'destructive' });
    }
  };

  return (
    <div className="min-h-[100dvh] flex flex-col bg-background">
      {/* Header */}
      <header className="border-b bg-card sticky top-0 z-10 shadow-sm">
        <div className="container mx-auto px-4 h-16 flex items-center gap-3">
          {/* Left: hamburger */}
          <div className="shrink-0">
            <HamburgerMenu />
          </div>

          {/* Center: logo */}
          <div className="flex-1 flex justify-center">
            <Link href="/">
              <div
                className="inline-flex items-center justify-center px-5 py-2 rounded-md"
                style={{ background: "hsl(123, 43%, 22%)" }}
              >
                <h1 className="font-bold text-base leading-none text-white tracking-wide">عراقي إيكو</h1>
              </div>
            </Link>
          </div>

          {/* Right: admin link */}
          <div className="shrink-0 flex items-center gap-2">
            {isAdmin ? (
              <Link href="/admin" className="text-sm font-medium text-primary hover:underline hidden sm:block">
                لوحة التحكم
              </Link>
            ) : (
              <Link href="/admin/login" className="text-sm text-muted-foreground hover:text-primary transition-colors hidden sm:block">
                دخول الإدارة
              </Link>
            )}
          </div>
        </div>
      </header>

      <main className="flex-grow container mx-auto px-4 py-8">
        {/* Search + Filters */}
        <div className="bg-card border rounded-2xl p-4 md:p-6 mb-8 shadow-sm space-y-6">
          <div className="relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
            <Input
              type="search"
              placeholder="ابحث بالإسم العربي أو اللاتيني"
              className="pl-4 pr-10 py-6 text-lg bg-background"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="space-y-4">
            {/* Row 1: Dropdowns */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-muted-foreground">المملكة</Label>
                <Select value={kingdom} onValueChange={setKingdom}>
                  <SelectTrigger dir="rtl">
                    <SelectValue placeholder="كل الممالك" />
                  </SelectTrigger>
                  <SelectContent dir="rtl">
                    <SelectItem value="All">الكل</SelectItem>
                    {(kingdoms ?? []).map(k => (
                      <SelectItem key={k} value={k}>{k}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-muted-foreground">الشعبة (Phylum)</Label>
                <Select value={phylum} onValueChange={setPhylum}>
                  <SelectTrigger dir="rtl">
                    <SelectValue placeholder="كل الشعب" />
                  </SelectTrigger>
                  <SelectContent dir="rtl">
                    <SelectItem value="All">الكل</SelectItem>
                    {phylums?.map(p => (
                      <SelectItem key={p} value={p}>{p}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Row 2: Image filter buttons — one active at a time */}
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => { setImagesOnly(v => !v); setNoImagesOnly(false); }}
                className={`px-5 py-2.5 rounded-xl border text-sm font-medium whitespace-nowrap transition-colors
                  ${imagesOnly
                    ? 'bg-primary border-primary text-primary-foreground shadow-sm'
                    : 'bg-background border-border text-foreground hover:bg-muted/50'}`}
              >
                تحوي صور فقط
              </button>

              <button
                type="button"
                onClick={() => { setNoImagesOnly(v => !v); setImagesOnly(false); }}
                className={`px-5 py-2.5 rounded-xl border text-sm font-medium whitespace-nowrap transition-colors
                  ${noImagesOnly
                    ? 'bg-primary border-primary text-primary-foreground shadow-sm'
                    : 'bg-background border-border text-foreground hover:bg-muted/50'}`}
              >
                بدون صور فقط
              </button>
            </div>
          </div>
        </div>

        {/* Results header */}
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-bold">النتائج</h2>
          <span className="text-sm bg-primary/10 text-primary px-3 py-1 rounded-full font-medium">
            {organisms != null ? `${organisms.length} كائن` : '...'}
          </span>
        </div>

        {/* Error state */}
        {error && (
          <div className="bg-destructive/10 border border-destructive/30 text-destructive rounded-xl p-4 mb-6 text-sm">
            خطأ في تحميل البيانات: {(error as any)?.message || String(error)}
          </div>
        )}

        {/* Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="bg-card border rounded-xl h-[420px] animate-pulse">
                <div className="h-1/2 bg-muted rounded-t-xl" />
                <div className="p-5 space-y-4">
                  <div className="h-6 bg-muted rounded w-1/3" />
                  <div className="h-8 bg-muted rounded w-2/3" />
                  <div className="h-4 bg-muted rounded w-1/2" />
                  <div className="h-12 bg-muted rounded w-full" />
                </div>
              </div>
            ))}
          </div>
        ) : !error && organisms?.length === 0 ? (
          <div className="text-center py-20 flex flex-col items-center bg-card border border-dashed rounded-2xl">
            <div className="bg-primary/5 p-6 rounded-full mb-4">
              <Trees className="w-16 h-16 text-primary/40" />
            </div>
            <h3 className="text-xl font-bold mb-2">لا توجد نتائج</h3>
            <p className="text-muted-foreground">جرب تغيير كلمات البحث أو تخفيف الفلاتر.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {(organisms ?? []).map(org => (
              <OrganismCard
                key={org.id}
                organism={org}
                isAdmin={isAdmin}
                onEdit={handleEditClick}
                onDelete={handleDeleteClick}
              />
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-primary text-primary-foreground py-6 mt-10">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-2 opacity-80">
            <Leaf className="w-5 h-5" />
            <span className="font-bold text-lg">عراقي إيكو</span>
          </div>
          <p className="text-primary-foreground/70 text-sm">
            مبادرة علمية لتوثيق التنوع البيولوجي في العراق.
          </p>
        </div>
      </footer>

      {/* Edit Dialog */}
      <Dialog open={!!editingOrg} onOpenChange={(open) => !open && setEditingOrg(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" dir="rtl">
          <DialogHeader>
            <DialogTitle>تعديل الكائن</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditSubmit} className="space-y-4 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>الاسم العربي *</Label>
                <Input value={editForm.name_ar ?? ''} onChange={e => setEditForm({ ...editForm, name_ar: e.target.value })} required />
              </div>
              <div className="space-y-2">
                <Label>الاسم العلمي *</Label>
                <Input dir="ltr" className="text-left font-serif italic" value={editForm.scientific_name ?? ''} onChange={e => setEditForm({ ...editForm, scientific_name: e.target.value })} required />
              </div>
              <div className="space-y-2">
                <Label>المملكة *</Label>
                <Select value={editForm.kingdom ?? ''} onValueChange={v => setEditForm({ ...editForm, kingdom: v })}>
                  <SelectTrigger dir="rtl"><SelectValue placeholder="اختر المملكة" /></SelectTrigger>
                  <SelectContent dir="rtl">
                    <SelectItem value="مملكة النباتات">مملكة النباتات</SelectItem>
                    <SelectItem value="مملكة الحيوانات">مملكة الحيوانات</SelectItem>
                    <SelectItem value="مملكة الفطريات">مملكة الفطريات</SelectItem>
                    <SelectItem value="مملكة البكتيريا">مملكة البكتيريا</SelectItem>
                    <SelectItem value="مملكة الطلائعيات">مملكة الطلائعيات</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>الشعبة</Label>
                <Input value={editForm.phylum ?? ''} onChange={e => setEditForm({ ...editForm, phylum: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>العائلة</Label>
                <Input value={editForm.family ?? ''} onChange={e => setEditForm({ ...editForm, family: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>حالة الحفظ (IUCN)</Label>
                <Select value={editForm.conservation_status ?? ''} onValueChange={v => setEditForm({ ...editForm, conservation_status: v })}>
                  <SelectTrigger dir="rtl"><SelectValue placeholder="اختر الحالة" /></SelectTrigger>
                  <SelectContent dir="rtl">
                    <SelectItem value="EX">منقرض (EX)</SelectItem>
                    <SelectItem value="EW">منقرض في البرية (EW)</SelectItem>
                    <SelectItem value="CR">خطر شديد (CR)</SelectItem>
                    <SelectItem value="EN">مهدد بالانقراض (EN)</SelectItem>
                    <SelectItem value="VU">ضعيف (VU)</SelectItem>
                    <SelectItem value="NT">شبه مهدد (NT)</SelectItem>
                    <SelectItem value="LC">أدنى خطر (LC)</SelectItem>
                    <SelectItem value="DD">بيانات ناقصة (DD)</SelectItem>
                    <SelectItem value="NE">غير مقيّم (NE)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>رابط الصورة (URL)</Label>
              <Input dir="ltr" className="text-left" value={editForm.image_url ?? ''} onChange={e => setEditForm({ ...editForm, image_url: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>الوصف</Label>
              <Textarea rows={4} value={editForm.description ?? ''} onChange={e => setEditForm({ ...editForm, description: e.target.value })} />
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setEditingOrg(null)}>إلغاء</Button>
              <Button type="submit" disabled={updateMutation.isPending}>حفظ التعديلات</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Login prompt (shown to guests who click Edit or Delete) */}
      <Dialog open={loginPromptOpen} onOpenChange={setLoginPromptOpen}>
        <DialogContent className="max-w-sm text-center" dir="rtl">
          <div className="flex justify-center mb-2 mt-1">
            <div className="bg-primary/10 p-4 rounded-full">
              <LogIn className="w-8 h-8 text-primary" />
            </div>
          </div>
          <DialogHeader>
            <DialogTitle className="text-center text-lg">تسجيل الدخول مطلوب</DialogTitle>
            <DialogDescription className="text-center text-sm text-muted-foreground mt-1">
              يجب تسجيل الدخول كمسؤول لتعديل أو حذف الكائنات.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-2 mt-4">
            <Button asChild className="w-full">
              <Link href="/admin/login" onClick={() => setLoginPromptOpen(false)}>
                تسجيل الدخول
              </Link>
            </Button>
            <Button variant="outline" className="w-full" onClick={() => setLoginPromptOpen(false)}>
              إلغاء
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <AlertDialog open={!!deletingOrg} onOpenChange={(open) => !open && setDeletingOrg(null)}>
        <AlertDialogContent dir="rtl">
          <AlertDialogHeader>
            <AlertDialogTitle>هل أنت متأكد من الحذف؟</AlertDialogTitle>
            <AlertDialogDescription>
              سيتم حذف "{(deletingOrg?.name_ar ?? '').trim()}" نهائياً من قاعدة البيانات.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-row-reverse gap-2">
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deleteMutation.isPending}
            >
              حذف
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

