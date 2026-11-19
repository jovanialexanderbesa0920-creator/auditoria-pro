import React, { useState, useEffect } from 'react';
import { dataService } from './dataService'; // 🚀 Conexión Azure/API
import { ESTRUCTURA_FORMATOS, CRITERIOS_EVALUACION, ROJO_MARCA } from './constants';
import { 
  ChevronLeft, 
  ChevronRight, 
  Save, 
  ShieldCheck,
  Search,
  Check,
  X,
  Users,
  MessageSquare,
  Zap,
  Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Cell, Legend, Tooltip } from 'recharts';

const NewAudit = ({ onCancel, onSaveComplete }) => {
  const [step, setStep] = useState(1);
  const [auditor, setAuditor] = useState('');
  
  const categories = Object.keys(ESTRUCTURA_FORMATOS || {});
  const [category, setCategory] = useState(categories[0] || '');
  const [findings, setFindings] = useState('');
  const [auditData, setAuditData] = useState({});
  const [isSaving, setIsSaving] = useState(false);

  const commonFailures = ["Falla etiquetadora", "Puntos limpieza OK", "Fuga detectada", "Ajuste torque", "Envase sin codificar", "Tripulación OK"];

  useEffect(() => {
    if (!category || !ESTRUCTURA_FORMATOS[category]) return;
    const initialData = {};
    ESTRUCTURA_FORMATOS[category].forEach(f => {
      initialData[f] = (CRITERIOS_EVALUACION || []).reduce((acc, crit) => ({ ...acc, [crit]: false }), {});
    });
    setAuditData(initialData);
  }, [category]);

  const handleCheck = (format, criterion) => {
    if (!auditData[format]) return;
    setAuditData(prev => ({
      ...prev,
      [format]: { ...prev[format], [criterion]: !prev[format][criterion] }
    }));
  };

  const calculateFormatCompliance = (format) => {
    if (!auditData || !auditData[format]) return 0;
    const checks = Object.values(auditData[format]);
    if (checks.length === 0) return 0;
    const passed = checks.filter(c => c).length;
    return Math.round((passed / checks.length) * 100);
  };

  const calculateGlobalCompliance = () => {
    const formats = Object.keys(auditData);
    if (formats.length === 0) return 0;
    const avg = formats.reduce((acc, f) => acc + calculateFormatCompliance(f), 0) / formats.length;
    return Math.round(avg);
  };

  const getComplianceColor = (comp) => {
    if (comp >= 90) return 'text-emerald-500';
    if (comp >= 70) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getComplianceBorderColor = (comp) => {
    if (comp >= 90) return '#10b981';
    if (comp >= 70) return '#eab308';
    return '#F40009';
  };

  const addQuickFinding = (text) => setFindings(prev => prev ? `${prev}\n- ${text}` : `- ${text}`);

  const handleSave = async () => {
    if (isSaving) return;
    setIsSaving(true);
    
    const payload = {
      auditor: auditor || 'Anónimo',
      category: category || 'General',
      findings: findings || 'Certificado Firma Digital Autodefecto',
      date: new Date().toISOString(),
      globalCompliance: calculateGlobalCompliance(),
      formats: Object.entries(auditData).map(([name, criteria]) => ({
        name,
        compliance: calculateFormatCompliance(name),
        criteria: JSON.stringify(criteria)
      })),
      createdAt: Date.now()
    };

    try {
      await dataService.saveAudit(payload);
      const existing = JSON.parse(localStorage.getItem('audits') || '[]');
      localStorage.setItem('audits', JSON.stringify([payload, ...existing]));
      setTimeout(() => { setIsSaving(false); onSaveComplete(); }, 300);
    } catch (e) { 
      alert("Error al guardar en Azure Cloud.");
      setIsSaving(false); 
    }
  };

  const globalComp = calculateGlobalCompliance();

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-20">
      <div className="flex items-center justify-between px-2">
        <div className="flex items-center gap-4">
          <motion.button whileHover={{ scale: 1.1, x: -5 }} onClick={onCancel} className="w-10 h-10 flex items-center justify-center glass-morphism rounded-xl">
            <ChevronLeft size={20} />
          </motion.button>
          <div>
            <h2 className="text-2xl font-black tracking-tight uppercase italic text-white italic">Auditoría en Nube</h2>
            <p className="text-[8px] font-black uppercase text-red-600 tracking-widest mt-1 italic flex items-center gap-2">
               <div className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse"></div> CLOUD SYNC ACTIVE
            </p>
          </div>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {step === 1 ? (
          <motion.div key="step1" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="glass-card p-10 max-w-xl mx-auto shadow-2xl relative overflow-hidden mt-8">
            <div className="absolute top-0 right-0 p-8 opacity-5"><ShieldCheck size={80} /></div>
            <h3 className="text-[10px] font-black uppercase text-red-500 mb-8 border-b border-white/5 pb-4 tracking-[0.3em]">Auditoría Logística</h3>
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-500">Auditor Responsable</label>
                <input type="text" className="input-field h-14 text-xs font-black uppercase tracking-wider" value={auditor} onChange={(e) => setAuditor(e.target.value)} />
              </div>
              <div className="space-y-2">
                <label className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-500">Línea de Proceso</label>
                <select className="input-field h-14 text-xs font-black uppercase tracking-wider appearance-none bg-black" value={category} onChange={(e) => setCategory(e.target.value)}>
                  {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
              </div>
              <button disabled={!auditor} onClick={() => setStep(2)} className="btn-primary w-full h-14 mt-4 text-[11px] font-black tracking-widest uppercase">Iniciar Sync <ChevronRight size={18} className="ml-2" /></button>
            </div>
          </motion.div>
        ) : step === 2 ? (
          <motion.div key="step2" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-4">
            <div className="lg:col-span-4 space-y-4">
               <div className="glass-card p-6 bg-white/[0.02] sticky top-24">
                  <h4 className="text-[9px] font-black text-red-500 uppercase tracking-widest mb-6 border-b border-white/5 pb-4">Live Performance Hub</h4>
                  <div className="flex items-center gap-4 mb-8">
                     <div className={`w-20 h-20 rounded-[2rem] border-2 flex items-center justify-center text-2xl font-black italic shadow-2xl transition-colors duration-500 ${getComplianceColor(globalComp)}`} style={{ borderColor: `${getComplianceBorderColor(globalComp)}20` }}>
                        {globalComp}%
                     </div>
                     <div className="overflow-hidden"><p className="font-black text-xs text-slate-100 italic">Score Actual</p><p className="text-[8px] text-slate-600 font-black uppercase truncate mt-1">{category}</p></div>
                  </div>
                  <div className="h-[240px] w-full">
                     <ResponsiveContainer>
                       <BarChart data={Object.keys(auditData).map(f => ({ name: f.substring(0,10), score: calculateFormatCompliance(f) }))} layout="vertical">
                          <XAxis type="number" domain={[0, 100]} hide />
                          <YAxis dataKey="name" type="category" width={60} tick={{fontSize: 7, fill: '#475569', fontWeight: 'bold'}} />
                          <Bar dataKey="score" name="Cumplimiento (%)" radius={[0, 6, 6, 0]}>
                             {Object.keys(auditData).map((_, i) => {
                               const c = calculateFormatCompliance(Object.keys(auditData)[i]);
                               return <Cell key={i} fill={getComplianceBorderColor(c)} />;
                             })}
                          </Bar>
                          <Legend verticalAlign="bottom" align="center" wrapperStyle={{ fontSize: '8px', fontWeight: 'black', paddingTop: '20px' }} iconType="circle" />
                       </BarChart>
                     </ResponsiveContainer>
                  </div>
                  <button onClick={() => setStep(3)} className="btn-primary w-full h-14 mt-6 shadow-red-600/10 text-[10px] font-black uppercase tracking-widest">Confirmar Datos <ChevronRight size={18} className="ml-2" /></button>
               </div>
            </div>

            <div className="lg:col-span-8 space-y-4 max-h-[80vh] overflow-y-auto custom-scroll pr-3">
              {ESTRUCTURA_FORMATOS[category]?.map((format, idx) => {
                const comp = calculateFormatCompliance(format);
                return (
                  <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.05 }} key={format} className="glass-card p-6 border-l-2 group transition-all duration-500" style={{ borderLeftColor: getComplianceBorderColor(comp)}}>
                    <div className="flex justify-between items-center mb-5">
                      <div className="flex items-center gap-3">
                         <div className={`w-8 h-8 rounded-lg flex items-center justify-center bg-white/5 border border-white/5 font-black text-[10px] italic transition-colors ${getComplianceColor(comp)}`}>{idx + 1}</div>
                         <h4 className="font-black text-xs text-slate-200 uppercase tracking-tight italic">{format}</h4>
                      </div>
                      <span className={`font-black text-sm italic transition-colors ${getComplianceColor(comp)}`}>{comp}%</span>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                      {CRITERIOS_EVALUACION.map(crit => (
                        <button key={crit} onClick={() => handleCheck(format, crit)} className={`p-2.5 rounded-xl border-2 text-[8px] font-black uppercase transition-all duration-300 ${
                          auditData[format]?.[crit] ? 'bg-red-600/10 border-red-600 text-white shadow-lg shadow-red-600/10 scale-[1.05]' : 'bg-white/[0.02] border-transparent text-slate-700 hover:bg-white/5'
                        }`}>
                           {crit === 'Limpieza' ? '🫧' : crit === 'Válvulas' ? '🔧' : crit === 'Envase' ? '🍾' : crit === 'Etiquetado' ? '🏷️' : crit === 'Codificado' ? '🔢' : '⚙️'} 
                           <span className="block mt-1 font-black">{crit}</span>
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </motion.div>
        ) : (
          <motion.div key="step3" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-12 max-w-3xl mx-auto space-y-10 shadow-2xl relative text-center">
            <div className="flex flex-col items-center">
               <div className={`w-24 h-24 rounded-[2.5rem] border-2 flex items-center justify-center text-4xl font-black italic mb-6 shadow-2xl transition-colors ${getComplianceColor(globalComp)}`} style={{ borderColor: `${getComplianceBorderColor(globalComp)}20` }}>
                  {globalComp}%
               </div>
               <h3 className="text-xl font-black italic uppercase tracking-tighter text-slate-200">Sincronización de Hallazgos</h3>
               <p className="text-[8px] font-black uppercase text-slate-600 tracking-widest mt-2">ALMACENAMIENTO EN LA NUBE ACTIVO</p>
            </div>
            <div className="space-y-6">
              <div className="flex flex-wrap gap-2 justify-center py-4 border-y border-white/5">
                 {commonFailures.map(fail => (<button key={fail} onClick={() => addQuickFinding(fail)} className="px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-[8px] font-black uppercase text-slate-500 hover:bg-red-600 hover:text-white transition-all flex items-center gap-2 italic"><Zap size={10} className="text-yellow-500" /> {fail}</button>))}
              </div>
              <div className="space-y-3 text-left">
                <label className="text-[9px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-2 italic"><MessageSquare size={12} className="text-red-500" /> Observaciones Finales</label>
                <textarea className="input-field min-h-[160px] text-xs font-medium resize-none border-white/5 bg-black/40 shadow-inner p-6 rounded-[2rem] tracking-tight" placeholder="Escriba aquí..." value={findings} onChange={(e) => setFindings(e.target.value)}/>
              </div>
            </div>
            <div className="flex gap-4 pt-4">
              <button onClick={() => setStep(2)} className="btn-secondary h-14 flex-1 text-[10px] tracking-widest uppercase font-black">Volver</button>
              <button onClick={handleSave} disabled={isSaving || !findings} className="btn-primary h-14 flex-[2] text-[10px] tracking-widest font-black uppercase shadow-red-600/20">{isSaving ? "Sincronizando..." : "Enviar a la Nube"} <Save size={18} className="ml-2" /></button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <div className="text-center opacity-10 py-10">
         <p className="text-[7px] font-black uppercase tracking-[1em] italic">AUDITORÍA PRO • ATREUM TECH</p>
      </div>
    </div>
  );
};

export default NewAudit;
