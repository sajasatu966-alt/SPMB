import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { UserPlus, FileCheck, Printer, ArrowRight, Settings, LayoutDashboard } from 'lucide-react';
import { useState, useEffect } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';

export default function Home() {
  const [settings, setSettings] = useState<any>(null);

  useEffect(() => {
    const unsubscribe = onSnapshot(doc(db, 'settings', 'config'), (doc) => {
      if (doc.exists()) {
        setSettings(doc.data());
      }
    });
    return () => unsubscribe();
  }, []);

  return (
    <div className="max-w-5xl mx-auto space-y-16 py-8">
      {/* Hero Section */}
      <section className="text-center space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-4"
        >
          {settings?.logoUrl && (
            <img 
              src={settings.logoUrl} 
              alt="School Logo" 
              className="h-32 w-32 mx-auto mb-6 object-contain"
              referrerPolicy="no-referrer"
            />
          )}
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight">
            Selamat Datang di Sistem Penerimaan Murid Baru
          </h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
            {settings?.schoolName || 'SMP Negeri 2 Sakra Barat'} membuka pendaftaran untuk calon siswa baru tahun ajaran 2026/2027.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="flex flex-wrap justify-center gap-4"
        >
          <Link
            to="/register"
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl font-bold text-lg shadow-lg shadow-blue-200 transition-all flex items-center gap-2 group"
          >
            <UserPlus size={24} />
            Daftar Sekarang
            <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link
            to="/admin/login"
            className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 px-8 py-4 rounded-xl font-bold text-lg shadow-sm transition-all flex items-center gap-2"
          >
            <LayoutDashboard size={24} />
            Halaman Admin
          </Link>
        </motion.div>
      </section>

      {/* Features Grid */}
      <section className="grid md:grid-cols-3 gap-8">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow space-y-4">
          <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center">
            <UserPlus size={24} />
          </div>
          <h3 className="text-xl font-bold text-slate-900">Pendaftaran Mandiri</h3>
          <p className="text-slate-600">
            Calon siswa atau orang tua dapat mengisi formulir pendaftaran secara mandiri dari mana saja dan kapan saja.
          </p>
        </div>

        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow space-y-4">
          <div className="w-12 h-12 bg-green-100 text-green-600 rounded-xl flex items-center justify-center">
            <FileCheck size={24} />
          </div>
          <h3 className="text-xl font-bold text-slate-900">Verifikasi Berkas</h3>
          <p className="text-slate-600">
            Admin sekolah akan memverifikasi berkas pendaftaran dan memberikan status penerimaan secara transparan.
          </p>
        </div>

        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow space-y-4">
          <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center">
            <Printer size={24} />
          </div>
          <h3 className="text-xl font-bold text-slate-900">Cetak Bukti Daftar</h3>
          <p className="text-slate-600">
            Setelah mendaftar, calon siswa dapat langsung mencetak bukti pendaftaran sebagai syarat verifikasi di sekolah.
          </p>
        </div>
      </section>

      {/* Announcement Section */}
      {settings?.announcement && (
        <section className="bg-blue-50 border border-blue-100 p-8 rounded-3xl">
          <h2 className="text-2xl font-bold text-blue-900 mb-4 flex items-center gap-2">
            Pengumuman Penting
          </h2>
          <div className="prose prose-blue max-w-none text-blue-800 whitespace-pre-wrap">
            {settings.announcement}
          </div>
        </section>
      )}
    </div>
  );
}
