import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { CalendarDays, ChevronRight, CircleUserRound, Clock3, Globe, ImagePlus, LayoutDashboard, LogOut, Menu as MenuIcon, Pencil, Plus, Search, Sparkles, Trash2, Users, UtensilsCrossed, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import mongolianImage from "@/assets/experience-mongolian.jpg";
import sunsetImage from "@/assets/experience-sunset.jpg";
import privateImage from "@/assets/experience-private.jpg";

type Reservation = Tables<"reservations">;
type MenuItem = Tables<"menu_items">;
type Experience = Tables<"experiences">;
type GalleryImage = Tables<"gallery_images">;
type View = "overview" | "reservations" | "menu" | "experiences" | "gallery" | "website";
const categories = ["Indian", "Continental", "East African", "Asian", "Fast Food", "Desserts"];
const experienceImages = [mongolianImage, sunsetImage, privateImage];

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({ meta: [
    { title: "Operations — Rooftop Restaurant & Lounge" },
    { name: "description", content: "Reservations, menus, experiences and gallery management for Rooftop Restaurant & Lounge." },
    { property: "og:title", content: "Rooftop Restaurant & Lounge Operations" },
    { property: "og:description", content: "Private restaurant operations at K Hotels Entebbe." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ]}),
  component: Dashboard,
});

function Dashboard() {
  const navigate = useNavigate();
  const [view, setView] = useState<View>("overview");
  const [navOpen, setNavOpen] = useState(false);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [gallery, setGallery] = useState<GalleryImage[]>([]);
  const [displayName, setDisplayName] = useState("Rooftop Admin");
  const [loading, setLoading] = useState(true);

  async function load() {
    const [r, m, e, g, u] = await Promise.all([
      supabase.from("reservations").select("*").order("reservation_date"),
      supabase.from("menu_items").select("*").order("category"),
      supabase.from("experiences").select("*").order("display_order"),
      supabase.from("gallery_images").select("*").order("created_at", { ascending: false }),
      supabase.auth.getUser(),
    ]);
    setReservations(r.data ?? []); setMenu(m.data ?? []); setExperiences(e.data ?? []); setGallery(g.data ?? []);
    if (u.data.user) { const p = await supabase.from("profiles").select("display_name").eq("id", u.data.user.id).maybeSingle(); setDisplayName(p.data?.display_name ?? "Rooftop Admin"); }
    setLoading(false);
  }
  useEffect(() => { load(); }, []);
  async function signOut() { await supabase.auth.signOut(); navigate({ to: "/auth", replace: true }); }
  const nav = [
    ["overview", "Overview", LayoutDashboard], ["reservations", "Reservations", CalendarDays], ["menu", "Menu", UtensilsCrossed], ["experiences", "Experiences", Sparkles], ["gallery", "Gallery", ImagePlus], ["website", "Website", Globe],
  ] as const;
  return <div className="min-h-screen bg-background text-foreground">
    <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-border bg-background/90 px-4 backdrop-blur-xl lg:hidden">
      <Brand compact/><Button variant="ghost" size="icon" aria-label="Open navigation" onClick={()=>setNavOpen(true)}><MenuIcon/></Button>
    </header>
    {navOpen && <div className="fixed inset-0 z-50 bg-background/90 p-5 backdrop-blur-xl lg:hidden"><div className="flex justify-between"><Brand/><Button variant="ghost" size="icon" onClick={()=>setNavOpen(false)} aria-label="Close navigation"><X/></Button></div><Nav nav={nav} view={view} choose={v=>{setView(v);setNavOpen(false)}}/><Button variant="ghost" className="mt-8 w-full justify-start text-muted-foreground" onClick={signOut}><LogOut/>Sign out</Button></div>}
    <aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-border bg-card/40 p-6 lg:flex lg:flex-col">
      <Brand/><div className="mt-14"><p className="mb-4 px-3 text-[10px] font-semibold uppercase text-muted-foreground">Operations</p><Nav nav={nav} view={view} choose={setView}/></div>
      <div className="mt-auto border-t border-border pt-5"><div className="flex items-center gap-3 px-2"><div className="grid size-9 place-items-center rounded-full bg-primary/10 text-primary"><CircleUserRound className="size-4"/></div><div className="min-w-0 flex-1"><p className="truncate text-xs font-semibold">{displayName}</p><p className="text-[10px] text-muted-foreground">Administrator</p></div><Button variant="ghost" size="icon" aria-label="Sign out" onClick={signOut}><LogOut/></Button></div></div>
    </aside>
    <main className="mx-auto max-w-[1500px] px-4 py-8 sm:px-8 lg:ml-64 lg:px-12 lg:py-12">
      {loading ? <Loading/> : <Content view={view} reservations={reservations} menu={menu} experiences={experiences} gallery={gallery} reload={load}/>} 
    </main>
  </div>;
}

