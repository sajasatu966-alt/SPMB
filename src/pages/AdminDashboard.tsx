import { useState, useEffect, useRef } from 'react';
import { collection, query, orderBy, onSnapshot, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { motion, AnimatePresence } from 'motion/react';
import { format } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';
import { Search, Filter, ChevronRight, Printer, Trash2, CheckCircle, XCircle, Clock, MoreVertical, Loader2, Download, User, MapPin, School, Phone, Calendar, CreditCard } from 'lucide-react';
import { useReactToPrint } from 'react-to-print';
import { QRCodeSVG } from 'qrcode.react';

import { utils, writeFile } from 'xlsx';

export default function AdminDashboard() {
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [showModal, setShowModal] = useState(false);
  const [settings, setSettings] = useState<any>(null);
  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const q = query(collection(db, 'registrations'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setRegistrations(data);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'registrations');
    });

    const settingsUnsubscribe = onSnapshot(doc(db, 'settings', 'config'), (doc) => {
      if (doc.exists()) {
        setSettings(doc.data());
      }
    });

    return () => {
      unsubscribe();
      settingsUnsubscribe();
    };
  }, []);

  const handleExportExcel = () => {
    const dataToExport = registrations.map(reg => ({
      'ID Pendaftaran': reg.id.toUpperCase(),
      'Nama Lengkap': reg.fullName,
      'NIK': reg.nik,
      'NISN': reg.nisn,
      'Tempat Lahir': reg.placeOfBirth,
      'Tanggal Lahir': reg.dateOfBirth,
      'Jenis Kelamin': reg.gender,
      'Alamat': reg.address,
      'Asal Sekolah': reg.previousSchool,
      'Nama Orang Tua': reg.parentName,
      'No. Telepon': reg.phoneNumber,
      'Status': reg.status,
      'Tanggal Daftar': reg.createdAt?.seconds ? format(new Date(reg.createdAt.seconds * 1000), 'dd/MM/yyyy HH:mm') : '-'
    }));

    const ws = utils.json_to_sheet(dataToExport);
    const wb = utils.book_new();
    utils.book_append_sheet(wb, ws, 'Pendaftar');
    writeFile(wb, `Data_Pendaftar_SPMB_${new Date().getFullYear()}.xlsx`);
  };

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      await updateDoc(doc(db, 'registrations', id), { status });
      if (selectedStudent?.id === id) {
        setSelectedStudent({ ...selectedStudent, status });
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `registrations/${id}`);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus data pendaftaran ini?')) {
      try {
        await deleteDoc(doc(db, 'registrations', id));
        setShowModal(false);
      } catch (error) {
        handleFirestoreError(error, OperationType.DELETE, `registrations/${id}`);
      }
    }
  };

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `Bukti_Pendaftaran_${selectedStudent?.fullName || 'Siswa'}`,
  });

  const filteredData = registrations.filter(reg => {
    const matchesSearch = reg.fullName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          reg.nisn.includes(searchTerm) || 
                          reg.nik.includes(searchTerm);
    const matchesStatus = statusFilter === 'All' || reg.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Accepted': return 'bg-green-100 text-green-700 border-green-200';
      case 'Rejected': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-amber-100 text-amber-700 border-amber-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Accepted': return <CheckCircle size={14} />;
      case 'Rejected': return <XCircle size={14} />;
      default: return <Clock size={14} />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Stats */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Dashboard Pendaftaran</h2>
          <p className="text-slate-500">Total {registrations.length} pendaftar masuk ke sistem.</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleExportExcel}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-xl shadow-sm flex items-center gap-2 text-sm font-bold transition-all"
          >
            <Download size={18} />
            Export Excel
          </button>
          <div className="bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-100 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></div>
            <span className="text-sm font-medium text-slate-600">
              {registrations.filter(r => r.status === 'Pending').length} Pending
            </span>
          </div>
          <div className="bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-100 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500"></div>
            <span className="text-sm font-medium text-slate-600">
              {registrations.filter(r => r.status === 'Accepted').length} Diterima
            </span>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col md:flex-row gap-4">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input
            type="text"
            placeholder="Cari nama, NIK, atau NISN..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="text-slate-400" size={20} />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all bg-white text-slate-600"
          >
            <option value="All">Semua Status</option>
            <option value="Pending">Pending</option>
            <option value="Accepted">Diterima</option>
            <option value="Rejected">Ditolak</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="px-6 py-4 text-sm font-bold text-slate-600">Pendaftar</th>
                <th className="px-6 py-4 text-sm font-bold text-slate-600">NISN / NIK</th>
                <th className="px-6 py-4 text-sm font-bold text-slate-600">Tanggal Daftar</th>
                <th className="px-6 py-4 text-sm font-bold text-slate-600">Status</th>
                <th className="px-6 py-4 text-sm font-bold text-slate-600 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <Loader2 className="animate-spin mx-auto text-blue-600 mb-2" size={32} />
                    <p className="text-slate-500">Memuat data...</p>
                  </td>
                </tr>
              ) : filteredData.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                    Tidak ada data pendaftaran yang ditemukan.
                  </td>
                </tr>
              ) : (
                filteredData.map((reg) => (
                  <tr key={reg.id} className="hover:bg-slate-50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold">
                          {reg.fullName.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900">{reg.fullName}</p>
                          <p className="text-xs text-slate-500">{reg.previousSchool}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-slate-700 font-mono">{reg.nisn}</p>
                      <p className="text-xs text-slate-400 font-mono">{reg.nik}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-slate-600">
                        {reg.createdAt?.seconds ? format(new Date(reg.createdAt.seconds * 1000), 'dd MMM yyyy', { locale: idLocale }) : '-'}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(reg.status)}`}>
                        {getStatusIcon(reg.status)}
                        {reg.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => { setSelectedStudent(reg); setShowModal(true); }}
                        className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                      >
                        <ChevronRight size={20} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Modal */}
      <AnimatePresence>
        {showModal && selectedStudent && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowModal(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-white w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl shadow-2xl"
            >
              <div className="sticky top-0 bg-white border-b border-slate-100 p-6 flex items-center justify-between z-10">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-600 text-white rounded-2xl flex items-center justify-center text-xl font-bold">
                    {selectedStudent.fullName.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900">{selectedStudent.fullName}</h3>
                    <p className="text-sm text-slate-500">ID: {selectedStudent.id.toUpperCase()}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handlePrint()}
                    className="p-2.5 text-slate-600 hover:bg-slate-100 rounded-xl transition-all"
                    title="Cetak Bukti"
                  >
                    <Printer size={20} />
                  </button>
                  <button
                    onClick={() => handleDelete(selectedStudent.id)}
                    className="p-2.5 text-red-600 hover:bg-red-50 rounded-xl transition-all"
                    title="Hapus Data"
                  >
                    <Trash2 size={20} />
                  </button>
                  <button
                    onClick={() => setShowModal(false)}
                    className="p-2.5 text-slate-400 hover:bg-slate-100 rounded-xl transition-all ml-2"
                  >
                    <XCircle size={24} />
                  </button>
                </div>
              </div>

              <div className="p-8 grid md:grid-cols-2 gap-12">
                <div className="space-y-8">
                  <section className="space-y-4">
                    <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                      <User size={16} /> Data Pribadi
                    </h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-slate-400">NIK</p>
                        <p className="font-medium">{selectedStudent.nik}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-400">NISN</p>
                        <p className="font-medium">{selectedStudent.nisn}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-400">Tempat Lahir</p>
                        <p className="font-medium">{selectedStudent.placeOfBirth}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-400">Tanggal Lahir</p>
                        <p className="font-medium">{selectedStudent.dateOfBirth}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-400">Jenis Kelamin</p>
                        <p className="font-medium">{selectedStudent.gender}</p>
                      </div>
                    </div>
                  </section>

                  <section className="space-y-4">
                    <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                      <MapPin size={16} /> Alamat & Sekolah
                    </h4>
                    <div className="space-y-4">
                      <div>
                        <p className="text-xs text-slate-400">Alamat Lengkap</p>
                        <p className="font-medium">{selectedStudent.address}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-400">Asal Sekolah</p>
                        <p className="font-medium">{selectedStudent.previousSchool}</p>
                      </div>
                    </div>
                  </section>
                </div>

                <div className="space-y-8">
                  <section className="space-y-4">
                    <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                      <Phone size={16} /> Kontak Orang Tua
                    </h4>
                    <div className="space-y-4">
                      <div>
                        <p className="text-xs text-slate-400">Nama Orang Tua/Wali</p>
                        <p className="font-medium">{selectedStudent.parentName}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-400">Nomor Telepon</p>
                        <p className="font-medium text-blue-600">{selectedStudent.phoneNumber}</p>
                      </div>
                    </div>
                  </section>

                  <section className="space-y-4">
                    <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Status Penerimaan</h4>
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => handleUpdateStatus(selectedStudent.id, 'Pending')}
                        className={`px-4 py-2 rounded-xl text-sm font-bold border transition-all flex items-center gap-2 ${
                          selectedStudent.status === 'Pending' ? 'bg-amber-100 border-amber-300 text-amber-700' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
                        }`}
                      >
                        <Clock size={16} /> Pending
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(selectedStudent.id, 'Accepted')}
                        className={`px-4 py-2 rounded-xl text-sm font-bold border transition-all flex items-center gap-2 ${
                          selectedStudent.status === 'Accepted' ? 'bg-green-100 border-green-300 text-green-700' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
                        }`}
                      >
                        <CheckCircle size={16} /> Terima
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(selectedStudent.id, 'Rejected')}
                        className={`px-4 py-2 rounded-xl text-sm font-bold border transition-all flex items-center gap-2 ${
                          selectedStudent.status === 'Rejected' ? 'bg-red-100 border-red-300 text-red-700' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
                        }`}
                      >
                        <XCircle size={16} /> Tolak
                      </button>
                    </div>
                  </section>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Hidden Print Content */}
      <div className="hidden">
        <div ref={printRef} className="p-12 text-slate-900 font-sans space-y-8">
          {/* Header */}
          <div className="flex items-center gap-6 border-b-4 border-slate-900 pb-6">
            {settings?.logoUrl ? (
              <img src={settings.logoUrl} alt="Logo" className="h-24 w-24 object-contain" referrerPolicy="no-referrer" />
            ) : (
              <div className="h-24 w-24 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-3xl">
                S2
              </div>
            )}
            <div className="flex-grow">
              <h1 className="text-3xl font-black uppercase tracking-tight">
                {settings?.schoolName || 'SMP Negeri 2 Sakra Barat'}
              </h1>
              <p className="text-lg font-bold text-slate-600">
                PANITIA PENERIMAAN PESERTA DIDIK BARU (PPDB)
              </p>
              <p className="text-sm text-slate-500 italic">
                Alamat: Sakra Barat, Lombok Timur, Nusa Tenggara Barat
              </p>
            </div>
          </div>

          <div className="text-center space-y-2">
            <h2 className="text-2xl font-black underline decoration-2 underline-offset-4">
              KARTU BUKTI PENDAFTARAN
            </h2>
            <p className="text-slate-600 font-medium">Tahun Pelajaran 2026/2027</p>
          </div>

          <div className="grid grid-cols-3 gap-8 items-start">
            <div className="col-span-2 space-y-4">
              <table className="w-full text-lg">
                <tbody className="divide-y divide-slate-100">
                  <tr>
                    <td className="py-2 font-bold w-48">No. Pendaftaran</td>
                    <td className="py-2">: <span className="font-mono font-black">{selectedStudent?.id.slice(0, 8).toUpperCase()}</span></td>
                  </tr>
                  <tr>
                    <td className="py-2 font-bold">Nama Lengkap</td>
                    <td className="py-2">: {selectedStudent?.fullName}</td>
                  </tr>
                  <tr>
                    <td className="py-2 font-bold">NIK</td>
                    <td className="py-2">: {selectedStudent?.nik}</td>
                  </tr>
                  <tr>
                    <td className="py-2 font-bold">NISN</td>
                    <td className="py-2">: {selectedStudent?.nisn}</td>
                  </tr>
                  <tr>
                    <td className="py-2 font-bold">Tempat, Tgl Lahir</td>
                    <td className="py-2">: {selectedStudent?.placeOfBirth}, {selectedStudent?.dateOfBirth}</td>
                  </tr>
                  <tr>
                    <td className="py-2 font-bold">Jenis Kelamin</td>
                    <td className="py-2">: {selectedStudent?.gender}</td>
                  </tr>
                  <tr>
                    <td className="py-2 font-bold">Asal Sekolah</td>
                    <td className="py-2">: {selectedStudent?.previousSchool}</td>
                  </tr>
                  <tr>
                    <td className="py-2 font-bold">Nama Orang Tua</td>
                    <td className="py-2">: {selectedStudent?.parentName}</td>
                  </tr>
                  <tr>
                    <td className="py-2 font-bold">No. Telepon</td>
                    <td className="py-2">: {selectedStudent?.phoneNumber}</td>
                  </tr>
                  <tr>
                    <td className="py-2 font-bold">Status</td>
                    <td className="py-2">: <span className="font-bold uppercase">{selectedStudent?.status}</span></td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="flex flex-col items-center gap-6">
              <div className="w-40 h-52 border-2 border-slate-300 flex items-center justify-center text-slate-400 text-sm italic text-center p-4">
                Pas Foto 3x4
              </div>
              <QRCodeSVG value={window.location.origin + '/success/' + selectedStudent?.id} size={120} />
            </div>
          </div>

          <div className="pt-12 grid grid-cols-2 gap-12">
            <div className="space-y-20">
              <div className="text-center">
                <p className="font-bold">Calon Siswa Baru,</p>
                <div className="h-24"></div>
                <p className="font-bold underline">{selectedStudent?.fullName}</p>
              </div>
            </div>
            <div className="space-y-20">
              <div className="text-center">
                <p className="font-bold">Sakra Barat, {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                <p className="font-bold">Panitia PPDB,</p>
                <div className="h-24"></div>
                <p className="font-bold underline">................................................</p>
                <p className="text-sm">NIP. ........................................</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
