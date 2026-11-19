import React, { useState } from 'react';
import { db, collection, addDoc, getDocs, deleteDoc, doc } from './firebase'; // 🔥 Nube
import { 
  Settings as SettingsIcon, 
  Download, 
  Upload, 
  Trash2, 
  Database, 
  FileJson, 
  FileSpreadsheet,
  ShieldAlert,
  CloudUpload,
  CheckCircle2,
  RefreshCcw,
  Zap,
  AlertCircle,
  XCircle,
  Skull,
  CloudIcon
} from 'lucide-react';
import { motion } from 'framer-motion';

const Settings = () => {
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [isDeletingAll, setIsDeletingAll] = useState(false);
  const [status, setStatus] = useState('');
  const [errorLog, setErrorLog] = useState(null);

  const addDocWithTimeout = async (coll, data, timeoutMs = 6000) => {
    return Promise.race([
      addDoc(coll, data),
      new Promise((_, reject) => setTimeout(() => reject(new Error("TIEMPO AGOTADO: El servidor no responde.")), timeoutMs))
    ]);
  };

  const importToCloud = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const importedData = JSON.parse(event.target.result);
        if (!Array.isArray(importedData)) throw new Error("JSON Inválido");
        if (!window.confirm(`Se subirán ${importedData.length} registros. ¿Confirmar?`)) return;
        setIsImporting(true);
        let count = 0;
        for (const audit of importedData) {
          try {
            setStatus(`Subiendo JSON: ${count + 1}/${importedData.length}`);
            await addDocWithTimeout(collection(db, "audits"), { ...audit, createdAt: audit.createdAt || Date.now() });
            count++;
          } catch (itemErr) { throw new Error(itemErr.message); }
        }
        alert(`¡Completado! ${count} registros en la Nube.`);
        window.location.reload();
      } catch (err) { alert("ERROR: " + err.message); } finally { setIsImporting(false); setStatus(''); }
    };
    reader.readAsText(file);
  };

  const generateBackupFile = (data, name) => {
    const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${name}_${new Date().toLocaleDateString()}.json`;
    link.click();
  };

  const exportCloudJSON = async () => {
    try {
      setIsExporting(true);
      setStatus('Extrayendo Nube...');
      const querySnapshot = await getDocs(collection(db, "audits"));
      const allData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      if (allData.length === 0) throw new Error("No hay datos en la Nube para exportar.");
      generateBackupFile(allData, 'Master_Cloud_Backup');
      alert("¡Backup Maestro descargado con éxito!");
    } catch (e) {
      alert("ERROR AL EXPORTAR: " + e.message);
    } finally {
      setIsExporting(false);
      setStatus('');
    }
  };

  const exportCloudCSV = async () => {
    try {
      setIsExporting(true);
      setStatus('Generando Reporte...');
      const querySnapshot = await getDocs(collection(db, "audits"));
      const allData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      if (allData.length === 0) throw new Error("No hay datos en la Nube.");
      const headers = ['Fecha', 'Auditor', 'Línea/Categoría', 'Cumplimiento (%)', 'Observaciones'];
      const rows = allData.map(a => [
        new Date(a.date).toLocaleDateString(),
        a.auditor,
        a.category,
        `${a.globalCompliance}%`,
        a.findings?.replace(/,/g, ';').replace(/\n/g, ' ') || 'Sin hallazgos'
      ]);
      const csvContent = "data:text/csv;charset=utf-16," + [headers, ...rows].map(e => e.join(",")).join("\n");
      const link = document.createElement("a");
      link.setAttribute("href", encodeURI(csvContent));
      link.setAttribute("download", `Reporte_Global_PlantaBOG_${new Date().toLocaleDateString()}.csv`);
      link.click();
      alert("¡Reporte Excel (Global) generado!");
    } catch (e) {
      alert("ERROR AL GENERAR CSV: " + e.message);
    } finally {
      setIsExporting(false);
      setStatus('');
    }
  };

  const nuclearDelete = async () => {
    const check1 = window.confirm("¿ATENCIÓN! Estás a punto de borrar TODA LA NUBE global.");
    if (!check1) return;
    try {
      setIsDeletingAll(true);
      setStatus('Creando Resguardo...');
      const querySnapshot = await getDocs(collection(db, "audits"));
      const allCloudData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      generateBackupFile(allCloudData, 'RESGUARDO_TOTAL_DESTRUCCION');
      let deletedCount = 0;
      for (const d of querySnapshot.docs) {
        setStatus(`Borrando Nube: ${deletedCount + 1}/${allCloudData.length}`);
        await deleteDoc(doc(db, "audits", d.id));
        deletedCount++;
      }
      localStorage.removeItem('audits');
      alert(`Reinicio Total. Se borraron ${deletedCount} registros globales.`);
      window.location.reload();
    } catch (e) { alert("ERROR: " + e.message); } finally { setIsDeletingAll(false); setStatus(''); }
  };

  const clearBrowserCache = () => {
    if (window.confirm("¿Borrar historial del navegador actual?")) {
       localStorage.removeItem('audits');
       window.location.reload();
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-12">
      <div className="flex items-center justify-between px-2">
        <div><h2 className="text-3xl font-black tracking-tight italic uppercase text-slate-100 italic">Central Administrativa</h2><p className="text-slate-500 font-bold uppercase tracking-[0.2em] text-[8px] mt-1 opacity-60 italic">GLOBAL CLOUD COMMAND</p></div>
        <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10 text-red-600 animate-pulse"><CloudIcon size={20} /></div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="glass-card p-10 border-t-8 border-red-600 space-y-8 bg-red-600/[0.02] relative group">
           <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:scale-110 transition-transform"><CloudUpload size={140} /></div>
           <h3 className="text-[11px] font-black uppercase text-red-500 mb-2 tracking-[0.4em] italic">Importar a la Nube</h3>
           <div className="relative">
              <input type="file" accept=".json" onChange={importToCloud} disabled={isImporting || isDeletingAll} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
              <div className="w-full h-32 border-2 border-dashed border-white/10 rounded-[2.5rem] flex flex-col items-center justify-center bg-white/[0.02] group-hover:bg-white/[0.05]">
                 {isImporting ? (<><RefreshCcw size={32} className="animate-spin text-red-500" /><span className="text-[10px] font-black uppercase text-red-500">{status}</span></>) : (<><FileJson size={32} className="text-slate-600" /><span className="text-[9px] font-black uppercase text-slate-500">Subir .json Maestro</span></>)}
              </div>
           </div>
        </div>

        <div className="glass-card p-10 space-y-10 group overflow-hidden relative">
           <h3 className="text-[10px] font-black uppercase text-slate-600 tracking-[0.4em] border-b border-white/5 pb-4">Exportación Global (Cloud)</h3>
           <div className="space-y-4">
              <button onClick={exportCloudCSV} disabled={isExporting} className="w-full flex items-center justify-between p-6 bg-white/[0.02] border border-white/5 rounded-[2rem] hover:bg-emerald-500/10 hover:border-emerald-500/20 transition-all font-black text-slate-300">
                <div className="flex items-center gap-4"><div className="p-3 bg-emerald-500/10 rounded-xl"><FileSpreadsheet size={16} className="text-emerald-500" /></div><span className="text-[11px] uppercase tracking-widest">{isExporting ? status : 'Descargar Excel Global'}</span></div>
              </button>
              <button onClick={exportCloudJSON} disabled={isExporting} className="w-full flex items-center justify-between p-6 bg-white/[0.02] border border-white/5 rounded-[2rem] hover:bg-blue-500/10 hover:border-blue-500/20 transition-all font-black text-slate-300">
                <div className="flex items-center gap-4"><div className="p-3 bg-blue-500/10 rounded-xl"><FileJson size={16} className="text-blue-500" /></div><span className="text-[11px] uppercase tracking-widest">{isExporting ? status : 'Backup Maestro Nube'}</span></div>
              </button>
           </div>
           <div className="absolute top-0 right-0 p-8 opacity-[0.02] pointer-events-none font-black italic text-8xl -rotate-12 translate-x-12">CLOUD</div>
        </div>

        <div className="md:col-span-2 glass-card p-10 border-2 border-red-600/20 bg-red-600/[0.03] overflow-hidden relative">
           <div className="absolute top-0 right-0 p-12 opacity-[0.05] pointer-events-none group-hover:rotate-12 transition-transform"><Skull size={100} className="text-red-600" /></div>
           <div className="flex flex-col md:flex-row items-center justify-between gap-10 relative z-10">
              <div className="space-y-4 max-w-xl">
                 <div className="flex items-center gap-4 text-red-500"><ShieldAlert size={24} /><h4 className="text-[12px] font-black uppercase tracking-[0.3em] italic">BORRADO MAESTRO GLOBAL</h4></div>
                 <p className="text-[10px] font-bold uppercase text-slate-500 tracking-widest opacity-60">⚠️ ACCIÓN NUCLEAR: Borra TODA la Nube para todos. Genera backup automático.</p>
              </div>
              <button onClick={nuclearDelete} disabled={isDeletingAll} className="h-20 px-12 bg-red-600 text-white rounded-[2rem] text-[11px] font-black uppercase tracking-[0.3em] shadow-2xl shadow-red-600/40 hover:bg-black hover:text-red-500 transition-all border-2 border-red-600">{isDeletingAll ? status : 'Borrar Todo'}</button>
           </div>
        </div>

        <button onClick={clearBrowserCache} className="md:col-span-2 h-14 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black uppercase text-slate-600 hover:text-white transition-all tracking-[0.5em] italic">Limpiar Espejo Local (Sin afectar Nube)</button>
      </div>
      <div className="text-center opacity-10 py-10">
         <p className="text-[7px] font-black uppercase tracking-[1.5em] italic">AUDITORÍA PRO • ATREUM TECH</p>
      </div>
    </div>
  );
};

export default Settings;
