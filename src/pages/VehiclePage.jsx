import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/VehiclePage.css';
import EditVehicleModal from '../components/modals/EditVehicleModal';
import AddVehicleModal from '../components/modals/AddVehicleModal';
import ConfirmationPopup from '../components/common/ConfirmationPopup';

const VehiclePage = () => {
    const [vehicles, setVehicles] = useState([]);
    const [originalVehicles, setOriginalVehicles] = useState([]);
    const [error, setError] = useState(null);
    const [searchInput, setSearchInput] = useState('');
    const [isDeleteMode, setIsDeleteMode] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [editingVehicle, setEditingVehicle] = useState(null);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [vehicleToDelete, setVehicleToDelete] = useState(null);
    const [notification, setNotification] = useState({ message: '', type: '' });
    const [currentPage, setCurrentPage] = useState(1);
    const vehiclesPerPage = 6;

    useEffect(() => {
        const fetchVehicles = async () => {
            const token = localStorage.getItem('accessToken');
            if (!token) {
                setError('No access token found.');
                return;
            }
            try {
                const response = await axios.get('http://localhost:8080/vehicles', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (response.data && Array.isArray(response.data.data)) {
                    setVehicles(response.data.data);
                    setOriginalVehicles(response.data.data);
                } else {
                    setError('Failed to fetch vehicles or data is not an array.');
                }
            } catch (err) {
                setError('An error occurred while fetching vehicles.');
                console.error('Fetch vehicles error:', err);
            }
        };
        fetchVehicles();
    }, []);

    const showNotification = (message, type) => {
        setNotification({ message, type });
        setTimeout(() => {
            setNotification({ message: '', type: '' });
        }, 3000);
    };

    const handleDeleteClick = (vehicle) => {
        setVehicleToDelete(vehicle);
        setShowDeleteConfirm(true);
    };

    const handleConfirmDelete = async () => {
        if (!vehicleToDelete) return;

        const { bienSoXe } = vehicleToDelete;
        const token = localStorage.getItem('accessToken');
        if (!token) {
            showNotification('Authentication token not found.', 'error');
            return;
        }

        try {
            await axios.delete(`http://localhost:8080/vehicles/${bienSoXe}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            const updatedVehicles = vehicles.filter(v => v.bienSoXe !== bienSoXe);
            setVehicles(updatedVehicles);
            setOriginalVehicles(originalVehicles.filter(v => v.bienSoXe !== bienSoXe));

            if (currentVehicles.length === 1 && currentPage > 1) {
                setCurrentPage(currentPage - 1);
            }

            showNotification(`Xóa thành công xe có biển số: ${bienSoXe}`, 'success');
            setIsDeleteMode(false);
            setShowDeleteConfirm(false);
            setVehicleToDelete(null);

        } catch (err) {
            console.error('Delete vehicle error:', err);
            showNotification(err.response?.data?.message || 'Đã có lỗi xảy ra khi xóa xe.', 'error');
        }
    };

    // Placeholder for Create and Update functions
    const handleCreateVehicle = async (newVehicleData) => {
        const token = localStorage.getItem('accessToken');
        if (!token) {
            showNotification('Authentication token not found.', 'error');
            return;
        }

        try {
            const response = await axios.post('http://localhost:8080/vehicles', newVehicleData, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.data && response.data.statusCode === 200) {
                const newVehicle = response.data.data;
                const updatedVehicles = [...originalVehicles, newVehicle];
                setOriginalVehicles(updatedVehicles);
                setVehicles(updatedVehicles);
                showNotification('Thêm xe mới thành công!', 'success');
                setIsAddModalOpen(false);

                const newTotalPages = Math.ceil(updatedVehicles.length / vehiclesPerPage);
                setCurrentPage(newTotalPages);
            } else {
                showNotification(response.data.message || 'Không thể thêm xe.', 'error');
            }
        } catch (err) {
            console.error('Create vehicle error:', err);
            showNotification(err.response?.data?.message || 'Đã có lỗi xảy ra khi thêm xe.', 'error');
        }
    };
    const handleUpdateVehicle = async (updatedVehicle) => {
        const token = localStorage.getItem('accessToken');
        if (!token) {
            showNotification('Authentication token not found.', 'error');
            return;
        }

        try {
            const response = await axios.put('http://localhost:8080/vehicles', updatedVehicle, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.data && response.data.statusCode === 200) {
                const updatedVehicles = originalVehicles.map(v => v.bienSoXe === updatedVehicle.bienSoXe ? response.data.data : v);
                setOriginalVehicles(updatedVehicles);
                setVehicles(updatedVehicles);
                showNotification('Cập nhật thông tin xe thành công!', 'success');
                setEditingVehicle(null);
                setIsEditMode(false);
            } else {
                showNotification(response.data.message || 'Không thể cập nhật thông tin xe.', 'error');
            }
        } catch (err) {
            console.error('Update vehicle error:', err);
            showNotification(err.response?.data?.message || 'Đã có lỗi xảy ra khi cập nhật.', 'error');
        }
    };

    const handleSearch = async () => {
        setCurrentPage(1);
        if (!searchInput.trim()) {
            setVehicles(originalVehicles);
            setError(null);
            return;
        }
        const token = localStorage.getItem('accessToken');
        if (!token) {
            setError('Authentication token not found.');
            return;
        }
        setError(null);
        try {
            const response = await axios.get(`http://localhost:8080/vehicles/${searchInput}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.data && response.data.statusCode === 200) {
                setVehicles(response.data.data ? [response.data.data] : []);
                if (!response.data.data) {
                    setError(`Vehicle with license plate ${searchInput} not found.`);
                }
            } else {
                setVehicles([]);
                setError(response.data.message || `Vehicle with license plate ${searchInput} not found.`);
            }
        } catch (err) {
            setVehicles([]);
            setError(err.response?.data?.message || `Vehicle with license plate ${searchInput} not found or an error occurred.`);
            console.error('Search error:', err);
        }
    };

    const handleKeyPress = (event) => {
        if (event.key === 'Enter') {
            handleSearch();
        }
    };

    // Pagination Logic
    const indexOfLastVehicle = currentPage * vehiclesPerPage;
    const indexOfFirstVehicle = indexOfLastVehicle - vehiclesPerPage;
    const currentVehicles = vehicles.slice(indexOfFirstVehicle, indexOfLastVehicle);
    const totalPages = Math.ceil(vehicles.length / vehiclesPerPage);

    return (
        <div className="vehicle-table-container">
            <div className="table-header">
                <h2>Vehicle Management</h2>
                <div className="search-container">
                    <input
                        type="text"
                        placeholder="Search by license plate..."
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                        onKeyPress={handleKeyPress}
                        className="search-input"
                    />
                    <button onClick={handleSearch} className="search-button">Search</button>
                </div>
            </div>

            {error && <p className="search-error-message">{error}</p>}

            {vehicles.length > 0 ? (
                <table>
                    <thead>
                        <tr>
                            <th>Biển Số Xe</th>
                            <th>Tên Xe</th>
                            <th>Loại Xe</th>
                            <th>Ngày tạo</th>
                            <th>Chủ sở hữu</th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentVehicles.map(vehicle => (
                            <tr 
                                key={vehicle.bienSoXe}
                                className={`${isDeleteMode ? 'deletable-row' : ''} ${isEditMode ? 'editable-row' : ''}`}
                                onClick={() => {
                                    if (isDeleteMode) {
                                        handleDeleteClick(vehicle);
                                    } else if (isEditMode) {
                                        setEditingVehicle(vehicle);
                                    }
                                }}
                            >
                                <td>{vehicle.bienSoXe}</td>
                                <td>{vehicle.tenXe}</td>
                                <td>{vehicle.maLoaiXe.tenLoaiXe}</td>
                                <td>{new Date(vehicle.createdDate).toLocaleDateString()}</td>
                                <td>{vehicle.owner.name} (ID: {vehicle.owner.id})</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            ) : (
                !error && <p className="info-message">No vehicles found.</p>
            )}

            {totalPages > 1 && (
                <div className="pagination-controls">
                    {currentPage > 1 && <span onClick={() => setCurrentPage(p => p - 1)} className="page-link prev-next">Trước</span>}
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                        <span 
                            key={page}
                            onClick={() => setCurrentPage(page)}
                            className={`page-link ${currentPage === page ? 'active' : ''}`}>
                            {page}
                        </span>
                    ))}
                    {currentPage < totalPages && <span onClick={() => setCurrentPage(p => p + 1)} className="page-link prev-next">Tiếp</span>}
                </div>
            )}

            {notification.message && (
                <div className={`notification ${notification.type}`}>
                    {notification.message}
                </div>
            )}

            <div className="table-footer">
                <button onClick={() => { setVehicles(originalVehicles); setError(null); setIsDeleteMode(false); setIsEditMode(false); setCurrentPage(1); }} className="show-all-button">
                    Tất cả
                </button>
                <button onClick={() => setIsAddModalOpen(true)} className="add-button">
                    Thêm
                </button>
                <button onClick={() => { setIsEditMode(!isEditMode); setIsDeleteMode(false); }} className={`edit-button ${isEditMode ? 'active' : ''}`}>
                    {isEditMode ? 'Hủy Sửa' : 'Sửa'}
                </button>
                <button onClick={() => { setIsDeleteMode(!isDeleteMode); setIsEditMode(false); }} className={`delete-button ${isDeleteMode ? 'active' : ''}`}>
                    {isDeleteMode ? 'Hủy Xóa' : 'Xóa'}
                </button>
            </div>

            {/* Modals will be added later */}
            {editingVehicle && <EditVehicleModal vehicle={editingVehicle} onSave={handleUpdateVehicle} onClose={() => { setEditingVehicle(null); setIsEditMode(false); }} />}
            {isAddModalOpen && <AddVehicleModal onSave={handleCreateVehicle} onClose={() => setIsAddModalOpen(false)} />}

            {showDeleteConfirm && (
                <ConfirmationPopup
                    message={`Bạn có chắc chắn muốn xóa xe có biển số: ${vehicleToDelete?.bienSoXe} không?`}
                    onConfirm={handleConfirmDelete}
                    onCancel={() => {
                        setShowDeleteConfirm(false);
                        setVehicleToDelete(null);
                    }}
                />
            )}
        </div>
    );
};

export default VehiclePage;