function Brand({compact=false}:{compact?:boolean}) { return <div className="flex items-center gap-3"><div className="grid size-10 place-items-center rounded-md border border-primary/40 bg-primary/10 font-serif text-xl text-primary">R</div>{!compact&&<div><p className="font-serif text-xl font-semibold leading-4">Rooftop</p><p className="mt-1 text-[9px] uppercase text-muted-foreground">K Hotels · Entebbe</p></div>}</div> }
function Nav({nav,view,choose}:{nav:readonly (readonly [View,string,typeof LayoutDashboard])[];view:View;choose:(v:View)=>void}) { return <nav className="space-y-1">{nav.map(([id,label,Icon])=><Button key={id} variant="ghost" onClick={()=>choose(id)} className={`h-11 w-full justify-start ${view===id?"bg-primary/10 text-primary":"text-muted-foreground"}`}><Icon/>{label}{view===id&&<ChevronRight className="ml-auto"/>}</Button>)}</nav> }
function Header({eyebrow,title,copy,action}:{eyebrow:string;title:string;copy:string;action?:React.ReactNode}) { return <div className="mb-9 flex flex-col justify-between gap-5 sm:flex-row sm:items-end"><div><p className="text-[10px] font-semibold uppercase text-primary">{eyebrow}</p><h1 className="mt-2 text-4xl font-semibold sm:text-5xl">{title}</h1><p className="mt-2 max-w-2xl text-sm text-muted-foreground">{copy}</p></div>{action}</div> }
function Content(p:{view:View;reservations:Reservation[];menu:MenuItem[];experiences:Experience[];gallery:GalleryImage[];reload:()=>Promise<void>}) {
  if(p.view==="reservations") return <Reservations reservations={p.reservations} reload={p.reload}/>;
  if(p.view==="menu") return <MenuManager items={p.menu} reload={p.reload}/>;
  if(p.view==="experiences") return <Experiences items={p.experiences} reload={p.reload}/>;
  if(p.view==="gallery") return <Gallery items={p.gallery} reload={p.reload}/>;
  if(p.view==="website") return <Website/>;
  return <Overview reservations={p.reservations} experiences={p.experiences}/>;
}
function Overview({reservations,experiences}:{reservations:Reservation[];experiences:Experience[]}) {
  const today=new Date().toISOString().slice(0,10), week=new Date(Date.now()+7*86400000).toISOString().slice(0,10);
  const stats=[
    ["Today's reservations",reservations.filter(r=>r.reservation_date===today).length,CalendarDays],
    ["This week",reservations.filter(r=>r.reservation_date>=today&&r.reservation_date<=week).length,Users],
    ["Pending requests",reservations.filter(r=>r.status==="pending").length,Clock3],
    ["Special experiences",experiences.length,Sparkles],
  ] as const;
  return <><Header eyebrow="Wednesday · 23 September" title="Good evening." copy="Here is the rhythm of the restaurant at a glance."/><div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{stats.map(([l,n,I],i)=><article key={l} className="animate-rise warm-shadow rounded-lg border border-border bg-card p-6 transition hover:-translate-y-1 hover:border-primary/40" style={{animationDelay:`${i*70}ms`}}><div className="flex justify-between"><p className="max-w-32 text-xs leading-5 text-muted-foreground">{l}</p><I className="size-4 text-primary"/></div><p className="mt-8 font-serif text-5xl font-semibold">{n}</p></article>)}</div><section className="mt-10"><div className="mb-5 flex items-center justify-between"><div><p className="text-[10px] font-semibold uppercase text-primary">Live book</p><h2 className="mt-1 text-2xl font-semibold">Recent reservations</h2></div></div><div className="overflow-hidden rounded-lg border border-border bg-card/60">{reservations.slice(0,5).map(r=><div key={r.id} className="grid gap-3 border-b border-border px-5 py-4 last:border-0 sm:grid-cols-[1fr_auto_auto] sm:items-center"><div><p className="text-sm font-semibold">{r.guest_name}</p><p className="mt-1 text-xs text-muted-foreground">{r.occasion||"Dinner"} · {r.party_size} guests</p></div><p className="text-xs text-muted-foreground">{prettyDate(r.reservation_date)} · {r.reservation_time.slice(0,5)}</p><Status status={r.status}/></div>)}</div></section></>;
}
function Reservations({reservations,reload}:{reservations:Reservation[];reload:()=>Promise<void>}) {
  const [filter,setFilter]=useState("upcoming"), [search,setSearch]=useState(""); const today=new Date().toISOString().slice(0,10), week=new Date(Date.now()+7*86400000).toISOString().slice(0,10);
  const shown=reservations.filter(r=>(filter==="today"?r.reservation_date===today:filter==="week"?r.reservation_date>=today&&r.reservation_date<=week:r.reservation_date>=today)&&r.guest_name.toLowerCase().includes(search.toLowerCase()));
  async function status(id:string,value:string){await supabase.from("reservations").update({status:value}).eq("id",id);await reload()}
  return <><Header eyebrow="Guest book" title="Reservations" copy="Review every table request and shape the service ahead."/><div className="mb-5 flex flex-col gap-3 sm:flex-row"><div className="relative flex-1"><Search className="absolute left-3 top-3 size-4 text-muted-foreground"/><Input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search guest name" className="h-10 pl-10"/></div><div className="flex gap-1 rounded-md border border-border p-1">{["today","week","upcoming"].map(f=><Button key={f} size="sm" variant={filter===f?"default":"ghost"} onClick={()=>setFilter(f)} className="capitalize">{f==="week"?"This week":f}</Button>)}</div></div><div className="overflow-x-auto rounded-lg border border-border bg-card/60"><table className="w-full min-w-[950px] text-left"><thead><tr className="border-b border-border text-[10px] uppercase text-muted-foreground">{["Guest","Contact","Date & time","Party","Occasion","Notes","Status"].map(x=><th key={x} className="px-5 py-4 font-semibold">{x}</th>)}</tr></thead><tbody>{shown.map(r=><tr key={r.id} className="border-b border-border/70 text-sm last:border-0 hover:bg-accent/30"><td className="px-5 py-4 font-semibold">{r.guest_name}</td><td className="px-5 py-4 text-muted-foreground">{r.phone}</td><td className="px-5 py-4">{prettyDate(r.reservation_date)}<br/><span className="text-xs text-muted-foreground">{r.reservation_time.slice(0,5)}</span></td><td className="px-5 py-4">{r.party_size}</td><td className="px-5 py-4">{r.occasion||"—"}</td><td className="max-w-56 truncate px-5 py-4 text-muted-foreground">{r.notes||"—"}</td><td className="px-5 py-4"><Select value={r.status} onValueChange={v=>status(r.id,v)}><SelectTrigger className="w-32"><SelectValue/></SelectTrigger><SelectContent>{["pending","confirmed","cancelled"].map(s=><SelectItem key={s} value={s}>{s.charAt(0).toUpperCase()+s.slice(1)}</SelectItem>)}</SelectContent></Select></td></tr>)}</tbody></table>{!shown.length&&<Empty text="No reservations match this view."/>}</div></>;
}
function MenuManager({items,reload}:{items:MenuItem[];reload:()=>Promise<void>}) {
 const [open,setOpen]=useState(false),[editing,setEditing]=useState<MenuItem|null>(null); async function toggle(i:MenuItem){await supabase.from("menu_items").update({available:!i.available}).eq("id",i.id);await reload()} async function remove(id:string){await supabase.from("menu_items").delete().eq("id",id);await reload()}
 return <><Header eyebrow="Kitchen catalogue" title="Menu management" copy="Curate every dish, from first course to final flourish." action={<Button onClick={()=>{setEditing(null);setOpen(true)}}><Plus/>Add dish</Button>}/><div className="space-y-9">{categories.map(cat=><section key={cat}><div className="mb-3 flex items-center gap-3"><h2 className="text-2xl font-semibold">{cat}</h2><span className="text-xs text-muted-foreground">{items.filter(i=>i.category===cat).length} dishes</span></div><div className="grid gap-3 xl:grid-cols-2">{items.filter(i=>i.category===cat).map(i=><article key={i.id} className="flex items-center gap-4 rounded-lg border border-border bg-card/60 p-4 transition hover:border-primary/30"><div className="grid size-14 shrink-0 place-items-center rounded-md bg-accent text-primary"><UtensilsCrossed/></div><div className="min-w-0 flex-1"><div className="flex items-center gap-2"><h3 className="truncate text-xl font-semibold">{i.name}</h3>{!i.available&&<span className="text-[9px] uppercase text-muted-foreground">Unavailable</span>}</div><p className="mt-1 truncate text-xs text-muted-foreground">{i.description}</p><p className="mt-2 text-xs font-semibold text-primary">UGX {Number(i.price).toLocaleString()}</p></div><Switch checked={i.available} onCheckedChange={()=>toggle(i)} aria-label={`Toggle ${i.name} availability`}/><Button variant="ghost" size="icon" aria-label={`Edit ${i.name}`} onClick={()=>{setEditing(i);setOpen(true)}}><Pencil/></Button><Button variant="ghost" size="icon" aria-label={`Delete ${i.name}`} onClick={()=>remove(i.id)}><Trash2/></Button></article>)}</div></section>)}</div><DishDialog open={open} setOpen={setOpen} item={editing} reload={reload}/></>;
}
function DishDialog({open,setOpen,item,reload}:{open:boolean;setOpen:(v:boolean)=>void;item:MenuItem|null;reload:()=>Promise<void>}) { async function save(e:FormEvent<HTMLFormElement>){e.preventDefault();const f=new FormData(e.currentTarget);const data={name:String(f.get("name")),description:String(f.get("description")),price:Number(f.get("price")),category:String(f.get("category")),image_url:String(f.get("image"))||null};if(item)await supabase.from("menu_items").update(data).eq("id",item.id);else await supabase.from("menu_items").insert(data);setOpen(false);await reload()} return <Dialog open={open} onOpenChange={setOpen}><DialogContent className="border-border bg-card"><DialogHeader><DialogTitle className="font-serif text-3xl">{item?"Edit dish":"Add a dish"}</DialogTitle></DialogHeader><form onSubmit={save} className="space-y-4"><Field name="name" label="Dish name" defaultValue={item?.name??""}/><label className="block text-xs text-muted-foreground">Description<Textarea name="description" defaultValue={item?.description??""} className="mt-2"/></label><Field name="price" label="Price (UGX)" type="number" defaultValue={item?.price??0}/><label className="block text-xs text-muted-foreground">Category<select name="category" defaultValue={item?.category??categories[0]} className="mt-2 h-10 w-full rounded-md border border-input bg-background px-3 text-sm">{categories.map(c=><option key={c}>{c}</option>)}</select></label><Field name="image" label="Image URL" defaultValue={item?.image_url??""}/><Button className="w-full">Save dish</Button></form></DialogContent></Dialog> }
function Experiences({items,reload}:{items:Experience[];reload:()=>Promise<void>}) { const [edit,setEdit]=useState<Experience|null>(null); return <><Header eyebrow="Signature moments" title="Experiences" copy="Shape the stories guests come upstairs to remember."/><div className="grid gap-5 xl:grid-cols-3">{items.map((x,i)=><article key={x.id} className="group overflow-hidden rounded-lg border border-border bg-card warm-shadow"><div className="relative aspect-[3/2] overflow-hidden"><img src={x.image_url||experienceImages[i%3]} width={1200} height={800} loading="lazy" alt={x.title} className="h-full w-full object-cover transition duration-700 group-hover:scale-105"/><div className="absolute inset-0 bg-gradient-to-t from-card to-transparent"/></div><div className="p-6"><h2 className="text-3xl font-semibold">{x.title}</h2><p className="mt-3 min-h-16 text-sm leading-6 text-muted-foreground">{x.description}</p><Button variant="outline" className="mt-5" onClick={()=>setEdit(x)}><Pencil/>Edit experience</Button></div></article>)}</div><ExperienceDialog item={edit} close={()=>setEdit(null)} reload={reload}/></> }
function ExperienceDialog({item,close,reload}:{item:Experience|null;close:()=>void;reload:()=>Promise<void>}) { async function save(e:FormEvent<HTMLFormElement>){e.preventDefault();if(!item)return;const f=new FormData(e.currentTarget);await supabase.from("experiences").update({title:String(f.get("title")),description:String(f.get("description")),image_url:String(f.get("image"))||null}).eq("id",item.id);close();await reload()} return <Dialog open={!!item} onOpenChange={v=>{if(!v)close()}}><DialogContent className="border-border bg-card"><DialogHeader><DialogTitle className="font-serif text-3xl">Edit experience</DialogTitle></DialogHeader>{item&&<form onSubmit={save} className="space-y-4"><Field name="title" label="Title" defaultValue={item.title}/><label className="block text-xs text-muted-foreground">Description<Textarea name="description" defaultValue={item.description} className="mt-2"/></label><Field name="image" label="Image URL" defaultValue={item.image_url??""}/><Button className="w-full">Save changes</Button></form>}</DialogContent></Dialog> }
function Gallery({items,reload}:{items:GalleryImage[];reload:()=>Promise<void>}) { const [uploading,setUploading]=useState(false); async function upload(file:File){setUploading(true);const path=`gallery/${crypto.randomUUID()}-${file.name}`;const up=await supabase.storage.from("restaurant-media").upload(path,file);if(!up.error){const signed=await supabase.storage.from("restaurant-media").createSignedUrl(path,31536000);if(signed.data)await supabase.from("gallery_images").insert({image_url:signed.data.signedUrl,alt_text:file.name})}setUploading(false);await reload()} async function remove(id:string){await supabase.from("gallery_images").delete().eq("id",id);await reload()} return <><Header eyebrow="Visual archive" title="Gallery" copy="A considered collection of the atmosphere, plates and views." action={<label className="inline-flex h-10 cursor-pointer items-center gap-2 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground"><ImagePlus className="size-4"/>{uploading?"Uploading…":"Upload image"}<input type="file" accept="image/*" className="sr-only" disabled={uploading} onChange={e=>{const f=e.target.files?.[0];if(f)upload(f)}}/></label>}/>{items.length?<div className="columns-1 gap-4 sm:columns-2 xl:columns-3">{items.map(i=><figure key={i.id} className="group relative mb-4 break-inside-avoid overflow-hidden rounded-lg border border-border"><img src={i.image_url} loading="lazy" alt={i.alt_text} className="w-full object-cover"/><Button size="icon" variant="destructive" aria-label="Delete image" onClick={()=>remove(i.id)} className="absolute right-3 top-3 opacity-0 transition group-hover:opacity-100"><Trash2/></Button></figure>)}</div>:<div className="grid min-h-80 place-items-center rounded-lg border border-dashed border-border bg-card/30"><div className="text-center"><ImagePlus className="mx-auto size-8 text-primary"/><h2 className="mt-4 text-2xl font-semibold">The gallery awaits</h2><p className="mt-2 text-sm text-muted-foreground">Upload the first restaurant image.</p></div></div>}</> }
function Website() {
  const base = typeof window !== "undefined" ? window.location.origin : "";
  const [copied, setCopied] = useState("");
  async function copy(key: string, text: string) {
    try { await navigator.clipboard.writeText(text); setCopied(key); setTimeout(() => setCopied(""), 2200); } catch { /* clipboard blocked */ }
  }
  const links = [
    ["book", "Booking page", `${base}/book`, "Guests fill this in; the request lands in your Reservations as pending."],
    ["staff", "Staff login", `${base}/auth`, "Where your team signs in. Keep this one off the public site."],
  ] as const;
  const panels = [
    ["menu", "Menu panel", `<script src="${base}/rooftop-embed.js" data-section="menu" defer></script>`],
    ["experiences", "Experiences panel", `<script src="${base}/rooftop-embed.js" data-section="experiences" defer></script>`],
    ["gallery", "Gallery panel", `<script src="${base}/rooftop-embed.js" data-section="gallery" defer></script>`],
    ["book", "Booking form panel", `<script src="${base}/rooftop-embed.js" data-section="book" defer></script>`],
  ] as const;
  const feeds = ["menu", "experiences", "gallery", "reservations"].map((name) => [name, `${base}/api/public/${name}`] as const);
  return <>
    <Header eyebrow="Your website" title="Link it to your site" copy="Three ways to connect Rooftop to the website you already run: send guests here, show live panels on your pages, or read the same data yourself."/>
    <section className="mb-9">
      <h2 className="mb-4 text-2xl font-semibold">Links to put on your website</h2>
      <div className="space-y-3">{links.map(([key,label,url,note])=><article key={key} className="rounded-lg border border-border bg-card/60 p-5 transition hover:border-primary/30"><div className="flex flex-wrap items-center justify-between gap-3"><div><h3 className="text-xl font-semibold">{label}</h3><p className="mt-1 text-xs text-muted-foreground">{note}</p></div><Button variant="outline" size="sm" onClick={()=>copy(key,url)}>{copied===key?"Copied":"Copy link"}</Button></div><code className="mt-3 block truncate rounded-md border border-border bg-background px-3 py-2 text-xs text-primary">{url}</code></article>)}</div>
    </section>
    <section className="mb-9">
      <h2 className="mb-2 text-2xl font-semibold">Panels to paste into your pages</h2>
      <p className="mb-4 max-w-2xl text-sm text-muted-foreground">Paste one line where the panel should appear on your website. It always shows what you have saved here, and grows to fit.</p>
      <div className="space-y-3">{panels.map(([key,label,code])=><article key={key} className="rounded-lg border border-border bg-card/60 p-5"><div className="flex flex-wrap items-center justify-between gap-3"><h3 className="text-xl font-semibold">{label}</h3><Button variant="outline" size="sm" onClick={()=>copy(`panel-${key}`,code)}>{copied===`panel-${key}`?"Copied":"Copy code"}</Button></div><pre className="mt-3 overflow-x-auto rounded-md border border-border bg-background p-3 text-xs leading-5 text-primary">{code}</pre></article>)}</div>
    </section>
    <section>
      <h2 className="mb-2 text-2xl font-semibold">Live data for a developer</h2>
      <p className="mb-4 max-w-2xl text-sm text-muted-foreground">If your website is built by someone else, these give them the same information in plain text. The booking address takes a name, phone, date, time and party size.</p>
      <div className="overflow-hidden rounded-lg border border-border bg-card/60">{feeds.map(([name,url])=><div key={name} className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-5 py-4 last:border-0"><div><p className="text-sm font-semibold capitalize">{name}</p><code className="mt-1 block truncate text-xs text-muted-foreground">{url}</code></div><Button variant="ghost" size="sm" onClick={()=>copy(`feed-${name}`,url)}>{copied===`feed-${name}`?"Copied":"Copy"}</Button></div>)}</div>
    </section>
  </>;
}
function Field(p:{name:string;label:string;type?:string;defaultValue?:string|number}) { return <label className="block text-xs text-muted-foreground">{p.label}<Input required name={p.name} type={p.type} defaultValue={p.defaultValue} className="mt-2"/></label> }
function Status({status}:{status:string}) { const s=status==="confirmed"?"bg-emerald-500/10 text-emerald-300":status==="cancelled"?"bg-destructive/10 text-destructive-foreground":"bg-primary/10 text-primary";return <span className={`w-fit rounded-full px-2.5 py-1 text-[10px] font-semibold capitalize ${s}`}>{status}</span> }
function Empty({text}:{text:string}) { return <div className="p-12 text-center text-sm text-muted-foreground">{text}</div> }
function Loading() { return <div className="grid min-h-[70vh] place-items-center"><div className="text-center"><div className="mx-auto size-8 animate-spin rounded-full border-2 border-primary/20 border-t-primary"/><p className="mt-4 text-xs text-muted-foreground">Preparing service…</p></div></div> }
function prettyDate(value:string){return new Intl.DateTimeFormat("en-UG",{day:"numeric",month:"short"}).format(new Date(`${value}T12:00:00`))}