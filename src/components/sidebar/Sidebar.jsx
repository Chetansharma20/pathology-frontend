import React from 'react';
import { NavLink } from 'react-router-dom';
import { Activity, LogOut, Sun, Moon } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { NAV_MENU } from '../../config/navMenu';

const Sidebar = () => {
  const { theme, toggleTheme, isDark } = useTheme();
  const { user, logout } = useAuth();

  if (!user) return null;

  return (
    <aside className="w-full md:w-80 flex flex-col h-screen sticky top-0 shadow-2xl z-40"
      style={{
        backgroundColor: 'var(--bg-sidebar)',
        borderColor: 'var(--border-primary)'
      }}>
      {/* Logo Section */}
      <div className="p-6 pl-4 flex items-center gap-4"
        style={{ borderColor: 'var(--border-secondary)' }}>
        <Activity size={24} style={{ color: 'var(--accent-indigo)' }} />
        <div className="space-y-1">
          <h2 className="font-black tracking-tighter leading-none text-2xl uppercase"
            style={{ color: 'var(--text-primary)' }}>
            Digitos
          </h2>
          <span className="text-[9px] font-black uppercase tracking-[0.4em] block opacity-60"
            style={{ color: 'var(--text-muted)' }}>
            Precision Lab
          </span>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 px-3 py-8 space-y-2 overflow-y-auto">
        {NAV_MENU.filter(m => m.roles.includes(user.role)).map(m => (
          <NavLink
            key={m.id}
            to={m.path}
            style={({ isActive }) => ({
              backgroundColor: isActive ? 'var(--accent-indigo)' : 'transparent',
              color: isActive ? 'var(--text-inverse)' : 'var(--text-secondary)',
              boxShadow: isActive ? 'var(--shadow-lg)' : 'none'
            })}
            className={({ isActive }) =>
              `w-full flex items-center gap-4 px-4 py-4 rounded-[1.75rem] font-black transition-all group relative ${isActive
                ? 'scale-[1.03]'
                : 'hover:bg-[var(--bg-hover)]'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <m.icon
                  size={22}
                  style={{
                    color: isActive ? 'var(--text-inverse)' : 'var(--text-muted)'
                  }}
                  className="group-hover:text-[var(--accent-indigo)] transition-colors"
                />
                <span className="text-[13px] tracking-tight uppercase font-black">
                  {m.label}
                </span>
                {isActive && (
                  <div className="absolute right-6 w-2 h-2 bg-[var(--text-inverse)] rounded-full"></div>
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Theme Toggle & Logout Section */}
      <div className="p-3 border-t space-y-3"
        style={{ borderColor: 'var(--border-primary)' }}>
        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          className="w-full flex items-center gap-4 px-4 py-3 rounded-xl font-medium text-sm transition-all hover:scale-[1.02]"
          style={{
            backgroundColor: 'var(--bg-secondary)',
            color: 'var(--text-primary)'
          }}
        >
          {isDark ? <Sun size={20} /> : <Moon size={20} />}
          <span>{isDark ? 'Light Mode' : 'Dark Mode'}</span>
        </button>

        {/* Logout Button */}
        <button
          onClick={logout}
          className="w-full flex items-center gap-4 px-4 py-3 rounded-xl font-medium text-sm transition-all hover:scale-[1.02]"
          style={{
            backgroundColor: 'var(--button-danger)',
            color: 'var(--text-inverse)'
          }}
        >
          <LogOut size={20} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
