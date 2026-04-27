import React, { useState, useMemo, useEffect } from 'react';
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
  Info
} from 'lucide-react';

// YOUR LIVE GOOGLE SHEET CSV URL
const SHEET_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vT-5D6tDErRDgeZnLlm4qR6c_M2FrxdFmUoDJyemEHawkfn-ZHbMHKBYSOhN8NcheKaJipvj5vcpSjR/pub?output=csv"; 

const CATEGORIES = {
  'Art': { color: 'bg-purple-100 text-purple-700 border-purple-200', emoji: '🎨' },
  'Nature': { color: 'bg-emerald-100 text-emerald-700 border-emerald-200', emoji: '🌿' },
  'Science': { color: 'bg-cyan-100 text-cyan-700 border-cyan-200', emoji: '🧪' },
  'Culture': { color: 'bg-amber-100 text-amber-700 border-amber-200', emoji: '🏛️' },
  'Zoo/Garden': { color: 'bg-lime-100 text-lime-700 border-lime-200', emoji: '🦁' },
  'Kid Friendly': { color: 'bg-orange-100 text-orange-700 border-orange-200', emoji: '👶' }
};

const ChicagoFlag = ({ className }) => (
  <svg viewBox="0 0 3 2" className={className} xmlns="http://www.w3.org/2000/svg">
    <rect width="3" height="2" fill="white"/>
    <rect width="3" height="0.33" y="0.33" fill="#B2D9E7"/>
    <rect width="3" height="0.33" y="1.33" fill="#B2D9E7"/>
    <text x="0.5" y="1.15" fontSize="0.45" fill="red" textAnchor="middle">✶</text>
    <text x="1.16" y="1.15" fontSize="0.45" fill="red" textAnchor="middle">✶</text>
    <text x="1.83" y="1.15" fontSize="0.45" fill="red" textAnchor="middle">✶</text>
    <text x="2.5" y="1.15" fontSize="0.45" fill="red" textAnchor="middle">✶</text>
  </svg>
);

