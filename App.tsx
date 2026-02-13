
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { 
  Upload, Download, QrCode, Sparkles, RefreshCcw, Trash2, 
  MapPin, Layout, Type as TypeIcon, Calendar, Clock, 
  Shirt, ShieldCheck, Image as ImageIcon, ChevronRight, 
  CheckCircle2, Star, Zap, Users, Smartphone, ArrowRight,
  Info, Lock, LogIn, Mail, Instagram, Phone
} from 'lucide-react';
import QRCanvas from './components/QRCanvas';
import TemplateRenderer from './components/TemplateRenderer';
import { EventDetails, QRConfig, CardTemplate, GuestDetails, TicketType } from './types';

const TEMPLATES: CardTemplate[] = [
  { id: 'wedding_floral', name: 'Swahili Floral', primaryColor: '#E67E22', secondaryColor: '#D35400', accentColor: '#F39C12', fontFamily: 'serif', bgGradient: 'from-orange-50 to-orange-100', hasFlowers: true, borderStyle: 'ornate' },
  { id: 'classic_gold', name: 'Royal Gold', primaryColor: '#B7950B', secondaryColor: '#9A7D0A', accentColor: '#D4AC0D', fontFamily: 'serif', bgGradient: 'from-amber-50 to-yellow-100', hasFlowers: false, borderStyle: 'ornate' },
  { id: 'royal_purple', name: 'Velvet Purple', primaryColor: '#F1C40F', secondaryColor: '#F39C12', accentColor: '#E67E22', fontFamily: 'serif', bgGradient: 'from-purple-900 to-indigo-950', hasFlowers: false, borderStyle: 'pattern' },
  { id: 'zanzibar_pattern', name: 'Zanzibar Shores', primaryColor: '#2980B9', secondaryColor: '#2C3E50', accentColor: '#3498DB', fontFamily: 'serif', bgGradient: 'from-cyan-50 to-blue-100', hasFlowers: true, borderStyle: 'pattern' },
  { id: 'modern_minimal', name: 'Minimalist Clean', primaryColor: '#2C3E50', secondaryColor: '#34495E', accentColor: '#7F8C8D', fontFamily: 'sans-serif', bgGradient: 'from-slate-50 to-slate-200', hasFlowers: false, borderStyle: 'none' },
];

const PORTFOLIO_SAMPLES = [
  { names: "Fatuma & Juma", type: "Wedding", venue: "Mlimani City Hall", date: "15 JULY 2025" },
  { names: "Afrikacha House Gala", type: "Corporate", venue: "Serena Hotel", date: "02 OCT 2025" },
  { names: "Neema's Send-off", type: "Ceremony", venue: "Diamond Jubilee", date: "20 DEC 2025" }
];

const SITE_URL = 'https://afrikacha.tz';

const generateId = () => `AFK-${Math.random().toString(36).substr(2, 4).toUpperCase()}-${Math.floor(Math.random() * 10000)}`;

const DEFAULT_GUEST: GuestDetails = {
  guestName: "",
  ticketType: "Single",
  uniqueId: generateId(),
  guestContact: ""
};

const DEFAULT_CONFIG: QRConfig = {
  content: "",
  size: 110,
  posX: 520,
  posY: 270,
  color: "#000000",
  bgColor: "#ffffff",
  includeMargin: true,
  autoFormat: true
};

const DEFAULT_DETAILS: EventDetails = {
  eventTitle: "Kadi ya Harusi",
  hostNames: "Familia ya Bw. na Bi. Deodatus Mussa Nachenga\ninayo furaha kubwa kukualika/kuwaalika",
  names: "Selestino & Victoria",
  date: "22 NOVEMBA 2025",
  time: "Saa 10:00 Jioni",
  venue: "PTA HALL, Sabasaba Ground",
  locationUrl: "https://maps.app.goo.gl/79UGeaJyx5YZQYTB9",
  contact: "0718710901",
  dressCode: "Burnt Orange",
  additionalInfo: "KARIBU SANA!"
};

