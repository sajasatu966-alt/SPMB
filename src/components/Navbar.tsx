import { Link, useNavigate } from 'react-router-dom';
import { User, signOut } from 'firebase/auth';
import { auth, db } from '../lib/firebase';
import { LogOut, User as UserIcon, Settings, LayoutDashboard, Home } from 'lucide-react';
import { useState, useEffect } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';

interface NavbarProps {
  user: User | null;
}

export default function Navbar({ user }: NavbarProps) {
  const navigate = useNavigate();
  const [settings, setSettings] = useState<any>(null);

  useEffect(() => {
    const unsubscribe = onSnapshot(doc(db, 'settings', 'config'), (doc) => {
      if (doc.exists()) {
        setSettings(doc.data());
      }
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/admin/login');
  };

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3">
          {settings?.logoUrl ? (
            <img src={settings.logoUrl} alt="Logo" className="h-10 w-10 object-contain" referrerPolicy="no-referrer" />
          ) : (
            <div className="h-10 w-10 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">
              S2
            </div>
          )}
          <div className="hidden sm:block">
            <h1 className="text-lg font-bold text-slate-900 leading-tight">
              {settings?.schoolName || 'SMP Negeri 2 Sakra Barat'}
            </h1>
            <p className="text-xs text-slate-500">Sistem Penerimaan Murid Baru</p>
          </div>
        </Link>

        <div className="flex items-center gap-4 sm:gap-6">
          <Link to="/" className="text-slate-600 hover:text-blue-600 transition-colors flex items-center gap-1">
            <Home size={18} />
            <span className="hidden md:inline">Beranda</span>
          </Link>

          {user ? (
            <>
              <Link to="/admin" className="text-slate-600 hover:text-blue-600 transition-colors flex items-center gap-1">
                <LayoutDashboard size={18} />
                <span className="hidden md:inline">Dashboard</span>
              </Link>
              <Link to="/admin/settings" className="text-slate-600 hover:text-blue-600 transition-colors flex items-center gap-1">
                <Settings size={18} />
                <span className="hidden md:inline">Pengaturan</span>
              </Link>
              <button 
                onClick={handleLogout}
                className="flex items-center gap-1 text-red-600 hover:text-red-700 transition-colors font-medium"
              >
                <LogOut size={18} />
                <span className="hidden md:inline">Keluar</span>
              </button>
            </>
          ) : (
            <Link 
              to="/admin/login" 
              className="flex items-center gap-1 text-slate-600 hover:text-blue-600 transition-colors font-medium"
            >
              <UserIcon size={18} />
              <span className="hidden md:inline">Admin</span>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
