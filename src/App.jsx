import React, { useState, useEffect } from 'react';
import Dashboard from './Dashboard';
import NewAudit from './NewAudit';
import History from './History';
import Settings from './Settings';
import Consolidated from './Consolidated';
import { 
  Menu, 
  X, 
  LayoutDashboard, 
  PlusCircle, 
  History as HistoryIcon, 
  ShieldCheck,
  ChevronRight,
  Settings as SettingsIcon,
  BarChart3
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const renderContent = () => {
    switch(activeTab) {
      case 'dashboard': return <Dashboard onNavigate={setActiveTab} />;
      case 'new': return <NewAudit onCancel={() => setActiveTab('dashboard')} onSaveComplete={() => setActiveTab('history')} />;
      case 'history': return <History />;
      case 'consolidated': return <Consolidated />;
      case 'settings': return <Settings />;
      default: return <Dashboard onNavigate={setActiveTab} />;
    }
  };

  const menuItems = [
    { id: 'dashboard', icon: <LayoutDashboard size={18} />, label: 'Dashboard' },
    { id: 'new', icon: <PlusCircle size={18} />, label: 'Nueva Auditoría' },
    { id: 'history', icon: <HistoryIcon size={18} />, label: 'Historial' },
    { id: 'consolidated', icon: <BarChart3 size={18} />, label: 'Consolidado' },
    { id: 'settings', icon: <SettingsIcon size={18} />, label: 'Ajustes' },
  ];

  return (
    <div className="flex min-h-screen bg-[#07080b] text-white overflow-x-hidden">
      {/* Sidebar Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 glass-morphism border-r border-white/5 
        transform transition-all duration-500 lg:translate-x-0 lg:static
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="p-6 h-full flex flex-col">
          {/* Logo Section */}
          <div className="flex items-center gap-3 mb-12">
             <div className="w-10 h-10 bg-red-600 rounded-xl flex items-center justify-center shadow-red-600/20 shadow-2xl group transition-all duration-500 hover:rotate-12 cursor-pointer">
               <ShieldCheck size={24} className="text-white" />
             </div>
             <div>
               <h1 className="text-xl font-black tracking-tight italic">
                 Auditoría <span className="text-red-600 italic">Pro</span>
               </h1>
               <p className="text-[9px] text-slate-500 uppercase font-black tracking-tighter italic">Sede Central</p>
             </div>
          </div>

          {/* Navigation */}
          <nav className="space-y-1 flex-1">
            <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest px-4 mb-4 opacity-30">Módulo de Auditoría</p>
            {menuItems.map(item => (
              <button
                key={item.id}
                onClick={() => { setActiveTab(item.id); setSidebarOpen(false); }}
                className={`
                  w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-300
                  ${activeTab === item.id 
                    ? 'bg-red-600 text-white shadow-xl shadow-red-600/30 font-bold' 
                    : 'text-slate-400 hover:bg-white/5 hover:text-white'}
                `}
              >
                <div className="flex items-center gap-4">
                  {item.icon}
                  <span className="text-[10px] uppercase tracking-wide font-black italic">{item.label}</span>
                </div>
                {activeTab === item.id && <ChevronRight size={14} />}
              </button>
            ))}
          </nav>

          <footer className="mt-auto pt-6 border-t border-white/10">
             <div className="opacity-20 flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                <p className="text-[8px] font-black text-slate-700 uppercase tracking-tighter italic">Auditoría Pro v2.2</p>
             </div>
          </footer>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col relative overflow-hidden">
        <header className={`
          sticky top-0 z-30 flex items-center justify-between px-6 py-3 transition-all duration-300
          ${scrolled ? 'bg-[#07080b]/80 backdrop-blur-md border-b border-white/5' : 'bg-transparent'}
        `}>
          <div className="flex items-center gap-4 lg:hidden">
            <button onClick={() => setSidebarOpen(true)} className="p-2.5 bg-white/5 border border-white/10 rounded-xl">
              <Menu size={18} />
            </button>
            <h1 className="text-sm font-black italic">Auditoría <span className="text-red-600 italic">Pro</span></h1>
          </div>
          <div className="hidden lg:block relative group">
            <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500 italic opacity-80 group-hover:opacity-100 transition-all cursor-default flex items-center gap-3">
               <div className="w-8 h-px bg-red-600/30"></div>
               SISTEMA DE GESTIÓN LOCAL ACTIVO
               <div className="w-8 h-px bg-red-600/30"></div>
            </h2>
          </div>
          <div className="w-10 h-10"></div>
        </header>

        <main className="flex-1 p-4 lg:p-8 overflow-auto custom-scroll">
          <motion.div 
            key={activeTab}
            initial={{ opacity: 0, scale: 0.99, y: 5 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="max-w-7xl mx-auto"
          >
            {renderContent()}
          </motion.div>
        </main>
      </div>
    </div>
  );
}

export default App;
