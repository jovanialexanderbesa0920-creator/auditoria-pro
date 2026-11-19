import React, { useState, useEffect, useRef } from 'react';
import { dataService } from './dataService'; // 🚀 Conexión Azure/API
import { Search, Filter, Trash2, Calendar, User, LayoutGrid, ChevronDown, FilterX, AlertCircle, CheckCircle, Camera, FileText, CloudRain } from 'lucide-react';
import { ResponsiveContainer, Tooltip, Cell, PieChart, Pie, Legend } from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import { toPng } from 'html-to-image';
import download from 'downloadjs';

const History = () => {
  const [audits, setAudits] = useState([]);
  const [filteredAudits, setFilteredAudits] = useState([]);
  const [expandedId, setExpandedId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ auditor: 'Todos', category: 'Todas', search: '', month: 'Todos', year: '2026' });

  // 🌩️ FETCH DESDE FIREBASE
  const fetchAudits = async () => {
    setLoading(true);
    try {
      const data = await dataService.getAudits();
      setAudits(data);
      setFilteredAudits(data);
    } catch (e) { 
      console.error("Error al leer Azure:", e);
      // Fallback local
      const local = JSON.parse(localStorage.getItem('audits') || '[]');
      setAudits(local);
      setFilteredAudits(local);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAudits();
  }, []);

  useEffect(() => {
    let res = [...audits];
    if (filters.auditor !== 'Todos') res = res.filter(a => a.auditor === filters.auditor);
    if (filters.category !== 'Todas') res = res.filter(a => a.category === filters.category);
    if (filters.month !== 'Todos') {
      res = res.filter(a => {
        const d = new Date(a.date);
        return d.getMonth().toString() === filters.month;
      });
    }
    if (filters.search.trim()) {
      const s = filters.search.toLowerCase();
      res = res.filter(a => (a.auditor?.toLowerCase().includes(s)) || (a.category?.toLowerCase().includes(s)));
    }
    setFilteredAudits(res);
  }, [filters, audits]);

  const handleDelete = async (id) => {
    if (window.confirm("¿Seguro que desea eliminar de la NUBE de Azure? (Acción irreversible)")) {
      try {
        await dataService.deleteAudit(id);
        const updated = audits.filter(a => a.id !== id);
        setAudits(updated);
        setFilteredAudits(updated);
      } catch (e) {
        alert("Error al eliminar del servidor de Azure.");
      }
    }
  };

  const downloadReportImage = (id) => {
    const node = document.getElementById(`report-${id}`);
    if (!node) return;
    toPng(node, { backgroundColor: '#07080b', style: { borderRadius: '24px' } })
      .then((dataUrl) => download(dataUrl, `CloudReport_${id}.png`))
      .catch((err) => console.error(err));
  };

  const auditors = ['Todos', ...new Set(audits.map(a => a.auditor || 'Desconocido'))];
  const categories = ['Todas', ...new Set(audits.map(a => a.category || 'General'))];
  const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 px-2">
        <div>
           <h2 className="text-3xl font-black tracking-tight italic uppercase text-slate-100 italic">Historial Global</h2>
           <p className="text-[8px] font-black uppercase text-red-600 tracking-widest mt-1 italic flex items-center gap-2">
               <div className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse"></div> CLOUD DATABASE CONNECTED
           </p>
        </div>
        <button onClick={fetchAudits} className="bg-white/5 py-4 px-8 rounded-2xl border border-white/10 flex items-center gap-4 hover:bg-white/10 transition-all cursor-pointer group">
           <CloudRain size={16} className="text-red-500 group-hover:rotate-12 transition-transform" />
           <span className="font-black text-xl italic">{audits.length}</span>
           <span className="text-[8px] font-black uppercase text-slate-600 opacity-50 tracking-widest">Reports</span>
        </button>
      </div>

      <div className="glass-card p-6 grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="md:col-span-1 bg-white/5 rounded-2xl border border-white/5 flex items-center px-4">
          <Search className="text-slate-600" size={14} />
          <input type="text" placeholder="BUSCAR..." className="bg-transparent border-none outline-none w-full h-12 pl-3 text-[9px] uppercase font-black text-white" value={filters.search} onChange={(e) => setFilters({ ...filters, search: e.target.value })} />
        </div>
        <div className="bg-white/5 rounded-2xl p-3 flex items-center gap-3 border border-white/10"><User size={12} className="text-red-500" />
          <select className="bg-transparent text-[9px] font-black uppercase text-white outline-none w-full" value={filters.auditor} onChange={(e) => setFilters({ ...filters, auditor: e.target.value })}>{auditors.map(a => <option key={a} value={a} className="bg-[#07080b]">{a}</option>)}</select>
        </div>
        <div className="bg-white/5 rounded-2xl p-3 flex items-center gap-3 border border-white/10"><LayoutGrid size={12} className="text-red-500" />
          <select className="bg-transparent text-[9px] font-black uppercase text-white outline-none w-full" value={filters.category} onChange={(e) => setFilters({ ...filters, category: e.target.value })}>{categories.map(c => <option key={c} value={c} className="bg-[#07080b]">{c}</option>)}</select>
        </div>
        <div className="bg-white/5 rounded-2xl p-3 flex items-center gap-3 border border-white/10"><Calendar size={12} className="text-red-500" />
          <select className="bg-transparent text-[9px] font-black uppercase text-white outline-none w-full" value={filters.month} onChange={(e) => setFilters({ ...filters, month: e.target.value })}>{['Todos', ...Array.from({length: 12}, (_, i) => i.toString())].map(m => <option key={m} value={m} className="bg-[#07080b]">{m === 'Todos' ? 'MES' : monthNames[parseInt(m)].toUpperCase()}</option>)}</select>
        </div>
        <button onClick={() => setFilters({ auditor: 'Todos', category: 'Todas', search: '', month: 'Todos', year: '2026' })} className="btn-secondary h-12 text-[8px] uppercase font-black"><FilterX size={12} /></button>
      </div>

      <div className="space-y-4 pb-20">
        <AnimatePresence>
          {loading ? (
            <div className="text-center py-20 animate-pulse text-[10px] font-black uppercase tracking-widest text-slate-700">Sincronizando con Nube...</div>
          ) : filteredAudits.length > 0 ? filteredAudits.map((audit) => (
            <motion.div key={audit.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card overflow-hidden">
              <div className="p-6 flex flex-wrap items-center justify-between gap-6 cursor-pointer" onClick={() => setExpandedId(expandedId === audit.id ? null : audit.id)}>
                <div className="flex items-center gap-8">
                   <div className={`text-2xl font-black italic w-16 h-16 rounded-2xl flex items-center justify-center bg-white/[0.03] border-2 shadow-2xl ${audit.globalCompliance >= 90 ? 'text-emerald-500 border-emerald-500/10' : audit.globalCompliance >= 70 ? 'text-yellow-500 border-yellow-500/10' : 'text-red-500 border-red-500/10'}`}>{audit.globalCompliance}%</div>
                   <div>
                    <h4 className="font-black text-lg tracking-tighter uppercase italic">{audit.category || 'N/A'}</h4>
                    <p className="text-[9px] text-slate-500 font-black uppercase tracking-[0.2em] mt-1 flex items-center gap-4 italic"><span className="text-red-600 px-2 py-0.5 bg-red-600/5 rounded-md">{audit.auditor || 'Auditor'}</span><span>{new Date(audit.date).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}</span></p>
                   </div>
                </div>
                <div className="flex items-center gap-3">
                  <button onClick={(e) => { e.stopPropagation(); handleDelete(audit.id); }} className="w-10 h-10 flex items-center justify-center rounded-xl bg-red-600/5 text-red-500/30 hover:bg-red-600 hover:text-white transition-all"><Trash2 size={16} /></button>
                  <ChevronDown className={`opacity-10 transition-transform ${expandedId === audit.id ? 'rotate-180 opacity-100 text-red-500' : ''}`} size={24} />
                </div>
              </div>
              {expandedId === audit.id && (
                <div id={`report-${audit.id}`} className="p-10 bg-[#0c0d12] border-t border-white/5 space-y-12 relative overflow-hidden">
                  <div className="flex justify-between items-start relative z-10">
                     <div className="flex items-center gap-4">
                        <div className="p-3 bg-red-600 rounded-xl"><AlertCircle size={20} className="text-white" /></div>
                        <div><h5 className="text-[10px] text-red-500 font-black uppercase tracking-[0.3em] mb-1">Criterios de Auditoría</h5><p className="text-[8px] font-black uppercase text-slate-500 opacity-60">Reporte Sincronizado en Nube</p></div>
                     </div>
                     <button onClick={() => downloadReportImage(audit.id)} className="btn-primary h-10 px-5 text-[9px] bg-white text-black hover:bg-slate-200 shadow-xl"><Camera size={14} className="mr-2" /> Capturar Imagen</button>
                  </div>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 relative z-10">
                    <div className="space-y-6">
                       <div className="grid gap-3 max-h-[450px] overflow-y-auto pr-3 custom-scroll">
                          {audit.formats.map((f, i) => {
                            let failed = [];
                            try { failed = Object.entries(JSON.parse(f.criteria)).filter(([_, val]) => !val); } catch (e) { }
                            return (
                              <div key={i} className="bg-white/[0.03] p-6 rounded-[1.5rem] border border-white/5">
                                 <div className="flex justify-between items-start mb-4"><span className="text-[11px] font-black uppercase italic text-slate-200">{f.name}</span><div className={`px-2.5 py-1 rounded-lg text-[9px] font-black ${f.compliance >= 90 ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>{f.compliance}%</div></div>
                                 {failed.length > 0 ? <div className="flex flex-wrap gap-2 mt-4">{failed.map(([crit]) => (<div key={crit} className="px-3 py-1.5 rounded-lg bg-red-500/5 border border-red-500/20 text-red-500 text-[9px] font-black uppercase flex items-center gap-2 italic"><AlertCircle size={10} /> {crit}</div>))}</div> : <div className="flex items-center gap-2 text-[9px] font-black uppercase text-emerald-500/20 tracking-widest mt-4"><CheckCircle size={10} /> Sin fallas reportadas</div>}
                              </div>
                            );
                          })}
                       </div>
                    </div>
                    <div className="space-y-12">
                       <div className="space-y-4"><h5 className="text-[10px] text-red-500 font-black uppercase tracking-[0.3em] flex items-center justify-between">Observación General<FileText size={12} className="opacity-40" /></h5><div className="p-8 bg-white/[0.02] rounded-[2rem] text-xs font-medium italic border border-white/5 leading-relaxed text-slate-400">{audit.findings || 'Sin hallazgos reportados.'}</div></div>
                       <div className="flex flex-col items-center justify-center p-8 bg-white/[0.01] rounded-[2rem] border border-white/5">
                         <div className="flex items-center justify-center h-[200px] w-full">
                           <ResponsiveContainer><PieChart><Pie data={[{ value: audit.globalCompliance || 0, name: 'OK' }, { value: 100 - (audit.globalCompliance || 0), name: 'Error' }]} innerRadius={60} outerRadius={85} paddingAngle={8} dataKey="value" stroke="none"><Cell fill={audit.globalCompliance >= 90 ? '#10b981' : audit.globalCompliance >= 70 ? '#eab308' : '#F40009'} /><Cell fill="rgba(255,255,255,0.03)" /></Pie><Tooltip /><Legend align="center" verticalAlign="bottom" iconType="circle" wrapperStyle={{ fontSize: '9px', fontWeight: 'bold' }} /></PieChart></ResponsiveContainer>
                           <div className="absolute flex flex-col items-center justify-center"><span className="text-4xl font-black italic tracking-tighter">{audit.globalCompliance || 0}%</span><span className="text-[8px] font-black uppercase opacity-40 italic">Final Score</span></div>
                         </div>
                       </div>
                    </div>
                  </div>
                  <div className="pt-10 border-t border-white/5 flex justify-between items-end opacity-20"><p className="text-[7px] font-medium uppercase tracking-[0.2em]">CLOUD ID: {audit.id}</p><p className="text-[9px] font-black italic">AUDITORÍA PRO CLOUD</p></div>
                </div>
              )}
            </motion.div>
          )) : <div className="text-center py-40 opacity-10 font-black tracking-[0.4em] text-2xl">HISTORIAL VACÍO</div>}
        </AnimatePresence>
      </div>

      <div className="text-center opacity-10 pb-10">
         <p className="text-[7px] font-black uppercase tracking-[1.5em] italic">AUDITORÍA PRO • ATREUM TECH</p>
      </div>
    </div>
  );
};

export default History;
