import { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import DonatePage from './pages/DonatePage';
import StudentRegisterPage from './pages/StudentRegisterPage';
import StudentQRPage from './pages/StudentQRPage';
import AdminPanel from './pages/AdminPanel';
import AboutPage from './pages/AboutPage';
import RequestPage from './pages/RequestPage';

export type Page = 'home' | 'donate' | 'student-register' | 'student-qr' | 'admin' | 'about' | 'request';

export default function App() {
  const [page, setPage] = useState<Page>('home');

  const navigate = (p: Page) => {
    setPage(p);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => { window.scrollTo({ top: 0 }); }, [page]);

  const isAdmin = page === 'admin';

  return (
    <div className="min-h-screen bg-ink-950 grain">
      {!isAdmin && <Navbar page={page} onNavigate={navigate} />}
      <div key={page} className="page-enter">
        {page === 'home'             && <HomePage onNavigate={navigate} />}
        {page === 'donate'           && <DonatePage onNavigate={navigate} />}
        {page === 'student-register' && <StudentRegisterPage onNavigate={navigate} />}
        {page === 'student-qr'       && <StudentQRPage onNavigate={navigate} />}
        {page === 'admin'            && <AdminPanel />}
        {page === 'about'            && <AboutPage onNavigate={navigate} />}
        {page === 'request'          && <RequestPage onNavigate={navigate} />}
      </div>
      {!isAdmin && <Footer onNavigate={navigate} />}
    </div>
  );
}
