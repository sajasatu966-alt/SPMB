export default function Footer() {
  return (
    <footer className="bg-white border-t border-slate-200 py-8 mt-auto">
      <div className="container mx-auto px-4 text-center">
        <p className="text-slate-600 text-sm">
          &copy; {new Date().getFullYear()} SMP Negeri 2 Sakra Barat. Seluruh Hak Cipta.
        </p>
        <p className="text-slate-400 text-xs mt-2">
          Sistem Penerimaan Murid Baru (SPMB) - Dikembangkan untuk kemudahan pendaftaran mandiri.
        </p>
      </div>
    </footer>
  );
}
