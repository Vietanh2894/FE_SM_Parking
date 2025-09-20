import React, { useState, useEffect } from 'react';
import axios from 'axios';

const EditParkingLotModal = ({ isOpen, parkingLot, onSave, onClose, isSubmitting = false }) => {
    const [formData, setFormData] = useState({
        maBaiDo: '',
        tenBaiDo: '',
        soChoTrong: '',
        tongSoCho: '',
        maLoaiXe: '',
        diaChi: '',
        moTa: '',
        trangThai: 'ACTIVE'
    });
    const [vehicleTypes, setVehicleTypes] = useState([]);

    // Initialize form fields when parkingLot changes
    useEffect(() => {
        if (parkingLot) {
            setFormData({
                maBaiDo: parkingLot.maBaiDo || '',
                tenBaiDo: parkingLot.tenBaiDo || '',
                soChoTrong: parkingLot.soChoTrong?.toString() || '',
                tongSoCho: parkingLot.tongSoCho?.toString() || '',
                maLoaiXe: parkingLot.maLoaiXe?.maLoaiXe || '',
                diaChi: parkingLot.diaChi || '',
                moTa: parkingLot.moTa || '',
                trangThai: parkingLot.trangThai || 'ACTIVE'
            });
        }
    }, [parkingLot]);

    // Fetch vehicle types when component mounts
    useEffect(() => {
        if (isOpen) {
            fetchVehicleTypes();
        }
    }, [isOpen]);

    // Don't render if modal is not open or no parkingLot
    if (!isOpen || !parkingLot) {
        return null;
    }

    const fetchVehicleTypes = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:8080/vehicle-types', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.data && response.data.data) {
                setVehicleTypes(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching vehicle types:', error);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!formData.tenBaiDo || !formData.tongSoCho || !formData.maLoaiXe) {
            alert('Vui lòng điền đầy đủ thông tin bắt buộc.');
            return;
        }

        const tongSoChoNum = parseInt(formData.tongSoCho);
        const soChoTrongNum = parseInt(formData.soChoTrong);

        // Validate numbers
        if (tongSoChoNum <= 0) {
            alert('Tổng số chỗ phải lớn hơn 0.');
            return;
        }

        if (soChoTrongNum < 0 || soChoTrongNum > tongSoChoNum) {
            alert('Số chỗ trống phải từ 0 đến tổng số chỗ.');
            return;
        }

        const updatedParkingLotData = {
            ...parkingLot,
            tenBaiDo: formData.tenBaiDo,
            soChoTrong: soChoTrongNum,
            tongSoCho: tongSoChoNum,
            maLoaiXe: { maLoaiXe: formData.maLoaiXe },
            diaChi: formData.diaChi || null,
            moTa: formData.moTa || null,
            trangThai: formData.trangThai
        };

        console.log('Submitting edit parking lot data:', updatedParkingLotData);
        onSave(updatedParkingLotData);
    };

    const handleClose = () => {
        onClose();
    };

    const handleBackdropClick = (e) => {
        if (e.target === e.currentTarget) {
            handleClose();
        }
    };

    return (
        <div className="popup-backdrop">
            <div className="popup-content form-popup">
                <h2>Chỉnh sửa bãi đỗ xe</h2>
                {error && <p className="error-message">{error}</p>}
                <form onSubmit={handleSubmit}>
                    <div className="form-row">
                        <div className="form-group">
                            <label>Mã bãi đỗ</label>
                            <input
                                type="text"
                                value={maBaiDo}
                                onChange={(e) => setMaBaiDo(e.target.value)}
                                placeholder="Nhập mã bãi đỗ"
                                maxLength="10"
                                readOnly
                                disabled
                            />
                        </div>
                        <div className="form-group">
                            <label>Loại xe <span className="required">*</span></label>
                            <select
                                value={maLoaiXe}
                                onChange={(e) => setMaLoaiXe(e.target.value)}
                                required
                            >
                                <option value="">Chọn loại xe</option>
                                {vehicleTypes.map(vehicleType => (
                                    <option key={vehicleType.maLoaiXe} value={vehicleType.maLoaiXe}>
                                        {vehicleType.tenLoaiXe}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                    
                    <div className="form-group">
                        <label>Tên bãi đỗ <span className="required">*</span></label>
                        <input
                            type="text"
                            value={tenBaiDo}
                            onChange={(e) => setTenBaiDo(e.target.value)}
                            placeholder="Nhập tên bãi đỗ"
                            maxLength="100"
                            required
                        />
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Tổng số chỗ <span className="required">*</span></label>
                            <input
                                type="number"
                                value={tongSoCho}
                                onChange={(e) => setTongSoCho(e.target.value)}
                                placeholder="Nhập tổng số chỗ"
                                min="1"
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>Số chỗ trống <span className="required">*</span></label>
                            <input
                                type="number"
                                value={soChoTrong}
                                onChange={(e) => setSoChoTrong(e.target.value)}
                                placeholder="Nhập số chỗ trống"
                                min="0"
                                max={tongSoCho || undefined}
                                required
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Địa chỉ</label>
                        <input
                            type="text"
                            value={diaChi}
                            onChange={(e) => setDiaChi(e.target.value)}
                            placeholder="Nhập địa chỉ bãi đỗ"
                            maxLength="255"
                        />
                    </div>

                    <div className="form-group">
                        <label>Trạng thái</label>
                        <select
                            value={trangThai}
                            onChange={(e) => setTrangThai(e.target.value)}
                        >
                            <option value="ACTIVE">Hoạt động</option>
                            <option value="INACTIVE">Không hoạt động</option>
                            <option value="MAINTENANCE">Bảo trì</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label>Mô tả</label>
                        <textarea
                            value={moTa}
                            onChange={(e) => setMoTa(e.target.value)}
                            placeholder="Nhập mô tả về bãi đỗ"
                            maxLength="500"
                            rows="3"
                        />
                        <small className="form-hint">Tối đa 500 ký tự</small>
                    </div>

                    <div className="form-info">
                        <div className="info-section">
                            <h4>Thông tin bổ sung</h4>
                            <div className="info-row">
                                <span>Tỷ lệ lấp đầy:</span>
                                <span className="occupancy-display">
                                    {tongSoCho ? (((parseInt(tongSoCho) - parseInt(soChoTrong || 0)) / parseInt(tongSoCho)) * 100).toFixed(1) : 0}%
                                </span>
                            </div>
                            {parkingLot.createdDate && (
                                <div className="info-row">
                                    <span>Ngày tạo:</span>
                                    <span>{new Date(parkingLot.createdDate).toLocaleString('vi-VN')}</span>
                                </div>
                            )}
                            {parkingLot.updatedDate && (
                                <div className="info-row">
                                    <span>Cập nhật lần cuối:</span>
                                    <span>{new Date(parkingLot.updatedDate).toLocaleString('vi-VN')}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="modal-actions">
                        <button 
                            type="button" 
                            onClick={onClose} 
                            className="cancel-btn"
                            disabled={loading}
                        >
                            Hủy
                        </button>
                        <button 
                            type="submit" 
                            className="save-btn"
                            disabled={loading}
                        >
                            {loading ? 'Đang lưu...' : 'Lưu'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditParkingLotModal;
