import React from 'react';
import { X, AlertTriangle, AlertCircle, Info } from 'lucide-react';

/**
 * ConfirmModal - Component thay thế window.confirm() mặc định
 * @param {boolean} isOpen - Trạng thái mở của modal
 * @param {function} onClose - Hàm đóng modal
 * @param {function} onConfirm - Hàm xác nhận hành động
 * @param {string} title - Tiêu đề modal
 * @param {string} message - Nội dung câu hỏi/cảnh báo
 * @param {string} type - 'danger' (đỏ), 'warning' (vàng), 'info' (xanh)
 */
const ConfirmModal = ({ 
    isOpen, 
    onClose, 
    onConfirm, 
    title = "Xác nhận hành động", 
    message = "Bạn có chắc chắn muốn thực hiện hành động này?",
    type = "warning",
    confirmText = "Xác nhận",
    cancelText = "Hủy bỏ",
    loading = false
}) => {
    if (!isOpen) return null;

    const styles = {
        danger: {
            bg: "bg-red-50",
            iconBg: "bg-red-100",
            iconColor: "text-red-600",
            btn: "bg-red-600 hover:bg-red-700",
            title: "text-red-900",
            icon: <AlertTriangle size={24} />
        },
        warning: {
            bg: "bg-amber-50",
            iconBg: "bg-amber-100",
            iconColor: "text-amber-600",
            btn: "bg-amber-600 hover:bg-amber-700",
            title: "text-amber-900",
            icon: <AlertCircle size={24} />
        },
        info: {
            bg: "bg-blue-50",
            iconBg: "bg-blue-100",
            iconColor: "text-blue-600",
            btn: "bg-blue-600 hover:bg-blue-700",
            title: "text-blue-900",
            icon: <Info size={24} />
        }
    };

    const currentStyle = styles[type] || styles.warning;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-0">
            {/* Backdrop */}
            <div 
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-md animate-in fade-in" 
                onClick={!loading ? onClose : undefined} 
            />
            
            {/* Modal Content */}
            <div className="relative bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
                <div className={`p-6 ${currentStyle.bg} flex items-center justify-between border-b border-black/5`}>
                    <div className="flex items-center gap-3">
                        <div className={`p-2 ${currentStyle.iconBg} ${currentStyle.iconColor} rounded-xl`}>
                            {currentStyle.icon}
                        </div>
                        <h3 className={`text-lg font-black uppercase tracking-tight ${currentStyle.title}`}>
                            {title}
                        </h3>
                    </div>
                    {!loading && (
                        <button 
                            onClick={onClose} 
                            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-white rounded-full transition-all"
                        >
                            <X size={20} strokeWidth={2.5} />
                        </button>
                    )}
                </div>

                <div className="p-8">
                    <p className="text-slate-600 font-bold leading-relaxed">
                        {message}
                    </p>

                    <div className="mt-8 flex flex-col sm:flex-row justify-end gap-3">
                        <button 
                            type="button" 
                            onClick={onClose}
                            disabled={loading}
                            className="order-2 sm:order-1 px-6 py-3 rounded-xl font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-all uppercase tracking-widest text-xs border-0 cursor-pointer"
                        >
                            {cancelText}
                        </button>
                        <button 
                            type="button" 
                            onClick={onConfirm}
                            disabled={loading}
                            className={`order-1 sm:order-2 px-8 py-3 ${currentStyle.btn} text-white font-black rounded-xl shadow-lg active:scale-95 transition-all uppercase tracking-widest text-xs flex items-center justify-center gap-2 border-0 cursor-pointer ${loading && 'opacity-50 cursor-not-allowed'}`}
                        >
                            {loading ? 'Đang xử lý...' : confirmText}
                        </button>
                    </div>
                </div>
                
                {/* Footer Accent */}
                <div className="h-1 w-full bg-gradient-to-r from-transparent via-slate-100 to-transparent" />
            </div>
        </div>
    );
};

export default ConfirmModal;
