import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axiosClient from '../api/axiosClient';
import { Heart, Repeat2, Star, Trash2, ArrowLeft, Send, X, MessageSquare } from 'lucide-react';
import UserBadge from '../components/UserBadge';
import toast from 'react-hot-toast';
import DOMPurify from 'dompurify';
import ConfirmModal from '../components/ConfirmModal';

const PostDetail = () => {
    const { id } = useParams();
    const [post, setPost] = useState(null);
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState("");
    const [userRating, setUserRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [loading, setLoading] = useState(true);
    const [submittingComment, setSubmittingComment] = useState(false);
    
    const [liked, setLiked] = useState(false);
    const [likeCount, setLikeCount] = useState(0);
    const [reposted, setReposted] = useState(false);

    // State cho ConfirmModal
    const [confirmState, setConfirmState] = useState({
        isOpen: false,
        title: '',
        message: '',
        onConfirm: () => {}
    });

    // Lightbox state cho gallery
    const [lightboxImg, setLightboxImg] = useState(null);

    const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
    const token = localStorage.getItem('token');
    const isAdmin = currentUser.role === 'admin';
    const isPostOwner = post && post.author_id == currentUser.id;

    useEffect(() => {
        fetchData();
    }, [id]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const resData = await axiosClient.get(`/api/posts/read_single.php?id=${id}`);
            setPost(resData);
            setLikeCount(resData.total_likes);
            setLiked(resData.liked || false);
            setReposted(resData.reposted || false);
            
            const commentData = await axiosClient.get(`/api/comments/read.php?post_id=${id}`);
            setComments(commentData);
            
            setLoading(false);
        } catch (err) {
            console.error('Fetch Detail Error:', err);
            setLoading(false);
        }
    };

    const handleCommentSubmit = async (e) => {
        e.preventDefault();
        if (!token) return toast.error("Vui lòng đăng nhập để bình luận.");
        if (!newComment.trim()) return;

        setSubmittingComment(true);
        try {
            const res = await axiosClient.post('/api/comments/create.php', 
                { post_id: id, content: newComment },
                { headers: { 'Authorization': 'Bearer ' + token } }
            );
            const newCommentObj = { ...res.comment, user_id: currentUser.id };
            setComments([newCommentObj, ...comments]);
            setNewComment("");
            setSubmittingComment(false);
            toast.success("Đã đăng bình luận");
        } catch (err) {
            toast.error(err.response?.data?.message || "Lỗi khi gửi bình luận.");
            setSubmittingComment(false);
        }
    };

    const canDeleteComment = (comment) => {
        if (!currentUser.id) return false;
        if (isAdmin) return true;
        if (comment.user_id == currentUser.id) return true;
        if (isPostOwner) return true;
        return false;
    };

    const handleDeleteComment = (commentId) => {
        setConfirmState({
            isOpen: true,
            title: "Xóa bình luận",
            message: "Bạn có chắc chắn muốn xóa bình luận này?",
            onConfirm: async () => {
                setConfirmState(prev => ({ ...prev, isOpen: false }));
                try {
                    await axiosClient.post('/api/comments/delete.php', 
                        { id: commentId },
                        { headers: { 'Authorization': 'Bearer ' + token } }
                    );
                    setComments(comments.filter(c => c.id !== commentId));
                    toast.success("Đã xóa bình luận");
                } catch (err) {
                    toast.error(err.response?.data?.message || "Lỗi khi xóa bình luận.");
                }
            }
        });
    };

    const handleRating = async (stars) => {
        if (!token) return toast.error("Vui lòng đăng nhập để đánh giá.");
        try {
            const res = await axiosClient.post('/api/ratings/rate.php', 
                { post_id: id, stars },
                { headers: { 'Authorization': 'Bearer ' + token } }
            );
            setUserRating(stars);
            setPost({...post, avg_rating: res.new_avg});
            toast.success(res.message);
        } catch (err) {
            toast.error("Lỗi đánh giá.");
        }
    };

    const handleLike = async () => {
        if (!token) return toast.error("Vui lòng đăng nhập để thả tim.");
        try {
            const res = await axiosClient.post('/api/social/like.php', 
                { post_id: id },
                { headers: { 'Authorization': 'Bearer ' + token } }
            );
            setLiked(res.status === 'liked');
            setLikeCount(res.total_likes);
        } catch (err) {
            toast.error("Lỗi khi thả tim.");
        }
    };

    const handleRepost = async () => {
        if (!token) return toast.error("Vui lòng đăng nhập để Repost.");
        try {
            const res = await axiosClient.post('/api/social/repost.php', 
                { post_id: id },
                { headers: { 'Authorization': 'Bearer ' + token } }
            );
            setReposted(res.status === 'reposted');
            toast.success(res.message);
        } catch (err) {
            toast.error("Lỗi khi Repost.");
        }
    };

    if (loading) return <div className="text-center py-20 font-bold text-blue-600 animate-pulse uppercase tracking-widest text-xs">Đang tải bài viết...</div>;
    if (!post) return <div className="text-center py-20 font-black text-red-500 uppercase tracking-widest bg-red-50 rounded-2xl border border-red-100 p-8">404: Không tìm thấy bài viết</div>;

    const gallery = post.gallery || [];

    return (
        <article className="max-w-4xl mx-auto animate-in fade-in duration-500">
            <header className="mb-8">
                <Link to="/" className="inline-flex items-center gap-1.5 text-slate-400 hover:text-blue-600 font-bold uppercase text-[10px] tracking-wider mb-6 no-underline transition-all">
                    <ArrowLeft size={12} /> Trở về trang chủ
                </Link>
                <div className="flex flex-wrap gap-2 mb-4">
                    {(post.tags || []).map(tag => (
                        <Link key={tag} to={`/?tag=${tag}`} className="text-blue-600 font-black text-[10px] uppercase bg-blue-50 px-3.5 py-1.5 rounded-full border border-blue-100 no-underline tracking-widest">
                            #{tag}
                        </Link>
                    ))}
                </div>
                <h1 className="text-3xl md:text-4xl font-black text-slate-900 leading-tight mb-6 tracking-tight">{post.title}</h1>
                <div className="flex items-center space-x-6 text-slate-400">
                    <Link to={`/profile/${post.author_uid}`} className="flex items-center group no-underline gap-1.5">
                        <div className="w-9 h-9 rounded-xl bg-slate-900 flex items-center justify-center font-bold text-white group-hover:bg-blue-600 transition-colors uppercase overflow-hidden border border-slate-200 shadow-sm">
                            {post.author_avatar ? (
                                <img 
                                    src={`http://localhost:8000/uploads/${post.author_avatar}`} 
                                    className="w-full h-full object-cover" 
                                    alt={post.author_name} 
                                />
                            ) : (
                                <span>{(post.author_full_name || post.author_name || '?').charAt(0)}</span>
                            )}
                        </div>
                        <span className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors uppercase text-xs tracking-tight">
                            {post.author_full_name || post.author_name}
                        </span>
                        <UserBadge followers={post.author_followers || 0} size={14} />
                    </Link>
                    <span className="text-xs font-mono">{new Date(post.created_at).toLocaleDateString('vi-VN')}</span>
                </div>
            </header>

            {/* Cover image */}
            {post.cover_image && (
                <div className="rounded-3xl overflow-hidden shadow-md mb-10 border border-slate-100">
                    <img src={`http://localhost:8000/uploads/${post.cover_image}`} className="w-full object-cover max-h-[420px]" alt={post.title} />
                </div>
            )}

            {/* Rich text body container */}
            <div 
                className="prose prose-slate max-w-none text-slate-800 leading-[1.8] text-justify mb-10 px-2 rich-text-content"
                dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(post.content, { ADD_DATA_URI_TAGS: ['img'] }) }}
            />

            {/* Attached media gallery */}
            {gallery.length > 0 && (
                <div className="mb-12 px-2 border-t border-slate-100 pt-8">
                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Ảnh đính kèm ({gallery.length})</h3>
                    <div className={`grid gap-3 ${
                        gallery.length === 1 ? 'grid-cols-1' :
                        gallery.length === 2 ? 'grid-cols-2' :
                        'grid-cols-2 md:grid-cols-3'
                    }`}>
                        {gallery.map((img, idx) => (
                            <div
                                key={img.id || idx}
                                className="rounded-2xl overflow-hidden border border-slate-100 shadow-sm cursor-pointer group relative aspect-square hover:shadow-md transition-all duration-300"
                                onClick={() => setLightboxImg(`http://localhost:8000/uploads/${img.image_url}`)}
                            >
                                <img
                                    src={`http://localhost:8000/uploads/${img.image_url}`}
                                    alt={`Gallery ${idx + 1}`}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                />
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all flex items-center justify-center">
                                    <span className="opacity-0 group-hover:opacity-100 text-white text-[9px] font-black uppercase tracking-widest bg-black/60 px-4 py-2 rounded-full transition-all">
                                        Xem ảnh
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Lightbox view */}
            {lightboxImg && (
                <div
                    className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 animate-in fade-in duration-200 cursor-pointer"
                    onClick={() => setLightboxImg(null)}
                >
                    <button className="absolute top-6 right-6 text-white/70 hover:text-white transition-colors bg-transparent border-0" onClick={() => setLightboxImg(null)}>
                        <X size={28} />
                    </button>
                    <img src={lightboxImg} alt="Full view" className="max-w-full max-h-[85vh] object-contain rounded-2xl shadow-2xl animate-in zoom-in-95 duration-200" />
                </div>
            )}

            {/* Engagement Widgets */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-12">
                {/* Rating card */}
                <div className="bg-white rounded-2xl p-5 border border-slate-100 flex flex-col justify-center shadow-sm/50">
                    <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest mb-2">Đánh giá bài viết</p>
                    <div className="flex items-center space-x-2">
                        <h3 className="text-2xl font-black text-slate-900">{post.avg_rating}</h3>
                        <span className="text-slate-300 font-bold text-sm">/ 5</span>
                    </div>
                    <div className="flex space-x-1 mt-2">
                        {[1, 2, 3, 4, 5].map((s) => (
                            <button 
                                key={s} 
                                onMouseEnter={() => setHoverRating(s)}
                                onMouseLeave={() => setHoverRating(0)}
                                onClick={() => handleRating(s)}
                                className={`transition-all duration-200 bg-transparent border-none p-0 outline-none hover:scale-110 active:scale-95 shadow-none ${
                                    (hoverRating || userRating || Math.round(post.avg_rating)) >= s ? 'text-yellow-400' : 'text-slate-200'
                                }`}
                            >
                                <Star 
                                    size={22} 
                                    fill={(hoverRating || userRating || Math.round(post.avg_rating)) >= s ? "currentColor" : "none"} 
                                    strokeWidth={1.5} 
                                />
                            </button>
                        ))}
                    </div>
                </div>

                {/* Likes card */}
                <div className="bg-white rounded-2xl p-5 border border-slate-100 flex items-center justify-between shadow-sm/50">
                    <div>
                        <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest mb-1">Like</p>
                        <h3 className="text-2xl font-black text-slate-900">{likeCount}</h3>
                    </div>
                    <button 
                        onClick={handleLike} 
                        className={`w-14 h-14 rounded-xl flex items-center justify-center transition-all border cursor-pointer active:scale-95 ${
                            liked 
                            ? 'bg-red-500 border-red-500 text-white shadow-md shadow-red-500/20' 
                            : 'bg-white border-slate-200 text-slate-400 hover:border-red-300 hover:text-red-500'
                        }`}
                    >
                        <Heart size={28} fill={liked ? "currentColor" : "none"} strokeWidth={2.5} />
                    </button>
                </div>

                {/* Repost card */}
                <div className="bg-white rounded-2xl p-5 border border-slate-100 flex items-center justify-between shadow-sm/50">
                    <div>
                        <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest mb-1">Repost</p>
                        <h3 className="text-2xl font-black text-slate-900">{reposted ? 'Đã Repost' : 'Repost'}</h3>
                    </div>
                    <button 
                        onClick={handleRepost} 
                        className={`w-14 h-14 rounded-xl flex items-center justify-center transition-all border cursor-pointer active:scale-95 ${
                            reposted 
                            ? 'bg-green-600 border-green-600 text-white shadow-md shadow-green-600/20' 
                            : 'bg-white border-slate-200 text-slate-400 hover:border-green-300 hover:text-green-600'
                        }`}
                    >
                        <Repeat2 size={28} strokeWidth={2.5} />
                    </button>
                </div>
            </div>

            {/* Comment Section (Light, Clean redesign) */}
            <section className="border-t border-slate-100 pt-10">
                <h2 className="text-xl font-black text-slate-900 mb-6 uppercase tracking-tight flex items-center gap-2">
                    <MessageSquare size={20} className="text-blue-600" /> Bình luận ({comments.length})
                </h2>
                
                {/* Clean white comment form */}
                <div className="bg-slate-50 border border-slate-100 rounded-3xl p-6 md:p-8 mb-10 shadow-sm/50">
                    {token ? (
                        <form onSubmit={handleCommentSubmit} className="space-y-4">
                            <textarea 
                                value={newComment} 
                                onChange={(e) => setNewComment(e.target.value)} 
                                placeholder="Chia sẻ cảm nghĩ của bạn về bài viết..." 
                                className="w-full bg-white border border-slate-200 focus:border-blue-500 rounded-2xl p-4 text-slate-800 text-sm focus:outline-none focus:ring-4 focus:ring-blue-50 transition-all resize-none shadow-sm placeholder:text-slate-350" 
                                rows={3}
                                disabled={submittingComment} 
                            />
                            <div className="flex justify-end">
                                <button 
                                    type="submit" 
                                    disabled={submittingComment}
                                    className={`flex items-center gap-1.5 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-xl shadow-md transition-all active:scale-95 uppercase text-[10px] tracking-wider cursor-pointer border-0 ${submittingComment && 'opacity-50'}`}
                                >
                                    <Send size={12} strokeWidth={2} /> Gửi bình luận
                                </button>
                            </div>
                        </form>
                    ) : (
                        <div className="text-center py-4">
                            <Link to="/login" className="inline-block px-8 py-3 bg-blue-600 text-white font-black rounded-xl no-underline hover:bg-blue-700 transition-all uppercase text-[10px] tracking-wider active:scale-95 shadow-md shadow-blue-500/10">
                                Đăng nhập để bình luận
                            </Link>
                        </div>
                    )}
                </div>

                {/* Comments list */}
                <div className="space-y-6 mb-16">
                    {comments.map((comment) => (
                        <div key={comment.id} className="flex space-x-4 animate-in fade-in duration-300">
                            <Link to={`/profile/${comment.user_uid}`} className="flex-shrink-0 no-underline">
                                <div className="w-11 h-11 rounded-xl bg-slate-900 flex items-center justify-center font-bold text-white text-sm border border-slate-100 uppercase overflow-hidden shadow-sm">
                                    {comment.username?.[0]?.toUpperCase() || '?'}
                                </div>
                            </Link>
                            <div className="flex-1 min-w-0">
                                <div className="bg-white rounded-2xl p-5 border border-slate-100 relative shadow-sm hover:shadow-md transition-all">
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-2">
                                            <Link to={`/profile/${comment.user_uid}`} className="font-bold text-slate-800 hover:text-blue-600 no-underline text-xs uppercase tracking-tight">
                                                @{comment.username}
                                            </Link>
                                            {comment.followers !== undefined && (
                                                <UserBadge followers={comment.followers || 0} size={12} />
                                            )}
                                        </div>
                                        <div className="flex items-center space-x-3 text-[10px] text-slate-400">
                                            <span className="font-mono">{comment.created_at}</span>
                                            {canDeleteComment(comment) && (
                                                <button 
                                                    onClick={() => handleDeleteComment(comment.id)} 
                                                    className="text-slate-350 hover:text-red-500 transition-all border-0 bg-transparent cursor-pointer p-0"
                                                    title={isAdmin ? 'Xóa (Admin)' : 'Xóa bình luận'}
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                    <p className="text-slate-600 leading-relaxed text-xs">{comment.content}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                    {comments.length === 0 && (
                        <div className="text-center py-10 bg-slate-50/50 rounded-2xl border border-slate-100 text-slate-400 font-mono text-[9px] uppercase tracking-widest">
                            Chưa có bình luận nào
                        </div>
                    )}
                </div>
            </section>

            {/* Confirm Modal */}
            <ConfirmModal 
                isOpen={confirmState.isOpen}
                onClose={() => setConfirmState(prev => ({ ...prev, isOpen: false }))}
                onConfirm={confirmState.onConfirm}
                title={confirmState.title}
                message={confirmState.message}
                type="warning"
            />
        </article>
    );
};

export default PostDetail;
