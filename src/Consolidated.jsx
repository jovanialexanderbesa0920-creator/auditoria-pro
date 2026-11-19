import React, { useState, useEffect } from 'react';
import { db, collection, getDocs, query, orderBy } from './firebase'; // 🔥 Nube
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  AlertTriangle,
  FileText,
  Camera,
  X,
  Target,
  CloudLightning
} from 'lucide-react';
import { ResponsiveContainer, XAxis, YAxis, Tooltip, Cell, AreaChart, Area, Legend } from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import { toPng } from 'html-to-image';
import download from 'downloadjs';

const Consolidated = () => {
  const [audits, setAudits] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth().toString());
  const [selectedYear, setSelectedYear] = useState('2026');
  const [monthlyData, setMonthlyData] = useState([]);
  const [summary, setSummary] = useState({ avg: 0, total: 0, best: { name: 'N/A', val: 0 }, worst: { name: 'N/A', val: 0 } });
  const [zoomedCard, setZoomedCard] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCloud = async () => {
      setLoading(true);
      try {
        const q = query(collection(db, "audits"), orderBy("createdAt", "desc"));
        const querySnapshot = await getDocs(q);
        const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setAudits(data);
      } catch (e) { console.error(e); } finally { setLoading(false); }
    };
    fetchCloud();
  }, []);

  useEffect(() => {
    const filtered = audits.filter(a => {
      const d = new Date(a.date);
      return d.getMonth().toString() === selectedMonth && d.getFullYear().toString() === selectedYear;
    });

    if (filtered.length === 0) {
      setMonthlyData([]);
      setSummary({ avg: 0, total: 0, best: { name: 'N/A', val: 0 }, worst: { name: 'N/A', val: 0 } });
      return;
    }

    const dayMap = {};
    filtered.forEach(a => {
      const day = new Date(a.date).getDate();
      if (!dayMap[day]) dayMap[day] = { day, val: 0, count: 0 };
      dayMap[day].val += a.globalCompliance;
      dayMap[day].count += 1;
    });

    const chartData = Object.values(dayMap).map(d => ({
      day: `Día ${d.day}`,
      compliance: Math.round(d.val / d.count)
    })).sort((a,b) => parseInt(a.day.split(' ')[1]) - parseInt(b.day.split(' ')[1]));

    setMonthlyData(chartData);

    const avg = Math.round(filtered.reduce((acc, a) => acc + a.globalCompliance, 0) / filtered.length);
    
    const catMap = {};
    filtered.forEach(a => {
      if (!catMap[a.category]) catMap[a.category] = { val: 0, count: 0 };
      catMap[a.category].val += (a.globalCompliance || 0);
      catMap[a.category].count += 1;
    });

    const categoriesSorted = Object.entries(catMap).map(([name, d]) => ({
      name, avg: Math.round(d.val / d.count)
    })).sort((a,b) => b.avg - a.avg);

    setSummary({
      avg,
      total: filtered.length,
      best: { name: categoriesSorted[0]?.name || 'N/A', val: categoriesSorted[0]?.avg || 0 },
      worst: { name: categoriesSorted[categoriesSorted.length - 1]?.name || 'N/A', val: categoriesSorted[categoriesSorted.length - 1]?.avg || 0 }
    });

  }, [selectedMonth, selectedYear, audits]);

  const captureConsolidated = () => {
    const node = document.getElementById('consolidated-report');
    if (!node) return;
    toPng(node, { backgroundColor: '#07080b', style: { padding: '40px' } })
      .then(url => download(url, `CLOUD_CONSOLIDADO_${selectedMonth}.png`))
      .catch(e => console.error(e));
  };

  const monthNames = ['ENERO', 'FEBRERO', 'MARZO', 'ABRIL', 'MAYO', 'JUNIO', 'JULIO', 'AGOSTO', 'SEPTIEMBRE', 'OCTUBRE', 'NOVIEMBRE', 'DICIEMBRE'];

  const statsCards = [
    { label: 'Promedio Global', val: `${summary.avg}%`, icon: <Activity className="text-blue-500" />, sub: 'Cloud Data', color: 'blue' },
    { label: 'Total Auditorías', val: summary.total, icon: <FileText className="text-slate-400" />, sub: 'Servidor', color: 'slate' },
    { label: 'Mejor Línea', val: summary.best.name, score: `${summary.best.val}%`, icon: <TrendingUp className="text-emerald-500" />, sub: 'Top Leader', color: 'emerald', id: 'best' },
    { label: 'Línea Crítica', val: summary.worst.name, score: `${summary.worst.val}%`, icon: <AlertTriangle className="text-red-500" />, sub: 'Atención', color: 'red', id: 'worst' }
  ];

  return (
    <div className="space-y-10 pb-20 relative">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 px-2">
        <div>
           <h2 className="text-3xl font-black tracking-tight italic uppercase text-slate-100 italic">One Page Nube</h2>
           <p className="text-slate-500 font-bold uppercase tracking-[0.2em] text-[8px] mt-1 opacity-60 flex items-center gap-2">
              <CloudLightning size={10} className="text-red-600" /> Sincronización Mundial Activa
           </p>
        </div>
        <div className="flex items-center gap-3">
           <div className="bg-white/5 p-1 rounded-xl flex gap-1 border border-white/5">
              <select className="bg-transparent text-[9px] font-black uppercase text-white outline-none px-4 py-2 cursor-pointer" value={selectedMonth} onChange={e => setSelectedMonth(e.target.value)}>
                {monthNames.map((m, i) => <option key={m} value={i} className="bg-black">{m}</option>)}
              </select>
           </div>
           <button onClick={captureConsolidated} className="btn-primary h-12 px-6 text-[10px] font-black shadow-xl">
              <Camera size={16} className="mr-2" /> Reporte Grupal
           </button>
        </div>
      </div>

      <div id="consolidated-report" className="space-y-8">
         <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {statsCards.map((s, i) => (
              <motion.div key={i} layoutId={s.id || `card-${i}`} onClick={() => s.id && setZoomedCard(s.id)} className="glass-card p-6 border-b-2 border-b-white/5 cursor-pointer hover:bg-white/[0.04] transition-all group overflow-hidden">
                 <div className="flex justify-between items-start mb-4"><p className="text-[8px] font-black uppercase tracking-widest text-slate-500">{s.label}</p><div className="opacity-40">{s.icon}</div></div>
                 <div className="space-y-1"><h4 className={`text-xl font-black italic tracking-tighter truncate ${s.id === 'best' ? 'text-emerald-500' : s.id === 'worst' ? (summary.worst.val >= 90 ? 'text-emerald-500' : summary.worst.val >= 70 ? 'text-yellow-500' : 'text-red-500') : (summary.avg >= 90 ? 'text-emerald-500' : summary.avg >= 70 ? 'text-yellow-500' : 'text-slate-100')}`}>{s.val}</h4>
                    {s.score && <p className="text-[10px] font-black italic opacity-40">{s.score}</p>}
                 </div><p className="text-[7px] font-black uppercase tracking-[0.3em] text-slate-700 mt-2">{s.sub}</p>
              </motion.div>
            ))}
         </div>

         <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-12 glass-card p-10 min-h-[450px] flex flex-col justify-between relative overflow-hidden">
               <div className="absolute top-0 right-0 p-12 opacity-[0.02] pointer-events-none font-black italic text-[120px]">GLOBAL SYNC</div>
               <div className="flex justify-between items-end mb-12 border-b border-white/5 pb-8 relative z-10">
                  <div><h5 className="text-[10px] text-red-600 font-black uppercase">Consolidado Grupal de Red</h5><p className="text-2xl font-black italic uppercase">{monthNames[selectedMonth]} {selectedYear}</p></div>
                  <div className="hidden md:block text-right"><p className="text-[8px] font-black uppercase text-slate-600">AUDITORÍA PRO CLOUD v2.2</p><p className="text-[7px] font-semibold text-slate-800 uppercase italic mt-1 font-black">Sede Central</p></div>
               </div>
               <div className="flex-1 w-full relative z-10">
                 {loading ? <div className="text-center py-20 animate-pulse text-[10px] font-black uppercase italic">Extrayendo Datos de la Nube...</div> : monthlyData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <AreaChart data={monthlyData} margin={{ top: 20, right: 30, left: -20, bottom: 0 }}>
                        <defs><linearGradient id="colG" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#F40009" stopOpacity={0.3}/><stop offset="95%" stopColor="#F40009" stopOpacity={0}/></linearGradient></defs>
                        <XAxis dataKey="day" stroke="#475569" fontSize={8} tickLine={false} axisLine={false} /><YAxis stroke="#475569" fontSize={8} tickLine={false} axisLine={false} domain={[0, 100]} /><Tooltip contentStyle={{ background: '#000', border: 'none', borderRadius: '12px', fontSize: '10px' }} />
                        <Area type="monotone" dataKey="compliance" name="%" stroke="#F40009" strokeWidth={5} fillOpacity={1} fill="url(#colG)" /><Legend align="right" verticalAlign="top" iconType="circle" wrapperStyle={{ fontSize: '9px', fontWeight: 'bold' }} />
                      </AreaChart>
                    </ResponsiveContainer>
                 ) : <div className="flex flex-col items-center justify-center h-[300px] opacity-10"><BarChart3 size={60} className="mb-4" /><p className="text-xl font-black italic tracking-widest">NO DATA IN CLOUD</p></div>}
               </div>
            </div>
         </div>
      </div>

      <AnimatePresence>
        {zoomedCard && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setZoomedCard(null)} className="fixed inset-0 bg-black/60 backdrop-blur-md z-[100]" />
            <div className="fixed inset-0 flex items-center justify-center z-[101] p-4 pointer-events-none">
              <motion.div layoutId={zoomedCard} className={`glass-card p-12 w-full max-w-xl shadow-2xl border-t-4 pointer-events-auto relative ${zoomedCard === 'best' ? 'border-emerald-500' : (summary.worst.val >= 90 ? 'border-emerald-500' : summary.worst.val >= 70 ? 'border-yellow-500' : 'border-red-500')}`}>
                 <button onClick={() => setZoomedCard(null)} className="absolute top-6 right-6 w-10 h-10 bg-white/5 rounded-full flex items-center justify-center"><X size={20} /></button>
                 <div className="flex items-center gap-6 mb-10"><div className={`w-20 h-20 rounded-[2.5rem] flex items-center justify-center text-3xl font-black italic shadow-2xl ${zoomedCard === 'best' ? 'bg-emerald-500' : (summary.worst.val >= 90 ? 'bg-emerald-500' : summary.worst.val >= 70 ? 'bg-yellow-500' : 'bg-red-500')}`}>
{zoomedCard === 'best' ? <TrendingUp size={36} /> : <AlertTriangle size={36} />}</div><div><h5 className="text-[12px] font-black uppercase text-slate-500 mb-2">KPI CLOUD GLOBAL</h5><h2 className="text-4xl font-black italic tracking-tighter uppercase leading-none">{zoomedCard === 'best' ? summary.best.name : summary.worst.name}</h2></div></div>
                 <div className="grid grid-cols-2 gap-6 bg-white/[0.02] p-8 rounded-[2.5rem] border border-white/5"><div><p className="text-[9px] font-black uppercase text-slate-600 mb-2">Score Global</p><p className={`text-4xl font-black italic ${zoomedCard === 'best' ? 'text-emerald-500' : (summary.worst.val >= 90 ? 'text-emerald-500' : summary.worst.val >= 70 ? 'text-yellow-500' : 'text-red-500')}`}>{zoomedCard === 'best' ? summary.best.val : summary.worst.val}%</p></div><div><p className="text-[9px] font-black uppercase text-slate-600 mb-2">Estatus Nube</p><p className="text-sm font-black italic uppercase tracking-tighter">{zoomedCard === 'best' ? 'OPERACIÓN ÉLITE' : (summary.worst.val >= 70 ? 'CUMPLIMIENTO MEDIO' : 'INTERVENCIÓN REQUERIDA')}</p></div></div>
                 <div className="mt-8 flex items-center gap-4 text-[10px] font-black uppercase text-slate-600 tracking-widest px-4 opacity-50 italic"><Target size={14} className="text-red-600" /> Sincronización Mundial Activa para {summary.total} registros</div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>

      <div className="text-center opacity-10 pb-10">
         <p className="text-[7px] font-black uppercase tracking-[1.5em] italic">AUDITORÍA PRO • ATREUM TECH</p>
      </div>
    </div>
  );
};

export default Consolidated;
