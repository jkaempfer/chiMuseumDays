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
  Ticket,
  ShieldCheck,
  Baby,
  Navigation
} from 'lucide-react';

const CATEGORIES = {
  'Art': { color: 'bg-purple-100 text-purple-700 border-purple-200', emoji: '🎨' },
  'Nature': { color: 'bg-emerald-100 text-emerald-700 border-emerald-200', emoji: '🌿' },
  'Science': { color: 'bg-cyan-100 text-cyan-700 border-cyan-200', emoji: '🧪' },
  'Culture': { color: 'bg-amber-100 text-amber-700 border-amber-200', emoji: '🏛️' },
  'Zoo/Garden': { color: 'bg-lime-100 text-lime-700 border-lime-200', emoji: '🦁' },
  'Kid Friendly': { color: 'bg-orange-100 text-orange-700 border-orange-200', emoji: '👶' }
};

const MUSEUMS = [
  {
    id: 'aic',
    name: 'Art Institute of Chicago',
    type: 'Art',
    mustSee: true,
    isKidFriendly: true,
    neighborhood: 'The Loop',
    address: '111 S Michigan Ave, Chicago, IL 60603',
    image: 'https://images.unsplash.com/photo-1594140026857-e6f79029705b?auto=format&fit=crop&q=80&w=800',
    basePrice: 32,
    description: 'Explore one of the world’s great art collections, spanning centuries and cultures. Highlights include the massive Impressionist collection and the intricate Thorne Miniature Rooms. Located right on Michigan Avenue, it’s an anchor of the city’s cultural landscape.',
    alwaysFree: false,
    freePolicy: "IL residents: Thursday evenings (5–8 p.m.).",
    freeDays: [4],
    boaParticipant: true,
    alwaysFreeFor: [
      "Chicago teens under 18",
      "Children under 14 (all locations)",
      "Illinois Educators (Pre-K–12)",
      "Active-duty military year-round"
    ],
    scheduledFreeDays: [
      "Illinois residents every Thursday (5–8 p.m.)",
      "Bank of America cardholders (1st full weekend of month)"
    ],
    url: 'https://www.artic.edu/visit/free-admission'
  },
  {
    id: 'field',
    name: 'Field Museum',
    type: 'Nature',
    mustSee: true,
    isKidFriendly: true,
    neighborhood: 'Museum Campus',
    address: '1400 S Lake Shore Dr, Chicago, IL 60605',
    image: 'https://images.unsplash.com/photo-1566125882500-87e10f726cdc?auto=format&fit=crop&q=80&w=800',
    basePrice: 30,
    description: 'Travel through billions of years of history from the origins of life to human cultures around the globe. Meet SUE, the most complete T. rex ever found, and Máximo, a colossal titanosaur. A premier destination for natural history lovers on the lakefront.',
    alwaysFree: false,
    freePolicy: "Free for IL residents every Wednesday.",
    freeDays: [3],
    boaParticipant: false,
    alwaysFreeFor: [
      "Illinois teachers",
      "Active-duty military members",
      "Museums for All (EBT/WIC cardholders)"
    ],
    scheduledFreeDays: [
      "Illinois residents every Wednesday (All Day)"
    ],
    url: 'https://www.fieldmuseum.org/visit/free-admission'
  },
  {
    id: 'shedd',
    name: 'Shedd Aquarium',
    type: 'Nature',
    mustSee: true,
    isKidFriendly: true,
    neighborhood: 'Museum Campus',
    address: '1200 S Lake Shore Dr, Chicago, IL 60605',
    image: 'https://images.unsplash.com/photo-1509233725247-49e657c54213?auto=format&fit=crop&q=80&w=800',
    basePrice: 40,
    description: 'Discover the wonders of the aquatic world with 32,000 animals ranging from beluga whales to seahorses. The aquarium offers immersive exhibits like the Amazon Rising and the Abbott Oceanarium. It provides a unique window into the world’s diverse water habitats.',
    alwaysFree: false,
    freePolicy: "Free for IL residents on Tuesday evenings (5–9 p.m.).",
    freeDays: [2],
    boaParticipant: false,
    alwaysFreeFor: [
      "Active-duty military",
      "Chicago Police & Firefighters",
      "Illinois Teachers"
    ],
    scheduledFreeDays: [
      "Illinois residents: Tuesday evenings (5–9 p.m.)"
    ],
    url: 'https://www.sheddaquarium.org/plan-a-visit/get-tickets/discounts-and-free-hours'
  },
  {
    id: 'msi',
    name: 'Museum of Science & Industry',
    type: 'Science',
    mustSee: true,
    isKidFriendly: true,
    neighborhood: 'Hyde Park',
    address: '5700 S DuSable Lake Shore Dr, Chicago, IL 60637',
    image: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&q=80&w=800',
    basePrice: 26,
    description: 'Housed in the only remaining building from the 1893 World’s Fair, this museum brings science to life. Iconic exhibits include a captured WWII German submarine, a coal mine, and a sprawling model railroad. It is the largest science museum in the Western Hemisphere.',
    alwaysFree: false,
    freePolicy: "Upcoming 2026 Free Dates: June 4, June 19, August 28.",
    freeDays: [],
    boaParticipant: true,
    alwaysFreeFor: [
      "Illinois teachers",
      "Active-duty military",
      "Corporate partner employees"
    ],
    scheduledFreeDays: [
      "Select dates for IL Residents (June 4, June 19, Aug 28)",
      "Bank of America cardholders (1st full weekend of month)"
    ],
    url: 'https://www.msichicago.org/visit/ticket-prices/offers-and-discounts/'
  },
  {
    id: 'adler',
    name: 'Adler Planetarium',
    type: 'Science',
    mustSee: false,
    isKidFriendly: true,
    neighborhood: 'Museum Campus',
    address: '1300 S DuSable Lake Shore Dr, Chicago, IL 60605',
    image: 'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?auto=format&fit=crop&q=80&w=800',
    basePrice: 19,
    description: 'America’s first planetarium sits on the tip of Museum Campus, offering breathtaking views of the Chicago skyline. Explore hands-on exhibits about the universe and witness state-of-the-art sky shows. It’s a stellar experience for space enthusiasts of all ages.',
    alwaysFree: false,
    freePolicy: "Free for IL residents every Wednesday (4–10 p.m.).",
    freeDays: [3],
    boaParticipant: true,
    alwaysFreeFor: [
      "Teachers from IL, IN, and WI",
      "Active military",
      "Kids under 3"
    ],
    scheduledFreeDays: [
      "Illinois residents every Wednesday (4–10 p.m.)",
      "Bank of America cardholders (1st full weekend of month)"
    ],
    url: 'https://www.adlerplanetarium.org/visit/tickets/special-offers/'
  },
  {
    id: 'lpz',
    name: 'Lincoln Park Zoo',
    type: 'Zoo/Garden',
    mustSee: true,
    isKidFriendly: true,
    neighborhood: 'Lincoln Park',
    address: '2001 N Clark St, Chicago, IL 60614',
    image: 'https://images.unsplash.com/photo-1534567153574-2b12153a87f0?auto=format&fit=crop&q=80&w=800',
    basePrice: 0,
    description: 'One of the last free-admission zoos in the United States, providing a home to animals from across the globe. Located within the historic Lincoln Park, it offers a serene escape with beautiful gardens and wildlife exhibits. It remains open 365 days a year for all visitors.',
    alwaysFree: true,
    freePolicy: "100% free for everyone, every single day.",
    freeDays: null,
    boaParticipant: false,
    alwaysFreeFor: [
      "Everyone (General Admission)"
    ],
    scheduledFreeDays: [
      "Open 365 days a year"
    ],
    url: 'https://www.lpzoo.org/'
  },
  {
    id: 'nmma',
    name: 'National Museum of Mexican Art',
    type: 'Culture',
    mustSee: false,
    isKidFriendly: true,
    neighborhood: 'Pilsen',
    address: '1852 W 19th St, Chicago, IL 60608',
    image: 'https://images.unsplash.com/photo-1518998053502-53cc83e9ce78?auto=format&fit=crop&q=80&w=800',
    basePrice: 0,
    description: 'A vibrant cultural institution in the Pilsen neighborhood showcasing the richness of Mexican art. The museum features a permanent collection and rotating exhibitions that represent the diverse voices of the community. It is a vital center for Mexican culture in the Midwest.',
    alwaysFree: true,
    freePolicy: "Free admission every day for all visitors.",
    freeDays: null,
    boaParticipant: false,
    alwaysFreeFor: [
      "Everyone (General Admission)"
    ],
    scheduledFreeDays: [
      "Closed on Mondays"
    ],
    url: 'https://nationalmuseumofmexicanart.org/'
  },
  {
    id: 'mca',
    name: 'Museum of Contemporary Art',
    type: 'Art',
    mustSee: false,
    isKidFriendly: false,
    neighborhood: 'Streeterville',
    address: '220 E Chicago Ave, Chicago, IL 60611',
    image: 'https://images.unsplash.com/photo-1549490349-8643362247b5?auto=format&fit=crop&q=80&w=800',
    basePrice: 19,
    description: 'One of the nation’s largest facilities dedicated to the art of our time. The museum features thought-provoking exhibitions and performances that push boundaries. Its sleek architecture and proximity to the Magnificent Mile make it a must-visit for contemporary art fans.',
    alwaysFree: false,
    freePolicy: "Free for IL residents every Tuesday.",
    freeDays: [2],
    boaParticipant: true,
    alwaysFreeFor: [
      "Under 18 years old",
      "Illinois Teachers",
      "Active Military"
    ],
    scheduledFreeDays: [
      "Illinois residents every Tuesday (All Day)",
      "Bank of America cardholders (1st full weekend of month)"
    ],
    url: 'https://mcachicago.org/visit'
  },
  {
    id: 'history',
    name: 'Chicago History Museum',
    type: 'Culture',
    mustSee: false,
    isKidFriendly: true,
    neighborhood: 'Lincoln Park',
    address: '1601 N Clark St, Chicago, IL 60614',
    image: 'https://images.unsplash.com/photo-1552083375-1447ce886485?auto=format&fit=crop&q=80&w=800',
    basePrice: 19,
    description: 'Delve into the stories that built Chicago, from its early beginnings to the modern day. Through interactive dioramas and rare artifacts, visitors learn about the Great Chicago Fire and the city’s civil rights history. A foundational stop for anyone wanting to understand the Windy City.',
    alwaysFree: false,
    freePolicy: "Next Free Resident Dates: May 19, June 19.",
    freeDays: [],
    boaParticipant: false,
    alwaysFreeFor: [
      "Illinois residents under 18",
      "Active military and veterans",
      "Illinois Teachers"
    ],
    scheduledFreeDays: [
      "Select dates for IL Residents (May 19, June 19, July 4)"
    ],
    url: 'https://www.chicagohistory.org/visit/'
  }
];

