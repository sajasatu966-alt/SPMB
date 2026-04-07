import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Settings, Users, FileText, Search, Filter, ChevronRight, Download, Printer, Trash2, CheckCircle, XCircle, Clock, MoreVertical } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { collection, query, orderBy, onSnapshot, doc, updateDoc, deleteDoc, getDoc, setDoc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { motion, AnimatePresence } from 'motion/react';
import { format } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';
import { useReactToPrint } from 'react-to-print';

// Sub-components
import AdminDashboard from './AdminDashboard';
import AdminSettings from './AdminSettings';

export default function AdminPanel() {
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      {/* Sidebar Navigation */}
      <aside className="lg:w-64 space-y-4">
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 space-y-2">
          <Link
            to="/admin"
            className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${
              isActive('/admin') ? 'bg-blue-600 text-white shadow-lg shadow-blue-100' : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <LayoutDashboard size={20} />
            Dashboard
          </Link>
          <Link
            to="/admin/settings"
            className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${
              isActive('/admin/settings') ? 'bg-blue-600 text-white shadow-lg shadow-blue-100' : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Settings size={20} />
            Pengaturan
          </Link>
        </div>

        <div className="bg-blue-600 p-6 rounded-2xl text-white space-y-4 relative overflow-hidden">
          <div className="relative z-10">
            <h4 className="font-bold text-lg">Butuh Bantuan?</h4>
            <p className="text-blue-100 text-sm">Hubungi tim teknis jika Anda mengalami kendala sistem.</p>
          </div>
          <div className="absolute -right-4 -bottom-4 opacity-10">
            <Settings size={120} />
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-grow">
        <Routes>
          <Route index element={<AdminDashboard />} />
          <Route path="settings" element={<AdminSettings />} />
        </Routes>
      </div>
    </div>
  );
}
