import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useNavigate } from 'react-router-dom';
import { collection, addDoc, serverTimestamp, doc, getDoc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Save, User, MapPin, School, Phone, Calendar, CreditCard, Loader2 } from 'lucide-react';

const studentSchema = z.object({
  fullName: z.string().min(3, 'Nama lengkap minimal 3 karakter').max(100),
  nik: z.string().length(16, 'NIK harus 16 digit'),
  nisn: z.string().length(10, 'NISN harus 10 digit'),
  placeOfBirth: z.string().min(2, 'Tempat lahir wajib diisi'),
  dateOfBirth: z.string().min(1, 'Tanggal lahir wajib diisi'),
  gender: z.enum(['Laki-laki', 'Perempuan']),
  address: z.string().min(10, 'Alamat minimal 10 karakter'),
  previousSchool: z.string().min(3, 'Asal sekolah wajib diisi'),
  parentName: z.string().min(3, 'Nama orang tua wajib diisi'),
  phoneNumber: z.string().min(10, 'Nomor telepon minimal 10 digit'),
});

type StudentForm = z.infer<typeof studentSchema>;

export default function Register() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [settings, setSettings] = useState<any>(null);

  useEffect(() => {
    const fetchSettings = async () => {
      const docRef = doc(db, 'settings', 'config');
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setSettings(docSnap.data());
      }
    };
    fetchSettings();
  }, []);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<StudentForm>({
    resolver: zodResolver(studentSchema),
    defaultValues: {
      gender: 'Laki-laki',
    },
  });

  const onSubmit = async (data: StudentForm) => {
    if (settings && settings.registrationOpen === false) {
      alert('Mohon maaf, pendaftaran saat ini sedang ditutup.');
      return;
    }

    setIsSubmitting(true);
    try {
      const docRef = await addDoc(collection(db, 'registrations'), {
        ...data,
        status: 'Pending',
        createdAt: serverTimestamp(),
      });
      navigate(`/success/${docRef.id}`);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'registrations');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden"
      >
        <div className="bg-blue-600 p-8 text-white">
          <h2 className="text-2xl font-bold">Formulir Pendaftaran Siswa Baru</h2>
          <p className="text-blue-100 mt-1">Silakan isi data calon siswa dengan lengkap dan benar.</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-8 space-y-8">
          {/* Personal Information */}
          <div className="space-y-6">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-2">
              <User size={20} className="text-blue-600" />
              Data Pribadi Siswa
            </h3>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Nama Lengkap</label>
                <input
                  {...register('fullName')}
                  className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                  placeholder="Contoh: Ahmad Fauzi"
                />
                {errors.fullName && <p className="text-red-500 text-xs">{errors.fullName.message}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">NIK (16 Digit)</label>
                <input
                  {...register('nik')}
                  className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                  placeholder="3501..."
                />
                {errors.nik && <p className="text-red-500 text-xs">{errors.nik.message}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">NISN (10 Digit)</label>
                <input
                  {...register('nisn')}
                  className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                  placeholder="0012..."
                />
                {errors.nisn && <p className="text-red-500 text-xs">{errors.nisn.message}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Jenis Kelamin</label>
                <select
                  {...register('gender')}
                  className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all bg-white"
                >
                  <option value="Laki-laki">Laki-laki</option>
                  <option value="Perempuan">Perempuan</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Tempat Lahir</label>
                <input
                  {...register('placeOfBirth')}
                  className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                  placeholder="Contoh: Mataram"
                />
                {errors.placeOfBirth && <p className="text-red-500 text-xs">{errors.placeOfBirth.message}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Tanggal Lahir</label>
                <input
                  type="date"
                  {...register('dateOfBirth')}
                  className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                />
                {errors.dateOfBirth && <p className="text-red-500 text-xs">{errors.dateOfBirth.message}</p>}
              </div>
            </div>
          </div>

          {/* Address & School */}
          <div className="space-y-6">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-2">
              <MapPin size={20} className="text-blue-600" />
              Alamat & Asal Sekolah
            </h3>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Alamat Lengkap</label>
              <textarea
                {...register('address')}
                rows={3}
                className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                placeholder="Dusun, Desa, Kecamatan, Kabupaten"
              />
              {errors.address && <p className="text-red-500 text-xs">{errors.address.message}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Asal Sekolah (SD/MI)</label>
              <input
                {...register('previousSchool')}
                className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                placeholder="Contoh: SDN 1 Sakra"
              />
              {errors.previousSchool && <p className="text-red-500 text-xs">{errors.previousSchool.message}</p>}
            </div>
          </div>

          {/* Parent Information */}
          <div className="space-y-6">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-2">
              <Phone size={20} className="text-blue-600" />
              Data Orang Tua / Wali
            </h3>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Nama Orang Tua / Wali</label>
                <input
                  {...register('parentName')}
                  className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                  placeholder="Nama Ayah/Ibu"
                />
                {errors.parentName && <p className="text-red-500 text-xs">{errors.parentName.message}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Nomor Telepon/WA</label>
                <input
                  {...register('phoneNumber')}
                  className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                  placeholder="0812..."
                />
                {errors.phoneNumber && <p className="text-red-500 text-xs">{errors.phoneNumber.message}</p>}
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-xl font-bold text-lg shadow-lg shadow-blue-200 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <Loader2 size={24} className="animate-spin" />
                Sedang Mengirim...
              </>
            ) : (
              <>
                <Save size={24} />
                Kirim Pendaftaran
              </>
            )}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
