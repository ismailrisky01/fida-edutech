import React, { useState } from 'react';
import { api } from '../services/api';
import type { User } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess: (user: User) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onAuthSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [role, setRole] = useState<'student' | 'teacher'>('student');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        const res = await api.login(email, password);
        if (res.success && res.user) {
          onAuthSuccess(res.user);
          onClose();
        } else {
          setError(res.error || 'Login gagal');
        }
      } else {
        const res = await api.register(name, email, password, role);
        if (res.success) {
          // Auto login after registration
          const loginRes = await api.login(email, password);
          if (loginRes.success && loginRes.user) {
            onAuthSuccess(loginRes.user);
            onClose();
          } else {
            setIsLogin(true);
            setError('Registrasi berhasil, silakan login.');
          }
        } else {
          setError(res.error || 'Registrasi gagal');
        }
      }
    } catch (err) {
      setError('Terjadi kesalahan koneksi.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = async (type: 'student' | 'teacher') => {
    const email = type === 'student' ? 'student@fida.com' : 'teacher@fida.com';
    setEmail(email);
    setPassword('password');
    setRole(type);
    setIsLogin(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-border-subtle overflow-hidden flex flex-col p-8">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-text-muted hover:text-text-heading rounded-full hover:bg-slate-100 transition-colors"
        >
          <span className="material-symbols-outlined text-[24px]">close</span>
        </button>

        <div className="text-center mb-6">
          <h3 className="font-headline-lg text-2xl font-extrabold text-text-heading">
            {isLogin ? 'Selamat Datang Kembali' : 'Gabung Fida-Education'}
          </h3>
          <p className="font-body-md text-sm text-text-muted mt-1">
            {isLogin ? 'Masuk untuk mengakses materi les dan kuis Anda' : 'Buat akun siswa atau tentor baru'}
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-error-container text-on-error-container text-xs rounded-xl flex items-center gap-2 border border-error/10">
            <span className="material-symbols-outlined text-[18px]">error</span>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div>
              <label className="block text-xs font-bold text-text-heading mb-1 uppercase tracking-wider">Nama Lengkap</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Masukkan nama lengkap"
                className="w-full px-4 py-3 rounded-xl border border-border-subtle focus:border-secondary focus:ring-1 focus:ring-secondary text-sm bg-slate-50 outline-none transition-all"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-text-heading mb-1 uppercase tracking-wider">Alamat Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="nama@email.com"
              className="w-full px-4 py-3 rounded-xl border border-border-subtle focus:border-secondary focus:ring-1 focus:ring-secondary text-sm bg-slate-50 outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-text-heading mb-1 uppercase tracking-wider">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-3 rounded-xl border border-border-subtle focus:border-secondary focus:ring-1 focus:ring-secondary text-sm bg-slate-50 outline-none transition-all"
            />
          </div>

          {!isLogin && (
            <div>
              <span className="block text-xs font-bold text-text-heading mb-2 uppercase tracking-wider">Saya Mendaftar Sebagai</span>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setRole('student')}
                  className={`py-3 rounded-xl border text-sm font-semibold flex items-center justify-center gap-2 transition-all ${
                    role === 'student'
                      ? 'border-secondary bg-secondary/10 text-secondary'
                      : 'border-border-subtle bg-slate-50 text-text-muted hover:border-slate-300'
                  }`}
                >
                  <span className="material-symbols-outlined text-[20px]">school</span>
                  Siswa
                </button>
                <button
                  type="button"
                  onClick={() => setRole('teacher')}
                  className={`py-3 rounded-xl border text-sm font-semibold flex items-center justify-center gap-2 transition-all ${
                    role === 'teacher'
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border-subtle bg-slate-50 text-text-muted hover:border-slate-300'
                  }`}
                >
                  <span className="material-symbols-outlined text-[20px]">co_present</span>
                  Tentor
                </button>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-primary-container text-white font-semibold rounded-xl hover:bg-primary-container/95 transition-colors shadow-sm font-label-md flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? 'Memproses...' : isLogin ? 'Masuk' : 'Daftar Sekarang'}
            {!loading && <span className="material-symbols-outlined text-[20px]">login</span>}
          </button>
        </form>

        {isLogin && (
          <div className="mt-6 border-t border-border-subtle pt-4 text-center">
            <span className="text-xs text-text-muted block mb-3 font-semibold uppercase tracking-wider">Demo Quick Access</span>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => handleQuickLogin('student')}
                className="py-2.5 rounded-xl border border-secondary/25 bg-secondary/5 text-secondary hover:bg-secondary/10 text-xs font-semibold flex items-center justify-center gap-1 transition-all"
              >
                <span className="material-symbols-outlined text-[16px]">school</span>
                Siswa Demo
              </button>
              <button
                onClick={() => handleQuickLogin('teacher')}
                className="py-2.5 rounded-xl border border-primary/25 bg-primary/5 text-primary hover:bg-primary/10 text-xs font-semibold flex items-center justify-center gap-1 transition-all"
              >
                <span className="material-symbols-outlined text-[16px]">co_present</span>
                Tentor Demo
              </button>
            </div>
          </div>
        )}

        <div className="mt-6 text-center text-sm">
          <span className="text-text-muted">
            {isLogin ? 'Belum punya akun? ' : 'Sudah memiliki akun? '}
          </span>
          <button
            onClick={() => {
              setIsLogin(!isLogin);
              setError('');
            }}
            className="font-bold text-secondary hover:underline"
          >
            {isLogin ? 'Daftar di sini' : 'Masuk di sini'}
          </button>
        </div>
      </div>
    </div>
  );
};
