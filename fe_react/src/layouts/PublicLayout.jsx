import React from 'react';
import { Outlet, useLocation, Link, useSearchParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';

const PublicLayout = () => {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  
  // Hide sidebar on focused routes
  const shouldHideSidebar = 
    ['/login', '/register', '/create'].includes(location.pathname) || 
    location.pathname.startsWith('/profile/');

  const activeTag = searchParams.get('tag') || '';
  const categories = ['php', 'react', 'webdev', 'javascript', 'database', 'laravel', 'frontend', 'backend'];

  return (
    <div className="min-h-screen bg-[#fafbfc] flex flex-col font-sans">
      <Navbar />

      {/* Categories Bar - Inspirations from Horizontal navigation */}
      {!['/login', '/register'].includes(location.pathname) && (
        <div className="bg-white border-b border-slate-100 sticky top-16 z-40 shadow-sm/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center space-x-2 py-3 overflow-x-auto no-scrollbar scroll-smooth">
              <Link
                to="/"
                className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider transition-all duration-200 no-underline whitespace-nowrap border ${
                  !activeTag && location.pathname === '/'
                    ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/10'
                    : 'bg-slate-50 text-slate-500 border-slate-100 hover:bg-slate-100 hover:text-slate-800'
                }`}
              >
                Tất cả
              </Link>
              {categories.map((cat) => (
                <Link
                  key={cat}
                  to={`/?tag=${cat}`}
                  className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider transition-all duration-200 no-underline whitespace-nowrap border ${
                    activeTag === cat
                      ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/10'
                      : 'bg-slate-50 text-slate-500 border-slate-100 hover:bg-slate-100 hover:text-slate-800'
                  }`}
                >
                  #{cat}
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Main Grid Wrapper */}
      <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 flex-1">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12">
          {/* Main Content Area */}
          <main className={shouldHideSidebar ? 'md:col-span-12' : 'md:col-span-8'}>
            <Outlet />
          </main>

          {/* Sticky Sidebar */}
          {!shouldHideSidebar && (
            <aside className="md:col-span-4 space-y-6">
              <div className="sticky top-32">
                <Sidebar />
              </div>
            </aside>
          )}
        </div>
      </div>

      {/* Modern Compact Footer */}
      <footer className="bg-white border-t border-slate-100 py-12 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Column 1: Logo & Slogan */}
            <div className="space-y-4">
              <Link to="/" className="text-xl font-black text-slate-900 tracking-tighter no-underline">
                MY<span className="text-blue-600">BLOG</span>
              </Link>
              <p className="text-xs text-slate-400 leading-relaxed font-medium">
                Nền tảng chia sẻ kiến thức công nghệ và lập trình cho nhà phát triển toàn cầu. Kết nối, học hỏi và phát triển.
              </p>
            </div>

            {/* Column 2: Discover */}
            <div>
              <h4 className="text-xs font-black uppercase text-slate-700 tracking-widest mb-4">Khám phá</h4>
              <ul className="space-y-2.5 p-0 list-none text-xs font-semibold">
                <li><Link to="/" className="text-slate-400 hover:text-blue-600 no-underline transition-colors">Trang chủ</Link></li>
                <li><Link to="/?tag=webdev" className="text-slate-400 hover:text-blue-600 no-underline transition-colors">Chủ đề hot</Link></li>
                <li><Link to="/?sort=hot" className="text-slate-400 hover:text-blue-600 no-underline transition-colors">Bài viết sôi nổi</Link></li>
              </ul>
            </div>

            {/* Column 3: Tools */}
            <div>
              <h4 className="text-xs font-black uppercase text-slate-700 tracking-widest mb-4">Công cụ</h4>
              <ul className="space-y-2.5 p-0 list-none text-xs font-semibold">
                <li><Link to="/create" className="text-slate-400 hover:text-blue-600 no-underline transition-colors">Viết bài mới</Link></li>
                <li><Link to="/login" className="text-slate-400 hover:text-blue-600 no-underline transition-colors">Đăng nhập tài khoản</Link></li>
              </ul>
            </div>

            {/* Column 4: Project Info */}
            <div>
              <h4 className="text-xs font-black uppercase text-slate-700 tracking-widest mb-4">Dự án</h4>
              <ul className="space-y-2.5 p-0 list-none text-xs font-semibold">
                <li className="text-slate-400">MyBlog v1.0.0</li>
                <li className="text-slate-400">React 19 & PHP Backend</li>
                <li className="text-slate-400">TailwindCSS Styling</li>
              </ul>
            </div>
          </div>

          <div className="border-t border-slate-100 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
            <span>© 2026 MyBlog. All rights reserved.</span>
            <span>Made with passion for developers.</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PublicLayout;