export default function App() {
  const [museums, setMuseums] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [museumType, setMuseumType] = useState('All');
  const [search, setSearch] = useState('');
  const [activeView, setActiveView] = useState('today');
  const [selectedMuseum, setSelectedMuseum] = useState(null);
  const [calendarOffset, setCalendarOffset] = useState(0); 
  const [calendarBaseDate, setCalendarBaseDate] = useState(new Date());
  
  const [activeCellDetail, setActiveCellDetail] = useState(null);
  const [modalOffset, setModalOffset] = useState(0);
  const [modalBaseDate, setModalBaseDate] = useState(new Date());

  const now = new Date();

  useEffect(() => {
    const chicagoFlagSvg = `data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 3 2'><rect width='3' height='2' fill='white'/><rect width='3' height='0.33' y='0.33' fill='%23B2D9E7'/><rect width='3' height='0.33' y='1.33' fill='%23B2D9E7'/><text x='0.5' y='1.15' font-size='0.45' fill='red' text-anchor='middle'>✶</text><text x='1.16' y='1.15' font-size='0.45' fill='red' text-anchor='middle'>✶</text><text x='1.83' y='1.15' font-size='0.45' fill='red' text-anchor='middle'>✶</text><text x='2.5' y='1.15' font-size='0.45' fill='red' text-anchor='middle'>✶</text></svg>`;
    let link = document.querySelector("link[rel~='icon']");
    if (!link) {
      link = document.createElement('link'); link.rel = 'icon';
      document.getElementsByTagName('head')[0].appendChild(link);
    }
    link.href = chicagoFlagSvg;
    document.title = "Chicago Free Museums";
  }, []);

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

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch(SHEET_URL);
        const text = await response.text();
        const lines = text.split(/\r?\n/).filter(line => line.trim() !== '');
        const dataRows = lines.slice(1);
        const parsedData = dataRows.map((line, index) => {
          const clean = parseCSVLine(line);
          const scheduleRaw = clean[15] ? clean[15].split(';') : [];
          const scheduleMap = {};
          scheduleRaw.forEach(item => {
            if (item.includes(':')) {
              const [datePart, label] = item.split(':');
              scheduleMap[datePart.trim()] = label.trim();
            } else {
              const trimmed = item.trim();
              if (trimmed) scheduleMap[trimmed] = "Free Admission";
            }
          });

          return {
            id: clean[0] || `museum-${index}`,
            name: clean[1],
            type: clean[2],
            mustSee: clean[3]?.toLowerCase() === 'true',
            isKidFriendly: clean[4]?.toLowerCase() === 'true',
            neighborhood: clean[5],
            address: clean[6],
            image: clean[7],
            basePrice: Number(clean[8]) || 0,
            description: clean[9],
            alwaysFree: clean[10]?.toLowerCase() === 'true',
            freePolicy: clean[11],
            freeDays: clean[12] ? clean[12].split(',').map(v => parseInt(v.trim())).filter(v => !isNaN(v)) : [],
            alwaysFreeFor: clean[14] ? clean[14].split(';').map(s => s.trim()).filter(Boolean) : [],
            scheduleMap,
            scheduledFreeDays: clean[15] ? clean[15].split(';').map(s => s.trim()).filter(Boolean) : [],
            url: clean[16],
            rating: clean[17] ? Number(clean[17]) : null,
            reviewCount: clean[18] ? clean[18] : null
          };
        }).filter(m => m.name && m.name.trim() !== '');
        setMuseums(parsedData);
        setLoading(false);
      } catch (err) {
        setError("Failed to sync with Google Sheet.");
        setLoading(false);
      }
    }
    fetchData();
  }, []);
  
  const getStatusForDate = (museum, date) => {
    if (!museum) return { type: 'none', label: '', fullLabel: '' };
    if (museum.alwaysFree) return { type: 'always', label: 'FREE', fullLabel: 'Free Admission Always' };
    
    const dayOfWeek = date.getDay();
    const dayOfMonth = date.getDate();
    const monthName = date.toLocaleString('en-US', { month: 'long' });
    const year = date.getFullYear();
    const dateStr = `${monthName} ${dayOfMonth}`;
    const dateStrYear = `${monthName} ${dayOfMonth}, ${year}`;
    
    const scheduledLabel = museum.scheduleMap?.[dateStr] || museum.scheduleMap?.[dateStrYear];
    if (scheduledLabel) return { type: 'limited', label: 'CHECK FREE', fullLabel: scheduledLabel };
    if (museum.freeDays?.includes(dayOfWeek)) return { type: 'limited', label: 'CHECK FREE', fullLabel: museum.freePolicy || 'Resident Free Day' };
    const isFirstWeekend = (dayOfWeek === 0 || dayOfWeek === 6) && dayOfMonth <= 7;
    if (museum.boaParticipant && isFirstWeekend) return { type: 'limited', label: 'CHECK FREE', fullLabel: 'Bank of America Cardholders' };

    return { type: 'none', label: `$${museum.basePrice}`, fullLabel: '' };
  };

  const filteredMuseums = useMemo(() => {
    const list = museums.filter(m => {
      if (search && !m.name?.toLowerCase().includes(search.toLowerCase())) return false;
      if (museumType === 'Must See' && !m.mustSee) return false;
      if (museumType === 'Kid Friendly' && !m.isKidFriendly) return false;
      if (museumType !== 'All' && museumType !== 'Must See' && museumType !== 'Kid Friendly' && m.type !== museumType) return false;
      return true;
    });

    return list.sort((a, b) => {
      const scoreA = { 'always': 3, 'limited': 2, 'none': 1 }[getStatusForDate(a, now).type];
      const scoreB = { 'always': 3, 'limited': 2, 'none': 1 }[getStatusForDate(b, now).type];
      if (scoreB !== scoreA) return scoreB - scoreA;
      return (a.name || '').localeCompare(b.name || '');
    });
  }, [museumType, search, museums]);

  const calendarDates = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(calendarBaseDate);
      d.setDate(calendarBaseDate.getDate() + i + (calendarOffset * 7));
      return d;
    });
  }, [calendarOffset, calendarBaseDate]);

  const modalCalendarDates = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(modalBaseDate);
      d.setDate(modalBaseDate.getDate() + i + (modalOffset * 7));
      return d;
    });
  }, [modalOffset, modalBaseDate]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
        <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Syncing with Sheet...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-12 font-sans selection:bg-indigo-100 selection:text-indigo-900 flex flex-col">
      {/* HEADER: STICKY AT TOP */}
      <header className="bg-white/95 backdrop-blur-md border-b border-slate-200 sticky top-0 z-[100] shadow-sm px-4">
        <div className="max-w-7xl mx-auto h-auto py-3 md:h-20 md:py-0 grid grid-cols-1 md:grid-cols-3 items-center gap-4">
          <div className="flex items-center gap-3">
            <ChicagoFlag className="w-8 h-auto rounded shadow-sm border border-slate-100" />
            <h1 className="text-base md:text-lg font-black tracking-tighter uppercase text-slate-800 leading-none">Chicago's Free Museums</h1>
          </div>
          <div className="flex bg-slate-100 p-1 rounded-xl shadow-inner max-w-sm mx-auto w-full order-3 md:order-2">
            {[{ id: 'today', icon: LayoutGrid, label: 'Today' }, { id: 'calendar', icon: Calendar, label: 'Calendar' }].map(v => (
              <button key={v.id} onClick={() => setActiveView(v.id)} className={`flex items-center justify-center gap-2 flex-1 py-1.5 rounded-lg text-xs md:text-sm font-bold transition-all ${activeView === v.id ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}><v.icon className="w-3.5 h-3.5 md:w-4 md:h-4" />{v.label}</button>
            ))}
          </div>
          <div className="relative group w-full order-2 md:order-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input type="text" placeholder="Search museum..." className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-full text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6 flex-1 w-full relative">
        {/* STICKY FILTER BOX (CALCULATED OFFSET FOR DESKTOP AND MOBILE) */}
        <div className="sticky top-[164px] md:top-[80px] z-50 bg-slate-50/90 backdrop-blur-sm pt-2 pb-6">
          <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm flex flex-col items-center gap-4">
            <div className="flex flex-wrap justify-center gap-2">
              {['All', 'Must See', 'Kid Friendly', 'Art', 'Nature', 'Science', 'Culture', 'Zoo/Garden'].map(type => (
                <button key={type} onClick={() => setMuseumType(type)} className={`flex items-center gap-1.5 px-4 py-1.5 text-[11px] font-black rounded-full border transition-all uppercase tracking-tighter ${museumType === type ? 'bg-slate-900 text-white border-slate-900 shadow-md' : 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100'}`}>
                  {type === 'Must See' && <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />}
                  {type === 'Kid Friendly' && <Baby className="w-3 h-3" />}
                  {CATEGORIES[type]?.emoji} {type}
                </button>
              ))}
            </div>
          </div>
        </div>

        {activeView === 'today' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {filteredMuseums.map((m, idx) => (
              <MuseumCard key={`${m.id}-${idx}`} museum={m} status={getStatusForDate(m, now)} onOpenDetail={() => setSelectedMuseum(m)} />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4">
             <div className="p-4 bg-white border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <h2 className="text-sm font-black text-slate-500 uppercase tracking-widest flex items-center gap-2"><CalendarDays className="w-4 h-4 text-indigo-500" /> Availability Calendar</h2>
                  <input type="date" className="text-xs font-bold bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 outline-none" value={calendarBaseDate.toISOString().split('T')[0]} onChange={(e) => { const s = new Date(e.target.value); s.setMinutes(s.getMinutes() + s.getTimezoneOffset()); setCalendarBaseDate(s); setCalendarOffset(0); }} />
                </div>
                <div className="flex items-center gap-2">
                  <button disabled={calendarOffset === 0} onClick={() => setCalendarOffset(prev => prev - 1)} className="p-2 bg-slate-50 border border-slate-200 rounded-xl disabled:opacity-30 hover:bg-slate-100"><ChevronLeft className="w-4 h-4" /></button>
                  <button onClick={() => setCalendarOffset(prev => prev + 1)} className="p-2 bg-slate-50 border border-slate-200 rounded-xl hover:bg-slate-100"><ChevronRight className="w-4 h-4" /></button>
                </div>
              </div>
              
              <div className="overflow-x-auto no-scrollbar relative">
                <table className="w-full text-left border-collapse table-fixed min-w-[850px]">
                  {/* STICKY TABLE HEADER: POSITIONED BELOW FILTERS */}
                  <thead className="sticky top-0 z-40 bg-slate-50 border-b border-slate-200 shadow-sm">
                    <tr>
                      <th className="p-4 text-xs font-black text-slate-400 uppercase tracking-widest sticky left-0 bg-slate-50 z-50 w-52 border-r border-slate-200">Museum</th>
                      {calendarDates.map((date, i) => (
                        <th key={`header-date-${i}`} className={`p-3 text-center border-r border-slate-200 last:border-r-0 ${date.getDay() === 0 || date.getDay() === 6 ? 'bg-indigo-50/40' : ''}`}>
                          <p className="text-xl font-black text-slate-800 leading-none">{date.getDate()}</p>
                          <p className="text-[10px] font-bold text-indigo-500 uppercase leading-none mt-1">{date.toLocaleDateString('en-US', { weekday: 'short' })}</p>
                          <p className="text-[8px] font-black text-slate-400 uppercase leading-none mt-1 opacity-60">{date.toLocaleString('en-US', { month: 'short' })}</p>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="relative z-10">
                    {filteredMuseums.map((m, idx) => (
                      <tr key={`row-${m.id}-${idx}`} className="border-b border-slate-100 group/row">
                        <td onClick={() => setSelectedMuseum(m)} className="p-4 sticky left-0 z-30 font-bold text-sm border-r border-slate-200 bg-white cursor-pointer hover:text-indigo-600 transition-colors">
                          <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-1.5">
                              {m.mustSee && <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500 shrink-0" />}
                              <span className="truncate font-black uppercase text-[11px]">{m.name}</span>
                            </div>
                            <span className={`text-[8px] font-black uppercase px-1.5 py-0.5 rounded border w-fit ${CATEGORIES[m.type]?.color || 'bg-slate-100 border-slate-200'}`}>{m.type}</span>
                          </div>
                        </td>
                        {calendarDates.map((date, i) => {
                          const status = getStatusForDate(m, date);
                          const isSelected = activeCellDetail === `${m.id}-${i}`;
                          return (
                            <td key={`cell-${m.id}-${idx}-${i}`} className={`p-1.5 border-r border-slate-100 last:border-r-0 ${date.getDay() === 0 || date.getDay() === 6 ? 'bg-indigo-50/10' : ''}`}>
                              <div 
                                onClick={() => {
                                  if (status.type !== 'none') {
                                    setActiveCellDetail(isSelected ? null : `${m.id}-${i}`);
                                  }
                                }}
                                className={`w-full h-14 rounded-xl flex flex-col items-center justify-center p-1 transition-all relative ${status.type !== 'none' ? 'cursor-pointer shadow-sm' : ''} ${status.type === 'always' ? 'bg-emerald-600 text-white' : status.type === 'limited' ? 'bg-emerald-50 border border-emerald-300 text-emerald-700 font-black' : 'bg-slate-50 text-slate-400'}`}
                              >
                                <span className="text-[8px] uppercase font-black text-center leading-tight">
                                  {status.label}
                                </span>
                                
                                {isSelected && (
                                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 bg-slate-900 text-white p-3 rounded-xl z-[100] text-[10px] font-bold shadow-xl animate-in zoom-in-95 duration-100">
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
              
              <div className="bg-slate-50 p-4 border-t border-slate-200 flex flex-wrap gap-4 items-center justify-center">
                 <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-emerald-600 rounded"></div>
                    <span className="text-[9px] font-black uppercase text-slate-500 tracking-widest">Free for everyone</span>
                 </div>
                 <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-emerald-50 border border-emerald-300 rounded"></div>
                    <span className="text-[9px] font-black uppercase text-slate-500 tracking-widest">Conditional Free (Tap to check eligibility)</span>
                 </div>
              </div>
          </div>
        )}
      </main>

      <footer className="mt-auto py-10 px-4 border-t border-slate-200 bg-white">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <ChicagoFlag className="w-10 h-auto opacity-30 grayscale" />
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-relaxed max-w-xl">
              <AlertTriangle className="w-3.5 h-3.5 inline mr-1.5 -mt-1 text-amber-500" />
              Disclaimer: Data is updated periodically but admission policies and free days are subject to change. 
              Always verify dates directly with the museum website. This site assumes no responsibility for denied entry.
            </p>
          </div>
          <p className="text-[9px] font-black text-slate-300 uppercase tracking-tighter">© 2026 Chicago Free Days Project</p>
        </div>
      </footer>

      {selectedMuseum && (
        <MuseumModal 
          museum={selectedMuseum} 
          onClose={() => setSelectedMuseum(null)} 
          getStatusForDate={getStatusForDate}
          modalOffset={modalOffset}
          setModalOffset={setModalOffset}
          modalCalendarDates={modalCalendarDates}
          modalBaseDate={modalBaseDate}
          setModalBaseDate={setModalBaseDate}
        />
      )}
    </div>
  );
}

function MuseumCard({ museum, status, onOpenDetail }) {
  const isFree = status.type === 'always' || status.type === 'limited';
  return (
    <div className="relative rounded-[2rem] shadow-sm border border-slate-200 transition-all flex flex-col h-full overflow-hidden bg-white hover:shadow-lg active:scale-[0.98]">
      <div className={`p-6 flex-grow ${isFree ? 'bg-emerald-50/40' : ''}`}>
        <div className="flex flex-col gap-4 mb-5">
          <div className="flex items-center gap-2">
            <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${CATEGORIES[museum.type]?.color}`}>{museum.type}</span>
            {isFree && <span className="ml-auto px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest bg-emerald-600 text-white shadow-sm">{status.type === 'limited' ? 'Conditional Free*' : 'Free Today'}</span>}
          </div>
          <div>
            <h3 className="text-xl font-black text-slate-900 leading-tight line-clamp-2 uppercase">{museum.name}</h3>
            <div className="flex items-center gap-2 mt-1">
              <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest shrink-0">{museum.neighborhood}</p>
              {museum.rating && (
                <div className="flex items-center gap-1 ml-auto">
                   <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                   <span className="text-[10px] font-black text-slate-700">{museum.rating}</span>
                   {museum.reviewCount && <span className="text-[9px] font-bold text-slate-300">({museum.reviewCount})</span>}
                </div>
              )}
            </div>
          </div>
        </div>
        <p className="text-sm text-slate-600 leading-relaxed line-clamp-3 font-medium">{museum.description}</p>
      </div>
      <div className="px-6 py-5 mt-auto border-t bg-slate-50/50 flex flex-col gap-3">
        <div className="flex justify-between text-[10px] font-black uppercase text-slate-400 tracking-widest px-1">
          <span>Standard Price</span>
          <span className="text-slate-900">{museum.basePrice === 0 ? 'FREE' : `$${museum.basePrice}`}</span>
        </div>
        <button onClick={onOpenDetail} className="w-full py-4 bg-slate-900 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-indigo-600 transition-colors shadow-lg active:bg-black">View Free Days</button>
      </div>
    </div>
  );
}

function MuseumModal({ museum, onClose, getStatusForDate, modalOffset, setModalOffset, modalCalendarDates, modalBaseDate, setModalBaseDate }) {
  const [activeModalCell, setActiveModalCell] = useState(null);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = 'unset'; };
  }, []);

  return (
    <div className="fixed inset-0 z-[200] flex flex-col bg-slate-950/90 backdrop-blur-md animate-in fade-in duration-200">
      <div className={`p-5 md:px-8 flex items-center justify-between text-white shadow-lg shrink-0 ${museum.alwaysFree ? 'bg-emerald-600' : 'bg-indigo-600'}`}>
        <div className="flex items-center gap-3 truncate">
          <h3 className="text-xs font-black uppercase tracking-widest truncate max-w-[200px] sm:max-w-md">{museum.name}</h3>
          <a href={museum.url} target="_blank" className="p-2 bg-white/20 rounded-full hover:bg-white/40 active:scale-90"><ExternalLink className="w-4 h-4" /></a>
        </div>
        <button onClick={onClose} className="p-2.5 bg-black/10 hover:bg-white/20 rounded-xl transition-all active:scale-90 flex items-center justify-center" aria-label="Close">
          <X className="w-6 h-6" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar p-6 md:p-10 pb-20">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10 pb-10 border-b border-white/10">
            <div>
              <h2 className="text-2xl md:text-4xl font-black text-white mb-4 leading-tight uppercase">{museum.name}</h2>
              <div className="flex flex-wrap items-center gap-3 mb-6">
                <p className="text-[11px] font-black text-white/50 uppercase tracking-widest flex items-center gap-1.5 bg-white/5 px-3 py-1.5 rounded-full border border-white/10"><MapPin className="w-4 h-4" /> {museum.address}</p>
                {museum.rating && (
                  <div className="flex items-center gap-1.5 bg-amber-400 text-amber-950 px-3 py-1.5 rounded-full border border-amber-500 shadow-lg">
                     <Star className="w-3.5 h-3.5 fill-current" />
                     <span className="text-[11px] font-black">{museum.rating}</span>
                  </div>
                )}
              </div>
              <p className="text-white/80 leading-relaxed font-normal text-sm md:text-base italic">{museum.description}</p>
            </div>
            
            <div className="space-y-4">
              <div className="bg-emerald-500/10 p-5 rounded-3xl border border-emerald-500/20">
                <h4 className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                  <CalendarDays className="w-4 h-4" /> Upcoming free days:
                </h4>
                <ul className="space-y-2.5">
                  {museum.scheduledFreeDays.length > 0 ? museum.scheduledFreeDays.map((item, i) => (
                    <li key={`scheduled-free-${i}`} className="text-xs font-normal text-emerald-50 flex items-start gap-3">
                      <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full mt-1.5 shrink-0" /> {item}
                    </li>
                  )) : (
                    <li className="text-[10px] font-black text-white/30 uppercase italic font-normal">No special dates scheduled</li>
                  )}
                </ul>
              </div>
              
              <div className="bg-emerald-500/10 p-5 rounded-3xl border border-emerald-500/20">
                <h4 className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                  <Star className="w-4 h-4" /> Free entry for:
                </h4>
                <ul className="space-y-2.5">
                  {museum.alwaysFreeFor.map((item, i) => (
                    <li key={`always-free-${i}`} className="text-xs font-normal text-emerald-50 flex items-start gap-3">
                      <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full mt-1.5 shrink-0" /> {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
          
          <div className="mb-12">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
              <div className="flex items-center gap-4">
                 <h4 className="text-[10px] font-black text-white/40 uppercase tracking-widest">Availability Calendar</h4>
                 <input 
                    type="date" 
                    className="text-[10px] font-black bg-white/5 border border-white/10 text-white rounded-lg px-2 py-1 outline-none focus:ring-2 focus:ring-indigo-500"
                    value={modalBaseDate.toISOString().split('T')[0]}
                    onChange={(e) => {
                      const s = new Date(e.target.value);
                      s.setMinutes(s.getMinutes() + s.getTimezoneOffset());
                      setModalBaseDate(s);
                      setModalOffset(0);
                    }}
                 />
              </div>
              <div className="flex gap-2">
                <button onClick={() => setModalOffset(p => Math.max(0, p - 1))} className="p-2.5 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 active:scale-90 transition-all text-white"><ChevronLeft className="w-5 h-5" /></button>
                <button onClick={() => setModalOffset(p => p + 1)} className="p-2.5 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 active:scale-90 transition-all text-white"><ChevronRight className="w-4 h-4" /></button>
              </div>
            </div>
            
            <div className="grid grid-cols-4 sm:grid-cols-7 gap-2.5">
              {modalCalendarDates.map((date, i) => {
                const status = getStatusForDate(museum, date);
                const isFree = status.type !== 'none';
                const isSelected = activeModalCell === i;
                return (
                  <div 
                    key={`modal-date-${i}`} 
                    onClick={() => {
                      if (isFree) setActiveModalCell(isSelected ? null : i);
                    }}
                    className={`p-3.5 rounded-2xl border flex flex-col items-center gap-1.5 transition-all relative ${isFree ? 'bg-emerald-500 border-emerald-400 text-white shadow-xl shadow-emerald-900/20 cursor-pointer active:scale-95' : 'bg-white/5 border-white/10 text-white/40'}`}
                  >
                    <span className="text-xl font-black">{date.getDate()}</span>
                    <span className="text-[9px] font-black uppercase opacity-80">{date.toLocaleDateString('en-US', { weekday: 'short' })}</span>
                    <span className="text-[8px] font-black text-white/40 uppercase leading-none opacity-60">{date.toLocaleString('en-US', { month: 'short' })}</span>
                    <span className={`text-[8px] font-black uppercase text-center leading-tight mt-1 ${isFree ? 'text-white' : 'text-white/20'}`}>
                      {isFree ? status.label : `$${museum.basePrice}`}
                    </span>

                    {isSelected && (
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 w-40 bg-white text-slate-900 p-3 rounded-xl z-[210] text-[10px] font-bold shadow-2xl animate-in zoom-in-95 duration-150 border border-slate-100">
                        <p className="leading-relaxed">{status.fullLabel}</p>
                        <div className="absolute top-full left-1/2 -translate-x-1/2 w-2 h-2 bg-white rotate-45 border-b border-r border-slate-100" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="mt-8 bg-white/5 p-4 rounded-2xl border border-white/10 flex flex-wrap gap-4 items-center justify-center">
               <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-emerald-500 rounded"></div>
                  <span className="text-[8px] font-black uppercase text-white/40 tracking-widest">Free for everyone</span>
               </div>
               <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-emerald-500/20 border border-emerald-500/40 rounded"></div>
                  <span className="text-[8px] font-black uppercase text-white/40 tracking-widest">Conditional Free (Tap to check eligibility)</span>
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}