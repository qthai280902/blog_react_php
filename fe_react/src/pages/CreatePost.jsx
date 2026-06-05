import React, { useState, useEffect, useRef, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosClient from '../api/axiosClient';
import Quill from 'quill';
import 'quill/dist/quill.snow.css';
import { Send, Image as ImageIcon, Type, Tag, ArrowLeft, Eye, Edit3, Calendar, User } from 'lucide-react';
import toast from 'react-hot-toast';
import DOMPurify from 'dompurify';
import { AuthContext } from '../context/AuthContext';

const CreatePost = () => {
    const { user: currentUser } = useContext(AuthContext);
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [tags, setTags] = useState('');
    const [coverImage, setCoverImage] = useState(null);
    const [coverPreview, setCoverPreview] = useState('');
    const [excerpt, setExcerpt] = useState('');
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('edit');
    
    const navigate = useNavigate();
    const editorRef = useRef(null);
    const quillRef = useRef(null);

    // Sync file upload with local preview URL
    useEffect(() => {
        if (!coverImage) {
            setCoverPreview('');
            return;
        }
        const objectUrl = URL.createObjectURL(coverImage);
        setCoverPreview(objectUrl);

        return () => URL.revokeObjectURL(objectUrl);
    }, [coverImage]);

    // Handle removing the cover image
    const handleRemoveCover = () => {
        setCoverImage(null);
    };

    // [HỒI SINH TRÌNH SOẠN THẢO]: Sử dụng Native Quill để tránh crash React 19
    useEffect(() => {
        if (editorRef.current && !quillRef.current) {
            quillRef.current = new Quill(editorRef.current, {
                theme: 'snow',
                placeholder: 'Hãy viết gì đó thật bùng nổ...',
                modules: {
                    toolbar: [
                        [{ 'header': [1, 2, false] }],
                        ['bold', 'italic', 'underline', 'strike', 'blockquote'],
                        [{ 'list': 'ordered' }, { 'list': 'bullet' }],
                        ['link', 'image'],
                        ['clean']
                    ]
                }
            });

            // Đồng bộ nội dung từ Quill sang React State
            quillRef.current.on('text-change', () => {
                setContent(quillRef.current.root.innerHTML);
            });
        }
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');
        if (!token) {
            toast.error("Vui lòng đăng nhập để viết bài.");
            return;
        }

        if (!title.trim() || !content.trim() || content === '<p><br></p>') {
            toast.error("Vui lòng nhập đầy đủ tiêu đề và nội dung.");
            return;
        }

        setLoading(true);
        const formData = new FormData();
        formData.append('title', title);
        formData.append('content', content);
        formData.append('excerpt', excerpt);
        formData.append('tags', tags);
        if (coverImage) {
            formData.append('cover_image', coverImage);
        }

        try {
            await axiosClient.post('/api/posts/create.php', formData, {
                headers: {
                    'Authorization': 'Bearer ' + token,
                    'Content-Type': 'multipart/form-data'
                }
            });
            toast.success("Đã xuất bản bài viết thành công!");
            navigate('/');
        } catch (err) {
            toast.error(err.response?.data?.message || "Lỗi khi đăng bài.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto py-8 px-4 animate-in fade-in duration-500">
            {/* Navigation and Tab Switcher */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <button 
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-1.5 text-slate-400 hover:text-blue-600 font-bold uppercase text-[10px] tracking-wider transition-colors cursor-pointer border border-transparent bg-transparent p-0"
                >
                    <ArrowLeft size={12} /> Trở lại
                </button>

                {/* Modern Pill Tab Switcher */}
                <div className="inline-flex bg-slate-100 p-1.5 rounded-2xl border border-slate-200 shadow-inner">
                    <button
                        type="button"
                        onClick={() => setActiveTab('edit')}
                        className={`flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer border-0 ${
                            activeTab === 'edit'
                                ? 'bg-white text-blue-600 shadow-md'
                                : 'text-slate-500 hover:text-slate-800 bg-transparent'
                        }`}
                    >
                        <Edit3 size={14} /> Soạn thảo
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveTab('preview')}
                        className={`flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer border-0 ${
                            activeTab === 'preview'
                                ? 'bg-white text-blue-600 shadow-md'
                                : 'text-slate-500 hover:text-slate-800 bg-transparent'
                        }`}
                    >
                        <Eye size={14} /> Xem trước
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.02)] border border-slate-100 overflow-hidden">
                {/* Form wrapper */}
                <form onSubmit={handleSubmit}>
                    {/* EDIT TAB CONTENT */}
                    <div className={activeTab === 'edit' ? 'p-8 space-y-8' : 'hidden'}>
                        {/* Editor Header */}
                        <div className="border-b border-slate-100 pb-6">
                            <h1 className="text-2xl font-black tracking-tight text-slate-800 flex items-center gap-2">
                                <Type size={24} className="text-blue-600" />
                                Viết bài mới
                            </h1>
                            <p className="text-slate-400 text-[10px] font-semibold uppercase tracking-wider mt-1">Sáng tạo nội dung không giới hạn</p>
                        </div>

                        {/* Cover image upload & preview */}
                        <div className="space-y-3">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Ảnh bìa bài viết</label>
                            {coverPreview ? (
                                <div className="relative w-full aspect-[21/9] rounded-2xl overflow-hidden group border border-slate-200 shadow-inner">
                                    <img src={coverPreview} alt="Cover Preview" className="w-full h-full object-cover" />
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 backdrop-blur-sm">
                                        <label className="px-5 py-2.5 bg-white text-slate-800 hover:bg-slate-50 font-bold text-xs uppercase tracking-wider rounded-xl cursor-pointer transition-all active:scale-95 shadow-lg">
                                            Thay đổi
                                            <input type="file" accept="image/*" onChange={(e) => {
                                                if (e.target.files[0]) setCoverImage(e.target.files[0]);
                                            }} className="hidden" />
                                        </label>
                                        <button
                                            type="button"
                                            onClick={handleRemoveCover}
                                            className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl cursor-pointer transition-all active:scale-95 border border-transparent shadow-lg"
                                        >
                                            Xóa ảnh
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="relative w-full py-12 border-2 border-dashed border-slate-200 hover:border-blue-400 hover:bg-blue-50/10 rounded-2xl flex flex-col items-center justify-center gap-3 transition-all cursor-pointer group">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => {
                                            if (e.target.files[0]) setCoverImage(e.target.files[0]);
                                        }}
                                        className="absolute inset-0 opacity-0 cursor-pointer z-10"
                                    />
                                    <ImageIcon size={32} className="text-slate-300 group-hover:text-blue-500 transition-colors" />
                                    <span className="text-xs font-black text-slate-400 group-hover:text-blue-600 uppercase tracking-widest">
                                        Chọn ảnh bìa (Max 2MB)
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* Title Input (Borderless, Huge) */}
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Tiêu đề bài viết</label>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="Nhập tiêu đề hấp dẫn..."
                                className="w-full bg-transparent border-b border-slate-100 hover:border-slate-200 focus:border-blue-500 rounded-none py-4 text-3xl font-extrabold outline-none transition-all placeholder:text-slate-300 text-slate-900"
                                required
                            />
                        </div>

                        {/* Excerpt Input */}
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Mô tả ngắn</label>
                            <textarea
                                value={excerpt}
                                onChange={(e) => setExcerpt(e.target.value)}
                                placeholder="Tóm tắt ngắn gọn nội dung bài viết để hiển thị ngoài trang chủ..."
                                className="w-full bg-slate-50 border border-slate-100 focus:border-blue-500/20 focus:bg-white rounded-xl px-5 py-3.5 text-sm font-bold outline-none focus:ring-4 focus:ring-blue-500/10 transition-all placeholder:text-slate-300 text-slate-700 shadow-inner resize-none"
                                rows={2}
                            />
                        </div>

                        {/* Tags */}
                        <div className="space-y-3">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Thẻ / Từ khóa (cách nhau bằng dấu phẩy)</label>
                            <div className="relative">
                                <Tag className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                                <input
                                    type="text"
                                    value={tags}
                                    onChange={(e) => setTags(e.target.value)}
                                    placeholder="Ví dụ: php, react, webdev"
                                    className="w-full bg-slate-50 border border-slate-100 focus:border-blue-500/20 focus:bg-white rounded-xl pl-11 pr-5 py-3.5 text-sm font-bold outline-none focus:ring-4 focus:ring-blue-500/10 transition-all placeholder:text-slate-300 text-slate-700 shadow-inner"
                                />
                            </div>
                        </div>

                        {/* Quill Editor */}
                        <div className="space-y-3">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Nội dung bài viết</label>
                            <div className="bg-slate-50 rounded-2xl overflow-hidden border border-slate-200/80 focus-within:border-blue-500/30 transition-all shadow-inner">
                                <div ref={editorRef} style={{ minHeight: '320px' }} className="native-quill-editor" />
                            </div>
                            {/* Visual guide card for multiple images */}
                            <div className="bg-blue-50/40 border border-blue-100 rounded-xl p-3.5 flex items-start gap-2.5 mt-2">
                                <span className="text-xs">💡</span>
                                <div className="text-[10px] font-medium text-slate-500 leading-normal">
                                    <span className="font-bold text-blue-700">Mẹo thêm nhiều ảnh minh họa:</span> Bạn có thể chèn nhiều hình ảnh vào nội dung bài viết bằng cách bấm vào nút <b className="text-blue-700">Hình ảnh</b> (biểu tượng khung tranh) trên thanh công cụ của trình soạn thảo. Ảnh sẽ được hiển thị ngay tại vị trí con trỏ chuột.
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* PREVIEW TAB CONTENT */}
                    <div className={activeTab === 'preview' ? 'p-8 md:p-12 space-y-8 animate-in fade-in duration-300' : 'hidden'}>
                        {/* Mock Article Page Preview */}
                        <article className="max-w-3xl mx-auto">
                            {/* Preview Tags */}
                            <div className="flex flex-wrap gap-2 mb-4">
                                {tags.split(',')
                                    .map(t => t.trim())
                                    .filter(t => t.length > 0)
                                    .map((tag, idx) => (
                                        <span key={idx} className="text-blue-600 font-black text-[10px] uppercase bg-blue-50 px-3.5 py-1.5 rounded-full border border-blue-100 tracking-widest">
                                            #{tag}
                                        </span>
                                    ))
                                }
                                {tags.split(',').map(t => t.trim()).filter(t => t.length > 0).length === 0 && (
                                    <span className="text-slate-400 font-black text-[10px] uppercase bg-slate-50 px-3.5 py-1.5 rounded-full border border-slate-100 tracking-widest">
                                        Chưa có thẻ
                                    </span>
                                )}
                            </div>

                            {/* Preview Title */}
                            <h1 className="text-3xl md:text-5xl font-black text-slate-900 leading-tight mb-6 tracking-tighter">
                                {title || <span className="text-slate-300 italic">Chưa nhập tiêu đề</span>}
                            </h1>

                            {/* Preview Meta Info */}
                            <div className="flex items-center space-x-6 text-slate-400 mb-8 border-b border-slate-100 pb-6">
                                <div className="flex items-center gap-2">
                                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-slate-700 to-slate-800 flex items-center justify-center font-black text-white uppercase overflow-hidden shadow-md shadow-inner">
                                        {currentUser?.avatar_image ? (
                                            <img 
                                                src={`http://localhost:8000/uploads/${currentUser.avatar_image}`} 
                                                className="w-full h-full object-cover" 
                                                alt={currentUser?.full_name || currentUser?.username} 
                                            />
                                        ) : (
                                            <span>{(currentUser?.full_name || currentUser?.username || 'U').charAt(0)}</span>
                                        )}
                                    </div>
                                    <span className="font-black text-slate-900 uppercase text-xs tracking-tight">
                                        {currentUser?.full_name || currentUser?.username || 'Tác giả'} (Draft)
                                    </span>
                                </div>
                                <div className="flex items-center gap-1.5 text-xs font-mono">
                                    <Calendar size={13} />
                                    <span>Hôm nay</span>
                                </div>
                            </div>

                            {/* Preview Cover Image */}
                            {coverPreview && (
                                <div className="rounded-[2.5rem] overflow-hidden shadow-2xl mb-10 border-[8px] border-white ring-1 ring-slate-100">
                                    <img src={coverPreview} className="w-full object-cover max-h-[360px]" alt="Preview Cover" />
                                </div>
                            )}

                            {/* Preview Rich Text Content */}
                            <div 
                                className="prose prose-slate max-w-none text-slate-800 leading-[1.8] text-justify mb-8 px-2 rich-text-content animate-in fade-in"
                                dangerouslySetInnerHTML={{ 
                                    __html: content ? DOMPurify.sanitize(content, { ADD_DATA_URI_TAGS: ['img'] }) : '<p class="text-slate-300 italic">Nhập nội dung để xem trước tại đây...</p>' 
                                }}
                            />
                        </article>
                    </div>

                    {/* Common Bottom Bar with Submit button */}
                    <div className="border-t border-slate-100 bg-slate-50/85 px-8 py-5 flex items-center justify-between">
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest hidden sm:inline">
                            {activeTab === 'edit' ? 'Đang soạn thảo' : 'Xem trước bản nháp'}
                        </span>
                        
                        <button
                            type="submit"
                            disabled={loading}
                            className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-8 py-3 font-bold uppercase tracking-widest shadow-md shadow-blue-500/10 active:scale-95 transition-all flex items-center gap-2 disabled:opacity-50 disabled:translate-y-0 cursor-pointer border border-transparent text-xs"
                        >
                            {loading ? "Đang xử lý..." : <><Send size={14} strokeWidth={2} /> Xuất bản bài viết</>}
                        </button>
                    </div>
                </form>
            </div>
            
            {/* Custom style fixes for rich-text-content images inside preview */}
            <style>{`
                .rich-text-content img {
                    max-width: 100%;
                    height: auto;
                    border-radius: 1rem;
                    margin: 1.5rem auto;
                    box-shadow: 0 4px 20px rgba(0,0,0,0.05);
                    display: block;
                }
                .rich-text-content p {
                    margin-bottom: 1.25rem;
                }
                .rich-text-content h1, .rich-text-content h2, .rich-text-content h3 {
                    font-weight: 800;
                    color: #0f172a;
                    margin-top: 2rem;
                    margin-bottom: 1rem;
                }
                .rich-text-content h1 { font-size: 1.8rem; }
                .rich-text-content h2 { font-size: 1.5rem; }
                .rich-text-content h3 { font-size: 1.25rem; }
                .rich-text-content ul, .rich-text-content ol {
                    margin-left: 1.5rem;
                    margin-bottom: 1.25rem;
                    list-style-position: outside;
                }
                .rich-text-content ul {
                    list-style-type: disc;
                }
                .rich-text-content ol {
                    list-style-type: decimal;
                }
                .rich-text-content blockquote {
                    border-left: 4px solid #3b82f6;
                    padding-left: 1.25rem;
                    color: #475569;
                    font-style: italic;
                    margin: 1.5rem 0;
                }
            `}</style>

            {/* Polish custom Quill styles for editor */}
            <style>{`
                .native-quill-editor .ql-toolbar {
                    background: #f8fafc;
                    border: none !important;
                    border-bottom: 1px solid #e2e8f0 !important;
                    padding: 0.75rem 1rem !important;
                }
                .native-quill-editor .ql-container {
                    border: none !important;
                    font-family: inherit;
                    font-size: 0.95rem;
                }
                .native-quill-editor .ql-editor {
                    min-height: 320px;
                    padding: 1.5rem !important;
                    line-height: 1.7;
                    color: #334155;
                }
                .native-quill-editor .ql-editor.ql-blank::before {
                    color: #cbd5e1;
                    font-style: normal;
                    left: 24px;
                    font-size: 0.95rem;
                }
            `}</style>
        </div>
    );
};

export default CreatePost;