const LivePreviewCard: React.FC<{ template: CardTemplate, sample: typeof PORTFOLIO_SAMPLES[0] }> = ({ template, sample }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  return (
    <div className="group relative aspect-[3/4] rounded-[48px] overflow-hidden bg-slate-900 border border-white/5 hover:border-orange-500/50 transition-all shadow-2xl">
      <div className="absolute inset-0 scale-50 -translate-y-1/4 origin-center group-hover:scale-[0.52] transition-transform duration-700">
        <TemplateRenderer 
          template={template} 
          details={{...DEFAULT_DETAILS, names: sample.names, eventTitle: sample.type, venue: sample.venue, date: sample.date}} 
          guest={{...DEFAULT_GUEST, guestName: "Sample Guest", uniqueId: "AFK-SAMPLE"}}
          canvasRef={canvasRef}
        />
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/20 to-transparent z-20 p-8 flex flex-col justify-end">
         <div className="flex justify-between items-center mb-2">
            <span className="px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 text-[8px] font-black uppercase tracking-widest text-orange-400">
              {template.name}
            </span>
            <QrCode className="w-4 h-4 text-white/40" />
         </div>
         <h3 className="text-xl font-black uppercase tracking-tighter text-white">{sample.names}</h3>
         <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{sample.venue}</p>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  const [view, setView] = useState<'home' | 'editor'>('home');
  const [showLogin, setShowLogin] = useState(false);
  const [password, setPassword] = useState('');
  
  const [image, setImage] = useState<string | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<CardTemplate | null>(null);
  const [config, setConfig] = useState<QRConfig>(DEFAULT_CONFIG);
  const [details, setDetails] = useState<EventDetails>(DEFAULT_DETAILS);
  const [guest, setGuest] = useState<GuestDetails>(DEFAULT_GUEST);
  const [activeTab, setActiveTab] = useState<'templates' | 'details' | 'ticket' | 'qr'>('templates');
  
  const templateCanvasRef = useRef<HTMLCanvasElement>(null);
  const exportCanvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [templateImage, setTemplateImage] = useState<string | null>(null);

  const finalQRContent = useMemo(() => {
    if (!config.autoFormat) return config.content;
    return `AFRIKACHA HOUSE | ID:${guest.uniqueId} | T:${guest.ticketType} | N:${guest.guestName || 'GUEST'} | E:${details.names}`;
  }, [config.autoFormat, config.content, guest, details]);

  useEffect(() => {
    if (selectedTemplate && templateCanvasRef.current) {
      const timeout = setTimeout(() => {
        setTemplateImage(templateCanvasRef.current!.toDataURL());
      }, 200);
      return () => clearTimeout(timeout);
    }
  }, [selectedTemplate, details, guest]);

  useEffect(() => {
    const isHomeView = view === 'home';
    const title = isHomeView
      ? 'Afrikacha House | QR Event Invitation Generator Tanzania'
      : 'Afrikacha House Editor | QR Invitation Designer';
    const description = isHomeView
      ? 'Afrikacha House creates secure QR-based digital invitations for weddings, galas, and corporate events in Tanzania.'
      : 'Design and export secure QR invitation cards with the Afrikacha House editor.';
    const robots = isHomeView
      ? 'index, follow, max-image-preview:large'
      : 'noindex, nofollow';

    const upsertMeta = (attr: 'name' | 'property', key: string, value: string) => {
      let tag = document.head.querySelector(`meta[${attr}="${key}"]`) as HTMLMetaElement | null;
      if (!tag) {
        tag = document.createElement('meta');
        tag.setAttribute(attr, key);
        document.head.appendChild(tag);
      }
      tag.setAttribute('content', value);
    };

    let canonical = document.head.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.rel = 'canonical';
      document.head.appendChild(canonical);
    }
    canonical.href = `${SITE_URL}/`;

    document.title = title;
    upsertMeta('name', 'description', description);
    upsertMeta('name', 'robots', robots);
    upsertMeta('property', 'og:title', title);
    upsertMeta('property', 'og:description', description);
    upsertMeta('property', 'og:url', `${SITE_URL}/`);
    upsertMeta('name', 'twitter:title', title);
    upsertMeta('name', 'twitter:description', description);
  }, [view]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const base64 = event.target?.result as string;
        setImage(base64);
        setSelectedTemplate(null);
        setView('editor');
        setActiveTab('qr');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDownload = () => {
    const canvas = exportCanvasRef.current;
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = `Afrikacha_House_Ticket_${guest.uniqueId}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  const resetAll = () => {
    if (confirm("Clear all data and return to home?")) {
      setImage(null);
      setSelectedTemplate(null);
      setConfig(DEFAULT_CONFIG);
      setDetails(DEFAULT_DETAILS);
      setGuest({ ...DEFAULT_GUEST, uniqueId: generateId() });
      setView('home');
      setTemplateImage(null);
    }
  };

  const scrollToId = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'AfrikachaHouse2025') {
      setShowLogin(false);
      setView('editor');
    } else {
      alert('Unauthorized access attempt.');
    }
  };

  if (view === 'home') {
    return (
      <div className="min-h-screen bg-[#020617] text-white selection:bg-orange-500/30">
        <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:bg-white focus:text-black focus:px-4 focus:py-2 focus:rounded-md">
          Skip to main content
        </a>
        <nav className="fixed top-0 w-full z-50 border-b border-white/5 bg-[#020617]/80 backdrop-blur-xl">
          <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
            <button
              type="button"
              onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})}
              aria-label="Go to top of page"
              className="flex items-center gap-3 cursor-pointer"
            >
              <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-rose-600 rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/20">
                <QrCode className="text-white w-6 h-6" />
              </div>
              <span className="text-2xl font-black tracking-tighter uppercase italic">Afrikacha House</span>
            </button>
            <div className="hidden md:flex items-center gap-8 text-sm font-bold uppercase tracking-widest text-slate-400">
              <button type="button" onClick={() => scrollToId('portfolio')} className="hover:text-orange-500 transition-colors uppercase">Portfolio</button>
              <button type="button" onClick={() => scrollToId('features')} className="hover:text-orange-500 transition-colors uppercase">Services</button>
              <button type="button" onClick={() => scrollToId('contact')} className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2.5 rounded-full transition-all active:scale-95 shadow-lg shadow-orange-500/20 text-xs font-black uppercase tracking-widest">
                Contact for Design
              </button>
            </div>
          </div>
        </nav>

        <main id="main-content">
        <section className="pt-48 pb-20 px-6">
          <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-10 animate-in fade-in slide-in-from-left-8 duration-1000">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-500 text-[10px] font-black uppercase tracking-widest">
                <Star className="w-3 h-3 fill-orange-500" /> Premium Tanzanian E-Cards
              </div>
              <h1 className="text-7xl lg:text-9xl font-black tracking-tighter leading-[0.85]">
                Luxury <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-rose-600 italic">Access.</span>
              </h1>
              <p className="text-xl text-slate-400 leading-relaxed max-w-lg">
                We transform traditional Tanzanian invitations into high-end secure digital experiences. Perfect for Weddings, Galas, and VIP corporate events.
              </p>
              <div className="flex flex-col sm:flex-row gap-6 pt-4">
                <button 
                  type="button"
                  onClick={() => scrollToId('portfolio')}
                  className="group flex items-center justify-center gap-3 bg-white text-black px-10 py-6 rounded-[32px] font-black uppercase tracking-widest text-sm hover:bg-orange-500 hover:text-white transition-all shadow-2xl active:scale-95"
                >
                  Explore Cards <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
                <a href="https://wa.me/255718710901" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-4 border border-slate-800 px-10 py-6 rounded-[32px] font-black uppercase tracking-widest text-sm hover:border-orange-500/50 transition-all">
                  <Phone className="w-5 h-5 text-orange-500" /> WhatsApp Us
                </a>
              </div>
            </div>

            <div className="relative animate-in fade-in zoom-in-95 duration-1000 delay-300">
              <div className="absolute -inset-10 bg-orange-500/20 blur-[120px] rounded-full opacity-40 animate-pulse" />
              <div className="relative bg-slate-900/40 border border-white/10 p-6 rounded-[60px] backdrop-blur-3xl rotate-3 shadow-2xl">
                 <img src="https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=2070&auto=format&fit=crop" className="rounded-[44px] brightness-75 hover:brightness-100 transition-all duration-700" alt="African Luxury" />
                 <div className="absolute -bottom-10 -left-10 bg-orange-500 p-8 rounded-[40px] shadow-2xl -rotate-6 border-4 border-slate-950">
                    <QrCode className="w-14 h-14 text-white" />
                 </div>
                 <div className="absolute -top-10 -right-10 bg-white text-black p-8 rounded-[40px] shadow-2xl rotate-12 flex flex-col gap-1 border-4 border-slate-950">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Security Verified</span>
                    <span className="text-2xl font-black">QR-MANIFEST</span>
                 </div>
              </div>
            </div>
          </div>
        </section>

        <section id="portfolio" className="py-32 px-6">
          <div className="max-w-7xl mx-auto">
             <div className="flex flex-col md:flex-row justify-between items-end mb-20 gap-8">
                <div className="space-y-4">
                   <h2 className="text-5xl lg:text-7xl font-black tracking-tighter uppercase leading-none">Signature <br />Collections</h2>
                   <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Exclusively designed for high-end events in Tanzania.</p>
                </div>
                <div className="w-full md:w-auto">
                   <p className="text-slate-400 max-w-sm text-sm italic">Below are real examples of the secure digital invitations we produce at Afrikacha House.</p>
                </div>
             </div>

             <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
                {TEMPLATES.slice(0, 3).map((t, idx) => (
                   <LivePreviewCard key={t.id} template={t} sample={PORTFOLIO_SAMPLES[idx]} />
                ))}
             </div>
             
             <div className="mt-20 p-12 bg-white/5 rounded-[48px] border border-white/5 text-center">
                <p className="text-slate-500 font-black uppercase tracking-[0.3em] text-xs mb-8">Want a custom layout for your event?</p>
                <div className="flex justify-center gap-4">
                   {TEMPLATES.slice(3).map(t => (
                     <div key={t.id} className={`w-3 h-3 rounded-full bg-gradient-to-br ${t.bgGradient} opacity-50`} />
                   ))}
                </div>
             </div>
          </div>
        </section>

        <section id="features" className="py-32 bg-white/5 border-y border-white/5 px-6">
          <div className="max-w-7xl mx-auto grid lg:grid-cols-3 gap-16">
              <div className="lg:col-span-1 space-y-6">
                 <h2 className="text-5xl font-black tracking-tighter uppercase leading-[0.9]">Why go <br /><span className="text-orange-500">Digital?</span></h2>
                 <p className="text-slate-400 leading-relaxed">Paper invitations are beautiful, but digital invitations are powerful. We bridge the gap between elegance and security.</p>
                 <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-4 p-4 rounded-3xl bg-slate-900/50 border border-slate-800">
                       <ShieldCheck className="w-6 h-6 text-orange-500" />
                       <span className="text-sm font-bold uppercase tracking-tight">Zero Fraud Entry</span>
                    </div>
                    <div className="flex items-center gap-4 p-4 rounded-3xl bg-slate-900/50 border border-slate-800">
                       <Users className="w-6 h-6 text-orange-500" />
                       <span className="text-sm font-bold uppercase tracking-tight">Real-time Guest List</span>
                    </div>
                 </div>
              </div>

              <div className="lg:col-span-2 grid md:grid-cols-2 gap-8">
                  {[
                    { title: "Smart RSVP", desc: "No more phone calls. Guests confirm their attendance with one tap.", icon: <Smartphone /> },
                    { title: "Gate Management", desc: "We provide scanning apps for your bouncers to verify guests at the entrance.", icon: <CheckCircle2 /> },
                    { title: "VIP Tiering", desc: "Separate gates for VIP, VVIP, and Single ticket holders.", icon: <Zap /> },
                    { title: "Paper-to-Digital", icon: <ImageIcon />, desc: "We can digitize your existing physical cards with our scanning tools." }
                  ].map((s, i) => (
                    <div key={i} className="p-10 rounded-[40px] bg-slate-950 border border-white/5 hover:border-orange-500/20 transition-all">
                       <div className="w-12 h-12 rounded-2xl bg-orange-500/10 flex items-center justify-center text-orange-500 mb-6">{s.icon}</div>
                       <h4 className="text-xl font-black mb-3 uppercase tracking-tight">{s.title}</h4>
                       <p className="text-slate-500 text-sm leading-relaxed">{s.desc}</p>
                    </div>
                  ))}
              </div>
          </div>
        </section>

        <section id="contact" className="py-40 text-center px-6">
           <div className="max-w-4xl mx-auto space-y-12">
              <h2 className="text-6xl lg:text-8xl font-black tracking-tighter uppercase leading-[0.85]">Let's Create <br />Your Masterpiece</h2>
              <div className="flex flex-wrap justify-center gap-10">
                 <div className="flex flex-col items-center gap-2">
                    <Phone className="w-8 h-8 text-orange-500" />
                    <span className="text-xs font-black uppercase tracking-widest">0718 710 901</span>
                 </div>
                 <div className="flex flex-col items-center gap-2">
                    <Mail className="w-8 h-8 text-orange-500" />
                    <span className="text-xs font-black uppercase tracking-widest">hello@afrikacha.tz</span>
                 </div>
                 <div className="flex flex-col items-center gap-2">
                    <Instagram className="w-8 h-8 text-orange-500" />
                    <span className="text-xs font-black uppercase tracking-widest">@afrikacha_house</span>
                 </div>
              </div>
              <a href="https://wa.me/255718710901" target="_blank" rel="noopener noreferrer" className="inline-block bg-orange-500 text-white px-16 py-8 rounded-full font-black uppercase tracking-[0.3em] text-xs shadow-2xl shadow-orange-500/40 hover:scale-105 transition-all">
                 Inquire Now
              </a>
           </div>
        </section>
        </main>

        <footer className="py-12 border-t border-white/5 bg-black/40 px-6">
           <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
              <div className="flex items-center gap-3 grayscale opacity-50">
                <QrCode className="w-6 h-6" />
                <span className="text-lg font-black tracking-tighter uppercase italic">Afrikacha House</span>
              </div>
              <p className="text-[10px] font-bold text-slate-600 uppercase tracking-[0.5em]">&copy; 2025 Afrikacha House • Dar es Salaam</p>
              <button 
                type="button"
                onClick={() => setShowLogin(true)}
                aria-label="Open owner login form"
                className="text-[9px] font-black uppercase tracking-widest text-slate-800 hover:text-slate-600 transition-colors flex items-center gap-2"
              >
                <Lock className="w-3 h-3" /> Owner Login
              </button>
           </div>
        </footer>

        {showLogin && (
          <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-xl flex items-center justify-center p-6 animate-in fade-in duration-300" role="dialog" aria-modal="true" aria-labelledby="owner-login-title">
             <div className="w-full max-w-md bg-slate-900 border border-white/10 rounded-[48px] p-10 space-y-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8">
                  <button type="button" onClick={() => setShowLogin(false)} aria-label="Close owner login dialog" className="text-slate-500 hover:text-white transition-colors">
                    <Trash2 className="w-6 h-6" />
                  </button>
                </div>
                <div className="space-y-4">
                  <div className="w-16 h-16 bg-orange-500 rounded-3xl flex items-center justify-center mx-auto shadow-2xl">
                    <ShieldCheck className="w-8 h-8 text-white" />
                  </div>
                  <h3 id="owner-login-title" className="text-2xl font-black text-center uppercase tracking-tighter">Owner Access Only</h3>
                  <p className="text-center text-slate-500 text-sm">Please verify your identity to enter the Afrikacha House Workspace.</p>
                </div>
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-1">
                     <label htmlFor="access-key" className="text-[10px] font-black text-slate-600 uppercase tracking-widest px-2">Access Key</label>
                     <input 
                       id="access-key"
                       type="password" 
                       value={password}
                       onChange={(e) => setPassword(e.target.value)}
                       autoComplete="current-password"
                       required
                       autoFocus
                       className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-6 py-5 text-white outline-none focus:border-orange-500 transition-all font-mono" 
                       placeholder="••••••••"
                     />
                  </div>
                  <button type="submit" className="w-full bg-white text-black py-5 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-orange-500 hover:text-white transition-all shadow-xl flex items-center justify-center gap-3">
                    <LogIn className="w-4 h-4" /> Unlock House
                  </button>
                </form>
                <p className="text-center text-[9px] font-bold text-slate-600 uppercase tracking-[0.2em]">Authorized Personnel Only</p>
             </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020617] flex flex-col selection:bg-orange-500/30">
      <header className="border-b border-white/5 bg-[#020617]/40 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <button
            type="button"
            onClick={() => setView('home')}
            aria-label="Back to homepage"
            className="flex items-center gap-3 cursor-pointer"
          >
            <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-rose-600 rounded-lg flex items-center justify-center">
              <QrCode className="text-white w-5 h-5" />
            </div>
            <span className="text-xl font-black tracking-tighter uppercase italic">Afrikacha House</span>
          </button>

          <div className="flex items-center gap-4">
            <div className="px-4 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-500 text-[9px] font-black uppercase tracking-widest flex items-center gap-2">
               <ShieldCheck className="w-3 h-3" /> Owner Mode
            </div>
            <button type="button" onClick={handleDownload} className="flex items-center gap-2 bg-white text-black hover:bg-orange-500 hover:text-white px-5 py-2 rounded-full font-black transition-all shadow-lg active:scale-95 text-[10px] uppercase tracking-widest">
              <Download className="w-4 h-4" />
              <span>Export Card</span>
            </button>
            <button type="button" onClick={resetAll} aria-label="Reset all editor data" className="p-2 text-slate-500 hover:text-red-400 transition-colors">
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full p-4 lg:p-10 grid lg:grid-cols-12 gap-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <h1 className="sr-only">Afrikacha House Editor</h1>
        <div className="lg:col-span-7 flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-black text-white flex items-center gap-3 uppercase tracking-tighter">
              <Zap className="w-5 h-5 text-orange-400" />
              House Editor
            </h2>
          </div>
          
          <div className="flex justify-center bg-slate-900/20 backdrop-blur-md p-6 rounded-[48px] border border-white/5 shadow-2xl relative">
            {!selectedTemplate && !image ? (
               <div className="h-[400px] w-full flex flex-col items-center justify-center gap-6 text-slate-500 border-2 border-dashed border-white/5 rounded-[36px]">
                  <Layout className="w-16 h-16 opacity-10" />
                  <p className="font-bold uppercase tracking-widest text-[10px]">Prepare a design to begin</p>
               </div>
            ) : (
              <>
                {selectedTemplate && (
                  <div className="hidden">
                     <TemplateRenderer template={selectedTemplate} details={details} guest={guest} canvasRef={templateCanvasRef} />
                  </div>
                )}
                
                {(image || templateImage) && (
                  <QRCanvas image={image || templateImage!} config={{...config, content: finalQRContent}} canvasRef={exportCanvasRef}
                    onPositionChange={(x, y) => setConfig(prev => ({ ...prev, posX: x, posY: y }))}
                  />
                )}
                <canvas ref={exportCanvasRef} className="hidden" />
              </>
            )}
          </div>
        </div>

        <div className="lg:col-span-5">
          <div className="bg-slate-900/90 border border-white/10 rounded-[48px] overflow-hidden shadow-2xl sticky top-24 backdrop-blur-2xl">
            <div className="flex bg-white/5 p-1.5 m-4 rounded-2xl">
              {['templates', 'details', 'ticket', 'qr'].map(tab => (
                <button key={tab} type="button" onClick={() => setActiveTab(tab as any)} aria-pressed={activeTab === tab}
                  className={`flex-1 py-3 text-[9px] font-black uppercase tracking-widest rounded-xl transition-all ${activeTab === tab ? 'bg-white text-slate-900 shadow-xl' : 'text-slate-500 hover:text-white'}`}>
                  {tab}
                </button>
              ))}
            </div>

            <div className="p-8 max-h-[55vh] overflow-y-auto custom-scrollbar space-y-6">
              {activeTab === 'templates' ? (
                <div className="space-y-6">
                   <input id="template-upload" type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileUpload} />
                   <button 
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    aria-label="Upload a paper invitation image"
                    className="w-full flex items-center justify-between p-6 rounded-[32px] border border-slate-700 bg-slate-800/40 hover:bg-slate-800 transition-all group cursor-pointer"
                   >
                      <div className="flex items-center gap-4">
                        <ImageIcon className="w-10 h-10 text-orange-400" />
                        <div className="text-left">
                          <p className="text-sm font-black text-white uppercase tracking-tight">Digitize Paper Card</p>
                          <p className="text-[9px] text-slate-500 uppercase font-black">Image Upload</p>
                        </div>
                      </div>
                   </button>

                   <div className="space-y-3">
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-2">House Presets</p>
                      {TEMPLATES.map(t => (
                        <button type="button" key={t.id} onClick={() => {setSelectedTemplate(t); setImage(null);}}
                          className={`w-full flex items-center justify-between p-5 rounded-3xl border transition-all ${selectedTemplate?.id === t.id ? 'bg-orange-500/10 border-orange-500/50 text-orange-400' : 'bg-slate-800/40 border-slate-800 text-slate-400 hover:border-slate-700'}`}>
                          <div className="flex items-center gap-4">
                            <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${t.bgGradient} flex items-center justify-center opacity-40 shadow-xl`}>
                               <Star className="w-4 h-4 text-white" />
                            </div>
                            <span className="text-xs font-black uppercase tracking-tight">{t.name}</span>
                          </div>
                          {t.hasFlowers && <Sparkles className="w-4 h-4 text-orange-500" />}
                        </button>
                      ))}
                   </div>
                </div>
              ) : activeTab === 'details' ? (
                <div className="space-y-5">
                  <div className="space-y-2">
                    <label htmlFor="details-host" className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Header (Host Info)</label>
                    <textarea id="details-host" value={details.hostNames} onChange={e => setDetails({...details, hostNames: e.target.value})}
                      className="w-full bg-slate-950 border border-slate-800 rounded-3xl px-6 py-5 text-white text-xs leading-relaxed outline-none focus:border-orange-500 min-h-[120px] transition-all" />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="details-names" className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Main Celebrants</label>
                    <input id="details-names" type="text" value={details.names} onChange={e => setDetails({...details, names: e.target.value})}
                      className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-6 py-5 text-white font-bold outline-none focus:border-orange-500" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label htmlFor="details-date" className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Date</label>
                      <input id="details-date" type="text" value={details.date} onChange={e => setDetails({...details, date: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-6 py-5 text-white text-xs outline-none" />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="details-time" className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Time</label>
                      <input id="details-time" type="text" value={details.time} onChange={e => setDetails({...details, time: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-6 py-5 text-white text-xs outline-none" />
                    </div>
                  </div>
                </div>
              ) : activeTab === 'ticket' ? (
                <div className="space-y-6">
                  <div className="bg-orange-500/5 p-8 rounded-[40px] border border-orange-500/10 space-y-6 shadow-2xl">
                     <div className="flex items-center gap-3">
                        <ShieldCheck className="w-6 h-6 text-orange-500" />
                        <h4 className="text-sm font-black text-white uppercase tracking-widest">Entry Verification</h4>
                     </div>
                     <div className="space-y-4">
                        <div className="space-y-2">
                          <label htmlFor="ticket-guest-name" className="text-[10px] font-black text-slate-600 uppercase">Guest To Print</label>
                          <input id="ticket-guest-name" type="text" value={guest.guestName} onChange={e => setGuest({...guest, guestName: e.target.value})} 
                            className="w-full bg-black border border-slate-800 rounded-2xl px-6 py-5 text-white text-xs outline-none focus:border-orange-500" placeholder="e.g. Salim Bakari" />
                        </div>
                        <div className="space-y-2">
                          <p className="text-[10px] font-black text-slate-600 uppercase">Tier Level</p>
                          <div className="grid grid-cols-2 gap-3">
                            {['Single', 'Double', 'VIP', 'VVIP'].map(t => (
                              <button type="button" key={t} onClick={() => setGuest({...guest, ticketType: t as TicketType})} aria-pressed={guest.ticketType === t}
                                className={`py-5 rounded-2xl text-[10px] font-black uppercase border transition-all ${guest.ticketType === t ? 'bg-orange-500 border-orange-500 text-white shadow-xl scale-[1.02]' : 'bg-black border-slate-800 text-slate-600 hover:border-slate-700'}`}>
                                {t}
                              </button>
                            ))}
                          </div>
                        </div>
                        <div className="pt-8 mt-8 border-t border-slate-900 flex items-center justify-between">
                           <div>
                             <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest mb-1">Security Hash</p>
                             <p className="text-sm font-mono text-orange-500 font-bold">{guest.uniqueId}</p>
                           </div>
                           <button type="button" onClick={() => setGuest({...guest, uniqueId: generateId()})} aria-label="Generate new security hash" className="p-4 bg-slate-900 rounded-2xl text-slate-400 hover:text-white transition-all active:rotate-180 duration-500">
                             <RefreshCcw className="w-5 h-5" />
                           </button>
                        </div>
                     </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-8">
                  <div className="space-y-3">
                    <label htmlFor="qr-scale" className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-2">QR Scale</label>
                    <input id="qr-scale" type="range" min="40" max="350" step="5" value={config.size}
                      onChange={(e) => setConfig(prev => ({ ...prev, size: parseInt(e.target.value) }))}
                      className="w-full accent-orange-500 h-2 bg-slate-950 rounded-lg appearance-none cursor-pointer" />
                  </div>
                  <div className="p-8 bg-black rounded-[40px] border border-white/5 space-y-4 shadow-inner">
                     <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Metadata Payload</p>
                     <div className="p-6 bg-slate-900/40 rounded-3xl text-[11px] font-mono text-orange-400/60 break-all leading-relaxed border border-white/5">
                        {finalQRContent}
                     </div>
                  </div>
                </div>
              )}
            </div>

            <div className="p-8 border-t border-white/10 bg-black/20">
               <button type="button" onClick={handleDownload} className="w-full py-6 bg-white text-black font-black uppercase tracking-[0.3em] text-[10px] rounded-[32px] shadow-2xl hover:bg-orange-500 hover:text-white transition-all active:scale-95 flex items-center justify-center gap-4">
                 <Download className="w-5 h-5" /> Generate & Export
               </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
