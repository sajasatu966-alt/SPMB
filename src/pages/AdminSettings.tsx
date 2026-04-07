import { useState, useEffect } from 'react';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { motion } from 'motion/react';
import { Save, Image, School, Bell, ToggleLeft, ToggleRight, Loader2, CheckCircle } from 'lucide-react';

export default function AdminSettings() {
  const [settings, setSettings] = useState({
    schoolName: 'SMP Negeri 2 Sakra Barat',
    logoUrl: '',
    registrationOpen: true,
    announcement: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const docRef = doc(db, 'settings', 'config');
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setSettings(docSnap.data() as any);
        } else {
          // Initialize default settings
          await setDoc(docRef, settings);
        }
      } catch (error) {
        handleFirestoreError(error, OperationType.GET, 'settings/config');
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleSave = async (e: any) => {
    e.preventDefault();
    setSaving(true);
    setSuccess(false);
    try {
      await setDoc(doc(db, 'settings', 'config'), settings);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'settings/config');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-20">
        <Loader2 className="animate-spin text-blue-600" size={32} />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Pengaturan Sistem</h2>
          <p className="text-slate-500">Konfigurasi logo, nama sekolah, dan status pendaftaran.</p>
        </div>
        {success && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-green-100 text-green-700 px-4 py-2 rounded-xl flex items-center gap-2 text-sm font-bold border border-green-200"
          >
            <CheckCircle size={18} />
            Berhasil Disimpan
          </motion.div>
        )}
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* General Settings */}
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 space-y-6">
          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-2">
            <School size={20} className="text-blue-600" />
            Identitas Sekolah
          </h3>
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Nama Sekolah</label>
            <input
              type="text"
              value={settings.schoolName}
              onChange={(e) => setSettings({ ...settings, schoolName: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              placeholder="Contoh: SMP Negeri 2 Sakra Barat"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">URL Logo Sekolah</label>
            <div className="flex gap-4 items-start">
              <div className="flex-grow space-y-2">
                <input
                  type="text"
                  value={settings.logoUrl}
                  onChange={(e) => setSettings({ ...settings, logoUrl: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  placeholder="https://example.com/logo.png"
                />
                <p className="text-xs text-slate-400 italic">
                  Masukkan URL gambar logo sekolah yang valid (hosting eksternal).
                </p>
              </div>
              {settings.logoUrl && (
                <div className="w-20 h-20 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-center overflow-hidden p-2">
                  <img src={settings.logoUrl} alt="Preview" className="max-w-full max-h-full object-contain" referrerPolicy="no-referrer" />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Registration Status */}
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 space-y-6">
          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-2">
            <Bell size={20} className="text-blue-600" />
            Status & Pengumuman
          </h3>

          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
            <div>
              <p className="font-bold text-slate-900">Status Pendaftaran</p>
              <p className="text-sm text-slate-500">Aktifkan atau nonaktifkan formulir pendaftaran mandiri.</p>
            </div>
            <button
              type="button"
              onClick={() => setSettings({ ...settings, registrationOpen: !settings.registrationOpen })}
              className={`p-1 rounded-full transition-all ${settings.registrationOpen ? 'text-blue-600' : 'text-slate-300'}`}
            >
              {settings.registrationOpen ? <ToggleRight size={48} /> : <ToggleLeft size={48} />}
            </button>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Pengumuman Dashboard</label>
            <textarea
              value={settings.announcement}
              onChange={(e) => setSettings({ ...settings, announcement: e.target.value })}
              rows={4}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              placeholder="Tuliskan pengumuman atau instruksi tambahan untuk calon siswa..."
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-xl font-bold text-lg shadow-lg shadow-blue-200 transition-all flex items-center justify-center gap-2 disabled:opacity-70"
        >
          {saving ? (
            <>
              <Loader2 size={24} className="animate-spin" />
              Sedang Menyimpan...
            </>
          ) : (
            <>
              <Save size={24} />
              Simpan Perubahan
            </>
          )}
        </button>
      </form>
    </div>
  );
}
