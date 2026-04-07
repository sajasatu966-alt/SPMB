import { useParams, Link } from 'react-router-dom';
import { useEffect, useState, useRef } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { motion } from 'motion/react';
import { CheckCircle, Printer, Home, ArrowLeft, Download } from 'lucide-react';
import { useReactToPrint } from 'react-to-print';
import { QRCodeSVG } from 'qrcode.react';

export default function Success() {
  const { id } = useParams();
  const [student, setStudent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState<any>(null);
  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      const docSnap = await getDoc(doc(db, 'registrations', id));
      if (docSnap.exists()) {
        setStudent({ id: docSnap.id, ...docSnap.data() });
      }
      
      const settingsSnap = await getDoc(doc(db, 'settings', 'config'));
      if (settingsSnap.exists()) {
        setSettings(settingsSnap.data());
      }
      setLoading(false);
    };
    fetchData();
  }, [id]);

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `Bukti_Pendaftaran_${student?.fullName || 'Siswa'}`,
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center p-20">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="text-center p-20 space-y-4">
        <h2 className="text-2xl font-bold text-slate-900">Data Tidak Ditemukan</h2>
        <Link to="/" className="text-blue-600 hover:underline flex items-center justify-center gap-2">
          <ArrowLeft size={20} /> Kembali ke Beranda
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 text-center space-y-6"
      >
        <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto">
          <CheckCircle size={48} />
        </div>
        <div className="space-y-2">
          <h2 className="text-3xl font-extrabold text-slate-900">Pendaftaran Berhasil!</h2>
          <p className="text-slate-600 text-lg">
            Terima kasih, <strong>{student.fullName}</strong>. Data Anda telah kami terima dengan nomor pendaftaran:
          </p>
          <div className="bg-slate-50 inline-block px-6 py-3 rounded-2xl border border-slate-200 font-mono text-2xl font-bold text-blue-600 mt-4">
            {student.id.slice(0, 8).toUpperCase()}
          </div>
        </div>

        <div className="flex flex-wrap justify-center gap-4 pt-4">
          <button
            onClick={() => handlePrint()}
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl font-bold shadow-lg shadow-blue-200 transition-all flex items-center gap-2"
          >
            <Printer size={24} />
            Cetak Bukti Pendaftaran
          </button>
          <Link
            to="/"
            className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 px-8 py-4 rounded-xl font-bold transition-all flex items-center gap-2"
          >
            <Home size={24} />
            Kembali ke Beranda
          </Link>
        </div>
      </motion.div>

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
              KARTU BUKTI PENDAFTARAN MANDIRI
            </h2>
            <p className="text-slate-600 font-medium">Tahun Pelajaran 2026/2027</p>
          </div>

          <div className="grid grid-cols-3 gap-8 items-start">
            <div className="col-span-2 space-y-4">
              <table className="w-full text-lg">
                <tbody className="divide-y divide-slate-100">
                  <tr>
                    <td className="py-2 font-bold w-48">No. Pendaftaran</td>
                    <td className="py-2">: <span className="font-mono font-black">{student.id.slice(0, 8).toUpperCase()}</span></td>
                  </tr>
                  <tr>
                    <td className="py-2 font-bold">Nama Lengkap</td>
                    <td className="py-2">: {student.fullName}</td>
                  </tr>
                  <tr>
                    <td className="py-2 font-bold">NIK</td>
                    <td className="py-2">: {student.nik}</td>
                  </tr>
                  <tr>
                    <td className="py-2 font-bold">NISN</td>
                    <td className="py-2">: {student.nisn}</td>
                  </tr>
                  <tr>
                    <td className="py-2 font-bold">Tempat, Tgl Lahir</td>
                    <td className="py-2">: {student.placeOfBirth}, {student.dateOfBirth}</td>
                  </tr>
                  <tr>
                    <td className="py-2 font-bold">Jenis Kelamin</td>
                    <td className="py-2">: {student.gender}</td>
                  </tr>
                  <tr>
                    <td className="py-2 font-bold">Asal Sekolah</td>
                    <td className="py-2">: {student.previousSchool}</td>
                  </tr>
                  <tr>
                    <td className="py-2 font-bold">Nama Orang Tua</td>
                    <td className="py-2">: {student.parentName}</td>
                  </tr>
                  <tr>
                    <td className="py-2 font-bold">No. Telepon</td>
                    <td className="py-2">: {student.phoneNumber}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="flex flex-col items-center gap-6">
              <div className="w-40 h-52 border-2 border-slate-300 flex items-center justify-center text-slate-400 text-sm italic text-center p-4">
                Pas Foto 3x4
              </div>
              <QRCodeSVG value={window.location.origin + '/success/' + student.id} size={120} />
            </div>
          </div>

          <div className="pt-12 grid grid-cols-2 gap-12">
            <div className="space-y-20">
              <div className="text-center">
                <p className="font-bold">Calon Siswa Baru,</p>
                <div className="h-24"></div>
                <p className="font-bold underline">{student.fullName}</p>
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

          <div className="mt-12 p-4 border border-slate-200 rounded-lg bg-slate-50 text-sm">
            <p className="font-bold mb-2">Catatan:</p>
            <ul className="list-disc list-inside space-y-1 text-slate-700">
              <li>Kartu ini adalah bukti pendaftaran mandiri yang sah.</li>
              <li>Harap membawa kartu ini saat melakukan verifikasi berkas di sekolah.</li>
              <li>Lampirkan fotokopi Akta Kelahiran, KK, dan Ijazah/SKL saat verifikasi.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
