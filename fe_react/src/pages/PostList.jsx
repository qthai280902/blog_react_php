import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import axiosClient from '../api/axiosClient';
import { Heart, Repeat2, MessageSquare, Star, ChevronLeft, ChevronRight, Hash, Search, X, Newspaper } from 'lucide-react';

const PostList = () => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchParams, setSearchParams] = useSearchParams();
    
    const tagFilter = searchParams.get('tag') || '';
    const urlSearchKeyword = searchParams.get('q') || '';
    const [currentPage, setCurrentPage] = useState(1);
    const [sortType, setSortType] = useState('newest'); 
    const [pagination, setPagination] = useState({ total_pages: 1, total_posts: 0 });
    
    const token = localStorage.getItem('token');
    const postsPerPage = 8;

    // Reset page to 1 when search filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [tagFilter, sortType, urlSearchKeyword]);

    // Fetch posts when search filters or pagination change
    useEffect(() => {
        fetchPosts();
    }, [tagFilter, sortType, currentPage, urlSearchKeyword]);

    const fetchPosts = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (tagFilter)                    params.append('tag', tagFilter);
            if (urlSearchKeyword.trim())      params.append('keyword', urlSearchKeyword.trim());
            params.append('page',  currentPage);
            params.append('limit', postsPerPage);
            params.append('sort',  sortType);

            const res = await axiosClient.get(`/api/posts/read_public.php?${params.toString()}`);
            setPosts(res.data || []);
            setPagination(res.pagination || { total_pages: 1, total_posts: 0 });
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } catch (err) {
            console.error(err);
            setPosts([]);
        } finally {
            setLoading(false);
        }
    };

    const handleLike = async (postId) => {
        if (!token) return alert("Vui lòng đăng nhập để thả tim.");
        try {
            const res = await axiosClient.post('/api/social/like.php', 
                { post_id: postId },
                { headers: { 'Authorization': 'Bearer ' + token } }
            );
            setPosts(posts.map(p => {
                if (p.id === postId) {
                    return { ...p, liked: res.status === 'liked', total_likes: res.total_likes };
                }
                return p;
            }));
        } catch (err) {
            alert("Lỗi khi thả tim.");
        }
    };

    const handleRepost = async (postId) => {
        if (!token) return alert("Vui lòng đăng nhập để Repost.");
        try {
            const res = await axiosClient.post('/api/social/repost.php', 
                { post_id: postId },
                { headers: { 'Authorization': 'Bearer ' + token } }
            );
            setPosts(posts.map(p => {
                if (p.id === postId) {
                    return { ...p, reposted: res.status === 'reposted' };
                }
                return p;
            }));
            alert(res.message);
        } catch (err) {
            alert("Lỗi khi Repost bài viết.");
        }
    };

    const renderPagination = () => {
        const pages = [];
        for (let i = 1; i <= pagination.total_pages; i++) {
            pages.push(
                <button 
                    key={i}
                    onClick={() => setCurrentPage(i)}
                    className={`w-9 h-9 rounded-xl font-black text-xs transition-all active:scale-90 ${currentPage === i ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'bg-white text-slate-400 hover:bg-slate-100 border border-slate-100'}`}
                >
                    {i}
                </button>
            );
        }
        return (
            <div className="flex items-center justify-center space-x-2 mt-12 py-6 border-t border-slate-100">
                <button 
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(prev => prev - 1)}
                    className="flex items-center gap-1 px-4 py-2 bg-white text-slate-600 font-bold rounded-xl disabled:opacity-30 hover:bg-slate-50 transition-all border border-slate-100 active:scale-90 text-[10px] uppercase tracking-wider"
                >
                    Trước
                </button>
                {pages}
                <button 
                    disabled={currentPage === pagination.total_pages}
                    onClick={() => setCurrentPage(prev => prev + 1)}
                    className="flex items-center gap-1 px-4 py-2 bg-white text-slate-600 font-bold rounded-xl disabled:opacity-30 hover:bg-slate-50 transition-all border border-slate-100 active:scale-90 text-[10px] uppercase tracking-wider"
                >
                    Sau
                </button>
            </div>
        );
    };

    // Determine layout partitions
    const showFeaturedGrid = currentPage === 1 && !tagFilter && !urlSearchKeyword && posts.length >= 3;
    const heroPost = showFeaturedGrid ? posts[0] : null;
    const highlights = showFeaturedGrid ? [posts[1], posts[2]] : [];
    const displayFeedPosts = showFeaturedGrid ? posts.slice(3) : posts;

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Sorting Tabs Widget */}
            <div className="bg-white p-3.5 rounded-2xl border border-slate-100 flex items-center justify-between flex-wrap gap-4 shadow-sm/50">
                <div className="flex space-x-1.5">
                    {[
                        { id: 'newest', label: 'Mới nhất' },
                        { id: 'top_rated', label: 'Đánh giá cao' },
                        { id: 'hot', label: 'Sôi nổi' }
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setSortType(tab.id)}
                            className={`px-4.5 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all active:scale-95 border-0 ${
                                sortType === tab.id 
                                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/10' 
                                    : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                            }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>
                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-1.5">
                    {pagination.total_posts} bài viết
                </div>
            </div>

            {/* Filter Indicators */}
            {urlSearchKeyword.trim() && (
                <div className="flex items-center justify-between bg-blue-50/40 p-4 rounded-2xl border border-blue-100/50 animate-in slide-in-from-top-2 duration-300">
                    <div className="flex items-center space-x-2">
                        <span className="font-bold text-xs flex items-center gap-1 text-slate-600">
                            <Search size={14} strokeWidth={2.5} /> Kết quả tìm kiếm:
                        </span>
                        <span className="bg-blue-600 text-white px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest">
                            &quot;{urlSearchKeyword.trim()}&quot;
                        </span>
                    </div>
                    <Link to="/" className="text-blue-600 hover:text-blue-700 text-[10px] font-black uppercase tracking-wider no-underline">Xóa bộ lọc</Link>
                </div>
            )}

            {tagFilter && (
                <div className="flex items-center justify-between bg-blue-50/40 p-4 rounded-2xl border border-blue-100/50 animate-in slide-in-from-top-2 duration-300">
                    <div className="flex items-center space-x-2">
                        <span className="font-bold text-xs flex items-center gap-1 text-slate-600">
                            <Hash size={14} strokeWidth={2.5} /> Chủ đề đang xem:
                        </span>
                        <span className="bg-blue-600 text-white px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest">
                            #{tagFilter}
                        </span>
                    </div>
                    <Link to="/" className="text-blue-600 hover:text-blue-700 text-[10px] font-black uppercase tracking-wider no-underline">Xóa bộ lọc</Link>
                </div>
            )}

            {loading ? (
                <div className="space-y-6">
                    {[1, 2, 3].map(n => (
                        <div key={n} className="h-36 bg-white border border-slate-100 rounded-2xl w-full animate-pulse p-5 flex gap-5">
                            <div className="w-40 bg-slate-50 rounded-xl shrink-0 hidden sm:block"></div>
                            <div className="flex-1 space-y-4">
                                <div className="h-4 bg-slate-50 rounded w-1/4"></div>
                                <div className="h-6 bg-slate-50 rounded w-3/4"></div>
                                <div className="h-4 bg-slate-50 rounded w-full"></div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="space-y-10">
                    {/* A. Top Content Section: Magazine Featured Row */}
                    {showFeaturedGrid && heroPost && (
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
                            {/* Hero Post (Left side) */}
                            <article className="lg:col-span-8 bg-white rounded-3xl border border-slate-100 p-6 hover:shadow-[0_12px_40px_rgba(0,0,0,0.03)] hover:border-blue-100 transition-all duration-300 group flex flex-col justify-between">
                                <Link to={`/post/${heroPost.id}`} className="block overflow-hidden relative rounded-2xl aspect-[16/9] w-full bg-slate-50 border border-slate-100">
                                    {heroPost.cover_image ? (
                                        <img 
                                            src={`http://localhost:8000/uploads/${heroPost.cover_image}`}
                                            className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500"
                                            alt={heroPost.title}
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-slate-300 bg-slate-50">
                                            <Newspaper size={48} strokeWidth={1.5} />
                                        </div>
                                    )}
                                    {heroPost.tags && heroPost.tags.length > 0 && (
                                        <div className="absolute top-4 left-4 bg-blue-600 text-white px-3 py-1 text-[9px] font-black uppercase tracking-widest rounded-lg shadow-md">
                                            {heroPost.tags[0]}
                                        </div>
                                    )}
                                </Link>

                                <div className="mt-5 space-y-3 flex-1 flex flex-col justify-between">
                                    <div>
                                        <div className="flex items-center gap-2 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                                            <Link to={`/profile/${heroPost.author_uid}`} className="font-bold text-slate-600 hover:text-blue-600 no-underline">
                                                @{heroPost.author_name}
                                            </Link>
                                            <span>•</span>
                                            <span>{new Date(heroPost.created_at).toLocaleDateString('vi-VN')}</span>
                                        </div>
                                        <Link to={`/post/${heroPost.id}`} className="no-underline block">
                                            <h2 className="text-xl md:text-2xl font-black text-slate-900 leading-tight tracking-tight mt-1 hover:text-blue-600 transition-colors line-clamp-2">
                                                {heroPost.title}
                                            </h2>
                                        </Link>
                                        <p className="text-xs text-slate-500 line-clamp-3 leading-relaxed mt-2">
                                            {heroPost.content ? heroPost.content.replace(/<[^>]*>?/gm, '') : ''}
                                        </p>
                                    </div>

                                    <div className="flex items-center justify-between pt-4 border-t border-slate-100 mt-4">
                                        <div className="flex items-center gap-1 text-amber-500 font-black bg-amber-50 px-2 py-0.5 rounded text-[10px] border border-amber-100">
                                            <Star size={12} fill="currentColor" /> {heroPost.avg_rating > 0 ? parseFloat(heroPost.avg_rating).toFixed(1) : 'New'}
                                        </div>
                                        <div className="flex items-center space-x-4 text-slate-400 scale-90">
                                            <button onClick={() => handleLike(heroPost.id)} className={`flex items-center gap-1 border-0 bg-transparent cursor-pointer text-xs font-semibold ${heroPost.liked ? 'text-red-500' : 'hover:text-red-500'}`}>
                                                <Heart size={16} fill={heroPost.liked ? "currentColor" : "none"} />
                                                <span>{heroPost.total_likes || 0}</span>
                                            </button>
                                            <button onClick={() => handleRepost(heroPost.id)} className={`flex items-center border-0 bg-transparent cursor-pointer text-xs font-semibold ${heroPost.reposted ? 'text-green-600' : 'hover:text-green-600'}`}>
                                                <Repeat2 size={16} />
                                            </button>
                                            <Link to={`/post/${heroPost.id}#comments`} className="flex items-center gap-1 text-slate-400 no-underline text-xs font-semibold">
                                                <MessageSquare size={16} />
                                                <span>{heroPost.total_comments || 0}</span>
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            </article>

                            {/* Side Highlights (Right side) */}
                            <div className="lg:col-span-4 flex flex-col justify-between gap-4">
                                {highlights.map((post) => (
                                    <article key={post.id} className="bg-white rounded-3xl border border-slate-100 p-5 hover:shadow-[0_12px_40px_rgba(0,0,0,0.03)] hover:border-blue-100 transition-all duration-300 group flex-1 flex flex-col justify-between">
                                        <div>
                                            <div className="flex items-center justify-between mb-2">
                                                {post.tags && post.tags.length > 0 ? (
                                                    <span className="text-blue-600 text-[9px] font-black uppercase tracking-widest bg-blue-50 px-2 py-0.5 rounded">
                                                        #{post.tags[0]}
                                                    </span>
                                                ) : <span />}
                                                <span className="text-[9px] text-slate-400 font-mono font-bold">{new Date(post.created_at).toLocaleDateString('vi-VN')}</span>
                                            </div>
                                            <Link to={`/post/${post.id}`} className="no-underline block">
                                                <h3 className="text-sm font-black text-slate-800 group-hover:text-blue-600 leading-snug line-clamp-2 transition-colors">
                                                    {post.title}
                                                </h3>
                                            </Link>
                                            <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed mt-1.5">
                                                {post.content ? post.content.replace(/<[^>]*>?/gm, '') : ''}
                                            </p>
                                        </div>
                                        <div className="flex items-center justify-between pt-3 border-t border-slate-50 mt-3 text-[10px]">
                                            <span className="font-bold text-slate-500">@{post.author_name}</span>
                                            <span className="flex items-center gap-0.5 text-red-500"><Heart size={12} fill={post.liked ? "currentColor" : "none"} /> {post.total_likes || 0}</span>
                                        </div>
                                    </article>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* B. Main Feed: News List Layout */}
                    <div className="space-y-5">
                        {showFeaturedGrid && (
                            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-3 mb-5">Bài viết mới cập nhật</h3>
                        )}
                        {displayFeedPosts.length > 0 ? (
                            displayFeedPosts.map((post) => (
                                <article 
                                    key={post.id} 
                                    className="bg-white rounded-2xl border border-slate-100 p-5 hover:shadow-[0_8px_25px_rgba(0,0,0,0.02)] hover:border-blue-100 transition-all duration-300 group flex gap-5 animate-in fade-in"
                                >
                                    {/* Row Left: Thumbnail */}
                                    <Link to={`/post/${post.id}`} className="block overflow-hidden relative rounded-xl w-28 h-20 sm:w-36 sm:h-24 md:w-44 md:h-28 shrink-0 bg-slate-50 border border-slate-100">
                                        {post.cover_image ? (
                                            <img 
                                                src={`http://localhost:8000/uploads/${post.cover_image}`}
                                                className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500"
                                                alt={post.title}
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-slate-300 bg-slate-50">
                                                <Newspaper size={28} strokeWidth={1.5} />
                                            </div>
                                        )}
                                    </Link>

                                    {/* Row Right: Metadata & Details */}
                                    <div className="flex-1 flex flex-col justify-between py-0.5 min-w-0">
                                        <div>
                                            {/* Meta data row */}
                                            <div className="flex items-center gap-2 mb-1.5 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                                                <Link to={`/profile/${post.author_uid}`} className="font-bold text-slate-600 hover:text-blue-600 no-underline">
                                                    @{post.author_name}
                                                </Link>
                                                <span>•</span>
                                                <span>{new Date(post.created_at).toLocaleDateString('vi-VN')}</span>
                                                {post.tags && post.tags.length > 0 && (
                                                    <>
                                                        <span>•</span>
                                                        <span className="text-blue-600 font-black">#{post.tags[0]}</span>
                                                    </>
                                                )}
                                            </div>

                                            {/* Post Title */}
                                            <Link to={`/post/${post.id}`} className="no-underline block">
                                                <h2 className="text-sm sm:text-base font-black text-slate-900 leading-snug tracking-tight hover:text-blue-600 transition-colors line-clamp-2">
                                                    {post.title}
                                                </h2>
                                            </Link>

                                            {/* Excerpt */}
                                            <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed mt-1 hidden sm:block">
                                                {post.content ? post.content.replace(/<[^>]*>?/gm, '') : ''}
                                            </p>
                                        </div>

                                        {/* Actions footer */}
                                        <div className="flex items-center justify-between pt-2 border-t border-slate-50 mt-2">
                                            <div className="flex items-center gap-1 text-amber-500 font-bold bg-amber-50 px-1.5 py-0.5 rounded text-[9px] border border-amber-100">
                                                <Star size={10} fill="currentColor" /> {post.avg_rating > 0 ? parseFloat(post.avg_rating).toFixed(1) : 'New'}
                                            </div>

                                            <div className="flex items-center space-x-4 text-slate-400 scale-90">
                                                <button onClick={() => handleLike(post.id)} className={`flex items-center gap-1 border-0 bg-transparent cursor-pointer text-xs font-semibold ${post.liked ? 'text-red-500' : 'hover:text-red-500'}`}>
                                                    <Heart size={14} fill={post.liked ? "currentColor" : "none"} />
                                                    <span>{post.total_likes || 0}</span>
                                                </button>

                                                <button onClick={() => handleRepost(post.id)} className={`flex items-center border-0 bg-transparent cursor-pointer text-xs font-semibold ${post.reposted ? 'text-green-600' : 'hover:text-green-600'}`}>
                                                    <Repeat2 size={14} />
                                                </button>

                                                <Link to={`/post/${post.id}#comments`} className="flex items-center gap-1 text-slate-400 no-underline text-xs font-semibold">
                                                    <MessageSquare size={14} />
                                                    <span>{post.total_comments || 0}</span>
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                </article>
                            ))
                        ) : (
                            !showFeaturedGrid && (
                                <div className="text-center py-16 bg-white rounded-2xl border border-slate-100 text-slate-400 font-mono text-xs uppercase tracking-widest shadow-sm/50">
                                    Không tìm thấy bài viết nào phù hợp.
                                </div>
                            )
                        )}

                        {posts.length > 0 && (
                            <div className="mt-4">
                                {renderPagination()}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default PostList;
