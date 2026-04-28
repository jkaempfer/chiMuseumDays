import React, { useState, useMemo, useEffect, useRef } from 'react';
import { 
  Calendar, 
  MapPin, 
  Search, 
  X, 
  LayoutGrid, 
  ChevronLeft, 
  ChevronRight, 
  CalendarDays, 
  Star, 
  ExternalLink,
  Baby,
  Loader2,
  AlertTriangle,
  Info,
  Navigation,
  Mail,
  CheckCircle2,
  BellRing,
  CircleDollarSign
} from 'lucide-react';

const SHEET_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vT-5D6tDErRDgeZnLlm4qR6c_M2FrxdFmUoDJyemEHawkfn-ZHbMHKBYSOhN8NcheKaJipvj5vcpSjR/pub?output=csv"; 

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

  const getNextWeekend = () => {
    const d = new Date();
    const sat = new Date(d);
    sat.setDate(d.getDate() + (6 - d.getDay() + 7) % 7);
    const sun = new Date(sat);
    sun.setDate(sat.getDate() + 1);
    return [sat, sun];
  };

  const parseCSVLine = (text) => {
    const result = [];
    let cur = '';
    let inQuote = false;
    for (let n = 0; n < text.length; n++) {
      const char = text[n];
      if (char === '"') {
        if (inQuote && text[n + 1] === '"') { cur += '"'; n++; } 
        else { inQuote = !inQuote; }
      } else if (char === ',' && !inQuote) {
        result.push(cur.trim()); cur = '';
      } else { cur += char; }
    }
    result.push(cur.trim());
    return result;
  };

  const getStatusForDate = (museum, date) => {
    if (!museum) return { type: 'none', label: '', fullLabel: '' };
    if (museum.alwaysFree) return { type: 'always', label: 'FREE', fullLabel: 'Free Admission Always' };
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const isoStr = `${year}-${month}-${day}`;
    if (museum.scheduleMap?.[isoStr]) {
        return { type: 'limited', label: 'CHECK FREE', fullLabel: museum.scheduleMap[isoStr] };
    }
    return { type: 'none', label: `$${museum.basePrice}`, fullLabel: '' };
  };

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch(SHEET_URL);
        const text = await response.text();
        const lines = text.split(/\r?\n/).filter(line => line.trim() !== '');
        const dataRows = lines.slice(1);
        const parsedData = dataRows.map((line, index) => {
          const clean = parseCSVLine(line);
          let admissionData = { always_free: false, always_free_groups: [], free_days: [] };
          try {
            const rawJson = JSON.parse(clean[10] || '{}');
            admissionData = rawJson.admission || admissionData;
          } catch (e) {}

          let scheduleMap = {};
          admissionData.free_days.forEach(fd => {
              scheduleMap[fd.date] = fd.eligibility;
          });

          return {
            id: clean[0] || `m-${index}`,
            name: clean[1],
            type: clean[2],
            mustSee: clean[3]?.toLowerCase() === 'true',
            isKidFriendly: clean[4]?.toLowerCase() === 'true',
            neighborhood: clean[5],
            address: clean[6],
            image: clean[7],
            basePrice: Number(clean[8]) || 0,
            description: (clean[9] || "").replace(/^"|"$/g, ''),
            alwaysFree: admissionData.always_free,
            alwaysFreeGroups: admissionData.always_free_groups || [],
            scheduledFreeDays: admissionData.free_days || [],
            scheduleMap,
            url: clean[11],
            rating: clean[12] ? Number(clean[12]) : 0,
          };
        }).filter(m => m.name);
        setMuseums(parsedData);
        setLoading(false);
        const hasVisited = localStorage.getItem('chicago-museums-visited');
        if (!hasVisited) setShowWelcome(true);
      } catch (err) {
        setError("Failed to sync with Google Sheet.");
        setLoading(false);
      }
    }
    fetchData();
  }, []);
  
  const freeCountToday = useMemo(() => {
    return museums.filter(m => getStatusForDate(m, now).type !== 'none').length;
  }, [museums, now]);

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

  const navigateMuseum = (direction) => {
    if (!selectedMuseum) return;
    const currentIndex = filteredMuseums.findIndex(m => m.id === selectedMuseum.id);
    const nextIndex = (currentIndex + direction + filteredMuseums.length) % filteredMuseums.length;
    setSelectedMuseum(filteredMuseums[nextIndex]);
  };

  const closeWelcome = () => {
    localStorage.setItem('chicago-museums-visited', 'true');
    setShowWelcome(false);
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-12 font-sans flex flex-col overflow-x-hidden">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-[100] shadow-sm px-4">
        <div className="max-w-7xl mx-auto py-3 md:h-20 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 self-start md:self-center">
            <ChicagoFlag className="w-8 h-auto rounded border border-slate-100" />
            <h1 className="text-base md:text-lg font-black tracking-tighter uppercase text-slate-800">Chicago Free Museums</h1>
          </div>
          <div className="flex bg-slate-100 p-1 rounded-xl w-full md:w-auto md:min-w-[360px] shadow-inner overflow-x-auto no-scrollbar">
            {[
              { id: 'today', icon: LayoutGrid, label: 'Today' }, 
              { id: 'weekend', icon: Navigation, label: 'Weekend' },
              { id: 'calendar', icon: Calendar, label: 'Calendar' }
            ].map(v => (
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
              {['All', ...Object.keys(CATEGORIES)].map(type => (
                <button key={type} onClick={() => setMuseumType(type)} className={`flex items-center gap-1.5 px-4 py-1.5 text-[11px] font-black rounded-full border transition-all uppercase ${museumType === type ? 'bg-slate-900 text-white border-slate-900 shadow-md' : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-100'}`}>{CATEGORIES[type]?.emoji} {type}</button>
              ))}
            </div>
        </div>

        {activeView !== 'calendar' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMuseums.map((m) => (
              <MuseumCard key={m.id} museum={m} view={activeView} getStatusForDate={getStatusForDate} weekendDates={getNextWeekend()} onOpenDetail={() => setSelectedMuseum(m)} />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden animate-in fade-in duration-500">
              <div className="p-4 bg-white border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><CalendarDays className="w-4 h-4 text-indigo-500" /> Free Day Calendar</h2>
                <div className="flex items-center gap-2">
                    <input type="date" className="text-xs font-bold bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5" value={calendarBaseDate.toISOString().split('T')[0]} onChange={(e) => { const s = new Date(e.target.value); s.setMinutes(s.getMinutes() + s.getTimezoneOffset()); setCalendarBaseDate(s); setCalendarOffset(0); }} />
                    <button disabled={calendarOffset === 0} onClick={() => setCalendarOffset(prev => prev - 1)} className="p-2 bg-slate-50 border border-slate-200 rounded-xl disabled:opacity-30"><ChevronLeft className="w-4 h-4" /></button>
                    <button onClick={() => setCalendarOffset(prev => prev + 1)} className="p-2 bg-slate-50 border border-slate-200 rounded-xl"><ChevronRight className="w-4 h-4" /></button>
                </div>
              </div>
              <div className="overflow-x-auto relative">
                <table className="w-full text-left border-collapse table-fixed min-w-[800px]">
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
                                <span className={`text-[8px] font-black uppercase px-1.5 py-0.5 rounded border border-slate-200 bg-slate-50 ${CATEGORIES[m.type]?.color.split(' ')[1] || 'text-slate-500'}`}>{CATEGORIES[m.type]?.emoji} {m.type}</span>
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
          </div>
        )}
      </main>

      {selectedMuseum && (
        <MuseumDetailModal 
          museum={selectedMuseum} 
          onClose={() => setSelectedMuseum(null)} 
          getStatusForDate={getStatusForDate} 
          onNavigate={navigateMuseum}
        />
      )}
      {showWelcome && <WelcomeModal freeCount={freeCountToday} totalCount={museums.length} onClose={closeWelcome} />}
    </div>
  );
}

function MuseumCard({ museum, view, getStatusForDate, weekendDates, onOpenDetail }) {
  const now = new Date();
  const statusToday = getStatusForDate(museum, now);
  const isFreeWeekend = weekendDates.some(d => getStatusForDate(museum, d).type !== 'none');
  const showFreeBadge = view === 'weekend' ? isFreeWeekend : statusToday.type !== 'none';

  return (
    <div className="rounded-[2rem] shadow-sm border border-slate-200 transition-all flex flex-col h-full overflow-hidden bg-white hover:shadow-lg active:scale-[0.99] group">
      <div className={`p-6 flex-grow ${showFreeBadge ? 'bg-emerald-50/40' : ''}`}>
        <div className="flex flex-col gap-3 mb-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${CATEGORIES[museum.type]?.color || 'bg-slate-100 border-slate-200'}`}>
              {CATEGORIES[museum.type]?.emoji} {museum.type}
            </span>
            {museum.mustSee && <span className="bg-yellow-400 text-yellow-950 px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-tighter flex items-center gap-1 shadow-sm"><Star className="w-2.5 h-2.5 fill-current" /> Must See</span>}
            {museum.isKidFriendly && <span className="bg-blue-600 text-white px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-tighter flex items-center gap-1 shadow-sm"><Baby className="w-2.5 h-2.5" /> Kids</span>}
            {showFreeBadge && <span className="ml-auto bg-emerald-600 text-white px-2.5 py-0.5 rounded-full text-[8px] font-black uppercase tracking-tighter">{view === 'weekend' ? 'Free Weekend' : 'Free Today'}</span>}
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
        <div className="flex justify-between text-[10px] font-black uppercase text-slate-400 tracking-widest px-1">
          <span>Standard Price</span>
          <span className="text-slate-900 font-black">{museum.basePrice === 0 ? 'FREE' : `$${museum.basePrice}`}</span>
        </div>
        <button onClick={onOpenDetail} className="w-full py-3 bg-slate-900 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-indigo-600 transition-colors shadow-md">View Free Days</button>
      </div>
    </div>
  );
}

function MuseumDetailModal({ museum, onClose, getStatusForDate, onNavigate }) {
  const [email, setEmail] = useState('');
  const [reminded, setReminded] = useState(false);
  const [activeCellDetail, setActiveCellDetail] = useState(null);
  const [modalOffset, setModalOffset] = useState(0);
  const [expandGroups, setExpandGroups] = useState(false);
  const [expandDays, setExpandDays] = useState(false);
  const emailInputRef = useRef(null);
  const reminderSectionRef = useRef(null);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = 'unset'; };
  }, [museum.id]);

  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${museum.name} ${museum.address} Chicago`)}`;

  const modalDates = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() + i + (modalOffset * 7));
      return d;
    });
  }, [modalOffset]);

  const nextFreeDateObj = useMemo(() => {
    if (museum.alwaysFree) return null;
    const checkDate = new Date();
    for (let i = 1; i <= 180; i++) {
        const d = new Date();
        d.setDate(checkDate.getDate() + i);
        const status = getStatusForDate(museum, d);
        if (status.type !== 'none') return d;
    }
    return null;
  }, [museum, getStatusForDate]);

  const nextFreeLabel = nextFreeDateObj ? nextFreeDateObj.toLocaleDateString('en-US', { month: 'long', day: 'numeric' }) : null;

  const handleRemindSubmit = (e) => {
    e.preventDefault();
    if (email) setReminded(true);
  };

  const handleRemindClick = () => {
    if (reminderSectionRef.current) {
        reminderSectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
        setTimeout(() => { emailInputRef.current?.focus(); }, 500);
    }
  };

  const maxItems = 5;
  const alwaysFreeItems = museum.alwaysFreeGroups || [];
  const scheduledItems = museum.scheduledFreeDays || [];
  const priceDisplay = museum.basePrice === 0 ? 'FREE' : `$${museum.basePrice}`;

  return (
    <div className="fixed inset-0 z-[200] flex items-end md:items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
        <button onClick={(e) => { e.stopPropagation(); onNavigate(-1); }} className="hidden md:flex absolute left-4 lg:left-12 top-1/2 -translate-y-1/2 p-4 bg-white/10 hover:bg-white/20 text-white rounded-full transition-all active:scale-90 z-[250]"><ChevronLeft className="w-8 h-8" /></button>
        <button onClick={(e) => { e.stopPropagation(); onNavigate(1); }} className="hidden md:flex absolute right-4 lg:right-12 top-1/2 -translate-y-1/2 p-4 bg-white/10 hover:bg-white/20 text-white rounded-full transition-all active:scale-90 z-[250]"><ChevronRight className="w-8 h-8" /></button>

        <div className="bg-white w-full max-w-2xl rounded-t-[2.5rem] md:rounded-[2.5rem] overflow-hidden shadow-2xl flex flex-col max-h-[92vh] animate-in slide-in-from-bottom-10 relative">
            <div className="relative h-40 md:h-48 bg-slate-900 shrink-0">
                {museum.image && <img src={museum.image} alt={museum.name} className="w-full h-full object-cover opacity-60" />}
                <button onClick={onClose} className="absolute top-4 right-4 p-2 bg-black/50 text-white rounded-full transition-all hover:bg-black/70 z-50"><X className="w-6 h-6" /></button>
                <div className="absolute bottom-6 left-6 text-white pr-6 z-10">
                    <div className="flex gap-2 mb-2 flex-wrap">
                        <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-tighter border-white/20 border bg-white/10`}>
                           {CATEGORIES[museum.type]?.emoji} {museum.type}
                        </span>
                        {museum.mustSee && <span className="bg-yellow-400 text-yellow-950 px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-tighter">Must See</span>}
                    </div>
                    <h2 className="text-2xl font-black uppercase leading-none truncate max-w-full flex items-center gap-2">
                        {museum.name}
                        <a href={museum.url} target="_blank" rel="noopener noreferrer" className="hover:text-indigo-400 transition-colors"><ExternalLink className="w-5 h-5" /></a>
                    </h2>
                    <a href={googleMapsUrl} target="_blank" rel="noopener noreferrer" className="text-xs font-bold opacity-80 mt-2 flex items-center gap-1 hover:opacity-100 underline decoration-white/30 underline-offset-4"><MapPin className="w-3 h-3" /> {museum.address}</a>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6 no-scrollbar">
                <p className="text-slate-600 leading-relaxed font-medium text-sm">
                    {museum.description} <span className="text-slate-400 font-bold ml-1">Typical Admission: {priceDisplay}</span>
                </p>

                {museum.alwaysFree ? (
                    <div className="bg-emerald-50 p-6 rounded-3xl border border-emerald-100 text-center"><p className="text-emerald-700 font-black uppercase tracking-widest text-xs mb-1">admission status</p><p className="text-emerald-600 font-medium">This museum is free for everyone, every day.</p></div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-emerald-50/50 p-4 rounded-3xl border border-emerald-100/50">
                            <h4 className="text-[10px] font-black text-emerald-700 uppercase tracking-widest mb-3">always free for:</h4>
                            <ul className="space-y-1.5">
                                {(expandGroups ? alwaysFreeItems : alwaysFreeItems.slice(0, maxItems)).map((group, i) => (
                                    <li key={i} className="text-[11px] text-slate-600 flex items-start gap-2">
                                        <div className="w-1 h-1 bg-emerald-400 rounded-full mt-1.5 shrink-0" /> 
                                        <span className="flex-1">{group.category} {group.link && <a href={group.link} target="_blank" rel="noopener noreferrer" className="inline-block ml-1 opacity-40 hover:opacity-100"><ExternalLink className="w-2.5 h-2.5 inline" /></a>}</span>
                                    </li>
                                ))}
                                {!expandGroups && alwaysFreeItems.length > maxItems && <button onClick={() => setExpandGroups(true)} className="text-[10px] font-black text-emerald-600 uppercase mt-2 hover:underline">+ {alwaysFreeItems.length - maxItems} more groups...</button>}
                            </ul>
                        </div>
                        <div className="bg-emerald-50/50 p-4 rounded-3xl border border-emerald-100/50">
                            <h4 className="text-[10px] font-black text-emerald-700 uppercase tracking-widest mb-3">upcoming free dates:</h4>
                            <ul className="space-y-1.5">
                                {(expandDays ? scheduledItems : scheduledItems.slice(0, maxItems)).map((fd, i) => (
                                    <li key={i} className="text-[11px] text-slate-600 flex items-start gap-2">
                                        <div className="w-1 h-1 bg-emerald-400 rounded-full mt-1.5 shrink-0" /> 
                                        <span>{new Date(fd.date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} <span className="opacity-40 ml-1">({fd.eligibility})</span></span>
                                    </li>
                                ))}
                                {!expandDays && scheduledItems.length > maxItems && <button onClick={() => setExpandDays(true)} className="text-[10px] font-black text-emerald-600 uppercase mt-2 hover:underline">+ {scheduledItems.length - maxItems} more dates...</button>}
                                {scheduledItems.length === 0 && <li className="text-[11px] italic text-slate-400">No scheduled dates available</li>}
                            </ul>
                        </div>
                    </div>
                )}

                {!museum.alwaysFree && nextFreeLabel && (
                    <section ref={reminderSectionRef} className="bg-indigo-600 rounded-[2rem] p-6 text-white shadow-lg">
                        <div className="flex flex-col gap-4">
                            <h3 className="text-xl font-black leading-tight tracking-tight">Next free on <span className="text-indigo-200">{nextFreeLabel}</span>. Remind me.</h3>
                            {!reminded ? (
                                <form onSubmit={handleRemindSubmit} className="flex flex-col sm:flex-row items-stretch sm:items-center bg-white/10 p-1.5 rounded-2xl border border-white/20 gap-2">
                                    <input ref={emailInputRef} type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Enter your email" className="bg-transparent text-xs font-bold px-4 py-2.5 flex-1 outline-none placeholder:text-white/40" />
                                    <button className="bg-white text-indigo-600 text-[11px] font-black uppercase tracking-widest px-6 py-3 rounded-xl hover:bg-indigo-50 shadow-md transition-all active:scale-95">Remind Me</button>
                                </form>
                            ) : <div className="flex items-center gap-3 text-emerald-300 font-black uppercase text-[11px] tracking-widest bg-emerald-500/10 px-5 py-4 rounded-xl border border-emerald-500/20"><CheckCircle2 className="w-5 h-5" /> Reminder set!</div>}
                        </div>
                    </section>
                )}

                {!museum.alwaysFree && (
                    <section className="bg-slate-50 p-5 rounded-3xl border border-slate-200 relative overflow-visible pb-10">
                        <div className="flex items-center justify-between mb-4">
                            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><CalendarDays className="w-3 h-3 text-indigo-500" /> upcoming free days</h4>
                            <div className="flex items-center gap-1">
                                <button onClick={() => setModalOffset(p => Math.max(0, p - 1))} disabled={modalOffset === 0} className="p-1.5 bg-white border border-slate-200 rounded-lg disabled:opacity-30"><ChevronLeft className="w-4 h-4" /></button>
                                <button onClick={() => setModalOffset(p => p + 1)} className="p-1.5 bg-white border border-slate-200 rounded-lg active:bg-slate-100"><ChevronRight className="w-4 h-4" /></button>
                            </div>
                        </div>
                        <div className="flex gap-2 overflow-x-auto pb-4 no-scrollbar">
                            {modalDates.map((date, i) => {
                                const status = getStatusForDate(museum, date);
                                const isSelected = activeCellDetail === i;
                                return (
                                    <div key={i} onClick={() => status.type !== 'none' && setActiveCellDetail(isSelected ? null : i)} className={`min-w-[75px] h-24 rounded-2xl flex flex-col items-center justify-center p-2 transition-all relative border cursor-pointer ${status.type === 'always' ? 'bg-emerald-600 border-emerald-500 text-white shadow-sm' : status.type === 'limited' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-white border-slate-100 text-slate-300'}`}>
                                        <span className="text-[8px] font-black uppercase opacity-60 leading-none">{date.toLocaleDateString('en-US', { weekday: 'short' })}</span>
                                        <span className="text-xl font-black leading-none my-1">{date.getDate()}</span>
                                        <span className="text-[8px] font-bold uppercase opacity-60 mb-1 leading-none">{date.toLocaleDateString('en-US', { month: 'short' })}</span>
                                        <span className="text-[8px] uppercase font-black text-center leading-tight mt-auto">{status.label}</span>
                                        {isSelected && (
                                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 w-48 bg-slate-900 text-white p-3 rounded-xl z-[400] text-[9px] font-bold shadow-2xl animate-in fade-in zoom-in-95 border border-white/10">
                                                {status.fullLabel}
                                                <div className="absolute top-full left-1/2 -translate-x-1/2 w-2 h-2 bg-slate-900 rotate-45" />
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </section>
                )}
            </div>
            
            <div className="flex md:hidden border-t border-slate-100 bg-slate-50 p-2 gap-2">
                <button onClick={() => onNavigate(-1)} className="flex-1 flex items-center justify-center gap-2 py-3 bg-white border border-slate-200 rounded-xl text-[10px] font-black uppercase"><ChevronLeft className="w-4 h-4" /> Previous</button>
                <button onClick={() => onNavigate(1)} className="flex-1 flex items-center justify-center gap-2 py-3 bg-white border border-slate-200 rounded-xl text-[10px] font-black uppercase">Next <ChevronRight className="w-4 h-4" /></button>
            </div>
        </div>
    </div>
  );
}

