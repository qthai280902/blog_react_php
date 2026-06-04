import React, { createContext, useState, useEffect, useContext } from 'react';

export const AuthContext = createContext();

export const useAuth = () => {
    return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(() => {
        const storedUser = localStorage.getItem('user');
        return (storedUser && storedUser !== "undefined") ? JSON.parse(storedUser) : null;
    });

    useEffect(() => {
        const handleStorageChange = () => {
            const updatedUser = localStorage.getItem('user');
            setUser(updatedUser && updatedUser !== "undefined" ? JSON.parse(updatedUser) : null);
        };

        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, []);

    const login = (userData, token) => {
        // [AUTHORITATIVE STORAGE]: Lưu trữ đồng bộ vào LocalStorage
        if (userData) {
            localStorage.setItem('user', JSON.stringify(userData));
        }
        if (token) {
            localStorage.setItem('token', token);
        }
        
        // Cập nhật Virtual DOM State ngay lập tức
        setUser(userData ? { ...userData } : null);
    };

    const logout = () => {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        setUser(null);
    };

    const setAuthUser = (userData) => {
        if (!userData) {
            setUser(null);
            localStorage.removeItem('user');
            return;
        }

        // [IDENTITY NORMALIZATION]: Luôn đảm bảo có uid để các logic isOwnProfile không bị vỡ
        const normalizedUser = { 
            ...userData, 
            uid: userData.uid || (user && user.uid) || userData.id 
        };

        localStorage.setItem('user', JSON.stringify(normalizedUser));
        // Kỹ thuật Clone Object: Tạo ra tham chiếu mới để React bắt buộc phải quét lại UI
        setUser({ ...normalizedUser });
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, setAuthUser }}>
            {children}
        </AuthContext.Provider>
    );
};
