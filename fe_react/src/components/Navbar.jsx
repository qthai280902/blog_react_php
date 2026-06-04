import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { LogOut, User, PlusSquare, LayoutDashboard, Menu, X, Search } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [localSearch, setLocalSearch] = useState('');
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const qParam = searchParams.get('q') || '';

  // Synchronize local search input with URL param 'q'
  useEffect(() => {
    setLocalSearch(qParam);
  }, [qParam]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (localSearch.trim()) {
      navigate(`/?q=${encodeURIComponent(localSearch.trim())}`);
    } else {
      navigate('/');
    }
  };

  const displayName = user?.full_name || user?.username || 'Guest';

  return (
    <nav className="bg-white/90 backdrop-blur-md border-b border-slate-100 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo MyBlog */}
          <div className="flex items-center">
            <Link to="/" className="text-xl font-black text-slate-900 tracking-tighter no-underline flex items-center">
              MY<span className="text-blue-600">BLOG</span>
            </Link>
          </div>

          {/* Center Search Bar */}
          <form onSubmit={handleSearchSubmit} className="hidden sm:flex items-center flex-1 max-w-md mx-8 relative">
            <Search className="absolute left-3.5 text-slate-400" size={14} strokeWidth={2.5} />
            <input 
              type="text"
              placeholder="Tìm kiếm bài viết, tác giả, thẻ..."
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              className="w-full bg-slate-50 border border-slate-100 hover:bg-slate-100/30 hover:border-slate-200 focus:bg-white focus:border-blue-500 rounded-xl pl-10 pr-4 py-2.5 text-xs font-bold text-slate-800 placeholder-slate-400 outline-none transition-all focus:ring-4 focus:ring-blue-50"
            />
          </form>

          {/* Desktop Navigation Menu */}
          <div className="hidden md:flex items-center space-x-6 text-xs font-black uppercase tracking-wider text-slate-500">
            <Link to="/" className="hover:text-blue-600 transition-colors no-underline">Trang chủ</Link>
            
            {user ? (
              <>
                <Link to="/create" className="hover:text-blue-600 transition-colors no-underline flex items-center gap-1.5">
                  <PlusSquare size={16} strokeWidth={2} /> Viết bài
                </Link>
                {user.role === 'admin' && (
                  <Link to="/sys-control-0x2026" className="text-purple-600 hover:text-purple-700 transition-colors no-underline flex items-center gap-1.5">
                    <LayoutDashboard size={16} strokeWidth={2} /> Dashboard
                  </Link>
                )}
                <div className="flex items-center space-x-4 pl-4 border-l border-slate-100">
                  <Link to={`/profile/${user?.uid || user?.id}`} className="flex items-center space-x-2 text-slate-900 hover:text-blue-600 transition-colors no-underline">
                    <div className="w-8 h-8 rounded-xl bg-slate-900 flex items-center justify-center text-white text-[10px] font-black overflow-hidden shadow-sm uppercase border border-slate-100/60">
                      {user?.avatar_image ? (
                        <img 
                          src={`http://localhost:8000/uploads/${user.avatar_image}`} 
                          alt="Avatar" 
                          className="w-full h-full object-cover" 
                        />
                      ) : (
                        <span>{displayName.charAt(0)}</span>
                      )}
                    </div>
                    <span className="normal-case font-bold">{displayName}</span>
                  </Link>
                  <button 
                    onClick={handleLogout} 
                    className="flex items-center gap-1 text-red-500 hover:text-red-600 transition-all active:scale-95 uppercase text-[9px] font-black border border-red-50 hover:bg-red-50 px-2.5 py-1.5 rounded-lg"
                  >
                    <LogOut size={12} strokeWidth={2} /> Thoát
                  </button>
                </div>
              </>
            ) : (
              <Link to="/login" className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl transition-all no-underline shadow-md shadow-blue-500/10 active:scale-95">Đăng nhập</Link>
            )}
          </div>

          {/* Mobile Hamburguer Menu Trigger */}
          <div className="md:flex lg:hidden flex items-center">
            <button onClick={() => setIsOpen(!isOpen)} className="text-slate-600 p-2 border-0 bg-transparent hover:bg-slate-50 rounded-lg">
              {isOpen ? <X size={20} strokeWidth={2} /> : <Menu size={20} strokeWidth={2} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu layout */}
      {isOpen && (
        <div className="md:hidden bg-white border-b border-slate-100 p-4 space-y-4 shadow-xl animate-in slide-in-from-top duration-250">
          <form onSubmit={handleSearchSubmit} className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} strokeWidth={2.5} />
            <input 
              type="text"
              placeholder="Tìm kiếm bài viết, thẻ..."
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              className="w-full bg-slate-50 border border-slate-100 rounded-xl pl-9 pr-4 py-2.5 text-xs font-bold text-slate-800 outline-none"
            />
          </form>

          <Link to="/" onClick={() => setIsOpen(false)} className="block font-black text-xs text-slate-600 uppercase tracking-widest no-underline px-2 py-1.5">Trang chủ</Link>
          
          {user ? (
            <>
              <Link to="/create" onClick={() => setIsOpen(false)} className="flex items-center gap-2 font-black text-xs text-slate-600 uppercase tracking-widest no-underline px-2 py-1.5">
                <PlusSquare size={16} strokeWidth={2} /> Viết bài
              </Link>
              {user.role === 'admin' && (
                <Link to="/sys-control-0x2026" onClick={() => setIsOpen(false)} className="flex items-center gap-2 font-black text-xs text-purple-600 uppercase tracking-widest no-underline px-2 py-1.5">
                  <LayoutDashboard size={16} strokeWidth={2} /> Dashboard Admin
                </Link>
              )}
              <Link to={`/profile/${user?.uid || user?.id}`} onClick={() => setIsOpen(false)} className="flex items-center gap-2 font-black text-xs text-slate-900 uppercase tracking-widest no-underline px-2 py-1.5">
                <div className="w-6 h-6 rounded-lg bg-slate-900 flex items-center justify-center text-white text-[9px] font-black overflow-hidden uppercase">
                   {user?.avatar_image ? (
                        <img src={`http://localhost:8000/uploads/${user.avatar_image}`} alt="Avatar" className="w-full h-full object-cover" />
                    ) : <span>{displayName.charAt(0)}</span>}
                </div>
                Hồ sơ cá nhân
              </Link>
              <button onClick={() => { handleLogout(); setIsOpen(false); }} className="flex items-center gap-2 w-full text-left font-black text-xs text-red-500 uppercase tracking-widest px-2 py-1.5 bg-transparent border-0">
                <LogOut size={16} strokeWidth={2} /> Đăng xuất
              </button>
            </>
          ) : (
            <Link to="/login" onClick={() => setIsOpen(false)} className="block font-black text-xs text-blue-600 uppercase tracking-widest no-underline px-2 py-1.5">Đăng nhập</Link>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
