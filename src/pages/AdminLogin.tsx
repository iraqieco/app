import { useState } from "react";
import { useLocation } from "wouter";
import { supabase } from "@/lib/supabase";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Leaf, AlertCircle } from "lucide-react";

export default function AdminLogin() {
  const [, setLocation] = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    
    if (error) {
      setError("بيانات الدخول غير صحيحة. يرجى المحاولة مرة أخرى.");
      setLoading(false);
    } else {
      setLocation("/admin");
    }
  };

  return (
    <div className="min-h-[100dvh] w-full flex items-center justify-center bg-gradient-to-br from-primary/20 via-background to-background p-4">
      <div className="w-full max-w-md bg-card rounded-2xl shadow-xl border p-8">
        <div className="flex flex-col items-center mb-8">
          <div className="bg-primary p-3 rounded-full text-primary-foreground mb-4 shadow-lg shadow-primary/30">
            <Leaf className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-center">لوحة التحكم</h1>
          <p className="text-muted-foreground mt-1">عراقي إيكو - Iraqi Eco</p>
        </div>

        {error && (
          <div className="bg-destructive/10 text-destructive border border-destructive/20 rounded-lg p-3 flex items-center gap-2 mb-6">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <p className="text-sm font-medium">{error}</p>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">البريد الإلكتروني</Label>
            <Input 
              id="email"
              type="email" 
              dir="ltr"
              className="text-left"
              value={email} 
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">كلمة المرور</Label>
            <Input 
              id="password"
              type="password" 
              dir="ltr"
              className="text-left"
              value={password} 
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <Button type="submit" className="w-full mt-6" size="lg" disabled={loading}>
            {loading ? "جاري الدخول..." : "تسجيل الدخول"}
          </Button>
        </form>
        
        <div className="mt-6 text-center">
          <Button variant="link" onClick={() => setLocation("/")} className="text-muted-foreground">
            العودة للرئيسية
          </Button>
        </div>
      </div>
    </div>
  );
}

