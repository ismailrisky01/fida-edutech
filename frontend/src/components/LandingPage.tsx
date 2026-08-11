import React from 'react';
import type { Course, User } from '../types';

interface LandingPageProps {
  courses: Course[];
  currentUser: User | null;
  onSelectCourse: (courseId: string) => void;
  onOpenAuth: () => void;
  onGoToDashboard: () => void;
  onLogout: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  currentUser,
  onSelectCourse,
  onOpenAuth,
  onGoToDashboard,
  onLogout
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const handleSelectPackage = (courseId: string) => {
    if (!currentUser) {
      onOpenAuth();
    } else {
      onSelectCourse(courseId);
    }
  };

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
    setMobileMenuOpen(false);
  };

  return (
    <div className="bg-background text-on-background flex flex-col min-h-screen">
      {/* TopNavBar */}
      <nav className="bg-white border-b border-border-subtle sticky top-0 z-50 shadow-sm">
        <div className="flex justify-between items-center w-full px-8 py-4 max-w-container-max mx-auto">
          <a className="font-headline-md text-headline-md font-extrabold text-secondary flex items-center gap-2" href="#">
            <img 
              alt="Fida-Edutech Logo" 
              className="h-10 w-auto object-contain" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuDYFIFGV115SAiQMFBhhqYvT5pn0pVM_OTKzo9Vjrlj5QleL6iA1M7kJh7ZAmprRwqhTA8E4ANqwFNTH2c9n8up5w0e1QQXzD34hMOxoWy1cczUPBgSNJaB7EpYHFMDI5zTBTC9O9zxoot_yJzQmlZ5uVKi6_pc4BJr78Nqew6g_vjwjSJ_h0YlGtrwmvsJ_DxzuaG-RSV3l_EJIuANQfRD5VNWzxcvU8Zq0BVIqOv8jLhqJsmtISuiFYv_HZaLPwx_aAc"
            />
          </a>
          
          <div className="hidden md:flex items-center gap-8">
            <button onClick={() => scrollToSection('tahapan')} className="text-on-surface-variant font-label-md hover:text-primary transition-colors font-medium">Program Belajar</button>
            <button onClick={() => scrollToSection('paket')} className="text-on-surface-variant font-label-md hover:text-primary transition-colors font-medium">Pilihan Paket</button>
            <button onClick={() => scrollToSection('testimoni')} className="text-on-surface-variant font-label-md hover:text-primary transition-colors font-medium">Testimoni</button>
          </div>

          <div className="hidden md:flex items-center gap-4">
            {currentUser ? (
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium text-text-heading bg-slate-100 px-3 py-1.5 rounded-full flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[18px] text-secondary">account_circle</span>
                  {currentUser.name} ({currentUser.role === 'teacher' ? 'Tentor' : 'Siswa'})
                </span>
                <button 
                  onClick={onGoToDashboard} 
                  className="px-5 py-2.5 rounded-xl font-label-md bg-secondary text-white hover:scale-105 transition-transform duration-200 shadow-sm"
                >
                  Dashboard LMS
                </button>
                <button 
                  onClick={onLogout} 
                  className="p-2.5 rounded-xl text-text-muted hover:text-error hover:bg-error/5 transition-colors"
                  title="Logout"
                >
                  <span className="material-symbols-outlined text-[20px] block">logout</span>
                </button>
              </div>
            ) : (
              <button 
                onClick={onOpenAuth}
                className="px-6 py-2.5 rounded-xl font-label-md bg-primary-container text-white hover:scale-105 transition-transform duration-200 shadow-md"
              >
                Masuk
              </button>
            )}
          </div>
          
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden p-2 text-on-surface">
            <span className="material-symbols-outlined">{mobileMenuOpen ? 'close' : 'menu'}</span>
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-border-subtle bg-white px-8 py-4 flex flex-col gap-4 animate-slide-down">
            <button onClick={() => scrollToSection('tahapan')} className="text-left py-2 text-on-surface-variant font-semibold">Program Belajar</button>
            <button onClick={() => scrollToSection('paket')} className="text-left py-2 text-on-surface-variant font-semibold">Pilihan Paket</button>
            <button onClick={() => scrollToSection('testimoni')} className="text-left py-2 text-on-surface-variant font-semibold">Testimoni</button>
            <div className="border-t border-border-subtle pt-4">
              {currentUser ? (
                <div className="flex flex-col gap-3">
                  <span className="text-sm font-semibold text-text-heading">Halo, {currentUser.name}</span>
                  <button onClick={onGoToDashboard} className="w-full text-center py-2.5 rounded-xl bg-secondary text-white font-semibold shadow-sm">Dashboard LMS</button>
                  <button onClick={onLogout} className="w-full text-center py-2.5 rounded-xl border border-error text-error hover:bg-error/5 font-semibold">Keluar</button>
                </div>
              ) : (
                <button onClick={onOpenAuth} className="w-full text-center py-2.5 rounded-xl bg-primary-container text-white font-semibold shadow-sm">Masuk</button>
              )}
            </div>
          </div>
        )}
      </nav>

      <main className="flex-grow">
        {/* Hero Section */}
        <section 
          className="w-full px-4 md:px-8 flex flex-col items-center text-center justify-center relative"
          style={{
            backgroundImage: `linear-gradient(rgba(247, 249, 251, 0.75), rgba(247, 249, 251, 0.85)), url("/bg_dashboard.png")`,
            backgroundSize: 'cover',
            backgroundPosition: 'center center',
            minHeight: '600px'
          }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-fixed/40 text-on-primary-fixed font-label-sm mb-8 border border-primary-fixed/80">
            <span className="material-symbols-outlined text-[16px] text-primary">rocket_launch</span>
            Kelas Interaktif Live Zoom untuk Usia 7-15 Tahun
          </div>
          <h1 className="font-headline-xl text-headline-xl text-text-heading max-w-4xl mb-6 leading-tight font-extrabold tracking-tight">
            Kuasai Logika Matematika &amp; Ciptakan Game Pertama bersama Fida-Edutech!
          </h1>
          <p className="font-body-lg text-body-lg text-text-muted max-w-2xl mb-10 text-lg">
            Metode belajar berbasis proyek yang menyenangkan. Melatih problem solving, kreativitas, dan logika komputasi anak sejak dini.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <button 
              onClick={() => scrollToSection('paket')} 
              className="px-8 py-4 rounded-2xl font-label-md bg-primary-container text-white shadow-lg hover:shadow-xl hover:scale-[1.03] transition-all flex items-center justify-center gap-2 font-bold"
            >
              Pilih Paket Belajar
              <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
            </button>
            <button 
              onClick={() => scrollToSection('tahapan')}
              className="px-8 py-4 rounded-2xl font-label-md bg-white border border-border-subtle text-secondary shadow-md hover:border-secondary hover:shadow-lg hover:scale-[1.03] transition-all flex items-center justify-center gap-2 font-bold"
            >
              <span className="material-symbols-outlined text-[20px]">calendar_today</span>
              Lihat Jadwal &amp; Kurikulum
            </button>
          </div>
        </section>

        {/* Courses Grid */}
        <section id="paket" className="max-w-container-max mx-auto px-4 md:px-8 py-20 mt-16 bg-white rounded-3xl shadow-sm border border-border-subtle mb-16">
          <div className="text-center mb-16">
            <h2 className="font-headline-lg text-headline-lg text-text-heading font-extrabold text-3xl mb-4">Pilihan Paket Belajar</h2>
            <p className="font-body-md text-body-md text-text-muted max-w-lg mx-auto">Dirancang khusus untuk menyesuaikan tingkat pemahaman anak di setiap tingkatannya.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Card 1: Math */}
            <div className="bg-white rounded-3xl border border-border-subtle shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-300 flex flex-col overflow-hidden group">
              <div className="bg-secondary/10 p-8 flex justify-between items-start border-b border-border-subtle group-hover:bg-secondary/[0.15] transition-colors">
                <div>
                  <span className="inline-block px-3 py-1 bg-white text-secondary text-[12px] font-bold rounded-lg shadow-sm mb-3 border border-secondary/10">SD &amp; SMP</span>
                  <h3 className="font-headline-md text-[20px] font-extrabold text-text-heading flex items-center gap-2">
                    <span className="material-symbols-outlined text-secondary text-[24px]">calculate</span>
                    Matematika Logika &amp; Olympiad
                  </h3>
                </div>
              </div>
              <div className="p-8 flex-grow flex flex-col">
                <ul className="space-y-4 mb-8 flex-grow">
                  <li className="flex items-start gap-3">
                    <span className="material-symbols-outlined text-tertiary-container text-[20px] mt-0.5" style={{ fontVariationSettings: '"FILL" 1' }}>check_circle</span>
                    <span className="font-body-md text-text-body">8x Live sesi interaktif Zoom</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="material-symbols-outlined text-tertiary-container text-[20px] mt-0.5" style={{ fontVariationSettings: '"FILL" 1' }}>check_circle</span>
                    <span className="font-body-md text-text-body">Latihan penalaran logis &amp; Pre/Post-test</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="material-symbols-outlined text-tertiary-container text-[20px] mt-0.5" style={{ fontVariationSettings: '"FILL" 1' }}>check_circle</span>
                    <span className="font-body-md text-text-body">Laporan perkembangan &amp; review tentor</span>
                  </li>
                </ul>
                <button 
                  onClick={() => handleSelectPackage('math')}
                  className="w-full py-3.5 rounded-2xl border-2 border-secondary text-secondary font-bold hover:bg-secondary hover:text-white transition-all duration-200"
                >
                  Pilih Kelas Math
                </button>
              </div>
            </div>

            {/* Card 2: Scratch */}
            <div className="bg-white rounded-3xl border border-border-subtle shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-300 flex flex-col overflow-hidden relative group">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 bg-red-500 text-white text-[12px] font-bold px-4 py-1.5 rounded-b-xl shadow-md flex items-center gap-1 z-10">
                Best Seller <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: '"FILL" 1' }}>local_fire_department</span>
              </div>
              <div className="bg-purple-600/10 p-8 pt-12 flex justify-between items-start border-b border-border-subtle group-hover:bg-purple-600/[0.15] transition-colors">
                <div>
                  <span className="inline-block px-3 py-1 bg-white text-purple-600 text-[12px] font-bold rounded-lg shadow-sm mb-3 border border-purple-600/10">Usia 7-15 Tahun</span>
                  <h3 className="font-headline-md text-[20px] font-extrabold text-text-heading flex items-center gap-2">
                    <span className="material-symbols-outlined text-purple-600 text-[24px]">code_blocks</span>
                    Scratch Game Programming
                  </h3>
                </div>
              </div>
              <div className="p-8 flex-grow flex flex-col">
                <ul className="space-y-4 mb-8 flex-grow">
                  <li className="flex items-start gap-3">
                    <span className="material-symbols-outlined text-tertiary-container text-[20px] mt-0.5" style={{ fontVariationSettings: '"FILL" 1' }}>check_circle</span>
                    <span className="font-body-md text-text-body">Membuat 8+ Game interaktif</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="material-symbols-outlined text-tertiary-container text-[20px] mt-0.5" style={{ fontVariationSettings: '"FILL" 1' }}>check_circle</span>
                    <span className="font-body-md text-text-body">Dasar logika pemrograman visual</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="material-symbols-outlined text-tertiary-container text-[20px] mt-0.5" style={{ fontVariationSettings: '"FILL" 1' }}>check_circle</span>
                    <span className="font-body-md text-text-body">Sertifikat kelulusan &amp; portofolio game</span>
                  </li>
                </ul>
                <button 
                  onClick={() => handleSelectPackage('scratch')}
                  className="w-full py-3.5 rounded-2xl border-2 border-purple-600 text-purple-600 font-bold hover:bg-purple-600 hover:text-white transition-all duration-200"
                >
                  Pilih Kelas Scratch
                </button>
              </div>
            </div>

            {/* Card 3: Combo */}
            <div className="bg-white rounded-3xl border-2 border-primary-container shadow-md hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 flex flex-col overflow-hidden relative group">
              <div className="absolute top-0 right-0 bg-primary-container text-white text-[12px] font-bold px-4 py-1.5 rounded-bl-2xl shadow-md flex items-center gap-1 z-10">
                Hemat 35% <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: '"FILL" 1' }}>loyalty</span>
              </div>
              <div className="bg-primary-container/10 p-8 flex justify-between items-start border-b border-primary-container/20">
                <div>
                  <span className="inline-block px-3 py-1 bg-white text-primary text-[12px] font-bold rounded-lg shadow-sm mb-3 border border-primary/10">Math + Scratch</span>
                  <h3 className="font-headline-md text-[20px] font-extrabold text-text-heading flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary-container text-[24px]">stars</span>
                    Combo Master
                  </h3>
                  <p className="text-sm text-text-muted mt-2">Paket Lengkap Logika &amp; Pemrograman</p>
                </div>
              </div>
              <div className="p-8 flex-grow flex flex-col">
                <ul className="space-y-4 mb-8 flex-grow">
                  <li className="flex items-start gap-3">
                    <span className="material-symbols-outlined text-tertiary-container text-[20px] mt-0.5" style={{ fontVariationSettings: '"FILL" 1' }}>check_circle</span>
                    <span className="font-body-md text-text-body font-semibold">Total 16x Sesi Interaktif</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="material-symbols-outlined text-tertiary-container text-[20px] mt-0.5" style={{ fontVariationSettings: '"FILL" 1' }}>check_circle</span>
                    <span className="font-body-md text-text-body">1-on-1 Mentoring Bulanan</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="material-symbols-outlined text-tertiary-container text-[20px] mt-0.5" style={{ fontVariationSettings: '"FILL" 1' }}>check_circle</span>
                    <span className="font-body-md text-text-body">Gratis Exclusive Exam Kit &amp; merchandise</span>
                  </li>
                </ul>
                <button 
                  onClick={() => handleSelectPackage('combo')}
                  className="w-full py-3.5 bg-primary-container hover:bg-primary-container/90 text-white font-bold rounded-2xl shadow-md hover:scale-[1.02] transition-all"
                >
                  Pilih Combo Master
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Checkout Area / Tahapan Pembelajaran */}
        <section id="tahapan" className="max-w-container-max mx-auto px-4 md:px-8 py-16 mb-16">
          <div className="bg-white rounded-3xl shadow-sm border border-border-subtle overflow-hidden">
            <div className="p-8 lg:p-12 bg-slate-50 flex flex-col items-center">
              <h2 className="font-headline-lg text-headline-lg text-text-heading font-extrabold text-3xl mb-6 flex items-center justify-center flex-wrap gap-3">
                Tahapan Pembelajaran Kelas
                <span className="px-3 py-1 bg-green-100 text-green-700 text-sm font-semibold rounded-full flex items-center gap-1">
                  <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: '"FILL" 1' }}>verified</span> 
                  Terverifikasi
                </span>
              </h2>
              <p className="font-body-md text-text-muted mb-12 text-center max-w-xl">
                Investasi terbaik untuk membangun pondasi logika dan kreativitas anak di era digital dengan skema pembelajaran yang terukur.
              </p>
              
              <div className="mb-12 w-full">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                  <div className="flex flex-col items-center text-center gap-4 bg-white p-6 rounded-2xl border border-border-subtle shadow-sm hover:shadow-md transition-shadow">
                    <div className="w-14 h-14 rounded-2xl bg-secondary/10 border-2 border-secondary/20 flex items-center justify-center shadow-sm">
                      <span className="material-symbols-outlined text-secondary text-[28px]">assignment</span>
                    </div>
                    <div>
                      <h4 className="font-body-md font-bold text-text-heading text-lg">Pre-test</h4>
                      <p className="text-sm text-text-muted mt-2">Menguji pemahaman logika awal siswa sebelum sesi dimulai.</p>
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-center text-center gap-4 bg-white p-6 rounded-2xl border border-border-subtle shadow-sm hover:shadow-md transition-shadow">
                    <div className="w-14 h-14 rounded-2xl bg-purple-600/10 border-2 border-purple-600/20 flex items-center justify-center shadow-sm">
                      <span className="material-symbols-outlined text-purple-600 text-[28px]">video_chat</span>
                    </div>
                    <div>
                      <h4 className="font-body-md font-bold text-text-heading text-lg">Interactive Zoom</h4>
                      <p className="text-sm text-text-muted mt-2">Live mentoring interaktif, mengajarkan pemecahan masalah secara nyata.</p>
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-center text-center gap-4 bg-white p-6 rounded-2xl border border-border-subtle shadow-sm hover:shadow-md transition-shadow">
                    <div className="w-14 h-14 rounded-2xl bg-primary-container/10 border-2 border-primary-container/20 flex items-center justify-center shadow-sm">
                      <span className="material-symbols-outlined text-primary-container text-[28px]">quiz</span>
                    </div>
                    <div>
                      <h4 className="font-body-md font-bold text-text-heading text-lg">Post-test</h4>
                      <p className="text-sm text-text-muted mt-2">Mengukur pemahaman materi baru di setiap akhir sesi.</p>
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-center text-center gap-4 bg-white p-6 rounded-2xl border border-border-subtle shadow-sm hover:shadow-md transition-shadow">
                    <div className="w-14 h-14 rounded-2xl bg-tertiary-container/10 border-2 border-tertiary-container/20 flex items-center justify-center shadow-sm">
                      <span className="material-symbols-outlined text-tertiary-container text-[28px]">emoji_events</span>
                    </div>
                    <div>
                      <h4 className="font-body-md font-bold text-text-heading text-lg">Review &amp; Sertifikat</h4>
                      <p className="text-sm text-text-muted mt-2">Apresiasi proyek akhir game/math portofolio dan rapor berkala.</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 w-full">
                <div className="bg-white p-4 rounded-2xl border border-border-subtle shadow-sm flex items-center justify-center gap-3">
                  <span className="material-symbols-outlined text-secondary">all_inclusive</span>
                  <div className="text-sm font-semibold text-text-heading">Akses Soal Unlimited</div>
                </div>
                <div className="bg-white p-4 rounded-2xl border border-border-subtle shadow-sm flex items-center justify-center gap-3">
                  <span className="material-symbols-outlined text-purple-600">key</span>
                  <div className="text-sm font-semibold text-text-heading">Kunci Jawaban &amp; Solusi</div>
                </div>
                <div className="bg-white p-4 rounded-2xl border border-border-subtle shadow-sm flex items-center justify-center gap-3">
                  <span className="material-symbols-outlined text-primary-container">calculate</span>
                  <div className="text-sm font-semibold text-text-heading">8x Math Logika</div>
                </div>
                <div className="bg-white p-4 rounded-2xl border border-border-subtle shadow-sm flex items-center justify-center gap-3">
                  <span className="material-symbols-outlined text-tertiary-container">code_blocks</span>
                  <div className="text-sm font-semibold text-text-heading">8x Scratch Prog.</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section id="testimoni" className="max-w-container-max mx-auto px-4 md:px-8 py-16 mb-16">
          <div className="text-center mb-12">
            <h2 className="font-headline-lg text-headline-lg text-text-heading font-extrabold text-3xl mb-4">Apa Kata Mereka?</h2>
            <p className="font-body-md text-body-md text-text-muted">Cerita sukses dari para siswa yang telah berkembang bersama Fida-Edutech.</p>
          </div>
          <div className="flex overflow-x-auto gap-6 pb-8 scrollbar-hide snap-x snap-mandatory">
            {/* Card 1 */}
            <div className="min-w-[320px] md:min-w-[400px] bg-white p-8 rounded-3xl border border-border-subtle shadow-sm hover:shadow-md transition-all flex flex-col snap-center">
              <div className="flex items-center gap-4 mb-6">
                <img 
                  alt="Budi Santoso" 
                  className="w-14 h-14 rounded-full object-cover border-2 border-primary-fixed"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuDkWxmlPgwuDlNVS5CKpWcYIiedoxh5JGhC7uCPXWc6K45XmajU4kS3frDvXsRN89meCLCfHjQ-B8BWgSxitpI1r4udqc-RnoYQ1yL3A8MmuCYs7xvGZD8UJEWVjT6S37lbLyz4IRKYSh4fh05UWjSBujMIfEDcR7ZlbhGqIZVo2Atgj-ETMGT1WZXSe7Py5AaUgyizahGZ7L5brl3bbPPxk3thlCEan9VoN_xmaXr-xwGLjPxWQrfvfg"
                />
                <div>
                  <h4 className="font-body-md font-bold text-text-heading">Budi Santoso</h4>
                  <p className="text-xs text-text-muted">Alumni Scratch Game Programming</p>
                </div>
              </div>
              <div className="flex gap-1 mb-4 text-yellow-500">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: '"FILL" 1' }}>star</span>
                ))}
              </div>
              <p className="font-body-md text-text-body italic text-sm leading-relaxed">
                "Belajar coding di sini seru banget! Kakak pengajarnya sabar dan materinya gampang dimengerti. Sekarang aku sudah bisa bikin game sendiri!"
              </p>
            </div>

            {/* Card 2 */}
            <div className="min-w-[320px] md:min-w-[400px] bg-white p-8 rounded-3xl border border-border-subtle shadow-sm hover:shadow-md transition-all flex flex-col snap-center">
              <div className="flex items-center gap-4 mb-6">
                <img 
                  alt="Siti Aminah" 
                  className="w-14 h-14 rounded-full object-cover border-2 border-primary-fixed"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuBi0xOKBxWgu9wdBhm2S0ct0o-HxOOFnm9mNr85rqm6xG2RCtmf3XLC-ZEPJufGiEJO0SBKdffd0JySWcGXErAEwgYBrG9itcwpUsUCjikP9hPBdeCkz5DUYfnua3cAe3j0PINGZ7G9EohCfWf-xb89g6QqLk_wZAmigly9QJ50xqZkit53ULMZTOmnR3pUuo2jh8UZKhm1HFLp1mQe5L1GtQgqNhOmcPg-4Op-dMGn0gi6zvCRGGG8LA"
                />
                <div>
                  <h4 className="font-body-md font-bold text-text-heading">Siti Aminah</h4>
                  <p className="text-xs text-text-muted">Siswa Matematika Logika</p>
                </div>
              </div>
              <div className="flex gap-1 mb-4 text-yellow-500">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: '"FILL" 1' }}>star</span>
                ))}
              </div>
              <p className="font-body-md text-text-body italic text-sm leading-relaxed">
                "Dulu aku takut sama matematika, tapi setelah ikut kelas di Fida-Edutech, aku jadi lebih suka tantangan logika. Nilai di sekolah juga naik!"
              </p>
            </div>

            {/* Card 3 */}
            <div className="min-w-[320px] md:min-w-[400px] bg-white p-8 rounded-3xl border border-border-subtle shadow-sm hover:shadow-md transition-all flex flex-col snap-center">
              <div className="flex items-center gap-4 mb-6">
                <img 
                  alt="Andi Wijaya" 
                  className="w-14 h-14 rounded-full object-cover border-2 border-primary-fixed"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuAJnElP9uJkGk7DQ7fSmdJq9pKmGlKuSfs5E3ZFkD0nVW23ofALh3rB9h-Q_DEJ7z310CvJrLr6P9pgC7_DyEyVm59uaWQsLPiuQXeJHI_F9aodJS24rTaMD4Bro983eFZd7DoAs1M_I6Dxnt-RmmrQSSiDt_ELSEaAoBuCKJQyP_GCw0gyafk_mf2AsXcwAidKzCOa91SMjMPBMdQq9KZx_IsyU3O3Z02nJmMZRkQ79lt3bXgHxehIDg"
                />
                <div>
                  <h4 className="font-body-md font-bold text-text-heading">Andi Wijaya</h4>
                  <p className="text-xs text-text-muted">Combo Master Student</p>
                </div>
              </div>
              <div className="flex gap-1 mb-4 text-yellow-500">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: '"FILL" 1' }}>star</span>
                ))}
              </div>
              <p className="font-body-md text-text-body italic text-sm leading-relaxed">
                "Paket Combo Master sangat lengkap. Aku belajar logika matematika sekaligus cara menerapkannya ke dalam pemrograman Scratch. Rekomendasi sekali!"
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-border-subtle mt-auto">
        <div className="w-full px-8 py-16 max-w-container-max mx-auto flex flex-col md:flex-row justify-between items-start gap-12">
          <div className="max-w-sm">
            <div className="font-headline-md text-headline-md font-bold text-secondary mb-4 flex items-center gap-2">
              <img 
                alt="Fida-Edutech Logo" 
                className="h-12 w-auto object-contain" 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDYFIFGV115SAiQMFBhhqYvT5pn0pVM_OTKzo9Vjrlj5QleL6iA1M7kJh7ZAmprRwqhTA8E4ANqwFNTH2c9n8up5w0e1QQXzD34hMOxoWy1cczUPBgSNJaB7EpYHFMDI5zTBTC9O9zxoot_yJzQmlZ5uVKi6_pc4BJr78Nqew6g_vjwjSJ_h0YlGtrwmvsJ_DxzuaG-RSV3l_EJIuANQfRD5VNWzxcvU8Zq0BVIqOv8jLhqJsmtISuiFYv_HZaLPwx_aAc"
              />
            </div>
            <p className="font-body-md text-body-md text-text-muted mb-6 text-sm">
              Membangun jembatan antara kemampuan matematika konvensional dan logika pemrograman modern untuk generasi masa depan.
            </p>
            <p className="font-label-sm text-label-sm text-text-muted text-xs">
              © 2026 Fida-Edutech. Bridge the gap between Math and Logic.
            </p>
          </div>
          
          <div className="flex flex-col gap-3">
            <h4 className="font-label-md font-bold text-text-heading mb-2">Navigasi</h4>
            <button onClick={() => scrollToSection('tahapan')} className="text-text-muted text-left font-body-md text-sm hover:text-secondary transition-colors">Program Belajar</button>
            <button onClick={() => scrollToSection('paket')} className="text-text-muted text-left font-body-md text-sm hover:text-secondary transition-colors">Pilihan Paket</button>
            <button onClick={() => scrollToSection('testimoni')} className="text-text-muted text-left font-body-md text-sm hover:text-secondary transition-colors">Testimoni</button>
          </div>
          
          <div className="flex flex-col gap-3">
            <h4 className="font-label-md font-bold text-text-heading mb-2">Bantuan</h4>
            <a className="text-text-muted font-body-md text-sm hover:text-secondary transition-colors" href="#">FAQ</a>
            <a className="text-text-muted font-body-md text-sm hover:text-secondary transition-colors" href="#">Hubungi Kami</a>
            <a className="text-text-muted font-body-md text-sm hover:text-secondary transition-colors" href="#">Syarat &amp; Ketentuan</a>
            <a className="text-text-muted font-body-md text-sm hover:text-secondary transition-colors" href="#">Kebijakan Privasi</a>
          </div>
        </div>
      </footer>
    </div>
  );
};
