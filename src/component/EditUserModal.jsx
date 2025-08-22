import React, { useState, useEffect } from 'react';
import './FormPopup.css';

const EditUserModal = ({ user, onSave, onClose }) => {
    const [formData, setFormData] = useState({ name: '', email: '', password: '' });

    useEffect(() => {
        if (user) {
            setFormData({ name: user.name, email: user.email, password: '' }); // Don't pre-fill password
        }
    }, [user]);

    if (!user) {
        return null;
    }

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const dataToSave = { ...user, ...formData };
        // Only include password if it was changed
        if (!formData.password) {
            delete dataToSave.password;
        }
        onSave(dataToSave);
    };

    const handleBackdropClick = (e) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    return (
        <div className="popup-backdrop" onClick={handleBackdropClick}>
            <div className="popup-content form-popup">
                <div className="modal-header">
                    <h2>Sửa thông tin: {user.name}</h2>
                    <button type="button" className="close-btn" onClick={onClose}>×</button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="name">Tên</label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="email">Email</label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="password">Mật khẩu mới</label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            placeholder="Để trống nếu không muốn đổi mật khẩu"
                            value={formData.password}
                            onChange={handleChange}
                        />
                    </div>
                    <div className="modal-actions">
                        <button type="submit" className="btn-save">Lưu</button>
                        <button type="button" onClick={onClose} className="btn-cancel">Hủy</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditUserModal;
