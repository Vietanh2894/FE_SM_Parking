import React, { useState, useEffect } from 'react';
import './FormPopup.css';

const EditVehicleModal = ({ vehicle, onSave, onClose }) => {
    const [tenXe, setTenXe] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        if (vehicle) {
            setTenXe(vehicle.tenXe);
        }
    }, [vehicle]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!tenXe) {
            setError('Tên xe không được để trống.');
            return;
        }

        const updatedVehicle = {
            ...vehicle,
            tenXe
        };

        onSave(updatedVehicle);
    };

    if (!vehicle) return null;

    return (
        <div className="popup-backdrop">
            <div className="popup-content form-popup">
                <h2>Chỉnh sửa thông tin xe</h2>
                {error && <p className="error-message">{error}</p>}
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Biển số xe</label>
                        <input
                            type="text"
                            value={vehicle.bienSoXe}
                            readOnly
                            disabled
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
                    <div className="modal-actions">
                        <button type="button" onClick={onClose} className="cancel-btn">Hủy</button>
                        <button type="submit" className="save-btn">Lưu</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditVehicleModal;

