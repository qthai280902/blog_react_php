import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { LogOut, User, PlusSquare, LayoutDashboard, Menu, X, Search, Bell } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import axiosClient from '../api/axiosClient';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [localSearch, setLocalSearch] = useState('');
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const qParam = searchParams.get('q') || '';

  // Notifications State
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifOpen, setNotifOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('comment'); // tabs: comment, repost, like

  // Synchronize local search input with URL param 'q'
  useEffect(() => {
    setLocalSearch(qParam);
  }, [qParam]);

  const fetchNotifications = async () => {
    if (!user) return;
    try {
      const res = await axiosClient.get('/api/notifications/list.php');
      if (res && res.status === 'success') {
        const list = Array.isArray(res.data) ? res.data : [];
        setNotifications(list);
        setUnreadCount(list.filter(n => !n.is_read).length);
      }
    } catch (err) {
      console.error('Fetch notifications error:', err);
    }
  };

  useEffect(() => {
    if (user) {
      fetchNotifications();
      // Poll notifications every 30 seconds
      const interval = setInterval(fetchNotifications, 30000);
      return () => clearInterval(interval);
    }
  }, [user]);

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

  const handleNotifClick = async (notif) => {
    setNotifOpen(false);
    if (!notif.is_read) {
      try {
        await axiosClient.post('/api/notifications/mark_read.php', { id: notif.id });
        setNotifications(prev => 
          prev.map(n => n.id === notif.id ? { ...n, is_read: 1 } : n)
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
      } catch (err) {
        console.error('Mark read error:', err);
      }
    }
    if (notif.post_id) {
      navigate(`/post/${notif.post_id}`);
    } else if (notif.actor_uid) {
      navigate(`/profile/${notif.actor_uid}`);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await axiosClient.post('/api/notifications/mark_all_read.php');
      setNotifications(prev => prev.map(n => ({ ...n, is_read: 1 })));
      setUnreadCount(0);
    } catch (err) {
      console.error('Mark all read error:', err);
    }
  };

  const filteredNotifs = notifications.filter(n => {
    if (activeTab === 'comment') {
      return n.type === 'comment' || n.type === 'reply';
    }
    return n.type === activeTab;
  });

  const displayName = user?.full_name || user?.username || 'Guest';

  // Common notification dropdown JSX component
  const renderNotifDropdown = () => {
    const unreadComments = notifications.filter(n => (n.type === 'comment' || n.type === 'reply') && !n.is_read).length;
    const unreadReposts = notifications.filter(n => n.type === 'repost' && !n.is_read).length;
    const unreadLikes = notifications.filter(n => n.type === 'like' && !n.is_read).length;

    return (
      <div className="absolute right-0 mt-2 w-96 max-w-[calc(100vw-2rem)] bg-white border border-slate-100 rounded-2xl shadow-xl z-50 overflow-hidden text-slate-800 normal-case font-normal animate-in fade-in slide-in-from-top-2 duration-150">
        {/* Header */}
        <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <span className="text-[11px] font-black uppercase tracking-wider text-slate-900">Thông báo</span>
          {unreadCount > 0 && (
            <button 
              onClick={handleMarkAllRead} 
              className="text-[10px] text-blue-600 hover:text-blue-700 font-bold border-0 bg-transparent cursor-pointer p-0"
            >
              Đọc tất cả
            </button>
          )}
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-100 bg-slate-50/20 text-[10px] font-black uppercase tracking-wider text-center p-1 gap-1">
          <button 
            onClick={() => setActiveTab('comment')} 
            className={`flex-1 py-2 rounded-lg transition-all border-0 cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'comment' 
                ? 'text-blue-600 bg-white shadow-sm font-bold' 
                : 'text-slate-400 hover:text-slate-600 bg-transparent'
            }`}
          >
            Bình luận
            {unreadComments > 0 && (
              <span className="px-1.5 py-0.5 bg-blue-600 text-white rounded-full text-[8px] font-extrabold animate-pulse">
                {unreadComments}
              </span>
            )}
          </button>
          <button 
            onClick={() => setActiveTab('repost')} 
            className={`flex-1 py-2 rounded-lg transition-all border-0 cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'repost' 
                ? 'text-blue-600 bg-white shadow-sm font-bold' 
                : 'text-slate-400 hover:text-slate-600 bg-transparent'
            }`}
          >
            Đăng lại
            {unreadReposts > 0 && (
              <span className="px-1.5 py-0.5 bg-blue-600 text-white rounded-full text-[8px] font-extrabold animate-pulse">
                {unreadReposts}
              </span>
            )}
          </button>
          <button 
            onClick={() => setActiveTab('like')} 
            className={`flex-1 py-2 rounded-lg transition-all border-0 cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'like' 
                ? 'text-blue-600 bg-white shadow-sm font-bold' 
                : 'text-slate-400 hover:text-slate-600 bg-transparent'
            }`}
          >
            Thích
            {unreadLikes > 0 && (
              <span className="px-1.5 py-0.5 bg-blue-600 text-white rounded-full text-[8px] font-extrabold animate-pulse">
                {unreadLikes}
              </span>
            )}
          </button>
        </div>

        {/* Notifications List */}
        <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 no-scrollbar">
          {filteredNotifs.length === 0 ? (
            <div className="py-10 text-center text-xs text-slate-400 font-bold uppercase tracking-wider">
              Chưa có thông báo
            </div>
          ) : (
            filteredNotifs.map(n => (
              <div 
                key={n.id} 
                onClick={() => handleNotifClick(n)} 
                className={`px-4 py-3.5 flex gap-3 items-start hover:bg-slate-50/80 cursor-pointer transition-colors ${
                  !n.is_read ? 'bg-blue-50/15 font-semibold' : ''
                }`}
              >
                {/* Actor Avatar */}
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-slate-100 to-slate-200 flex-shrink-0 flex items-center justify-center overflow-hidden border border-slate-200 shadow-sm">
                  {n.actor_avatar ? (
                    <img 
                      src={`http://localhost:8000/uploads/${n.actor_avatar}`} 
                      alt="actor avatar" 
                      className="w-full h-full object-cover" 
                    />
                  ) : (
                    <span className="text-[10px] font-black uppercase text-slate-500">
                      {n.actor_name?.charAt(0)}
                    </span>
                  )}
                </div>

                {/* Message Info */}
                <div className="flex-1 min-w-0 text-left">
                  <p className="text-xs text-slate-700 leading-relaxed">
                    <span className="font-extrabold text-slate-900">@{n.actor_name}</span>{' '}
                    {n.message}
                    {n.post_title && (
                      <span className="text-slate-500 font-bold">
                        {' '}“{n.post_title}”
                      </span>
                    )}
                  </p>
                  <span className="text-[9px] text-slate-400 mt-1 block font-medium">
                    {new Date(n.created_at).toLocaleDateString('vi-VN')} {new Date(n.created_at).toLocaleTimeString('vi-VN', {hour: '2-digit', minute:'2-digit'})}
                  </span>
                </div>

                {/* Unread Dot */}
                {!n.is_read && (
                  <span className="w-2 h-2 rounded-full bg-blue-500 mt-2 flex-shrink-0 shadow-md shadow-blue-500/20" />
                )}
              </div>
            ))
          )}
        </div>
      </div>
    );
  };

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

                {/* Notification Bell */}
                <div className="relative">
                  <button 
                    onClick={() => {
                      setNotifOpen(!notifOpen);
                      if (!notifOpen) fetchNotifications();
                    }} 
                    className="relative text-slate-500 hover:text-slate-800 transition-colors p-2 border-0 bg-transparent cursor-pointer"
                  >
                    <Bell size={18} strokeWidth={2} />
                    {unreadCount > 0 && (
                      <span className="absolute top-1 right-1 bg-red-500 text-white text-[9px] font-black rounded-full h-4 w-4 flex items-center justify-center animate-pulse">
                        {unreadCount}
                      </span>
                    )}
                  </button>

                  {notifOpen && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setNotifOpen(false)} />
                      {renderNotifDropdown()}
                    </>
                  )}
                </div>

                <div className="flex items-center space-x-4 pl-4 border-l border-slate-100">
                  <Link to={`/profile/${user?.uid || user?.id}`} className="flex items-center space-x-2 text-slate-900 hover:text-blue-600 transition-colors no-underline">
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-slate-700 to-slate-800 flex items-center justify-center text-white text-[10px] font-black overflow-hidden shadow-sm uppercase border border-slate-100/60 shadow-inner">
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
                    className="flex items-center gap-1 text-red-500 hover:text-red-600 transition-all active:scale-95 uppercase text-[9px] font-black border border-red-50 hover:bg-red-50 px-2.5 py-1.5 rounded-lg cursor-pointer bg-transparent"
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
          <div className="md:flex lg:hidden flex items-center space-x-3">
            {user && (
              <div className="relative">
                <button 
                  onClick={() => {
                    setNotifOpen(!notifOpen);
                    if (!notifOpen) fetchNotifications();
                  }} 
                  className="relative text-slate-500 hover:text-slate-800 transition-colors p-2 border-0 bg-transparent cursor-pointer"
                >
                  <Bell size={18} strokeWidth={2} />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 bg-red-500 text-white text-[9px] font-black rounded-full h-4 w-4 flex items-center justify-center animate-pulse">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {notifOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setNotifOpen(false)} />
                    {renderNotifDropdown()}
                  </>
                )}
              </div>
            )}
            <button onClick={() => setIsOpen(!isOpen)} className="text-slate-600 p-2 border-0 bg-transparent hover:bg-slate-50 rounded-lg cursor-pointer">
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
                <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-slate-700 to-slate-800 flex items-center justify-center text-white text-[9px] font-black overflow-hidden uppercase shadow-inner">
                   {user?.avatar_image ? (
                        <img src={`http://localhost:8000/uploads/${user.avatar_image}`} alt="Avatar" className="w-full h-full object-cover" />
                    ) : <span>{displayName.charAt(0)}</span>}
                </div>
                Hồ sơ cá nhân
              </Link>
              <button onClick={() => { handleLogout(); setIsOpen(false); }} className="flex items-center gap-2 w-full text-left font-black text-xs text-red-500 uppercase tracking-widest px-2 py-1.5 bg-transparent border-0 cursor-pointer">
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
