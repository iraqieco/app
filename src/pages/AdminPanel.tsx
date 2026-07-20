import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { supabase, Organism, OrganismInsert } from "@/lib/supabase";
import { useAuth } from "@/hooks/use-auth";
import { useOrganisms, useAddOrganism, useUpdateOrganism, useDeleteOrganism } from "@/hooks/use-organisms";
import { IUCNBadge } from "@/components/IUCNBadge";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Leaf, LogOut, Plus, Edit, Trash, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const initialFormState: OrganismInsert = {
  name_ar: "",
  scientific_name: "",
  kingdom: "",
  phylum: "",
  family: "",
  conservation_status: "",
  image_url: "",
  description: ""
};

export default function AdminPanel() {
  const { session, loading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchTerm), 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const { data: organisms, isLoading: dataLoading } = useOrganisms({
    search: debouncedSearch,
    kingdom: "All",
    phylum: "All",
    imagesOnly: false,
    noImagesOnly: false
  });

  const addMutation = useAddOrganism();
  const updateMutation = useUpdateOrganism();
  const deleteMutation = useDeleteOrganism();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<OrganismInsert>(initialFormState);

  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !session) {
      setLocation("/admin/login");
    }
  }, [session, authLoading, setLocation]);

  if (authLoading || !session) {
    return <div className="min-h-[100dvh] flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setLocation("/");
  };

  const openAddForm = () => {
    setEditingId(null);
    setFormData(initialFormState);
    setIsFormOpen(true);
  };

  const openEditForm = (org: Organism) => {
    setEditingId(org.id);
    setFormData({
      name_ar: org.name_ar,
      scientific_name: org.scientific_name,
      kingdom: org.kingdom,
      phylum: org.phylum || "",
      family: org.family || "",
      conservation_status: org.conservation_status || "",
      image_url: org.image_url || "",
      description: org.description || ""
    });
    setIsFormOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await updateMutation.mutateAsync({ id: editingId, data: formData });
        toast({ title: "تم التحديث بنجاح" });
      } else {
        await addMutation.mutateAsync(formData);
        toast({ title: "تمت الإضافة بنجاح" });
      }
      setIsFormOpen(false);
    } catch (error: any) {
      toast({ title: "حدث خطأ", description: error.message, variant: "destructive" });
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteMutation.mutateAsync(deleteId);
      toast({ title: "تم الحذف بنجاح" });
    } catch (error: any) {
      toast({ title: "حدث خطأ", description: error.message, variant: "destructive" });
    } finally {
      setDeleteId(null);
    }
  };

  return (
    <div className="min-h-[100dvh] bg-background flex flex-col">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-primary p-1.5 rounded-lg text-primary-foreground">
              <Leaf className="w-5 h-5" />
            </div>
            <h1 className="font-bold text-lg leading-none text-primary">لوحة التحكم — عراقي إيكو</h1>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => setLocation("/")} className="text-muted-foreground hover:text-foreground">
              الموقع العام
            </Button>
            <Button variant="outline" size="sm" onClick={handleLogout} className="text-destructive hover:bg-destructive/10">
              <LogOut className="w-4 h-4 ml-2" />
              تسجيل الخروج
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold">الكائنات الحية</h2>
            <p className="text-muted-foreground mt-1">إدارة قاعدة البيانات، الإضافة، التعديل والحذف.</p>
          </div>

          <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
            <DialogTrigger asChild>
              <Button onClick={openAddForm}>
                <Plus className="w-4 h-4 ml-2" />
                إضافة كائن جديد
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" dir="rtl">
              <DialogHeader>
                <DialogTitle>{editingId ? "تعديل الكائن" : "إضافة كائن جديد"}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleFormSubmit} className="space-y-4 py-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name_ar">الاسم العربي *</Label>
                    <Input id="name_ar" value={formData.name_ar} onChange={e => setFormData({...formData, name_ar: e.target.value})} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="scientific_name">الاسم العلمي *</Label>
                    <Input id="scientific_name" dir="ltr" className="text-left font-serif italic" value={formData.scientific_name} onChange={e => setFormData({...formData, scientific_name: e.target.value})} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="kingdom">المملكة *</Label>
                    <Select value={formData.kingdom} onValueChange={v => setFormData({...formData, kingdom: v})} required>
                      <SelectTrigger dir="rtl">
                        <SelectValue placeholder="اختر المملكة" />
                      </SelectTrigger>
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
                    <Label htmlFor="phylum">الشعبة (Phylum)</Label>
                    <Input id="phylum" value={formData.phylum || ""} onChange={e => setFormData({...formData, phylum: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="family">العائلة (Family)</Label>
                    <Input id="family" value={formData.family || ""} onChange={e => setFormData({...formData, family: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="conservation_status">حالة الحفظ (IUCN)</Label>
                    <Select value={formData.conservation_status || ""} onValueChange={v => setFormData({...formData, conservation_status: v})}>
                      <SelectTrigger dir="rtl">
                        <SelectValue placeholder="اختر الحالة" />
                      </SelectTrigger>
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
                  <Label htmlFor="image_url">رابط الصورة (URL)</Label>
                  <Input id="image_url" dir="ltr" className="text-left" value={formData.image_url || ""} onChange={e => setFormData({...formData, image_url: e.target.value})} />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description">الوصف</Label>
                  <Textarea id="description" rows={4} value={formData.description || ""} onChange={e => setFormData({...formData, description: e.target.value})} />
                </div>

                <div className="flex justify-end pt-4 gap-2">
                  <Button type="button" variant="outline" onClick={() => setIsFormOpen(false)}>إلغاء</Button>
                  <Button type="submit" disabled={addMutation.isPending || updateMutation.isPending}>
                    {editingId ? "حفظ التعديلات" : "إضافة الكائن"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="bg-card border rounded-xl shadow-sm overflow-hidden">
          <div className="p-4 border-b">
            <Input 
              type="search" 
              placeholder="بحث في القائمة..." 
              className="max-w-md"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
          
          <Table dir="rtl">
            <TableHeader>
              <TableRow>
                <TableHead className="text-right">الاسم</TableHead>
                <TableHead className="text-right">المملكة</TableHead>
                <TableHead className="text-right">التصنيف</TableHead>
                <TableHead className="text-right">الحالة</TableHead>
                <TableHead className="text-right">إجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {dataLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                    جاري التحميل...
                  </TableCell>
                </TableRow>
              ) : organisms?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    لا توجد كائنات تطابق البحث.
                  </TableCell>
                </TableRow>
              ) : (
                organisms?.map((org) => (
                  <TableRow key={org.id}>
                    <TableCell>
                      <div className="font-bold">{org.name_ar}</div>
                      <div className="text-xs text-muted-foreground italic" dir="ltr">{org.scientific_name}</div>
                    </TableCell>
                    <TableCell>
                      <span className="inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
                        {org.kingdom}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">{org.phylum || "-"}</div>
                      <div className="text-xs text-muted-foreground">{org.family || "-"}</div>
                    </TableCell>
                    <TableCell>
                      <IUCNBadge status={org.conservation_status} />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon" onClick={() => openEditForm(org)}>
                          <Edit className="w-4 h-4 text-muted-foreground hover:text-foreground" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => setDeleteId(org.id)}>
                          <Trash className="w-4 h-4 text-destructive hover:bg-destructive/10" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </main>

      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent dir="rtl">
          <AlertDialogHeader>
            <AlertDialogTitle>هل أنت متأكد من الحذف؟</AlertDialogTitle>
            <AlertDialogDescription>
              هذا الإجراء لا يمكن التراجع عنه. سيتم حذف الكائن نهائياً من قاعدة البيانات.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-row-reverse sm:space-x-reverse sm:justify-start gap-2">
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              حذف
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

