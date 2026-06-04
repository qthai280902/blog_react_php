import React, { useState, useContext, useEffect } from 'react';
import { X, Upload, Info, ImagePlus, User, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import axiosClient from '../api/axiosClient';
import { AuthContext } from '../context/AuthContext';

const EditProfileModal = ({ isOpen, onClose, profile, token, onSuccess }) => {
    const { user: currentUser, setAuthUser } = useContext(AuthContext);
    const [fullName, setFullName] = useState(profile?.full_name || '');
    const [avatarFile, setAvatarFile] = useState(null);
    const [coverFile, setCoverFile] = useState(null);
    
    // Previews
    const [avatarPreview, setAvatarPreview] = useState(profile?.avatar_image ? `http://localhost:8000/uploads/${profile.avatar_image}` : '');
    const [coverPreview, setCoverPreview] = useState(profile?.cover_image ? `http://localhost:8000/uploads/${profile.cover_image}` : '');
    
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');

    const [isCoolingDown, setIsCoolingDown] = useState(false);
    const [timeLeftStr, setTimeLeftStr] = useState("");

    const isNameChanged = fullName.trim() !== (profile?.full_name || '').trim();
    const isSubmitDisabled = loading || (isCoolingDown && isNameChanged);

    // Sync input fields when the modal opens or the profile prop changes
    useEffect(() => {
        if (isOpen && profile) {
            setFullName(profile.full_name || '');
            setAvatarPreview(profile.avatar_image ? `http://localhost:8000/uploads/${profile.avatar_image}` : '');
            setCoverPreview(profile.cover_image ? `http://localhost:8000/uploads/${profile.cover_image}` : '');
            setAvatarFile(null);
            setCoverFile(null);
            setErrorMsg('');
        }
    }, [isOpen, profile]);

    // [HÀM TÍNH TOÁN COOLDOWN LIVE]
    useEffect(() => {
        const updateTimer = () => {
            console.log("Ngày đổi tên từ API:", profile?.last_name_change_at);
            
            if (!profile?.last_name_change_at) {
                setIsCoolingDown(false);
                return;
            }

            // [EPOCH HANDLING]: Xử lý dữ liệu đã được Backend convert sang Epoch (seconds)
            const lastChangeMs = parseInt(profile.last_name_change_at) * 1000;
            
            if (isNaN(lastChangeMs)) {
                console.error("Lỗi: Dữ liệu thời gian không hợp lệ (Expected Epoch):", profile.last_name_change_at);
                setIsCoolingDown(false);
                return;
            }
            const now = Date.now();
            const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;
            const diff = sevenDaysMs - (now - lastChangeMs);

            if (diff <= 0) {
                setIsCoolingDown(false);
                return;
            }

            setIsCoolingDown(true);
            
            const days = Math.floor(diff / (1000 * 60 * 60 * 24));
            const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((diff % (1000 * 60)) / 1000);

            const timeParts = [];
            if (days > 0) timeParts.push(`${days} ngày`);
            if (hours > 0) timeParts.push(`${hours} giờ`);
            if (minutes > 0) timeParts.push(`${minutes} phút`);
            if (seconds > 0 && days === 0) timeParts.push(`${seconds} giây`);
            
            setTimeLeftStr(timeParts.join(' '));
        };

        // [IMMEDIATE EXECUTION]: Chống flicker 1 giây đầu tiên
        updateTimer();
        const intervalId = setInterval(updateTimer, 1000);

        return () => clearInterval(intervalId);
    }, [profile]);


    const handleAvatarChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        
        // CHẶN CỨNG FRONTEND: Chỉ JPG
        if (file.type !== 'image/jpeg') {
            toast.error('Lỗi: Chỉ hỗ trợ định dạng ảnh JPG/JPEG');
            e.target.value = ''; // Reset input
            return;
        }

        if (file.size > 2 * 1024 * 1024) {
            toast.error('Avatar phải nhỏ hơn 2MB');
            return;
        }
        setAvatarFile(file);
        setAvatarPreview(URL.createObjectURL(file));
    };

    const handleCoverChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // CHẶN CỨNG FRONTEND: Chỉ JPG
        if (file.type !== 'image/jpeg') {
            toast.error('Lỗi: Chỉ hỗ trợ định dạng ảnh JPG/JPEG');
            e.target.value = ''; // Reset input
            return;
        }

        if (file.size > 2 * 1024 * 1024) {
            toast.error('Ảnh bìa phải nhỏ hơn 2MB');
            return;
        }
        setCoverFile(file);
        setCoverPreview(URL.createObjectURL(file));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setErrorMsg('');

        try {
            // [BẮT BUỘC DÙNG FORMDATA] - Ngăn chặn trôi dữ liệu JSON làm mất data DB
            const formData = new FormData();
            formData.append('full_name', fullName);

            if (avatarFile) {
                formData.append('avatar_image', avatarFile);
            }
            if (coverFile) {
                formData.append('cover_image', coverFile);
            }

            const res = await axiosClient.post('/api/users/update_profile.php', formData, {
                headers: { 
                    'Authorization': 'Bearer ' + token,
                    'Content-Type': 'multipart/form-data'
                }
            });

            // [DEFENSIVE DIAGNOSTIC]: Soi kỹ data từ server
            console.log("Dữ liệu Update trả về (Raw):", res);
            
            // [SMART EXTRACTION]: Fallback chain tương tự Login.jsx
            const updatedUser = res?.data?.user || res?.data?.data || res?.user || res?.data || res;
            const status = res?.status || res?.data?.status;

            console.log("Dữ liệu User đã bóc tách:", updatedUser);

            // [INTEGRITY CHECK]: Đảm bảo status là success và có ít nhất full_name
            if ((status === 'success' || status === 200) && updatedUser && updatedUser.full_name) {
                // ÉP RE-RENDER: Cập nhật Context ngay
                setAuthUser({ ...updatedUser });
                
                toast.success('Hồ sơ đã được đồng bộ thành công');
                
                if (onSuccess) onSuccess({ ...updatedUser });
                onClose();
            } else {
                console.error("LỖI ĐỒNG BỘ: Data không hợp lệ hoặc thiếu full_name", res);
                throw new Error("Cập nhật thất bại. Dữ liệu từ Server không hợp lệ.");
            }
        } catch (err) {
            console.error("Submit Error:", err);
            const message = err?.response?.data?.message || err.message || 'Lỗi: Không thể kết nối với máy chủ.';
            setErrorMsg(message);
            toast.error(message);
        } finally {
            setLoading(false);
        }
    };

    const isOwn = currentUser && profile && (currentUser.uid === profile.uid || currentUser.id === profile.id);

    if (!isOpen || !isOwn) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-0">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in" onClick={!loading ? onClose : undefined} />
            
            {/* Modal Content */}
            <div className="relative bg-white w-full max-w-xl rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
                <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                    <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">Chỉnh sửa hồ sơ</h2>
                    <button onClick={onClose} disabled={loading} className="p-2 text-slate-400 hover:text-slate-600 bg-white rounded-full hover:bg-slate-100 transition-colors">
                        <X size={20} strokeWidth={2.5} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6">
                    {/* [DỌN DẸP]: Loại bỏ cảnh báo kép tĩnh ở đầu form theo yêu cầu CTO */}
                    {errorMsg && (
                         <div className="mb-6 p-4 bg-red-50 text-red-600 border border-red-100 rounded-2xl text-sm font-bold flex items-start gap-2 animate-in slide-in-from-top-2">
                            <Info size={18} className="mt-0.5 shrink-0" /> {errorMsg}
                        </div>
                    )}

                    <div className="space-y-6">
                        {/* Cụm Ảnh Bìa & Đại Diện */}
                        <div className="relative mb-12">
                            {/* Cover Image Upload */}
                            <div className="relative w-full aspect-[21/9] bg-slate-100 rounded-2xl overflow-hidden group border-2 border-dashed border-slate-200 hover:border-blue-400 transition-colors">
                                {coverPreview ? (
                                    <img src={coverPreview} alt="Cover Preview" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400">
                                        <ImagePlus size={28} strokeWidth={1.5} className="mb-2" />
                                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Tải ảnh bìa (Max 2MB)</span>
                                    </div>
                                )}
                                <label className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer backdrop-blur-sm">
                                    <span className="text-white text-xs font-bold uppercase tracking-widest flex items-center gap-2"><Upload size={14}/> Thay đổi Ảnh bìa</span>
                                    <input type="file" accept="image/*" onChange={handleCoverChange} className="hidden" />
                                </label>
                            </div>

                            {/* Avatar Upload */}
                            <div className="absolute -bottom-10 left-6">
                                <div className="relative w-24 h-24 rounded-full border-4 border-white overflow-hidden bg-slate-100 shadow-xl group">
                                    {avatarPreview ? (
                                        <img src={avatarPreview} alt="Avatar Preview" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-slate-400">
                                            <User size={32} />
                                        </div>
                                    )}
                                    <label className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center cursor-pointer backdrop-blur-sm">
                                        <Upload size={16} className="text-white mb-1" />
                                        <input type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
                                    </label>
                                </div>
                            </div>
                        </div>

                        {/* Input Fields */}
                        <div className="pt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Định danh (Không thể đổi)</label>
                                <input 
                                    type="text" 
                                    value={`@${profile?.username || ''}`}
                                    className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-slate-400 font-bold outline-none cursor-not-allowed"
                                    disabled
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Tên hiển thị (Tên thật)</label>
                                <input 
                                    type="text" 
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    placeholder="Ví dụ: Nguyễn Văn A"
                                    className={`w-full bg-white border border-slate-200 focus:border-blue-500 rounded-xl px-4 py-3 text-slate-800 font-bold outline-none ring-4 ring-transparent focus:ring-blue-50 transition-all ${isCoolingDown ? 'bg-slate-100 opacity-50 cursor-not-allowed text-slate-500' : ''}`}
                                    required
                                    disabled={isCoolingDown}
                                />
                                {isCoolingDown ? (
                                    <div className="text-[11px] font-black mt-2.5 flex items-start gap-2 uppercase tracking-tight text-red-600 bg-red-50 p-3 rounded-xl border border-red-100 animate-in slide-in-from-top-1">
                                        <AlertCircle size={14} className="shrink-0 mt-0.5" />
                                        <span>Bạn chỉ có thể đổi tên tiếp theo sau: <span className="text-red-700 underline decoration-red-300 underline-offset-2">{timeLeftStr}</span> nữa.</span>
                                    </div>
                                ) : (
                                    <div className="h-0 md:h-2" /> // Thu gọn khoảng trống khi Ready
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="mt-8 pt-6 border-t border-slate-100 flex justify-end gap-3">
                        <button 
                            type="button" 
                            onClick={onClose}
                            className="px-6 py-3 rounded-xl font-bold text-slate-500 hover:bg-slate-100 transition-colors uppercase tracking-widest text-xs"
                            disabled={loading}
                        >
                            Hủy bỏ
                        </button>
                        <button 
                            type="submit" 
                            disabled={isSubmitDisabled}
                            className={`px-8 py-3 bg-slate-900 hover:bg-black text-white font-black rounded-xl shadow-lg active:scale-95 transition-all uppercase tracking-widest text-xs flex items-center gap-2 ${isSubmitDisabled && 'opacity-50 cursor-not-allowed bg-slate-300 shadow-none'}`}
                        >
                            {loading ? 'Đang lưu...' : 'Cập nhật thông tin'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditProfileModal;
