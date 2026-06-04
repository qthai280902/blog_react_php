import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { TrendingUp, PenTool, Flame, Heart, MessageSquare } from 'lucide-react';
import axiosClient from '../api/axiosClient';

const Sidebar = () => {
  const hashtags = ['php', 'react', 'webdev', 'javascript', 'database', 'laravel', 'frontend', 'backend'];
  const [popularPosts, setPopularPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPopular = async () => {
      try {
        const res = await axiosClient.get('/api/posts/read_public.php?limit=3&sort=hot');
        if (res && res.data) {
          setPopularPosts(res.data);
        }
      } catch (err) {
        console.error("Error fetching popular posts for sidebar:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchPopular();
  }, []);

  return (
    <aside className="space-y-6">
      {/* Hot Tags Widget */}
      <div className="bg-white rounded-2xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.01)] border border-slate-100">
        <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2 uppercase tracking-wider">
          <TrendingUp size={16} className="text-blue-600" />
          Từ khóa Hot
        </h3>
        <div className="flex flex-wrap gap-2">
          {hashtags.map((tag) => (
            <Link 
              key={tag}
              to={`/?tag=${tag}`}
              className="px-3.5 py-1.5 bg-slate-50 text-slate-500 hover:text-blue-600 hover:bg-blue-50/50 hover:border-blue-200 border border-slate-100/60 rounded-xl text-xs font-semibold cursor-pointer transition-all duration-250 no-underline"
            >
              #{tag}
            </Link>
          ))}
        </div>
      </div>

      {/* Popular Posts Widget */}
      <div className="bg-white rounded-2xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.01)] border border-slate-100">
        <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2 uppercase tracking-wider">
          <Flame size={16} className="text-orange-500" />
          Bài viết đọc nhiều
        </h3>
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(n => (
              <div key={n} className="h-12 bg-slate-50 rounded-xl animate-pulse"></div>
            ))}
          </div>
        ) : popularPosts.length > 0 ? (
          <div className="space-y-4">
            {popularPosts.map((post, index) => (
              <Link 
                key={post.id} 
                to={`/post/${post.id}`} 
                className="flex items-start gap-3 no-underline group"
              >
                <span className="text-xl font-black text-slate-200 group-hover:text-blue-500/30 transition-colors leading-none w-6 text-center pt-0.5">
                  0{index + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-bold text-slate-700 group-hover:text-blue-600 line-clamp-2 leading-snug transition-colors">
                    {post.title}
                  </h4>
                  <div className="flex items-center gap-2 mt-1.5 text-[9px] text-slate-400 font-semibold uppercase tracking-wider">
                    <span>@{post.author_name}</span>
                    <span>•</span>
                    <span className="flex items-center gap-0.5"><Heart size={10} className="text-red-400" /> {post.total_likes || 0}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-[10px] text-slate-400 font-mono uppercase tracking-widest text-center py-4">Chưa có bài viết nổi bật</p>
        )}
      </div>

      {/* Start writing Widget */}
      <div className="bg-gradient-to-br from-blue-600 via-indigo-600 to-blue-700 rounded-2xl p-6 text-white shadow-xl shadow-blue-500/10">
        <div className="flex items-center gap-2 mb-3">
          <PenTool size={20} className="text-blue-200" />
          <h3 className="font-bold text-lg leading-none">Bắt đầu viết Blog</h3>
        </div>
        <p className="text-xs text-blue-100 mb-5 leading-relaxed opacity-90">
          Chia sẻ kiến thức của bạn và kết nối với cộng đồng lập trình viên trên toàn thế giới.
        </p>
        <Link 
          to="/create" 
          className="block text-center w-full py-3 bg-white text-blue-600 font-bold text-xs uppercase tracking-wider rounded-xl hover:bg-slate-50 transition-colors shadow-md shadow-blue-800/10 no-underline"
        >
          Đăng bài ngay
        </Link>
      </div>
    </aside>
  );
};

export default Sidebar;