function WelcomeModal({ freeCount, totalCount, onClose }) {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const handleSubmit = (e) => { e.preventDefault(); if (email) { setSubmitted(true); setTimeout(onClose, 2000); } };
  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-300">
        <div className="bg-white w-full max-w-md rounded-[2.5rem] p-8 md:p-10 shadow-2xl relative animate-in zoom-in-95 duration-300 overflow-hidden text-center">
            {!submitted ? (
                <>
                    <div className="mb-8">
                        <div className="w-12 h-12 bg-indigo-100 rounded-2xl flex items-center justify-center mb-6 mx-auto"><CalendarDays className="w-6 h-6 text-indigo-600" /></div>
                        <h2 className="text-3xl font-black uppercase leading-tight mb-4 tracking-tighter">Today, <span className="text-emerald-600">{freeCount}</span> out of <span className="text-slate-400">{totalCount}</span> museums are free.</h2>
                        <p className="text-slate-500 font-medium text-sm">Sign up for monthly alerts about upcoming free days and special events.</p>
                    </div>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <input type="email" required placeholder="Enter your email address" className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-indigo-500 outline-none" value={email} onChange={(e) => setEmail(e.target.value)} />
                        <button type="submit" className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-indigo-600 shadow-lg">Notify Me</button>
                    </form>
                    <button onClick={onClose} className="w-full mt-6 text-[10px] font-black text-slate-300 uppercase hover:text-slate-500">Skip for now</button>
                </>
            ) : <div className="py-12 flex flex-col items-center"><CheckCircle2 className="w-12 h-12 text-emerald-600 mb-4 animate-bounce" /><h2 className="text-2xl font-black uppercase tracking-tighter">You're on the list!</h2></div>}
        </div>
    </div>
  );
}