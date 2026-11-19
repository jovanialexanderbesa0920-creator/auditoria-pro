import React, { useState, useEffect } from 'react';
import { dataService } from './dataService'; // 🚀 Azure
import { LayoutDashboard, PlusCircle, TrendingUp, AlertTriangle, ChevronRight, Activity, Clock, BarChart3, PieChart as PieChartIcon, Info } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, PieChart, Pie, Cell, Legend } from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';

const Dashboard = ({ onNavigate }) => {
  const [recentAudits, setRecentAudits] = useState([]);
  const [stats, setStats] = useState({ avgCompliance: 0, totalAudits: 0, criticalIssues: 0 });
  const [chartType, setChartType] = useState('area');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCloud = async () => {
      setLoading(true);
      try {
        const allData = await dataService.getAudits();
        
        if (allData.length > 0) {
          setRecentAudits(allData.slice(0, 5));
          
          const avg = allData.reduce((acc, curr) => acc + (curr.globalCompliance || 0), 0) / allData.length;
          setStats({
            avgCompliance: Math.round(avg),
            totalAudits: allData.length,
            criticalIssues: allData.filter(a => a.globalCompliance < 70).length
          });
        }
      } catch (e) { console.error(e); } finally { setLoading(false); }
    };
    fetchCloud();
  }, []);

  const realChartData = recentAudits.slice().reverse().map((a, i) => ({
    name: a.date ? new Date(a.date).toLocaleDateString([], { month: 'short', day: 'numeric' }) : `N/A`,
    val: a.globalCompliance,
    auditor: a.auditor
  }));

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 px-2">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-white leading-tight uppercase italic font-bold">Dashboard</h1>
          <p className="text-slate-500 font-bold uppercase tracking-[0.2em] text-[8px] mt-1 opacity-70">Sincronizado • Cloud Database</p>
        </div>
        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => onNavigate('new')} className="btn-primary h-12 px-6 shadow-xl shadow-red-600/10 text-xs">
          <PlusCircle size={18} /> <span>Nueva Auditoría</span>
        </motion.button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { 
            label: 'Score Global', 
            val: `${stats.avgCompliance}%`, 
            icon: <TrendingUp size={20} />, 
            color: stats.avgCompliance >= 90 ? 'text-emerald-500' : stats.avgCompliance >= 70 ? 'text-yellow-500' : 'text-red-500', 
            note: 'Promedio Nube' 
          },
          { label: 'Inspecciones', val: stats.totalAudits, icon: <Activity size={20} />, color: 'text-blue-500', note: 'Total Global' },
          { label: 'Fallas Críticas', val: stats.criticalIssues, icon: <AlertTriangle size={20} />, color: 'text-red-600', note: 'Reportes <70%' }
        ].map((s, i) => (
          <motion.div key={i} initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="glass-card p-6 border-l-2" style={{ borderLeftColor: s.color.includes('emerald') ? '#10b981' : s.color.includes('yellow') ? '#eab308' : s.color.includes('blue') ? '#3b82f6' : '#F40009' }}>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-2">{s.label}</p>
            <div className="flex items-center justify-between"><h2 className={`text-3xl font-black italic tracking-tighter ${s.color}`}>{s.val}</h2><div className="opacity-10">{s.icon}</div></div>
            <p className="text-[7px] font-black uppercase tracking-widest text-slate-600 mt-2 opacity-50 italic flex items-center gap-1"><Info size={8} /> {s.note}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 glass-card p-8 min-h-[400px] flex flex-col justify-between overflow-hidden">
          <div className="flex justify-between items-center mb-6">
            <div><h3 className="text-lg font-black italic uppercase text-slate-200">Tendencia Realtime</h3><p className="text-[8px] font-black uppercase text-slate-600 tracking-widest opacity-40">Cloud Sync Analysis</p></div>
            <div className="flex bg-white/5 p-1 rounded-xl"><button onClick={() => setChartType('area')} className={`p-1.5 rounded-lg transition-all ${chartType === 'area' ? 'bg-red-600 shadow-md' : 'opacity-20 hover:opacity-100'}`}><BarChart3 size={14} /></button><button onClick={() => setChartType('pie')} className={`p-1.5 rounded-lg transition-all ${chartType === 'pie' ? 'bg-red-600 shadow-md' : 'opacity-20 hover:opacity-100'}`}><PieChartIcon size={14} /></button></div>
          </div>
          <div className="flex-1 w-full mt-4">
            {loading ? <div className="text-center py-20 animate-pulse text-[10px] font-black uppercase">Actualizando Datos...</div> : recentAudits.length > 0 ? (
                chartType === 'area' ? (
                    <ResponsiveContainer width="100%" height={260}><AreaChart data={realChartData} margin={{ left: -30 }}><defs><linearGradient id="gReal" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#F40009" stopOpacity={0.2}/><stop offset="95%" stopColor="#F40009" stopOpacity={0}/></linearGradient></defs><Area type="monotone" dataKey="val" name="Comp %" stroke="#F40009" strokeWidth={4} fill="url(#gReal)" /><XAxis dataKey="name" stroke="#475569" fontSize={8} tickLine={false} axisLine={false} /><YAxis hide domain={[0, 100]} /><Tooltip contentStyle={{ background: '#07080b', border: '1px solid #ffffff10', borderRadius: '12px', fontSize: '10px' }} /><Legend verticalAlign="top" align="right" iconType="circle" wrapperStyle={{ fontSize: '9px', fontWeight: 'bold' }} /></AreaChart></ResponsiveContainer>
                ) : (
                    <div className="flex flex-col items-center justify-center h-[260px]"><ResponsiveContainer width="100%" height={230}><PieChart><Pie data={[{ value: stats.avgCompliance, name: 'OK' }, { value: 100 - stats.avgCompliance, name: 'NO' }]} innerRadius={60} outerRadius={80} dataKey="value" stroke="none"><Cell fill="#F40009" /><Cell fill="rgba(255,255,255,0.03)" /></Pie><Tooltip /><Legend align="center" verticalAlign="bottom" iconType="circle" wrapperStyle={{ fontSize: '9px', fontWeight: 'bold' }} /></PieChart></ResponsiveContainer><div className="absolute flex flex-col items-center justify-center"><span className="text-3xl font-black italic">{stats.avgCompliance}%</span><span className="text-[7px] font-black uppercase opacity-20 italic">Cloud Scope</span></div></div>
                )
            ) : <p className="text-center opacity-10 py-20 italic font-black text-xl">ESPERANDO DATOS DE LA NUBE...</p>}
          </div>
        </div>

        <div className="lg:col-span-4 glass-card p-6 flex flex-col">
          <h3 className="text-lg font-black italic uppercase mb-6 flex items-center justify-between border-b border-white/5 pb-4">Últimos Registros <Clock size={16} className="text-red-600 opacity-50" /></h3>
          <div className="space-y-4 flex-1">
            {recentAudits.map((a) => (
              <div key={a.id} className="p-4 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-between group hover:bg-white/[0.04] transition-all cursor-pointer"><div className="flex items-center gap-4 overflow-hidden"><div className={`text-md font-black italic min-w-[40px] ${a.globalCompliance >= 90 ? 'text-emerald-500' : a.globalCompliance >= 70 ? 'text-yellow-500' : 'text-red-500'}`}>{a.globalCompliance}%</div><div className="overflow-hidden"><h4 className="text-[10px] font-black uppercase tracking-tight truncate w-32">{a.category}</h4><p className="text-[7px] text-slate-600 font-bold uppercase truncate">{a.auditor}</p></div></div><ChevronRight size={14} className="opacity-0 group-hover:opacity-100 transition-all text-red-500" /></div>
            ))}
          </div>
        </div>
      </div>

      <div className="text-center opacity-10 pb-10">
         <p className="text-[7px] font-black uppercase tracking-[1.5em] italic">AUDITORÍA PRO • ATREUM TECH</p>
      </div>
    </div>
  );
};

export default Dashboard;
