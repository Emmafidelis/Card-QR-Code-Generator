
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { 
  Upload, Download, QrCode, Sparkles, RefreshCcw, Trash2, 
  MapPin, Layout, Type as TypeIcon, Calendar, Clock, 
  Shirt, ShieldCheck, Image as ImageIcon, ChevronRight, 
  CheckCircle2, Star, Zap, Users, Smartphone, ArrowRight,
  Info, Lock, LogIn, Mail, Instagram, Phone, Paperclip
} from 'lucide-react';
import QRCanvas from './components/QRCanvas';
import TemplateRenderer from './components/TemplateRenderer';
import { EventDetails, QRConfig, CardTemplate, GuestDetails, TicketType } from './types';

const TEMPLATES: CardTemplate[] = [
  { id: 'lyakurwa_red_navy', name: 'Lyakurwa Red & Navy', primaryColor: '#1A237E', secondaryColor: '#B71C1C', accentColor: '#D4AF37', fontFamily: 'serif', bgGradient: 'from-white to-slate-50', hasFlowers: true, borderStyle: 'none' },
  { id: 'wedding_floral', name: 'Swahili Floral', primaryColor: '#E67E22', secondaryColor: '#D35400', accentColor: '#F39C12', fontFamily: 'serif', bgGradient: 'from-orange-50 to-orange-100', hasFlowers: true, borderStyle: 'ornate' },
  { id: 'classic_gold', name: 'Royal Gold', primaryColor: '#B7950B', secondaryColor: '#9A7D0A', accentColor: '#D4AC0D', fontFamily: 'serif', bgGradient: 'from-amber-50 to-yellow-100', hasFlowers: false, borderStyle: 'ornate' },
  { id: 'royal_purple', name: 'Velvet Purple', primaryColor: '#F1C40F', secondaryColor: '#F39C12', accentColor: '#E67E22', fontFamily: 'serif', bgGradient: 'from-purple-900 to-indigo-950', hasFlowers: false, borderStyle: 'pattern' },
  { id: 'zanzibar_pattern', name: 'Zanzibar Shores', primaryColor: '#2980B9', secondaryColor: '#2C3E50', accentColor: '#3498DB', fontFamily: 'serif', bgGradient: 'from-cyan-50 to-blue-100', hasFlowers: true, borderStyle: 'pattern' },
  { id: 'modern_minimal', name: 'Minimalist Clean', primaryColor: '#2C3E50', secondaryColor: '#34495E', accentColor: '#7F8C8D', fontFamily: 'sans-serif', bgGradient: 'from-slate-50 to-slate-200', hasFlowers: false, borderStyle: 'none' },
];

const PORTFOLIO_SAMPLES = [
  { names: "Mark & Glory", type: "Wedding", venue: "Grand Paradise", date: "14 FEB 2026" },
  { names: "Fatuma & Juma", type: "Wedding", venue: "Mlimani City Hall", date: "15 JULY 2025" },
  { names: "Afrikacha Gala", type: "Corporate", venue: "Serena Hotel", date: "02 OCT 2025" }
];

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
  eventTitle: "Mwaliko wa harusi",
  hostNames: "Familia ya Modest Lyakurwa wa Yombo Kilakala Dar es\nSalaam wanayo furaha kukualika/kuwaalika",
  names: "Mark M. Lyakurwa\n&\nGlory Prosper",
  date: "14/02/2026",
  time: "Saa 8:30 Alasiri",
  venue: "Ukumbi wa Grand Paradise",
  locationUrl: "https://maps.app.goo.gl/79UGeaJyx5YZQYTB9",
  contact: "0718710901",
  dressCode: "Mavazi ya Heshima",
  additionalInfo: "Mwisho wa lami Dar es salaam.",
  instruction: "Skani kadi hii kwa ajili ya kuingilia ukumbini"
};

