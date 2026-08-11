import React, { useState } from 'react';
import { api } from '../services/api';
import type { User } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess: (user: User) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onAuthSuccess }) => {
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
      const res = await api.login(email, password);
      if (res.success && res.user) {
        onAuthSuccess(res.user);
        onClose();
      } else {
        setError(res.error || 'Login gagal');
      }
    } catch (err) {
      setError('Terjadi kesalahan koneksi.');
    } finally {
      setLoading(false);
    }
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
            Selamat Datang Kembali
          </h3>
          <p className="font-body-md text-sm text-text-muted mt-1">
            Masuk untuk mengakses materi les dan kuis Anda
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-error-container text-on-error-container text-xs rounded-xl flex items-center gap-2 border border-error/10">
            <span className="material-symbols-outlined text-[18px]">error</span>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">

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

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-primary-container text-white font-semibold rounded-xl hover:bg-primary-container/95 transition-colors shadow-sm font-label-md flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? 'Memproses...' : 'Masuk'}
            {!loading && <span className="material-symbols-outlined text-[20px]">login</span>}
          </button>
        </form>
      </div>
    </div>
  );
};
