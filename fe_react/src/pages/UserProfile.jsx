import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axiosClient from '../api/axiosClient';
import { Eye, EyeOff, Heart, Repeat, User, Users, ThumbsUp, ChevronRight, Trash2, RotateCcw, AlertTriangle, Archive } from 'lucide-react';
import UserBadge from '../components/UserBadge';
import EditProfileModal from '../components/EditProfileModal';
import ConfirmModal from '../components/ConfirmModal';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const UserProfile = () => {
    const { id } = useParams();
    const [profile, setProfile] = useState(null);
    const [posts, setPosts] = useState([]);
    const [reposts, setReposts] = useState([]);
    const [trashItems, setTrashItems] = useState([]);
    const [activeTab, setActiveTab] = useState('posts');
    const [loading, setLoading] = useState(true);
    const [isFollowing, setIsFollowing] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    
    // State cho ConfirmModal tùy chỉnh
    const [confirmState, setConfirmState] = useState({
        isOpen: false,
        title: '',
        message: '',
        type: 'warning',
        onConfirm: () => {}
    });

    const { user: currentUser, setAuthUser } = useAuth();
    const token = localStorage.getItem('token');
    const navigate = useNavigate();

    // [DỌN DẸP BẢO MẬT]: Không chặn đứng trang nếu là Guest hoặc xem Profile người khác
    // Tuy nhiên nếu chưa login (không có token), vẫn nên đẩy ra login để bảo vệ API Endpoint
    useEffect(() => {
        if (!token) {
            navigate('/login');
            return;
        }
    }, [token, navigate]);

    const isOwnProfile = currentUser?.uid === id;
    const [followLoading, setFollowLoading] = useState(false);

    useEffect(() => {
        // [DEFENSIVE ROUTING]: Chốt chặn đường dẫn undefined
        if (id === 'undefined') {
            toast.error("Phiên đăng nhập cũ. Vui lòng đăng xuất và đăng nhập lại!");
            navigate('/');
            return;
        }
        if (!id) return;

        fetchProfile();
        fetchUserPosts();
        fetchUserReposts();
    }, [id, navigate]); // BẮT BUỘC: id trong dependency array để fix lỗi cache component khi nhảy profile

    useEffect(() => {
        if (isOwnProfile && activeTab === 'trash') {
            fetchTrash();
        }
    }, [activeTab, isOwnProfile]);

    const fetchProfile = async () => {
        try {
            const res = await axiosClient.get(`/api/users/profile.php?id=${id}`);
            console.log("Dữ liệu fetchProfile:", res);

            // Phòng thủ mức độ đỏ: Bóc tách data an toàn
            const profileData = res?.data?.data || res?.data;
            
            if (profileData && (profileData.id || profileData.username)) {
                setProfile(profileData);
                // [SYNC STATE]: Khởi tạo trạng thái theo dõi từ API
                setIsFollowing(profileData.is_following || false);
            } else {
                console.error("Lỗi: Dữ liệu Profile trả về rỗng hoặc bị lỗi cấu trúc.");
                throw new Error("Mất dữ liệu đồng bộ Profile.");
            }
            setLoading(false);
        } catch (err) {
            console.error(err);
            setLoading(false);
        }
    };

    const fetchUserPosts = async () => {
        try {
            const res = await axiosClient.get(`/api/posts/read_user_posts.php?user_id=${id}`, {
                headers: token ? { 'Authorization': 'Bearer ' + token } : {}
            });
            // [BỐC TÁCH AN TOÀN]: API trả về { status: 'success', data: [...] }
            const postData = res?.data || res;
            setPosts(Array.isArray(postData) ? postData : []);
        } catch (err) {
            console.error("Fetch Posts Error:", err);
            setPosts([]);
        }
    };

    const fetchUserReposts = async () => {
        try {
            const res = await axiosClient.get(`/api/users/read_reposts.php?user_id=${id}`, {
                headers: { 'Authorization': 'Bearer ' + token }
            });
            // [BỐC TÁCH AN TOÀN]: API trả về { status: 'success', data: [...] }
            const repostData = res?.data || res;
            setReposts(Array.isArray(repostData) ? repostData : []);
        } catch (err) {
            console.error("Fetch Reposts Error:", err);
            setReposts([]);
        }
    };

    const fetchTrash = async () => {
        try {
            const data = await axiosClient.get('/api/posts/trash.php', {
                headers: { 'Authorization': 'Bearer ' + token }
            });
            setTrashItems(data.trash || []);
        } catch (err) {
            console.error(err);
            setTrashItems([]);
        }
    };

    const handleFollow = async () => {
        if (!token) return toast.error("Vui lòng đăng nhập để theo dõi.");
        if (followLoading) return; // Chống double-click

        setFollowLoading(true);
        try {
            const res = await axiosClient.post('/api/users/follow.php',
                { user_id: id }, // Truyền UID băm
                { headers: { 'Authorization': 'Bearer ' + token } }
            );

            console.log("Response Follow logic:", res);

            // [PHÒNG THỦ MỨC CAO]: Kiểm tra trạng thái thành công thật từ Backend
            if (res.status !== 'success') {
                toast.error(res.message || "Không thể thực hiện hành động này.");
                return;
            }

            const newFollowerCount = res?.data?.follower_count ?? res?.follower_count;
            const newIsFollowing = res?.data?.is_following ?? res?.is_following;

            // [INTEGRITY CHECK]: Chỉ cập nhật khi có dữ liệu số hợp lệ
            if (newFollowerCount !== undefined) {
                setIsFollowing(!!newIsFollowing);
                setProfile(prev => ({
                    ...prev,
                    stats: {
                        ...(prev?.stats || {}),
                        followers: parseInt(newFollowerCount)
                    }
                }));
            }
            
            toast.success(res?.message || res?.data?.message || (newIsFollowing ? "Đã theo dõi" : "Đã bỏ theo dõi"));
        } catch (err) {
            toast.error(err.response?.data?.message || "Lỗi khi thực hiện hành động.");
        } finally {
            setFollowLoading(false);
        }
    };

    const handleToggleRepostVisibility = async (repostId) => {
        try {
            const res = await axiosClient.post('/api/social/toggle_repost_visibility.php',
                { repost_id: repostId },
                { headers: { 'Authorization': 'Bearer ' + token } }
            );
            setReposts(reposts.map(r => {
                if (r.repost_id === repostId) return { ...r, is_hidden: !r.is_hidden };
                return r;
            }));
            toast.success(res.message);
        } catch (err) {
            toast.error("Lỗi khi cập nhật trạng thái hiển thị.");
        }
    };

    // ── POST ACTIONS ──
    const handleTogglePostVisibility = async (postId, currentHidden) => {
        try {
            const res = await axiosClient.post('/api/posts/toggle_visibility.php',
                { post_id: postId },
                { headers: { 'Authorization': 'Bearer ' + token } }
            );
            setPosts(posts.map(p => {
                if (p.id === postId) return { ...p, is_hidden: res.is_hidden };
                return p;
            }));
            toast.success(res.message);
        } catch (err) {
            toast.error(err.response?.data?.message || "Lỗi khi thay đổi trạng thái.");
        }
    };

    const handleSoftDelete = (postId) => {
        setConfirmState({
            isOpen: true,
            title: "Xóa bài viết",
            message: "Bài viết sẽ được chuyển vào Thùng rác. Bạn có 30 ngày để khôi phục. Tiếp tục?",
            type: "warning",
            onConfirm: async () => {
                setConfirmState(prev => ({ ...prev, isOpen: false }));
                try {
                    const res = await axiosClient.post('/api/posts/soft_delete.php',
                        { post_id: postId },
                        { headers: { 'Authorization': 'Bearer ' + token } }
                    );
                    setPosts(posts.filter(p => p.id !== postId));
                    toast.success(res.message);
                } catch (err) {
                    toast.error(err.response?.data?.message || "Lỗi khi xóa bài viết.");
                }
            }
        });
    };

    const handleSoftDeleteRepost = (repostId) => {
        setConfirmState({
            isOpen: true,
            title: "Xóa lượt đăng lại",
            message: "Hành động này sẽ chuyển lượt đăng lại này vào Thùng rác. Bạn có thể khôi phục bất cứ lúc nào trong 30 ngày. Xóa?",
            type: "warning",
            onConfirm: async () => {
                setConfirmState(prev => ({ ...prev, isOpen: false }));
                try {
                    await axiosClient.get(`/api/reposts/soft_delete.php?id=${repostId}`, {
                        headers: { 'Authorization': 'Bearer ' + token }
                    });
                    setReposts(reposts.filter(r => r.repost_id !== repostId));
                    toast.success("Đã chuyển vào thùng rác.");
                } catch (err) {
                    toast.error(err.response?.data?.message || "Lỗi khi xóa lượt đăng lại.");
                }
            }
        });
    };

    const handleRestore = async (postId) => {
        try {
            const res = await axiosClient.post('/api/posts/restore.php',
                { post_id: postId },
                { headers: { 'Authorization': 'Bearer ' + token } }
            );
            setTrashItems(trashItems.filter(t => t.id !== postId));
            toast.success(res.message);
            fetchUserPosts(); // Refresh danh sách bài viết
        } catch (err) {
            toast.error(err.response?.data?.message || "Lỗi khi khôi phục.");
        }
    };

    const handlePermanentDelete = (postId) => {
        setConfirmState({
            isOpen: true,
            title: "XÓA VĨNH VIỄN",
            message: "⚠️ CẢNH BÁO: Hành động này KHÔNG THỂ hoàn tác! Bài viết và TẤT CẢ hình ảnh sẽ bị xóa vĩnh viễn.",
            type: "danger",
            onConfirm: async () => {
                setConfirmState(prev => ({ ...prev, isOpen: false }));
                try {
                    const res = await axiosClient.post('/api/posts/permanent_delete.php',
                        { post_id: postId },
                        { headers: { 'Authorization': 'Bearer ' + token } }
                    );
                    setTrashItems(trashItems.filter(t => t.id !== postId));
                    toast.success(res.message);
                } catch (err) {
                    toast.error(err.response?.data?.message || "Lỗi khi xóa vĩnh viễn.");
                }
            }
        });
    };

    if (loading) return <div className="text-center py-20 font-bold text-slate-400 animate-pulse uppercase tracking-widest text-sm">Đang tải hồ sơ...</div>;
    if (!profile) return <div className="text-center py-20 font-bold text-red-500 uppercase tracking-widest bg-red-50 rounded-[2rem]">404: Không tìm thấy hồ sơ</div>;

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
            {/* ── HEADER AREA ── */}
            <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.02)] border border-slate-100 relative overflow-hidden mb-6">
                {/* Banner / Cover photo */}
                <div className="w-full h-48 md:h-64 bg-slate-100 relative">
                    {profile?.cover_image ? (
                        <img 
                            src={`http://localhost:8000/uploads/${profile.cover_image}`} 
                            alt="Cover" 
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <div className="w-full h-full bg-gradient-to-r from-blue-700 via-indigo-600 to-blue-800" />
                    )}
                </div>

                <div className="px-6 md:px-8 pb-6 relative">
                    {/* Avatar & Info Container */}
                    <div className="flex flex-col md:flex-row items-center md:items-end gap-5 relative z-10 -mt-12 md:-mt-16 mb-5">
                        <div className="w-24 h-24 md:w-32 md:h-32 rounded-2xl bg-white p-1.5 shadow-lg flex-shrink-0 border border-slate-100/60">
                            {profile?.avatar_image ? (
                                <img 
                                    src={`http://localhost:8000/uploads/${profile.avatar_image}`} 
                                    alt="Avatar" 
                                    className="w-full h-full object-cover rounded-xl"
                                />
                            ) : (
                                <div className="w-full h-full rounded-xl bg-slate-900 flex items-center justify-center text-white text-4xl font-extrabold uppercase">
                                     <span>{(profile?.full_name || profile?.username || '?').charAt(0)}</span>
                                </div>
                            )}
                        </div>

                        {/* Name, Username, Badges and Buttons */}
                        <div className="flex-1 w-full text-center md:text-left mt-2 md:mt-0">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div>
                                    <h1 className="text-xl md:text-2xl font-bold text-slate-800 tracking-tight flex items-center justify-center md:justify-start gap-2">
                                        {profile?.full_name || profile?.username}
                                        <UserBadge role={profile?.role} followers={profile?.stats?.followers || 0} size={18} />
                                    </h1>
                                    <p className="text-slate-400 font-semibold text-[11px] tracking-wider uppercase mt-0.5">@{profile?.username}</p>
                                </div>

                                <div className="flex justify-center shrink-0">
                                    {currentUser ? (
                                        isOwnProfile ? (
                                            <button 
                                                onClick={() => setIsEditModalOpen(true)}
                                                className="px-5 py-2 bg-slate-900 hover:bg-black text-white font-bold rounded-xl shadow transition-all active:scale-95 text-xs uppercase tracking-wider cursor-pointer"
                                            >
                                                Chỉnh sửa hồ sơ
                                            </button>
                                        ) : (
                                            <button 
                                                onClick={handleFollow}
                                                disabled={followLoading}
                                                className={`px-6 py-2 rounded-xl font-bold text-xs uppercase tracking-wider transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ${
                                                    isFollowing 
                                                    ? 'bg-slate-100 text-slate-500 border border-slate-200 hover:bg-red-50 hover:text-red-500 hover:border-red-100' 
                                                    : 'bg-blue-600 text-white hover:bg-blue-700 shadow-md shadow-blue-500/10'
                                                }`}
                                            >
                                                {followLoading ? 'Đang xử lý...' : (isFollowing ? 'Bỏ theo dõi' : 'Theo dõi')}
                                            </button>
                                        )
                                    ) : null}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Stats details layout */}
                    <div className="flex justify-center md:justify-start gap-8 pt-4 border-t border-slate-100">
                        <div className="text-center md:text-left">
                            <div className="flex items-center gap-1.5 mb-0.5 text-slate-400 justify-center md:justify-start">
                                <Users size={13} strokeWidth={2} />
                                <span className="text-[9px] font-bold uppercase tracking-wider">Người theo dõi</span>
                            </div>
                            <p className="text-lg font-bold text-slate-800">{profile?.stats?.followers ?? 0}</p>
                        </div>
                        <div className="text-center md:text-left">
                            <div className="flex items-center gap-1.5 mb-0.5 text-slate-400 justify-center md:justify-start">
                                <User size={13} strokeWidth={2} />
                                <span className="text-[9px] font-bold uppercase tracking-wider">Đang theo dõi</span>
                            </div>
                            <p className="text-lg font-bold text-slate-800">{profile?.stats?.following || 0}</p>
                        </div>
                        <div className="text-center md:text-left">
                            <div className="flex items-center gap-1.5 mb-0.5 text-slate-400 justify-center md:justify-start">
                                <ThumbsUp size={13} strokeWidth={2} />
                                <span className="text-[9px] font-bold uppercase tracking-wider">Lượt thích</span>
                            </div>
                            <p className="text-lg font-bold text-slate-800">{profile?.stats?.total_likes || 0}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── CONTENT TABS ── */}
            <div className="space-y-6 pb-20">
                <div className="flex space-x-6 border-b border-slate-100 pb-1 overflow-x-auto">
                    <button 
                        onClick={() => setActiveTab('posts')} 
                        className={`text-xs font-bold pb-3.5 uppercase tracking-wider transition-all flex-shrink-0 cursor-pointer ${activeTab === 'posts' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                        Bài viết ({posts.length})
                    </button>
                    <button 
                        onClick={() => setActiveTab('reposts')} 
                        className={`text-xs font-bold pb-3.5 uppercase tracking-wider transition-all flex-shrink-0 cursor-pointer ${activeTab === 'reposts' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                        Lượt đăng lại ({reposts.length})
                    </button>
                    {isOwnProfile && (
                        <button 
                            onClick={() => setActiveTab('trash')} 
                            className={`text-xs font-bold pb-3.5 uppercase tracking-wider transition-all flex-shrink-0 flex items-center gap-1.5 cursor-pointer ${activeTab === 'trash' ? 'text-red-500 border-b-2 border-red-500' : 'text-slate-400 hover:text-slate-600'}`}
                        >
                            <Trash2 size={13} strokeWidth={2} /> Thùng rác ({trashItems.length})
                        </button>
                    )}
                </div>

                <div className="flex flex-col gap-4">
                    {/* ── TAB: POSTS ── */}
                    {activeTab === 'posts' && (
                        <>
                            {posts.map(post => (
                                <div key={post.id} className="relative group animate-in fade-in slide-in-from-bottom-2 duration-300">
                                    <Link to={`/post/${post.id}`} className="no-underline block">
                                        <div className={`bg-white p-5 rounded-2xl border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.01)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.03)] hover:border-blue-100/50 transition-all relative overflow-hidden ${post.is_hidden ? 'opacity-60 border-amber-100 bg-amber-50/20' : ''}`}>
                                            <div className="flex gap-4 items-start">
                                                {post.cover_image && (
                                                    <div className="w-24 h-16 sm:w-28 sm:h-20 rounded-xl overflow-hidden shrink-0 border border-slate-100 bg-slate-50">
                                                        <img src={`http://localhost:8000/uploads/${post.cover_image}`} className="w-full h-full object-cover" alt="" />
                                                    </div>
                                                )}
                                                <div className="flex-1 min-w-0">
                                                    {post.is_hidden > 0 && (
                                                        <span className="inline-flex items-center gap-1 text-[8px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-100 mb-2 uppercase tracking-wider">
                                                            <EyeOff size={10} strokeWidth={2} /> Đang ẩn
                                                        </span>
                                                    )}
                                                    <h3 className="text-base font-bold text-slate-800 group-hover:text-blue-600 mb-1.5 transition-colors pr-16 leading-snug line-clamp-1">
                                                        {post.title}
                                                    </h3>
                                                    <p className="text-slate-400 text-xs line-clamp-2 leading-relaxed pr-8">
                                                        {post.content ? post.content.replace(/<[^>]*>?/gm, '') : ''}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </Link>

                                    {/* ── ACTION BUTTONS (Chủ profile) ── */}
                                    {isOwnProfile && (
                                        <div className="absolute top-5 right-5 flex items-center gap-1.5 z-10">
                                            <button
                                                onClick={() => handleTogglePostVisibility(post.id, post.is_hidden)}
                                                className={`p-2 rounded-lg transition-all border shadow-sm active:scale-90 ${post.is_hidden ? 'bg-amber-500 text-white border-amber-500 hover:bg-amber-600' : 'bg-slate-50 text-slate-400 border-slate-100 hover:bg-blue-600 hover:text-white hover:border-blue-600'}`}
                                                title={post.is_hidden ? "Hiện bài viết" : "Ẩn bài viết"}
                                            >
                                                {post.is_hidden ? <Eye size={12} strokeWidth={2} /> : <EyeOff size={12} strokeWidth={2} />}
                                            </button>
                                            <button
                                                onClick={() => handleSoftDelete(post.id)}
                                                className="p-2 rounded-lg bg-slate-50 text-slate-400 border border-slate-100 hover:bg-red-500 hover:text-white hover:border-red-500 transition-all shadow-sm active:scale-90"
                                                title="Xóa bài viết"
                                            >
                                                <Trash2 size={12} strokeWidth={2} />
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </>
                    )}

                    {/* ── TAB: REPOSTS ── */}
                    {activeTab === 'reposts' && (
                        <>
                            {reposts.map(repost => (
                                <div key={repost.repost_id} className="relative group animate-in fade-in slide-in-from-bottom-2 duration-300">
                                    <Link to={`/post/${repost.id}`} className="no-underline block">
                                        <div className={`bg-white p-6 rounded-2xl border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.01)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.03)] hover:border-green-100/50 transition-all ${repost.is_hidden ? 'opacity-50 grayscale' : ''}`}>
                                            <div className="flex items-center gap-1.5 mb-2">
                                                <span className="flex items-center gap-1 text-[8px] font-bold text-green-600 uppercase tracking-wider bg-green-50 px-2 py-0.5 rounded border border-green-100">
                                                    <Repeat size={10} strokeWidth={2.5} /> Đăng lại từ @{repost.author_name}
                                                </span>
                                            </div>
                                            {repost.is_hidden > 0 && (
                                                 <span className="inline-flex items-center gap-1 text-[8px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-100 mb-2 uppercase tracking-wider">
                                                    <EyeOff size={10} strokeWidth={2} /> Đang ẩn
                                                </span>
                                            )}
                                            <h3 className="text-base font-bold text-slate-800 group-hover:text-green-600 mb-1.5 transition-colors pr-16">/{repost.title}</h3>
                                            <p className="text-slate-400 text-xs line-clamp-2 leading-relaxed pr-8">
                                                {repost.content ? repost.content.replace(/<[^>]*>?/gm, '') : ''}
                                            </p>
                                        </div>
                                    </Link>

                                    {isOwnProfile && (
                                        <div className="absolute top-5 right-5 flex items-center gap-1.5 z-10">
                                            <button
                                                onClick={() => handleToggleRepostVisibility(repost.repost_id)}
                                                className={`p-2 rounded-lg transition-all border shadow-sm active:scale-90 ${repost.is_hidden ? 'bg-amber-500 text-white border-amber-500' : 'bg-slate-50 text-slate-400 border-slate-100 hover:bg-blue-600 hover:text-white hover:border-blue-600'}`}
                                                title={repost.is_hidden ? "Hiện" : "Ẩn"}
                                            >
                                                {repost.is_hidden ? <EyeOff size={12} strokeWidth={2} /> : <Eye size={12} strokeWidth={2} />}
                                            </button>
                                            <button
                                                onClick={() => handleSoftDeleteRepost(repost.repost_id)}
                                                className="p-2 rounded-lg bg-slate-50 text-slate-400 border border-slate-100 hover:bg-red-500 hover:text-white hover:border-red-500 transition-all shadow-sm active:scale-90"
                                                title="Xóa đăng lại"
                                            >
                                                <Trash2 size={12} strokeWidth={2} />
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </>
                    )}

                    {/* ── TAB: THÙNG RÁC ── */}
                    {activeTab === 'trash' && isOwnProfile && (
                        <>
                            {trashItems.length > 0 ? (
                                <>
                                    <div className="bg-red-50/50 border border-red-100 rounded-xl p-4 flex items-start gap-3 mb-2 animate-in fade-in duration-300">
                                        <AlertTriangle size={18} className="text-red-500 flex-shrink-0 mt-0.5" strokeWidth={2} />
                                        <div>
                                            <p className="text-xs font-bold text-red-700">Bài viết trong thùng rác sẽ bị xóa vĩnh viễn sau 30 ngày.</p>
                                            <p className="text-[10px] text-red-500 mt-0.5">Hãy khôi phục ngay nếu bạn cần giữ lại bất kỳ nội dung nào.</p>
                                        </div>
                                    </div>

                                    {trashItems.map(item => (
                                        <div key={item.id} className="bg-white p-6 rounded-2xl border-2 border-dashed border-red-100 shadow-[0_8px_30px_rgb(0,0,0,0.01)] relative animate-in slide-in-from-bottom-2 duration-300 group">
                                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                                                        <span className={`text-[8px] font-bold px-2 py-0.5 rounded border uppercase tracking-wider flex items-center gap-1 ${item.item_type === 'repost' ? 'bg-green-50 text-green-600 border-green-100' : 'bg-red-50 text-red-500 border-red-100'}`}>
                                                            {item.item_type === 'repost' ? <Repeat size={8} /> : <Archive size={8} />}
                                                            {item.item_type === 'repost' ? 'Repost đã xóa' : 'Bài viết đã xóa'}
                                                        </span>
                                                        <span className={`text-[8px] font-bold px-2 py-0.5 rounded border uppercase tracking-wider ${item.days_remaining <= 7 ? 'text-red-600 bg-red-100 border-red-200' : 'text-amber-600 bg-amber-50 border-amber-200'}`}>
                                                            Còn {item.days_remaining} ngày
                                                        </span>
                                                    </div>
                                                    <h3 className="text-base font-bold text-slate-400 mb-1.5 tracking-tight line-through decoration-red-300/60">/{item.title}</h3>
                                                    <p className="text-[9px] text-slate-400 font-mono">
                                                        Đã xóa: {new Date(item.deleted_at).toLocaleString('vi-VN')} · Tạo: {new Date(item.created_at).toLocaleString('vi-VN')}
                                                    </p>
                                                </div>

                                                <div className="flex items-center gap-2 flex-shrink-0 w-full sm:w-auto">
                                                    <button
                                                        onClick={() => handleRestore(item.id)}
                                                        className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-4 py-2 bg-emerald-500 text-white font-bold text-[10px] rounded-lg shadow-sm hover:bg-emerald-600 transition-all active:scale-95 uppercase tracking-wider"
                                                    >
                                                        <RotateCcw size={12} strokeWidth={2} /> Khôi phục
                                                    </button>
                                                    <button
                                                        onClick={() => handlePermanentDelete(item.id)}
                                                        className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-4 py-2 bg-red-500 text-white font-bold text-[10px] rounded-lg shadow-sm hover:bg-red-600 transition-all active:scale-95 uppercase tracking-wider"
                                                    >
                                                        <Trash2 size={12} strokeWidth={2} /> Xóa vĩnh viễn
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </>
                            ) : (
                                <div className="text-center py-16 bg-slate-50/50 rounded-2xl border border-slate-100 text-slate-400 font-mono text-[9px] uppercase tracking-widest">
                                    Thùng rác trống
                                </div>
                            )}
                        </>
                    )}

                    {/* ── EMPTY STATE (Dùng ternary để triệt tiêu số 0) ── */}
                    {((activeTab === 'posts' && posts.length === 0) || (activeTab === 'reposts' && reposts.length === 0)) ? (
                        <div className="text-center py-16 bg-slate-50/50 rounded-2xl border border-slate-100 text-slate-400 font-mono text-[9px] uppercase tracking-widest">
                            Không có dữ liệu hiển thị
                        </div>
                    ) : null}
                </div>
            </div>
            <EditProfileModal 
                isOpen={isEditModalOpen} 
                onClose={() => setIsEditModalOpen(false)} 
                profile={isOwnProfile ? profile : null} 
                token={token}
                onSuccess={(updatedUser) => {
                    if (updatedUser) {
                        setProfile(prev => ({...prev, ...updatedUser}));
                    }
                }}
            />

            {/* Custom confirmation dialog */}
            <ConfirmModal 
                isOpen={confirmState.isOpen}
                onClose={() => setConfirmState(prev => ({ ...prev, isOpen: false }))}
                onConfirm={confirmState.onConfirm}
                title={confirmState.title}
                message={confirmState.message}
                type={confirmState.type}
            />
        </div>
    );
};

export default UserProfile;