const App: React.FC = () => {
  const [view, setView] = useState<'home' | 'editor'>('home');
  const [isOwner, setIsOwner] = useState(false);
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
  const assetInputRef = useRef<HTMLInputElement>(null);
  const [templateImage, setTemplateImage] = useState<string | null>(null);

  const finalQRContent = useMemo(() => {
    if (!config.autoFormat) return config.content;
    return `AFRIKACHA | ID:${guest.uniqueId} | T:${guest.ticketType} | N:${guest.guestName || 'GUEST'} | E:${details.names.replace(/\n/g, ' ')}`;
  }, [config.autoFormat, config.content, guest, details]);

  useEffect(() => {
    if (selectedTemplate && templateCanvasRef.current) {
      const timeout = setTimeout(() => {
        setTemplateImage(templateCanvasRef.current!.toDataURL());
      }, 200);
      return () => clearTimeout(timeout);
    }
  }, [selectedTemplate, details, guest]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        setImage(base64);
        setSelectedTemplate(null);
        setView('editor');
        setActiveTab('details');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDownload = () => {
    const canvas = exportCanvasRef.current;
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = `Afrikacha_Ticket_${guest.uniqueId}.png`;
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
      setIsOwner(true);
      setShowLogin(false);
      setView('editor');
    } else {
      alert('Unauthorized access attempt.');
    }
  };

  if (view === 'home') {
    return (
      <div className="min-h-screen bg-[#020617] text-white selection:bg-orange-500/30">
        <nav className="fixed top-0 w-full z-50 border-b border-white/5 bg-[#020617]/80 backdrop-blur-xl">
          <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})}>
              <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-rose-600 rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/20">
                <QrCode className="text-white w-6 h-6" />
              </div>
              <span className="text-2xl font-black tracking-tighter uppercase italic">Afrikacha</span>
            </div>
            <div className="hidden md:flex items-center gap-8 text-sm font-bold uppercase tracking-widest text-slate-400">
              <button onClick={() => scrollToId('portfolio')} className="hover:text-orange-500 transition-colors uppercase">Portfolio</button>
              <button onClick={() => scrollToId('features')} className="hover:text-orange-500 transition-colors uppercase">Services</button>
              <button onClick={() => scrollToId('contact')} className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2.5 rounded-full transition-all active:scale-95 shadow-lg shadow-orange-500/20 text-xs font-black uppercase tracking-widest">
                Contact for Design
              </button>
            </div>
          </div>
        </nav>

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
          <div className="max-w-7xl mx-auto text-center space-y-20">
             <div className="flex flex-col md:flex-row justify-between items-end gap-8">
                <div className="space-y-4 text-left">
                   <h2 className="text-5xl lg:text-7xl font-black tracking-tighter uppercase leading-none">Signature <br />Collections</h2>
                   <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Exclusively designed for high-end events in Tanzania.</p>
                </div>
                <div className="w-full md:w-auto">
                   <p className="text-slate-400 max-w-sm text-sm italic text-right">Below are real examples of the secure digital invitations we produce in our studio.</p>
                </div>
             </div>

             <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
                {TEMPLATES.slice(0, 3).map((t, idx) => (
                   <div key={t.id} className="relative aspect-[3/4] rounded-[48px] overflow-hidden bg-slate-900 border border-white/5 shadow-2xl group">
                      <div className="absolute inset-0 scale-50 -translate-y-1/4 origin-center group-hover:scale-[0.52] transition-transform duration-700">
                        <TemplateRenderer 
                          template={t} 
                          details={{...DEFAULT_DETAILS, names: PORTFOLIO_SAMPLES[idx].names, eventTitle: PORTFOLIO_SAMPLES[idx].type, venue: PORTFOLIO_SAMPLES[idx].venue, date: PORTFOLIO_SAMPLES[idx].date}} 
                          guest={{...DEFAULT_GUEST, guestName: "Sample Guest", uniqueId: "AFK-SAMPLE"}}
                          canvasRef={null as any}
                        />
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/20 to-transparent z-20 p-8 flex flex-col justify-end">
                         <h3 className="text-xl font-black uppercase tracking-tighter text-white">{PORTFOLIO_SAMPLES[idx].names}</h3>
                         <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{PORTFOLIO_SAMPLES[idx].venue}</p>
                      </div>
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
                    <span className="text-xs font-black uppercase tracking-widest">@afrikacha_studio</span>
                 </div>
              </div>
              <a href="https://wa.me/255718710901" target="_blank" rel="noopener noreferrer" className="inline-block bg-orange-500 text-white px-16 py-8 rounded-full font-black uppercase tracking-[0.3em] text-xs shadow-2xl shadow-orange-500/40 hover:scale-105 transition-all">
                 Inquire Now
              </a>
           </div>
        </section>

        <footer className="py-12 border-t border-white/5 bg-black/40 px-6">
           <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
              <div className="flex items-center gap-3 grayscale opacity-50">
                <QrCode className="w-6 h-6" />
                <span className="text-lg font-black tracking-tighter uppercase italic">Afrikacha</span>
              </div>
              <p className="text-[10px] font-bold text-slate-600 uppercase tracking-[0.5em]">&copy; 2025 Afrikacha Studio • Dar es Salaam</p>
              <button 
                onClick={() => setShowLogin(true)}
                className="text-[9px] font-black uppercase tracking-widest text-slate-800 hover:text-slate-600 transition-colors flex items-center gap-2"
              >
                <Lock className="w-3 h-3" /> Owner Login
              </button>
           </div>
        </footer>

        {showLogin && (
          <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-xl flex items-center justify-center p-6 animate-in fade-in duration-300">
             <div className="w-full max-w-md bg-slate-900 border border-white/10 rounded-[48px] p-10 space-y-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8">
                  <button onClick={() => setShowLogin(false)} className="text-slate-500 hover:text-white transition-colors">
                    <Trash2 className="w-6 h-6" />
                  </button>
                </div>
                <div className="space-y-4">
                  <div className="w-16 h-16 bg-orange-500 rounded-3xl flex items-center justify-center mx-auto shadow-2xl">
                    <ShieldCheck className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-black text-center uppercase tracking-tighter">Owner Access Only</h3>
                  <p className="text-center text-slate-500 text-sm">Please verify your identity to enter the Afrikacha Studio Workspace.</p>
                </div>
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-1">
                     <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest px-2">Access Key</label>
                     <input 
                       type="password" 
                       value={password}
                       onChange={(e) => setPassword(e.target.value)}
                       autoFocus
                       className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-6 py-5 text-white outline-none focus:border-orange-500 transition-all font-mono" 
                       placeholder="••••••••"
                     />
                  </div>
                  <button type="submit" className="w-full bg-white text-black py-5 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-orange-500 hover:text-white transition-all shadow-xl flex items-center justify-center gap-3">
                    <LogIn className="w-4 h-4" /> Unlock Studio
                  </button>
                </form>
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
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setView('home')}>
            <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-rose-600 rounded-lg flex items-center justify-center">
              <QrCode className="text-white w-5 h-5" />
            </div>
            <span className="text-xl font-black tracking-tighter uppercase italic">Afrikacha</span>
          </div>

          <div className="flex items-center gap-4">
            <button onClick={() => assetInputRef.current?.click()} className="flex items-center gap-2 bg-slate-800 text-white px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-slate-700 transition-all">
               <Paperclip className="w-3 h-3" /> Attach File
            </button>
            <input type="file" ref={assetInputRef} className="hidden" onChange={(e) => alert("File attached successfully!")} />
            <button onClick={handleDownload} className="flex items-center gap-2 bg-white text-black hover:bg-orange-500 hover:text-white px-5 py-2 rounded-full font-black transition-all shadow-lg text-[10px] uppercase tracking-widest">
              <Download className="w-4 h-4" /> Export
            </button>
            <button onClick={resetAll} className="p-2 text-slate-500 hover:text-red-400">
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full p-4 lg:p-10 grid lg:grid-cols-12 gap-10">
        <div className="lg:col-span-7 flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-black text-white flex items-center gap-3 uppercase tracking-tighter">
              <Zap className="w-5 h-5 text-orange-400" /> Studio Editor
            </h2>
          </div>
          
          <div className="flex justify-center bg-slate-900/20 backdrop-blur-md p-6 rounded-[48px] border border-white/5 shadow-2xl relative">
            {!selectedTemplate && !image ? (
               <div className="h-[400px] w-full flex flex-col items-center justify-center gap-6 text-slate-500 border-2 border-dashed border-white/5 rounded-[36px]">
                  <Layout className="w-16 h-16 opacity-10" />
                  <p className="font-bold uppercase tracking-widest text-[10px]">Select template to begin</p>
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
          <div className="bg-slate-900/90 border border-white/10 rounded-[48px] overflow-hidden shadow-2xl backdrop-blur-2xl">
            <div className="flex bg-white/5 p-1.5 m-4 rounded-2xl">
              {['templates', 'details', 'ticket', 'qr'].map(tab => (
                <button key={tab} onClick={() => setActiveTab(tab as any)}
                  className={`flex-1 py-3 text-[9px] font-black uppercase tracking-widest rounded-xl transition-all ${activeTab === tab ? 'bg-white text-slate-900' : 'text-slate-500 hover:text-white'}`}>
                  {tab}
                </button>
              ))}
            </div>

            <div className="p-8 max-h-[60vh] overflow-y-auto custom-scrollbar space-y-6">
              {activeTab === 'templates' ? (
                <div className="space-y-6">
                   <button onClick={() => fileInputRef.current?.click()} className="w-full flex items-center justify-between p-6 rounded-[32px] border border-slate-700 bg-slate-800/40 hover:bg-slate-800 transition-all">
                      <div className="flex items-center gap-4 text-left">
                        <ImageIcon className="w-10 h-10 text-orange-400" />
                        <div><p className="text-sm font-black text-white uppercase tracking-tight">Digitize Paper Card</p><p className="text-[9px] text-slate-500 font-black">UPLOAD IMAGE</p></div>
                      </div>
                      <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileUpload} />
                   </button>
                   <div className="space-y-3">
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-2">Presets</p>
                      {TEMPLATES.map(t => (
                        <button key={t.id} onClick={() => {setSelectedTemplate(t); setImage(null);}}
                          className={`w-full flex items-center justify-between p-5 rounded-3xl border transition-all ${selectedTemplate?.id === t.id ? 'bg-orange-500/10 border-orange-500/50 text-orange-400' : 'bg-slate-800/40 border-slate-800 text-slate-400'}`}>
                          <span className="text-xs font-black uppercase tracking-tight">{t.name}</span>
                          {t.hasFlowers && <Sparkles className="w-4 h-4 text-orange-500" />}
                        </button>
                      ))}
                   </div>
                </div>
              ) : activeTab === 'details' ? (
                <div className="space-y-5">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Header Text</label>
                    <textarea value={details.hostNames} onChange={e => setDetails({...details, hostNames: e.target.value})}
                      className="w-full bg-slate-950 border border-slate-800 rounded-3xl px-6 py-5 text-white text-xs leading-relaxed outline-none min-h-[100px]" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Main Title</label>
                    <input type="text" value={details.eventTitle} onChange={e => setDetails({...details, eventTitle: e.target.value})}
                      className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-6 py-5 text-white font-bold outline-none" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Celebrants</label>
                    <textarea value={details.names} onChange={e => setDetails({...details, names: e.target.value})}
                      className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-6 py-5 text-white font-bold outline-none min-h-[100px]" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <input type="text" value={details.date} onChange={e => setDetails({...details, date: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-6 py-5 text-white text-xs" placeholder="Date" />
                    <input type="text" value={details.time} onChange={e => setDetails({...details, time: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-6 py-5 text-white text-xs" placeholder="Time" />
                  </div>
                  <input type="text" value={details.venue} onChange={e => setDetails({...details, venue: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-6 py-5 text-white text-xs" placeholder="Place (Ukumbi)" />
                  <input type="text" value={details.additionalInfo} onChange={e => setDetails({...details, additionalInfo: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-6 py-5 text-white text-xs" placeholder="Location (Eneo)" />
                  <input type="text" value={details.contact} onChange={e => setDetails({...details, contact: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-6 py-5 text-white text-xs" placeholder="Contact (Mawasiliano)" />
                </div>
              ) : activeTab === 'ticket' ? (
                <div className="space-y-6">
                  <div className="bg-orange-500/5 p-8 rounded-[40px] border border-orange-500/10 space-y-6">
                     <div className="flex items-center gap-3"><ShieldCheck className="w-6 h-6 text-orange-500" /><h4 className="text-sm font-black text-white uppercase tracking-widest">Entry Verification</h4></div>
                     <input type="text" value={guest.guestName} onChange={e => setGuest({...guest, guestName: e.target.value})} className="w-full bg-black border border-slate-800 rounded-2xl px-6 py-5 text-white text-xs" placeholder="Guest Name" />
                     <div className="grid grid-cols-2 gap-3">
                       {['Single', 'Double', 'VIP', 'VVIP'].map(t => (
                         <button key={t} onClick={() => setGuest({...guest, ticketType: t as TicketType})}
                           className={`py-5 rounded-2xl text-[10px] font-black uppercase border transition-all ${guest.ticketType === t ? 'bg-orange-500 text-white' : 'bg-black text-slate-600 border-slate-800'}`}>{t}</button>
                       ))}
                     </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-8">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-2">QR Scale</label>
                    <input type="range" min="40" max="350" step="5" value={config.size} onChange={(e) => setConfig(prev => ({ ...prev, size: parseInt(e.target.value) }))} className="w-full accent-orange-500 h-2 bg-slate-950 rounded-lg appearance-none cursor-pointer" />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
