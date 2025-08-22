import React, { useState } from 'react';
import './FormPopup.css';

const AddVehicleModal = ({ onSave, onClose }) => {
    const [bienSoXe, setBienSoXe] = useState('');
    const [tenXe, setTenXe] = useState('');
    const [maLoaiXe, setMaLoaiXe] = useState('');
    const [ownerId, setOwnerId] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!bienSoXe || !tenXe || !maLoaiXe || !ownerId) {
            setError('Vui lòng điền đầy đủ thông tin.');
            return;
        }

        const newVehicleData = {
            bienSoXe,
            tenXe,
            maLoaiXe: { maLoaiXe: parseInt(maLoaiXe, 10) },
            owner: { id: parseInt(ownerId, 10) }
        };

        onSave(newVehicleData);
    };

    return (
        <div className="popup-backdrop">
            <div className="popup-content form-popup">
                <h2>Thêm phương tiện mới</h2>
                {error && <p className="error-message">{error}</p>}
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Biển số xe</label>
                        <input
                            type="text"
                            value={bienSoXe}
                            onChange={(e) => setBienSoXe(e.target.value)}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Tên xe</label>
                        <input
                            type="text"
                            value={tenXe}
                            onChange={(e) => setTenXe(e.target.value)}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Mã loại xe</label>
                        <input
                            type="text"
                            value={maLoaiXe}
                            onChange={(e) => setMaLoaiXe(e.target.value)}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>ID Chủ sở hữu</label>
                        <input
                            type="number"
                            value={ownerId}
                            onChange={(e) => setOwnerId(e.target.value)}
                            required
                        />
                    </div>
                    <div className="modal-actions">
                        <button type="button" onClick={onClose} className="cancel-btn">Hủy</button>
                        <button type="submit" className="save-btn">Lưu</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddVehicleModal;