export default function App() {
  const [museumType, setMuseumType] = useState('All');
  const [search, setSearch] = useState('');
  const [activeView, setActiveView] = useState('today');
  const [selectedMuseum, setSelectedMuseum] = useState(null);
  const [calendarOffset, setCalendarOffset] = useState(0); 
  const [calendarBaseDate, setCalendarBaseDate] = useState(new Date());

  const [modalOffset, setModalOffset] = useState(0);
  const [modalBaseDate, setModalBaseDate] = useState(new Date());

  const now = new Date();
  
  const getStatusForDate = (museum, date) => {
    if (!museum) return 'none';
    if (museum.alwaysFree) return 'always';
    const dayOfWeek = date.getDay();
    const dayOfMonth = date.getDate();
    const isFirstWeekend = (dayOfWeek === 0 || dayOfWeek === 6) && dayOfMonth <= 7;
    const isBoAFree = museum.boaParticipant && isFirstWeekend;
    const isResidencyFree = museum.freeDays?.includes(dayOfWeek);
    if (isResidencyFree || isBoAFree) return 'limited';
    return 'none';
  };

  const filteredMuseums = useMemo(() => {
    const list = MUSEUMS.filter(m => {
      if (search && !m.name.toLowerCase().includes(search.toLowerCase())) return false;
      if (museumType === 'Must See' && !m.mustSee) return false;
      if (museumType === 'Kid Friendly' && !m.isKidFriendly) return false;
      if (museumType !== 'All' && museumType !== 'Must See' && museumType !== 'Kid Friendly' && m.type !== museumType) return false;
      return true;
    });

    return list.sort((a, b) => {
      const statusA = getStatusForDate(a, now);
      const statusB = getStatusForDate(b, now);
      const score = { 'always': 3, 'limited': 2, 'none': 1 };
      if (score[statusB] !== score[statusA]) return score[statusB] - score[statusA];
      return a.name.localeCompare(b.name);
    });
  }, [museumType, search]);

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

  useEffect(() => {
    if (!selectedMuseum) {
      setModalOffset(0);
      setModalBaseDate(new Date());
    }
  }, [selectedMuseum]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans pb-12">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm h-auto py-3 px-4 md:h-20 md:py-0 flex items-center">
        <div className="max-w-7xl mx-auto w-full grid grid-cols-1 md:grid-cols-3 items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-indigo-600 rounded-lg text-white shrink-0">
              <MapPin className="w-5 h-5 md:w-6 md:h-6" />
            </div>
            <h1 className="text-base md:text-lg font-black tracking-tighter uppercase text-slate-800">Chicago's Free Museums</h1>
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

      <main className="max-w-7xl mx-auto px-4 py-6">
        <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm flex flex-col items-center gap-4 mb-8">
          <div className="flex flex-wrap justify-center gap-2">
            <button onClick={() => setMuseumType('All')} className={`px-4 py-1.5 text-[11px] font-black rounded-full border transition-all uppercase tracking-tighter ${museumType === 'All' ? 'bg-slate-900 text-white border-slate-900 shadow-md' : 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100'}`}>All</button>
            <button onClick={() => setMuseumType('Must See')} className={`flex items-center gap-1.5 px-4 py-1.5 text-[11px] font-black rounded-full border transition-all uppercase tracking-tighter ${museumType === 'Must See' ? 'bg-yellow-400 text-yellow-900 border-yellow-500 shadow-md' : 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100'}`}><Star className={`w-3 h-3 ${museumType === 'Must See' ? 'fill-yellow-900 text-yellow-900' : 'text-yellow-400'}`} /> Must See</button>
            <button onClick={() => setMuseumType('Kid Friendly')} className={`flex items-center gap-1.5 px-4 py-1.5 text-[11px] font-black rounded-full border transition-all uppercase tracking-tighter ${museumType === 'Kid Friendly' ? 'bg-orange-400 text-white border-orange-500 shadow-md' : 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100'}`}><Baby className="w-3 h-3" /> Kids</button>
            {Object.entries(CATEGORIES).filter(([k]) => k !== 'Kid Friendly' && k !== 'Events').map(([id, config]) => (
              <button key={id} onClick={() => setMuseumType(id)} className={`flex items-center gap-1.5 px-4 py-1.5 text-[11px] font-black rounded-full border transition-all uppercase tracking-tighter ${museumType === id ? 'bg-slate-900 text-white border-slate-900 shadow-md' : 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100'}`}><span>{config.emoji}</span>{id}</button>
            ))}
          </div>
        </div>

        <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
          {activeView === 'today' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredMuseums.map(m => (
                <MuseumCard key={m.id} museum={m} status={getStatusForDate(m, now)} onOpenDetail={() => setSelectedMuseum(m)} />
              ))}
            </div>
          )}

          {activeView === 'calendar' && (
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-4 bg-white border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <h2 className="text-sm font-black text-slate-500 uppercase tracking-widest flex items-center gap-2"><CalendarDays className="w-4 h-4 text-indigo-500" /> Forecast</h2>
                  <input type="date" className="text-xs font-bold bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 outline-none cursor-pointer" value={calendarBaseDate.toISOString().split('T')[0]} onChange={(e) => { const selected = new Date(e.target.value); selected.setMinutes(selected.getMinutes() + selected.getTimezoneOffset()); setCalendarBaseDate(selected); setCalendarOffset(0); }} />
                </div>
                <div className="flex items-center gap-2">
                  <button disabled={calendarOffset === 0} onClick={() => setCalendarOffset(prev => prev - 1)} className="p-2 bg-slate-50 border border-slate-200 rounded-xl disabled:opacity-30 hover:bg-slate-100"><ChevronLeft className="w-4 h-4" /></button>
                  <button onClick={() => setCalendarOffset(prev => prev + 1)} className="p-2 bg-slate-50 border border-slate-200 rounded-xl shadow-sm hover:bg-slate-100"><ChevronRight className="w-4 h-4" /></button>
                </div>
              </div>
              <div className="overflow-x-auto no-scrollbar">
                <table className="w-full text-left border-collapse table-fixed min-w-[950px]">
                  <thead className="sticky top-[108px] md:top-[80px] z-40 bg-slate-50 border-b border-slate-200 shadow-sm">
                    <tr>
                      <th className="p-5 text-xs font-black text-slate-400 uppercase tracking-widest sticky left-0 bg-slate-50 z-10 w-64 border-r border-slate-200">Museum</th>
                      {calendarDates.map((date, i) => (
                        <th key={i} className={`p-4 text-center border-r border-slate-200 last:border-r-0 ${date.getDay() === 0 || date.getDay() === 6 ? 'bg-indigo-50/40' : ''}`}>
                          <p className="text-[10px] font-bold text-indigo-500 uppercase leading-none mb-1">{date.toLocaleDateString('en-US', { weekday: 'short' })}</p>
                          <p className="text-xl font-black text-slate-800 leading-none">{date.getDate()}</p>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredMuseums.map(m => (
                      <tr key={m.id} className="border-b border-slate-100 last:border-b-0 hover:bg-slate-50/30 transition-colors group/row">
                        <td onClick={() => setSelectedMuseum(m)} className={`p-5 sticky left-0 z-10 font-bold text-sm border-r border-slate-200 bg-white cursor-pointer hover:text-indigo-600 transition-colors`}>
                          <div className="flex flex-col gap-1.5">
                            <div className="flex items-center gap-1.5 overflow-hidden">
                              {m.mustSee && <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500 shrink-0" />}
                              <span className="truncate font-black">{m.name}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <span className={`text-[8px] font-black uppercase tracking-tighter px-1.5 py-0.5 rounded border w-fit ${CATEGORIES[m.type].color}`}>{CATEGORIES[m.type].emoji} {m.type}</span>
                            </div>
                          </div>
                        </td>
                        {calendarDates.map((date, i) => {
                          const status = getStatusForDate(m, date);
                          const dayOfWeek = date.getDay();
                          const dayOfMonth = date.getDate();
                          const isFirstWeekend = (dayOfWeek === 0 || dayOfWeek === 6) && dayOfMonth <= 7;
                          const hoverText = status === 'limited' ? (isFirstWeekend && m.boaParticipant ? "Bank of America Weekend" : m.freePolicy) : null;
                          return (
                            <td key={i} className={`p-2 border-r border-slate-100 last:border-r-0 transition-colors ${date.getDay() === 0 || date.getDay() === 6 ? 'bg-indigo-50/10' : ''}`}>
                              <div title={hoverText} className={`w-full h-14 rounded-2xl flex flex-col items-center justify-center transition-all ${status === 'always' ? 'bg-emerald-600 text-white shadow-lg' : status === 'limited' ? 'bg-emerald-50 border border-emerald-300 text-emerald-700 font-black cursor-help' : 'bg-slate-50 text-slate-400'}`}>
                                {status !== 'none' ? <span className="text-[10px] uppercase font-black">{status === 'limited' ? 'PARTIAL*' : 'FREE'}</span> : <span className="text-[10px] opacity-40 font-bold">${m.basePrice}</span>}
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
        </div>

        {selectedMuseum && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-2 md:p-8 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
            <div className="bg-white w-full max-w-4xl rounded-[2rem] md:rounded-[2.5rem] shadow-2xl overflow-hidden relative animate-in slide-in-from-bottom-4 duration-300 max-h-[92vh] flex flex-col">
              
              <div className={`py-3 px-6 md:px-8 text-center ${selectedMuseum.alwaysFree ? 'bg-emerald-600' : 'bg-indigo-600'} text-white sticky top-0 z-50 flex items-center justify-between shadow-md`}>
                <div className="flex items-center gap-3 truncate pr-4 overflow-hidden flex-1 min-w-0">
                   {selectedMuseum.mustSee && <Star className="w-4 h-4 fill-yellow-400 text-yellow-400 shrink-0" />}
                   <h3 className="text-xs md:text-sm font-black uppercase tracking-[0.1em] truncate">
                     {selectedMuseum.name}
                   </h3>
                   <a 
                      href={selectedMuseum.url}
                      target="_blank"
                      className="flex items-center gap-1 px-3 py-1 bg-black text-white rounded-full text-[9px] font-black uppercase tracking-widest transition-all shrink-0 border border-black"
                    >
                      Site <ExternalLink className="w-2.5 h-2.5 ml-1" />
                    </a>
                </div>
                <button onClick={() => setSelectedMuseum(null)} className="p-1.5 bg-white/20 hover:bg-white/30 rounded-full transition-colors shrink-0 ml-2" aria-label="Close popup"><X className="w-5 h-5" /></button>
              </div>

              <div className="overflow-y-auto flex-1 no-scrollbar pb-8">
                <div className="h-32 md:h-40 w-full overflow-hidden border-b border-slate-100 bg-slate-100">
                  <img src={selectedMuseum.image} alt={selectedMuseum.name} className="w-full h-full object-cover" />
                </div>

                <div className="p-6 md:p-10">
                  <div className="flex flex-wrap items-center gap-2 mb-5">
                    <div className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border shadow-sm ${CATEGORIES[selectedMuseum.type].color}`}>{CATEGORIES[selectedMuseum.type].emoji} {selectedMuseum.type}</div>
                    {selectedMuseum.isKidFriendly && <div className="px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border bg-orange-100 text-orange-700 border-orange-200 shadow-sm">👶 Kid Friendly</div>}
                  </div>

                  <h2 className="text-2xl md:text-3xl font-black text-slate-900 leading-tight mb-2">
                    {selectedMuseum.name}
                  </h2>
                  
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-10">
                    <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(selectedMuseum.address)}`} target="_blank" className="text-[11px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5 hover:text-indigo-600 transition-colors"><MapPin className="w-3.5 h-3.5" /> {selectedMuseum.address}</a>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 mb-10 border-b border-slate-100 pb-10">
                    <div className="text-slate-600 text-sm leading-relaxed font-medium">
                        {selectedMuseum.description}
                    </div>

                    <div className="space-y-6">
                        <div>
                          <h4 className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-3">Always free for</h4>
                          <ul className="space-y-2 font-medium">
                            {selectedMuseum.alwaysFreeFor.map((item, i) => (
                              <li key={i} className="flex items-center gap-2 text-xs text-slate-600">
                                <div className="w-1 h-1 bg-slate-300 rounded-full"></div>
                                {item}
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div>
                          <h4 className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-3">Free days for</h4>
                          <ul className="space-y-2 font-medium">
                            {selectedMuseum.scheduledFreeDays.map((item, i) => (
                              <li key={item} className="flex items-center gap-2 text-xs text-slate-600">
                                <div className="w-1 h-1 bg-slate-400 rounded-full"></div>
                                {item}
                              </li>
                            ))}
                          </ul>
                        </div>
                    </div>
                  </div>

                  <div className="mb-10">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><CalendarDays className="w-4 h-4 text-indigo-500" /> Days with free access</h4>
                      <div className="flex gap-2">
                        <button disabled={modalOffset === 0} onClick={() => setModalOffset(prev => prev - 1)} className="p-1.5 bg-slate-100 hover:bg-slate-200 rounded-lg disabled:opacity-30 transition-colors"><ChevronLeft className="w-4 h-4" /></button>
                        <button onClick={() => setModalOffset(prev => prev + 1)} className="p-1.5 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"><ChevronRight className="w-4 h-4" /></button>
                      </div>
                    </div>
                    <div className="flex gap-2 overflow-x-auto no-scrollbar">
                      {modalCalendarDates.map((date, i) => {
                        const status = getStatusForDate(selectedMuseum, date);
                        const dayOfWeek = date.getDay();
                        const dayOfMonth = date.getDate();
                        const isFirstWeekend = (dayOfWeek === 0 || dayOfWeek === 6) && dayOfMonth <= 7;
                        const hoverText = status === 'limited' ? (isFirstWeekend && selectedMuseum.boaParticipant ? "Bank of America Weekend" : selectedMuseum.freePolicy) : null;
                        return (
                          <div key={i} title={hoverText} className={`flex-1 min-w-[95px] p-3 rounded-2xl border flex flex-col items-center gap-1 transition-all ${status === 'always' ? 'bg-emerald-600 border-emerald-700 text-white shadow-md' : status === 'limited' ? 'bg-emerald-50 border border-emerald-300 text-emerald-800 shadow-sm cursor-help' : `bg-slate-50 border-slate-200 ${dayOfWeek === 0 || dayOfWeek === 6 ? 'opacity-80 ring-1 ring-indigo-100/30' : ''}`}`}>
                            <span className={`text-[9px] font-black uppercase ${status === 'always' ? 'text-white/80' : 'text-slate-400'}`}>{date.toLocaleDateString('en-US', { weekday: 'short' })}</span>
                            <span className="text-lg font-black leading-none">{date.getDate()}</span>
                            <span className={`text-[8px] font-black uppercase mt-1 ${status === 'always' ? 'text-white' : 'text-emerald-700'}`}>{status === 'always' ? 'FREE' : status === 'limited' ? 'PARTIAL*' : `$${selectedMuseum.basePrice}`}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="border-t border-slate-100 pt-8">
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2"><Star className="w-4 h-4 text-amber-500" /> Similar Museums</h4>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {MUSEUMS.filter(m => (m.type === selectedMuseum.type || (selectedMuseum.isKidFriendly && m.isKidFriendly)) && m.id !== selectedMuseum.id).slice(0, 3).map(rec => (
                        <div key={rec.id} onClick={() => { setSelectedMuseum(rec); setModalOffset(0); }} className="p-3 bg-slate-50 border border-slate-100 rounded-2xl cursor-pointer hover:bg-slate-100 transition-colors group/rec"><p className="text-[11px] font-black text-slate-900 leading-tight mb-1 truncate group-hover/rec:text-indigo-600">{rec.name}</p><p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter truncate">{rec.neighborhood}</p></div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

function MuseumCard({ museum, status, onOpenDetail }) {
  const config = CATEGORIES[museum.type];
  const isFree = status === 'always' || status === 'limited';
  
  return (
    <div className="relative rounded-[2.5rem] shadow-sm border border-slate-200 transition-all group flex flex-col h-full overflow-hidden bg-white">
      <div className={`p-6 flex-grow transition-colors duration-300 ${isFree ? 'bg-emerald-50/40' : ''}`}>
        <div className="flex flex-col gap-4 mb-5">
          <div className="flex items-center gap-2">
            <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest w-fit border shadow-sm ${config.color}`}><span>{config.emoji}</span>{museum.type}</div>
            {isFree && (
              <div className={`ml-auto inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest w-fit border shadow-sm ${status === 'always' ? 'bg-emerald-600 text-white border-emerald-700' : 'bg-emerald-50 border-emerald-300 text-emerald-700'}`}>
                {status === 'always' ? 'Free today' : 'Partial Free*'}
              </div>
            )}
          </div>
          <div>
            <div className="h-12 flex items-center mb-1.5">
              <h3 className="text-xl font-black text-slate-900 leading-[1.1] tracking-tight flex items-center gap-2 line-clamp-2 overflow-hidden">
                {museum.mustSee && <Star className="w-5 h-5 text-yellow-500 fill-yellow-500 shrink-0" />}
                {museum.name}
              </h3>
            </div>
            <p className="text-[11px] text-slate-400 flex items-center gap-1.5 font-bold uppercase tracking-wide"><MapPin className="w-3.5 h-3.5 text-slate-300" /> {museum.neighborhood}</p>
          </div>
        </div>
        <p className="text-sm text-slate-600 mb-6 leading-relaxed font-medium line-clamp-3">{museum.description}</p>
      </div>
      <div className={`px-6 py-5 mt-auto border-t space-y-4 transition-all duration-300 ${isFree ? 'bg-emerald-100/20 border-emerald-50' : 'bg-slate-50/50 border-slate-100'}`}>
        <div className="flex justify-between items-center px-1"><span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Price per person</span><span className="text-slate-900 text-sm font-black tracking-tight">{museum.basePrice === 0 ? 'FREE' : `$${museum.basePrice}`}</span></div>
        <button onClick={onOpenDetail} className="flex items-center justify-center gap-2 w-full py-3.5 text-sm font-black rounded-3xl transition-all shadow-lg active:scale-95 bg-slate-900 text-white hover:bg-slate-800 shadow-slate-300">Get Free Access</button>
      </div>
    </div>
  );
}