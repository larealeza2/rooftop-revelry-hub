import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { ArrowRight, Eye, EyeOff, LockKeyhole } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import rooftopImage from "@/assets/rooftop-lounge.jpg";

export const Route = createFileRoute("/auth")({
  head: () => ({ meta: [
    { title: "Staff Login — Rooftop Restaurant & Lounge" },
    { name: "description", content: "Private staff login for Rooftop Restaurant & Lounge, K Hotels Entebbe." },
    { property: "og:title", content: "Staff Login — Rooftop Restaurant & Lounge" },
    { property: "og:description", content: "Private staff access for Rooftop Restaurant & Lounge." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ]}),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => { supabase.auth.getUser().then(({ data }) => { if (data.user) navigate({ to: "/dashboard", replace: true }); }); }, [navigate]);

  async function submit(event: FormEvent) {
    event.preventDefault(); setLoading(true); setError("");
    const { data, error: authError } = await supabase.auth.signInWithPassword({ email, password });
    if (authError || !data.user) { setError(authError?.message ?? "Unable to sign in."); setLoading(false); return; }
    await supabase.from("profiles").upsert({ id: data.user.id, display_name: data.user.user_metadata?.display_name ?? "Rooftop Admin" });
    navigate({ to: "/dashboard", replace: true });
  }

  return <main className="grid min-h-screen bg-background lg:grid-cols-[1.12fr_.88fr]">
    <section className="relative hidden min-h-screen overflow-hidden lg:block">
      <img src={rooftopImage} width={1600} height={1000} alt="Rooftop Restaurant overlooking Lake Victoria at dusk" className="absolute inset-0 h-full w-full object-cover" />
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/25 to-transparent" />
      <div className="absolute bottom-0 max-w-2xl p-14 xl:p-20">
        <p className="mb-5 text-xs font-semibold uppercase text-primary">K Hotels · Entebbe</p>
        <h1 className="text-6xl font-semibold leading-[.9] text-foreground xl:text-7xl">Above the city.<br/><span className="italic text-primary">Beyond ordinary.</span></h1>
        <p className="mt-6 max-w-md text-sm leading-7 text-foreground/70">Private operations for Rooftop Restaurant & Lounge.</p>
      </div>
    </section>
    <section className="flex min-h-screen items-center px-6 py-12 sm:px-12 lg:px-16">
      <div className="mx-auto w-full max-w-sm animate-rise">
        <div className="mb-12 flex items-center gap-3"><div className="flex size-11 items-center justify-center rounded-md border border-primary/40 bg-primary/10 text-primary"><span className="font-serif text-2xl">R</span></div><div><p className="font-serif text-xl font-semibold">Rooftop</p><p className="text-[10px] uppercase text-muted-foreground">Restaurant & Lounge</p></div></div>
        <p className="text-xs font-semibold uppercase text-primary">Private access</p>
        <h2 className="mt-3 text-4xl font-semibold">Welcome back.</h2>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">Sign in to manage tonight’s service and the weeks ahead.</p>
        <form onSubmit={submit} className="mt-10 space-y-5">
          <label className="block text-xs font-medium text-muted-foreground">Email address<Input required type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="admin@khotels.ug" className="mt-2 h-12 bg-card/70" /></label>
          <label className="block text-xs font-medium text-muted-foreground">Password<div className="relative mt-2"><Input required type={showPassword ? "text" : "password"} value={password} onChange={e=>setPassword(e.target.value)} placeholder="Enter your password" className="h-12 bg-card/70 pr-12"/><Button type="button" variant="ghost" size="icon" aria-label={showPassword ? "Hide password" : "Show password"} onClick={()=>setShowPassword(v=>!v)} className="absolute right-1.5 top-1.5">{showPassword?<EyeOff/>:<Eye/>}</Button></div></label>
          {error && <p role="alert" className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive-foreground">{error}</p>}
          <Button disabled={loading} className="h-12 w-full text-sm">{loading ? "Opening dashboard…" : "Enter dashboard"}<ArrowRight/></Button>
        </form>
        <p className="mt-8 flex items-center gap-2 text-xs text-muted-foreground"><LockKeyhole className="size-3.5 text-primary"/>Authorised staff only</p>
      </div>
    </section>
  </main>;
}