import React, { useState, useMemo, useEffect, useRef } from 'react';
import { 
  Calendar, MapPin, Search, X, LayoutGrid, ChevronLeft, ChevronRight, 
  CalendarDays, Star, ExternalLink, Baby, Loader2, AlertTriangle, 
  Info, Navigation, Mail, CheckCircle2, BellRing, CircleDollarSign 
} from 'lucide-react';
import museumsData from './data.json';

const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwtB7UoFLbJL-pfvA0C_4srymdlTz5MEZaLnRWGFGv3bFsWcuT0Vzdm6DixGZQ80H-_Vg/exec";

const CATEGORIES = {
  'Art': { color: 'bg-purple-100 text-purple-700 border-purple-200', emoji: '🎨' },
  'Nature': { color: 'bg-emerald-100 text-emerald-700 border-emerald-200', emoji: '🌿' },
  'Science': { color: 'bg-cyan-100 text-cyan-700 border-cyan-200', emoji: '🧪' },
  'Culture': { color: 'bg-amber-100 text-amber-700 border-amber-200', emoji: '🏛️' },
  'Zoo/Garden': { color: 'bg-lime-100 text-lime-700 border-lime-200', emoji: '🦁' }
};

const ChicagoFlag = ({ className }) => (
  <svg viewBox="0 0 3 2" className={className} xmlns="http://www.w3.org/2000/svg">
    <rect width="3" height="2" fill="white"/>
    <rect width="3" height="0.33" y="0.33" fill="#B2D9E7"/>
    <rect width="3" height="0.33" y="1.33" fill="#B2D9E7"/>
    <g fill="red" textAnchor="middle">
        <text x="0.5" y="1.15" fontSize="0.45">✶</text>
        <text x="1.16" y="1.15" fontSize="0.45">✶</text>
        <text x="1.83" y="1.15" fontSize="0.45">✶</text>
        <text x="2.5" y="1.15" fontSize="0.45">✶</text>
    </g>
  </svg>
);

