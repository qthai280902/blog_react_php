import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import axiosClient from '../../api/axiosClient';
import { Search, User, Calendar, Hash, Trash2, Heart, MessageSquare, Star, X } from 'lucide-react';

const AdminPosts = () => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);

    const [keyword,  setKeyword]  = useState('');
    const [author,   setAuthor]   = useState('');
    const [hashtag,  setHashtag]  = useState('');
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo,   setDateTo]   = useState('');

    // Pagination State
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalPosts, setTotalPosts] = useState(0);
    const limit = 15;

    // Reset page to 1 when filters change
    useEffect(() => {
        setPage(1);
    }, [keyword, author, hashtag, dateFrom, dateTo]);

    const fetchPosts = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (keyword.trim())  params.append('keyword',   keyword.trim());
            if (author.trim())   params.append('author',    author.trim());
            if (hashtag.trim())  params.append('hashtag',   hashtag.trim());
            if (dateFrom)        params.append('date_from', dateFrom);
            if (dateTo)          params.append('date_to',   dateTo);
            params.append('page', page);
            params.append('limit', limit);

            const qs = params.toString();
            const url = `/api/admin/read_posts.php${qs ? '?' + qs : ''}`;

            const data = await axiosClient.get(url);
            if (data && data.status === 'success') {
                setPosts(Array.isArray(data.posts) ? data.posts : []);
                setTotalPages(data.total_pages || 1);
                setTotalPosts(data.total_posts || 0);
            } else {
                setPosts(Array.isArray(data) ? data : []);
                setTotalPages(1);
                setTotalPosts(Array.isArray(data) ? data.length : 0);
            }
        } catch (err) {
            console.error('AdminPosts fetch error:', err);
            setPosts([]);
        } finally {
            setLoading(false);
        }
    }, [keyword, author, hashtag, dateFrom, dateTo, page]);

    // Debounce 450ms for filters/page changes
    useEffect(() => {
        const timer = setTimeout(() => {
            fetchPosts();
        }, 450);
        return () => clearTimeout(timer);
    }, [fetchPosts]);

    const handleDelete = async (id, title) => {
        if (!window.confirm(`Xác nhận xóa bài viết:\n"${title}"\n\nHành động này KHÔNG thể hoàn tác!`)) return;
        try {
            await axiosClient.post('/api/posts/soft_delete.php', { post_id: id });
            setPosts(prev => prev.filter(p => p.id !== id));
            setTotalPosts(prev => Math.max(0, prev - 1));
        } catch (err) {
            alert(err?.response?.data?.message || 'Lỗi khi xóa bài viết.');
        }
    };

    const clearFilters = () => {
        setKeyword(''); setAuthor(''); setHashtag(''); setDateFrom(''); setDateTo('');
    };
    const hasFilter = keyword || author || hashtag || dateFrom || dateTo;

    return (
        <div className="space-y-8 animate-in fade-in duration-500">

            {/* ── HEADER ── */}
            <div className="flex items-end justify-between">
                <div>
                    <h1 className="text-3xl font-black text-white uppercase tracking-tight">Quản lý bài viết</h1>
                    <p className="text-cyan-500/50 font-mono text-xs uppercase mt-1">
                        Records found: <span className="text-cyan-400 font-black">{totalPosts}</span>
                    </p>
                </div>
                {hasFilter && (
                    <button onClick={clearFilters}
                        className="flex items-center gap-1.5 px-4 py-2 text-[11px] font-black uppercase tracking-widest text-red-400 bg-red-500/5 border border-red-500/20 rounded-xl hover:bg-red-500/10 transition-all active:scale-95 cursor-pointer border-0"
                    >
                        <X size={12} strokeWidth={2} /> Xóa bộ lọc
                    </button>
                )}
            </div>

            {/* ── FILTER TOOLBAR ── */}
            <div className="bg-slate-900/60 border border-cyan-500/10 rounded-2xl p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 backdrop-blur-sm">
                <div className="lg:col-span-2 space-y-1.5">
                    <label className="flex items-center gap-1 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                        <Search size={10} strokeWidth={2} /> Tìm tiêu đề
                    </label>
                    <input type="text" value={keyword} onChange={e => setKeyword(e.target.value)}
                        placeholder="Gõ từ khóa..."
                        className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500/60 rounded-xl px-4 py-2.5 text-xs text-slate-300 placeholder-slate-600 outline-none transition-colors" />
                </div>
                <div className="space-y-1.5">
                    <label className="flex items-center gap-1 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                        <User size={10} strokeWidth={2} /> Tác giả
                    </label>
                    <input type="text" value={author} onChange={e => setAuthor(e.target.value)}
                        placeholder="@username..."
                        className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500/60 rounded-xl px-4 py-2.5 text-xs text-slate-300 placeholder-slate-600 outline-none transition-colors" />
                </div>
                <div className="space-y-1.5">
                    <label className="flex items-center gap-1 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                        <Hash size={10} strokeWidth={2} /> Hashtag
                    </label>
                    <input type="text" value={hashtag} onChange={e => setHashtag(e.target.value)}
                        placeholder="#tag..."
                        className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500/60 rounded-xl px-4 py-2.5 text-xs text-slate-300 placeholder-slate-600 outline-none transition-colors" />
                </div>
                <div className="lg:col-span-5 grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                        <label className="flex items-center gap-1 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                            <Calendar size={10} strokeWidth={2} /> Từ ngày
                        </label>
                        <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500/60 rounded-xl px-4 py-2.5 text-xs text-slate-300 outline-none transition-colors [color-scheme:dark]" />
                    </div>
                    <div className="space-y-1.5">
                        <label className="flex items-center gap-1 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                            <Calendar size={10} strokeWidth={2} /> Đến ngày
                        </label>
                        <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500/60 rounded-xl px-4 py-2.5 text-xs text-slate-300 outline-none transition-colors [color-scheme:dark]" />
                    </div>
                </div>
            </div>

            {/* ── DATA TABLE ── */}
            <div className="bg-slate-950 rounded-2xl border border-cyan-500/10 overflow-hidden shadow-2xl">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-slate-900/50 border-b border-cyan-500/10">
                        <tr>
                            <th className="p-5 text-[11px] font-bold text-slate-400 uppercase tracking-widest w-16">ID</th>
                            <th className="p-5 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Tiêu đề</th>
                            <th className="p-5 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Tác giả</th>
                            <th className="p-5 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Tags</th>
                            <th className="p-5 text-[11px] font-bold text-slate-400 uppercase tracking-widest text-center">Stats</th>
                            <th className="p-5 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Ngày đăng</th>
                            <th className="p-5 text-[11px] font-bold text-slate-400 uppercase tracking-widest text-center">XÓA</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-cyan-500/5 text-sm">
                        {loading ? (
                            <tr><td colSpan="7" className="p-16 text-center text-cyan-500 font-mono text-xs uppercase tracking-widest animate-pulse">Scanning database nodes...</td></tr>
                        ) : posts.length === 0 ? (
                            <tr><td colSpan="7" className="p-20 text-center text-slate-600 font-mono text-xs uppercase tracking-[0.2em] italic">NO RECORD MATCHES CURRENT QUERY</td></tr>
                        ) : (
                            posts.map(post => (
                                <tr key={post.id} className="hover:bg-cyan-500/[0.02] transition-colors group">
                                    <td className="p-5 font-mono text-xs text-cyan-500/60">#{post.id}</td>
                                    <td className="p-5 max-w-[220px]">
                                        <Link to={`/post/${post.id}`} target="_blank"
                                            className="text-slate-300 font-semibold group-hover:text-cyan-400 transition-colors truncate block no-underline hover:underline">
                                            {post.title}
                                        </Link>
                                    </td>
                                    <td className="p-5">
                                        <div className="flex items-center gap-2">
                                            <span className="w-1.5 h-1.5 bg-green-500 rounded-full shadow-[0_0_6px_#22c55e] flex-shrink-0" />
                                            <span className="text-slate-400 font-mono text-xs">@{post.author_name}</span>
                                        </div>
                                    </td>
                                    <td className="p-5">
                                        <div className="flex flex-wrap gap-1 max-w-[120px]">
                                            {(post.tags || []).slice(0, 3).map(t => (
                                                <span key={t} className="text-[9px] font-black text-cyan-500/60 bg-cyan-500/5 border border-cyan-500/10 px-1.5 py-0.5 rounded-md uppercase tracking-tight">#{t}</span>
                                            ))}
                                        </div>
                                    </td>
                                    <td className="p-5">
                                        <div className="flex items-center justify-center gap-3 text-xs font-mono">
                                            <span className="flex items-center gap-1 text-red-400"><Heart size={11} fill="currentColor" /> {post.total_likes}</span>
                                            <span className="flex items-center gap-1 text-blue-400"><MessageSquare size={11} /> {post.total_comments}</span>
                                            <span className="flex items-center gap-1 text-amber-400"><Star size={11} fill="currentColor" /> {post.avg_rating || 0}</span>
                                        </div>
                                    </td>
                                    <td className="p-5 text-slate-500 font-mono text-xs italic whitespace-nowrap">
                                        {new Date(post.created_at).toLocaleDateString('vi-VN')}
                                    </td>
                                    <td className="p-5 text-center">
                                        <button onClick={() => handleDelete(post.id, post.title)} title="Xóa bài viết"
                                            className="inline-flex items-center gap-1.5 px-3 py-2 text-red-400 bg-red-500/5 border border-red-500/20 rounded-xl hover:bg-red-500/10 hover:border-red-500/50 transition-all active:scale-90 text-[11px] font-black uppercase tracking-widest cursor-pointer border-0">
                                            <Trash2 size={13} strokeWidth={1.5} /> Xóa
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* ── PAGINATION CONTROLS ── */}
            {totalPages > 1 && (
                <div className="flex items-center justify-between px-4 py-3 bg-slate-950/40 border border-cyan-500/10 rounded-2xl">
                    <button
                        disabled={page === 1}
                        onClick={() => setPage(prev => Math.max(1, prev - 1))}
                        className="px-4 py-2 text-xs font-black uppercase tracking-widest text-cyan-400 bg-cyan-500/5 border border-cyan-500/10 hover:bg-cyan-500/10 rounded-xl transition-all disabled:opacity-30 disabled:pointer-events-none cursor-pointer border-0"
                    >
                        Trang trước
                    </button>
                    <span className="text-xs text-slate-400 font-mono">
                        Trang <span className="text-cyan-400 font-black">{page}</span> / {totalPages}
                    </span>
                    <button
                        disabled={page === totalPages}
                        onClick={() => setPage(prev => Math.min(totalPages, prev + 1))}
                        className="px-4 py-2 text-xs font-black uppercase tracking-widest text-cyan-400 bg-cyan-500/5 border border-cyan-500/10 hover:bg-cyan-500/10 rounded-xl transition-all disabled:opacity-30 disabled:pointer-events-none cursor-pointer border-0"
                    >
                        Trang sau
                    </button>
                </div>
            )}
        </div>
    );
};

export default AdminPosts;
