import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, CheckSquare, BookOpen, MessageCircle, User, LogOut, Sparkles } from 'lucide-react';
import useAuthStore from '../stores/authStore';
import toast from 'react-hot-toast';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Beranda' },
  { to: '/tasks',     icon: CheckSquare,    label: 'Tugas' },
  { to: '/summary',   icon: Sparkles,       label: 'Summary' },
  { to: '/flashcards',icon: BookOpen,       label: 'Flashcard' },
  { to: '/chat',      icon: MessageCircle,  label: 'Chat AI' },
  { to: '/profile',   icon: User,           label: 'Profil' },
];

export default function Layout({ children }) {
  const navigate = useNavigate();
  const { logout, profile } = useAuthStore();

  const handleLogout = async () => {
    await logout();
    toast.success('Sampai jumpa! 👋');
    navigate('/auth');
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar — desktop */}
      <aside className="hidden lg:flex flex-col w-64 bg-white border-r border-gray-100 fixed h-full z-30">
        {/* Logo */}
        <div className="px-6 py-5 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <img
              src="/logo.png"
              alt="Clova Logo"
              className="w-9 h-9 object-contain drop-shadow"
            />
            <h1 className="text-base font-bold text-gray-900" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
              Clova
            </h1>
          </div>
        </div>

        {/* User mini profile */}
        {profile && (
          <div className="px-4 py-3 mx-4 mt-4 bg-primary-50 rounded-2xl">
            <p className="text-sm font-semibold text-gray-800 truncate">{profile.name || 'Clova User'}</p>
            <div className="flex items-center gap-1 mt-1">
              <span className="text-orange-400 text-sm">🔥</span>
              <span className="text-xs text-gray-600">{profile.streak || 0} hari streak</span>
            </div>
          </div>
        )}

        {/* Nav items */}
        <nav className="flex-1 px-3 mt-4 space-y-1">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-primary-600 text-white shadow-glow'
                    : 'text-gray-600 hover:bg-primary-50 hover:text-primary-700'
                }`
              }
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Logout */}
        <div className="p-4">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-sm font-medium text-gray-500 hover:bg-red-50 hover:text-red-600 transition-all duration-200"
          >
            <LogOut size={18} />
            Keluar
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 lg:ml-64 pb-20 lg:pb-0">
        {children}
      </main>

      {/* Bottom Nav — mobile */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 z-30 safe-area-bottom">
        <div className="flex items-center justify-around px-2 py-2">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex flex-col items-center gap-0.5 px-3 py-2 rounded-xl transition-all duration-200 ${
                  isActive ? 'text-primary-600' : 'text-gray-400'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <div className={`p-1.5 rounded-xl ${
                    isActive ? 'bg-primary-100' : ''
                  }`}>
                    <Icon size={20} />
                  </div>
                  <span className="text-xs font-medium">{label}</span>
                </>
              )}
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  );
}