export default function App() {
  const [museums, setMuseums] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [museumType, setMuseumType] = useState('All');
  const [filterMustSee, setFilterMustSee] = useState(false);
  const [filterKidFriendly, setFilterKidFriendly] = useState(false);
  const [filterFreeOnly, setFilterFreeOnly] = useState(false);
  const [search, setSearch] = useState('');
  const [activeView, setActiveView] = useState('today'); 
  const [selectedMuseum, setSelectedMuseum] = useState(null);
  const [calendarOffset, setCalendarOffset] = useState(0); 
  const [calendarBaseDate, setCalendarBaseDate] = useState(new Date());
  const [activeCellDetail, setActiveCellDetail] = useState(null);
  const [showWelcome, setShowWelcome] = useState(false);

  const now = new Date();

  const getStatusForDate = (museum, date) => {
    if (!museum) return { type: 'none', label: '', fullLabel: '' };
    if (museum.alwaysFree) return { type: 'always', label: 'FREE', fullLabel: 'Free Admission Always' };
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const isoStr = `${year}-${month}-${day}`;
    if (museum.scheduleMap?.[isoStr]) return { type: 'limited', label: 'CHECK FREE', fullLabel: museum.scheduleMap[isoStr] };
    return { type: 'none', label: `$${museum.basePrice}`, fullLabel: '' };
  };

  useEffect(() => {
    try {
      const parsedData = museumsData.map((museum, index) => {
        const admissionData = museum.admission || { always_free: false, always_free_groups: [], free_days: [] };
        const scheduleMap = {};
        admissionData.free_days?.forEach(fd => { scheduleMap[fd.date] = fd.eligibility; });

        return {
          ...museum,
          id: museum.id || `m-${index}`,
          basePrice: Number(museum.basePrice) || 0,
          alwaysFree: admissionData.always_free || false,
          alwaysFreeGroups: admissionData.always_free_groups || [],
          scheduledFreeDays: admissionData.free_days || [],
          scheduleMap,
          rating: museum.rating ? Number(museum.rating) : 0,
        };
      }).filter(m => m.name);

      setMuseums(parsedData);
      if (!localStorage.getItem('chicago-museums-visited')) setShowWelcome(true);
    } catch (err) {
      setError("Failed to read local data.");
    } finally {
      setLoading(false);
    }
  }, []);
  
  const filteredMuseums = useMemo(() => {
    return museums
      .filter(m => {
        if (search && !m.name?.toLowerCase().includes(search.toLowerCase())) return false;
        if (filterMustSee && !m.mustSee) return false;
        if (filterKidFriendly && !m.isKidFriendly) return false;
        if (filterFreeOnly && getStatusForDate(m, now).type === 'none') return false;
        if (museumType !== 'All' && m.type !== museumType) return false;
        return true;
      })
      .sort((a, b) => {
        if (a.mustSee !== b.mustSee) return a.mustSee ? -1 : 1;
        if (b.rating !== a.rating) return b.rating - a.rating;
        return a.name.localeCompare(b.name);
      });
  }, [museumType, filterMustSee, filterKidFriendly, filterFreeOnly, search, museums, now]);

  const calendarDates = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(calendarBaseDate);
      d.setDate(calendarBaseDate.getDate() + i + (calendarOffset * 7));
      return d;
    });
  }, [calendarOffset, calendarBaseDate]);

  const handleSubscribe = async (email, source) => {
    try {
      await fetch(SCRIPT_URL, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, source })
      });
      return true;
    } catch (err) {
      console.error("Capture failed:", err);
      return false;
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-slate-50"><Loader2 className="w-10 h-10 text-indigo-600 animate-spin" /></div>;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-12 font-sans flex flex-col overflow-x-hidden">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-[100] shadow-sm px-4">
        <div className="max-w-7xl mx-auto py-3 md:h-20 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 self-start md:self-center">
            <ChicagoFlag className="w-8 h-auto rounded border border-slate-100" />
            <h1 className="text-base md:text-lg font-black tracking-tighter uppercase text-slate-800">Chicago Free Museums</h1>
          </div>
          <div className="flex bg-slate-100 p-1 rounded-xl w-full md:w-auto md:min-w-[360px] shadow-inner overflow-x-auto no-scrollbar">
            {[ { id: 'today', icon: LayoutGrid, label: 'Today' }, { id: 'weekend', icon: Navigation, label: 'Weekend' }, { id: 'calendar', icon: Calendar, label: 'Calendar' } ].map(v => (
              <button key={v.id} onClick={() => setActiveView(v.id)} className={`flex items-center justify-center gap-2 flex-1 py-1.5 px-3 rounded-lg text-[10px] md:text-xs font-black uppercase tracking-tighter transition-all whitespace-nowrap ${activeView === v.id ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}>
                <v.icon className="w-3.5 h-3.5" />{v.label}
              </button>
            ))}
          </div>
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input type="text" placeholder="Search..." className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-full text-sm outline-none focus:ring-2 focus:ring-indigo-500" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6 flex-1 w-full relative">
        <div className="mb-8 flex flex-wrap items-center gap-3 justify-center">
            <div className="flex gap-2 mr-4 border-r border-slate-200 pr-4 flex-wrap">
                <button onClick={() => setFilterMustSee(!filterMustSee)} className={`flex items-center gap-1.5 px-4 py-1.5 text-[11px] font-black rounded-full border transition-all uppercase ${filterMustSee ? 'bg-yellow-400 border-yellow-500 text-yellow-950 shadow-sm' : 'bg-white border-slate-200 text-slate-500'}`}><Star className={`w-3 h-3 ${filterMustSee ? 'fill-current' : ''}`} /> Must See</button>
                <button onClick={() => setFilterKidFriendly(!filterKidFriendly)} className={`flex items-center gap-1.5 px-4 py-1.5 text-[11px] font-black rounded-full border transition-all uppercase ${filterKidFriendly ? 'bg-blue-600 border-blue-700 text-white shadow-sm' : 'bg-white border-slate-200 text-slate-500'}`}><Baby className="w-3 h-3" /> Kids</button>
                <button onClick={() => setFilterFreeOnly(!filterFreeOnly)} className={`flex items-center gap-1.5 px-4 py-1.5 text-[11px] font-black rounded-full border transition-all uppercase ${filterFreeOnly ? 'bg-emerald-600 border-emerald-700 text-white shadow-sm' : 'bg-white border-slate-200 text-slate-500'}`}><CircleDollarSign className="w-3 h-3" /> Free Today</button>
            </div>
            <div className="flex gap-2 flex-wrap justify-center">
              {Object.keys(CATEGORIES).map(type => (
                <button key={type} onClick={() => setMuseumType(museumType === type ? 'All' : type)} className={`flex items-center gap-1.5 px-4 py-1.5 text-[11px] font-black rounded-full border transition-all uppercase ${museumType === type ? 'bg-slate-900 text-white border-slate-900 shadow-md' : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-100'}`}>{CATEGORIES[type]?.emoji} {type}</button>
              ))}
            </div>
        </div>

        {activeView !== 'calendar' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMuseums.map((m) => <MuseumCard key={m.id} museum={m} view={activeView} getStatusForDate={getStatusForDate} onOpenDetail={() => setSelectedMuseum(m)} />)}
          </div>
        ) : (
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[800px]">
                  <thead className="sticky top-0 z-[60] bg-slate-50 border-b border-slate-200 shadow-sm">
                    <tr>
                      <th className="p-4 text-xs font-black text-slate-400 uppercase sticky left-0 bg-slate-50 z-20 w-52 border-r border-slate-200">Museum</th>
                      {calendarDates.map((date, i) => (
                        <th key={i} className={`p-3 text-center border-r border-slate-200 last:border-r-0 ${date.getDay() === 0 || date.getDay() === 6 ? 'bg-indigo-50/40' : ''}`}>
                          <p className="text-lg font-black text-slate-800 leading-none">{date.getDate()}</p>
                          <p className="text-[9px] font-bold text-indigo-500 uppercase mt-1">{date.toLocaleDateString('en-US', { weekday: 'short' })}</p>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredMuseums.map((m) => (
                      <tr key={m.id} className="border-b border-slate-100 group hover:bg-slate-50/50">
                        <td onClick={() => setSelectedMuseum(m)} className="p-4 sticky left-0 z-10 font-bold text-sm border-r border-slate-200 bg-white cursor-pointer group-hover:text-indigo-600">
                          <div className="flex flex-col gap-1">
                            <span className="truncate font-black uppercase text-[10px] tracking-tight">{m.name}</span>
                            <div className="flex items-center gap-1.5">
                                <span className="text-[8px] font-black uppercase px-1.5 py-0.5 rounded border border-slate-200 bg-slate-50">{CATEGORIES[m.type]?.emoji} {m.type}</span>
                                {m.rating > 0 && <span className="text-[8px] font-black text-amber-500">★{m.rating}</span>}
                            </div>
                          </div>
                        </td>
                        {calendarDates.map((date, i) => {
                          const status = getStatusForDate(m, date);
                          const isSelected = activeCellDetail === `${m.id}-${i}`;
                          return (
                            <td key={i} className="p-1 border-r border-slate-100 last:border-r-0">
                              <div onClick={() => status.type !== 'none' && setActiveCellDetail(isSelected ? null : `${m.id}-${i}`)} className={`h-12 rounded-lg flex flex-col items-center justify-center p-1 transition-all relative ${status.type !== 'none' ? 'cursor-pointer' : ''} ${status.type === 'always' ? 'bg-emerald-600 text-white shadow-sm' : status.type === 'limited' ? 'bg-emerald-50 border border-emerald-200 text-emerald-700' : 'bg-slate-50 text-slate-300'}`}>
                                <span className="text-[8px] uppercase font-black text-center leading-tight">{status.label}</span>
                                {isSelected && (
                                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 bg-slate-900 text-white p-3 rounded-xl z-[100] text-[9px] font-bold shadow-2xl animate-in zoom-in-95">
                                    <p className="leading-relaxed">{status.fullLabel}</p>
                                    <div className="absolute top-full left-1/2 -translate-x-1/2 w-2 h-2 bg-slate-900 rotate-45" />
                                  </div>
                                )}
                              </div>
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
          </div>
        )}
      </main>

      {selectedMuseum && <MuseumDetailModal museum={selectedMuseum} onClose={() => setSelectedMuseum(null)} getStatusForDate={getStatusForDate} onNavigate={(dir) => {
        const idx = filteredMuseums.findIndex(m => m.id === selectedMuseum.id);
        const next = (idx + dir + filteredMuseums.length) % filteredMuseums.length;
        setSelectedMuseum(filteredMuseums[next]);
      }} onSubscribe={handleSubscribe} />}
      {showWelcome && <WelcomeModal freeCount={museums.filter(m => getStatusForDate(m, now).type !== 'none').length} totalCount={museums.length} onClose={() => setShowWelcome(false)} onSubscribe={handleSubscribe} />}
    </div>
  );
}

function MuseumCard({ museum, view, getStatusForDate, onOpenDetail }) {
  const statusToday = getStatusForDate(museum, new Date());
  const showFreeBadge = statusToday.type !== 'none';
  return (
    <div className="rounded-[2rem] shadow-sm border border-slate-200 transition-all flex flex-col h-full overflow-hidden bg-white hover:shadow-lg active:scale-[0.99] group">
      <div className={`p-6 flex-grow ${showFreeBadge ? 'bg-emerald-50/40' : ''}`}>
        <div className="flex flex-col gap-3 mb-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${CATEGORIES[museum.type]?.color || 'bg-slate-100 border-slate-200'}`}>{CATEGORIES[museum.type]?.emoji} {museum.type}</span>
            {museum.mustSee && <span className="bg-yellow-400 text-yellow-950 px-2 py-0.5 rounded-full text-[8px] font-black uppercase flex items-center gap-1 shadow-sm"><Star className="w-2.5 h-2.5 fill-current" /> Must See</span>}
            {showFreeBadge && <span className="ml-auto bg-emerald-600 text-white px-2.5 py-0.5 rounded-full text-[8px] font-black uppercase tracking-tighter">Free Today</span>}
          </div>
          <h3 className="text-xl font-black text-slate-900 leading-tight uppercase line-clamp-2">{museum.name}</h3>
          <div className="flex items-center justify-between">
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{museum.neighborhood}</p>
            {museum.rating > 0 && <div className="flex items-center gap-1"><Star className="w-3 h-3 fill-amber-400 text-amber-400" /><span className="text-[10px] font-black">{museum.rating}</span></div>}
          </div>
        </div>
        <p className="text-sm text-slate-600 leading-relaxed line-clamp-3 font-medium italic">{museum.description}</p>
      </div>
      <div className="px-6 py-4 mt-auto border-t bg-slate-50/50 flex flex-col gap-3">
        <div className="flex justify-between text-[10px] font-black uppercase text-slate-400 tracking-widest px-1"><span>Standard</span><span className="text-slate-900 font-black">{museum.basePrice === 0 ? 'FREE' : `$${museum.basePrice}`}</span></div>
        <button onClick={onOpenDetail} className="w-full py-3 bg-slate-900 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-indigo-600 transition-colors shadow-md">View Free Days</button>
      </div>
    </div>
  );
}

function MuseumDetailModal({ museum, onClose, getStatusForDate, onNavigate, onSubscribe }) {
  const [email, setEmail] = useState('');
  const [subStatus, setSubStatus] = useState('idle');
  const [modalOffset, setModalOffset] = useState(0);
  const [expandGroups, setExpandGroups] = useState(false);
  const [expandDays, setExpandDays] = useState(false);
  const [activeCellDetail, setActiveCellDetail] = useState(null);

  const nextFreeDateObj = useMemo(() => {
    if (museum.alwaysFree) return null;
    for (let i = 1; i <= 180; i++) {
        const d = new Date(); d.setDate(d.getDate() + i);
        if (getStatusForDate(museum, d).type !== 'none') return d;
    }
    return null;
  }, [museum, getStatusForDate]);

  const handleSubmit = async (e) => {
    e.preventDefault(); setSubStatus('loading');
    const ok = await onSubscribe(email, museum.id);
    setSubStatus(ok ? 'success' : 'error');
  };

  const modalDates = Array.from({ length: 7 }, (_, i) => { const d = new Date(); d.setDate(d.getDate() + i + (modalOffset * 7)); return d; });

  return (
    <div className="fixed inset-0 z-[200] flex items-end md:items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
        <button onClick={() => onNavigate(-1)} className="hidden md:flex absolute left-8 top-1/2 p-4 bg-white/10 text-white rounded-full hover:bg-white/20 z-[250]"><ChevronLeft /></button>
        <button onClick={() => onNavigate(1)} className="hidden md:flex absolute right-8 top-1/2 p-4 bg-white/10 text-white rounded-full hover:bg-white/20 z-[250]"><ChevronRight /></button>
        <div className="bg-white w-full max-w-2xl rounded-t-[2.5rem] md:rounded-[2.5rem] overflow-hidden shadow-2xl flex flex-col max-h-[92vh] relative animate-in slide-in-from-bottom-10">
            <div className="relative h-40 md:h-48 bg-slate-900 shrink-0">
                {museum.image && <img src={museum.image} alt="" className="w-full h-full object-cover opacity-60" />}
                <button onClick={onClose} className="absolute top-4 right-4 p-2 bg-black/50 text-white rounded-full hover:bg-black/70 z-50"><X /></button>
                <div className="absolute bottom-6 left-6 text-white pr-6 z-10">
                    <div className="flex gap-2 mb-2 flex-wrap"><span className="px-2 py-0.5 rounded-full text-[8px] font-black uppercase border-white/20 border bg-white/10">{CATEGORIES[museum.type]?.emoji} {museum.type}</span></div>
                    <h2 className="text-2xl font-black uppercase leading-none truncate flex items-center gap-2">{museum.name} <a href={museum.url} target="_blank" className="hover:text-indigo-400"><ExternalLink size={20}/></a></h2>
                    <p className="text-xs font-bold opacity-80 mt-2 flex items-center gap-1"><MapPin size={12}/> {museum.address}</p>
                </div>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-6 no-scrollbar">
                <p className="text-slate-600 leading-relaxed font-medium text-sm">{museum.description} <span className="text-slate-400 font-bold ml-1">Admission: {museum.basePrice === 0 ? 'FREE' : `$${museum.basePrice}`}</span></p>
                {museum.alwaysFree ? <div className="bg-emerald-50 p-6 rounded-3xl border border-emerald-100 text-center text-emerald-700 font-medium">Free for everyone, every day.</div> : 
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-emerald-50/50 p-4 rounded-3xl border border-emerald-100/50">
                        <h4 className="text-[10px] font-black text-emerald-700 uppercase mb-3">always free for:</h4>
                        <ul className="space-y-1.5"> 
                          {museum.alwaysFreeGroups?.slice(0, expandGroups ? 99 : 5).map((g, i) => <li key={i} className="text-[11px] text-slate-600 flex items-start gap-2"><div className="w-1 h-1 bg-emerald-400 rounded-full mt-1.5 shrink-0" /> {g.category}</li>)}
                          {!expandGroups && museum.alwaysFreeGroups?.length > 5 && <button onClick={() => setExpandGroups(true)} className="text-[10px] font-black text-emerald-600 uppercase mt-1">+ {museum.alwaysFreeGroups.length - 5} more</button>}
                        </ul>
                    </div>
                    <div className="bg-emerald-50/50 p-4 rounded-3xl border border-emerald-100/50">
                        <h4 className="text-[10px] font-black text-emerald-700 uppercase mb-3">upcoming free dates:</h4>
                        <ul className="space-y-1.5"> 
                          {museum.scheduledFreeDays?.slice(0, expandDays ? 99 : 5).map((fd, i) => <li key={i} className="text-[11px] text-slate-600 flex items-start gap-2"><div className="w-1 h-1 bg-emerald-400 rounded-full mt-1.5 shrink-0" /> {new Date(fd.date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</li>)} 
                          {!expandDays && museum.scheduledFreeDays?.length > 5 && <button onClick={() => setExpandDays(true)} className="text-[10px] font-black text-emerald-600 uppercase mt-1">+ {museum.scheduledFreeDays.length - 5} more</button>}
                        </ul>
                    </div>
                </div>}
                {!museum.alwaysFree && nextFreeDateObj && <section className="bg-indigo-600 rounded-[2rem] p-6 text-white shadow-lg">
                    <h3 className="text-xl font-black mb-4">Next free on {nextFreeDateObj.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}. Remind me.</h3>
                    {subStatus === 'success' ? <div className="flex items-center gap-3 text-emerald-300 font-black uppercase text-[11px]"><CheckCircle2 /> Reminder set!</div> :
                    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2 bg-white/10 p-1.5 rounded-2xl border border-white/20">
                        <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Enter email" className="bg-transparent text-xs font-bold px-4 py-2.5 flex-1 outline-none placeholder:text-white/40" />
                        <button disabled={subStatus === 'loading'} className="bg-white text-indigo-600 text-[11px] font-black uppercase px-6 py-3 rounded-xl hover:bg-indigo-50">{subStatus === 'loading' ? 'Saving...' : 'Remind Me'}</button>
                    </form>}
                </section>}
                {!museum.alwaysFree && <section className="bg-slate-50 p-5 rounded-3xl border border-slate-200 relative">
                    <div className="flex items-center justify-between mb-4"><h4 className="text-[10px] font-black text-slate-400 uppercase">upcoming free days</h4>
                    <div className="flex gap-1"><button onClick={() => setModalOffset(p => Math.max(0, p-1))} className="p-1.5 bg-white border rounded-lg"><ChevronLeft size={16}/></button><button onClick={() => setModalOffset(p => p+1)} className="p-1.5 bg-white border rounded-lg"><ChevronRight size={16}/></button></div></div>
                    <div className="flex gap-2 overflow-x-auto pb-4 no-scrollbar"> {modalDates.map((d, i) => { 
                        const s = getStatusForDate(museum, d);
                        const isSel = activeCellDetail === i;
                        return <div key={i} onClick={() => s.type !== 'none' && setActiveCellDetail(isSel ? null : i)} className={`min-w-[75px] h-24 rounded-2xl flex flex-col items-center justify-center p-2 border transition-all relative cursor-pointer ${s.type === 'always' ? 'bg-emerald-600 border-emerald-500 text-white' : s.type === 'limited' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-white border-slate-100 text-slate-300'}`}>
                            <span className="text-[8px] font-black uppercase opacity-60 leading-none">{d.toLocaleDateString('en-US', { weekday: 'short' })}</span>
                            <span className="text-xl font-black">{d.getDate()}</span>
                            <span className="text-[8px] font-bold uppercase opacity-60">{d.toLocaleDateString('en-US', { month: 'short' })}</span>
                            <span className="text-[8px] uppercase font-black mt-auto">{s.label}</span>
                            {isSel && (
                              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 w-40 bg-slate-900 text-white p-3 rounded-xl z-[400] text-[9px] font-bold shadow-2xl animate-in zoom-in-95 border border-white/10">
                                <p>{s.fullLabel}</p>
                                <div className="absolute top-full left-1/2 -translate-x-1/2 w-2 h-2 bg-slate-900 rotate-45" />
                              </div>
                            )}
                        </div>
                    })} </div>
                </section>}
            </div>
            <div className="flex md:hidden border-t bg-slate-50 p-2 gap-2">
                <button onClick={() => onNavigate(-1)} className="flex-1 py-3 bg-white border rounded-xl text-[10px] font-black uppercase flex items-center justify-center gap-2"><ChevronLeft size={16}/> Previous</button>
                <button onClick={() => onNavigate(1)} className="flex-1 py-3 bg-white border rounded-xl text-[10px] font-black uppercase flex items-center justify-center gap-2">Next <ChevronRight size={16}/></button>
            </div>
        </div>
    </div>
  );
}

function WelcomeModal({ freeCount, totalCount, onClose, onSubscribe }) {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle');
  const handleSubmit = async (e) => { 
    e.preventDefault(); setStatus('loading');
    const ok = await onSubscribe(email, 'general');
    if (ok) { setStatus('success'); setTimeout(onClose, 2000); } else setStatus('error');
  };
  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-300">
        <div className="bg-white w-full max-w-md rounded-[2.5rem] p-8 md:p-10 shadow-2xl relative text-center overflow-hidden">
            {status === 'success' ? <div className="py-12 flex flex-col items-center"><CheckCircle2 size={48} className="text-emerald-600 mb-4 animate-bounce"/><h2 className="text-2xl font-black uppercase">You're on the list!</h2></div> :
            <>
                <div className="w-12 h-12 bg-indigo-100 rounded-2xl flex items-center justify-center mb-6 mx-auto"><CalendarDays className="text-indigo-600" /></div>
                <h2 className="text-3xl font-black uppercase leading-tight mb-4">Today, <span className="text-emerald-600">{freeCount}</span> out of <span className="text-slate-400">{totalCount}</span> museums are free.</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <input type="email" required placeholder="Enter email" className="w-full px-6 py-4 bg-slate-50 border rounded-2xl text-sm font-bold outline-none" value={email} onChange={(e) => setEmail(e.target.value)} />
                    <button disabled={status === 'loading'} className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black uppercase text-xs hover:bg-indigo-600">{status === 'loading' ? 'Saving...' : 'Notify Me'}</button>
                </form>
                <button onClick={onClose} className="w-full mt-6 text-[10px] font-black text-slate-300 uppercase">Skip for now</button>
            </>}
        </div>
    </div>
  );
}
