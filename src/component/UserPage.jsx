import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './UserPage.css';
import EditUserModal from './EditUserModal';
import AddUserModal from './AddUserModal';
import ConfirmationPopup from './ConfirmationPopup';

// API instance để đồng nhất base URL
const api = axios.create({
    baseURL: 'http://localhost:8080',
    headers: {
        'Content-Type': 'application/json'
    }
});

const UserPage = () => {
    const [users, setUsers] = useState([]);
    const [originalUsers, setOriginalUsers] = useState([]);
    const [error, setError] = useState(null);
    const [searchInput, setSearchInput] = useState('');
    const [isDeleteMode, setIsDeleteMode] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [userToDelete, setUserToDelete] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [notification, setNotification] = useState({ message: '', type: '' });
    const [currentPage, setCurrentPage] = useState(1);
    const usersPerPage = 6;

    useEffect(() => {
        const fetchUsers = async () => {
            const token = localStorage.getItem('accessToken');
            if (!token) {
                setError('No access token found.');
                return;
            }
            try {
                const response = await api.get('/users', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (response.data && Array.isArray(response.data.data)) {
                    setUsers(response.data.data);
                    setOriginalUsers(response.data.data);
                } else {
                    setError('Failed to fetch users or data is not an array.');
                }
            } catch (err) {
                setError('An error occurred while fetching users.');
                console.error('Fetch users error:', err);
            }
        };
        fetchUsers();
    }, []);

    const showNotification = (message, type) => {
        setNotification({ message, type });
        setTimeout(() => {
            setNotification({ message: '', type: '' });
        }, 3000);
    };

    const handleDeleteUser = async (userId) => {
        // Show confirmation popup instead of window.confirm
        const userToDelete = users.find(user => user.id === userId);
        setUserToDelete(userToDelete);
        setShowDeleteConfirm(true);
    };

    const confirmDeleteUser = async () => {
        if (!userToDelete) return;

        setIsLoading(true);
        const token = localStorage.getItem('accessToken');
        if (!token) {
            showNotification('Authentication token not found.', 'error');
            setShowDeleteConfirm(false);
            setUserToDelete(null);
            setIsLoading(false);
            return;
        }

        try {
            await api.delete(`/users/${userToDelete.id}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            
            const updatedUsers = users.filter(user => user.id !== userToDelete.id);
            setUsers(updatedUsers);
            setOriginalUsers(originalUsers.filter(user => user.id !== userToDelete.id));

            // Adjust current page if the last item on a page is deleted
            if (currentUsers.length === 1 && currentPage > 1) {
                setCurrentPage(currentPage - 1);
            }

            showNotification(`Xóa thành công người dùng: ${userToDelete.name}`, 'success');
            setIsDeleteMode(false); // Exit delete mode after successful deletion

        } catch (err) {
            console.error('Delete user error:', err);
            showNotification(err.response?.data?.message || 'Đã có lỗi xảy ra khi xóa người dùng.', 'error');
        } finally {
            setIsLoading(false);
            setShowDeleteConfirm(false);
            setUserToDelete(null);
        }
    };

    const cancelDeleteUser = () => {
        if (!isLoading) {
            setShowDeleteConfirm(false);
            setUserToDelete(null);
        }
    };

    const handleCreateUser = async (newUserData) => {
        const token = localStorage.getItem('accessToken');
        if (!token) {
            showNotification('Authentication token not found.', 'error');
            return;
        }

        try {
            const response = await api.post('/users', newUserData, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            if (response.data && response.data.statusCode === 201) {
                const newUser = response.data.data;
                // Add to user list and go to the last page to see the new user
                const updatedUsers = [...users, newUser];
                setUsers(updatedUsers);
                setOriginalUsers([...originalUsers, newUser]);
                setCurrentPage(Math.ceil(updatedUsers.length / usersPerPage));

                showNotification(`Thêm thành công người dùng: ${newUser.name}`, 'success');
                setIsAddModalOpen(false);
            } else {
                showNotification(response.data.message || 'Không thể thêm người dùng.', 'error');
            }
        } catch (err) {
            console.error('Create user error:', err);
            showNotification(err.response?.data?.message || 'Đã có lỗi xảy ra khi thêm người dùng.', 'error');
        }
    };

    const handleUpdateUser = async (updatedUser) => {
        const token = localStorage.getItem('accessToken');
        if (!token) {
            showNotification('Authentication token not found.', 'error');
            return;
        }

        try {
            const response = await api.put(`/users`, updatedUser, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            const returnedUser = response.data.data;
            const updatedUsers = users.map(user => user.id === returnedUser.id ? returnedUser : user);
            setUsers(updatedUsers);
            setOriginalUsers(originalUsers.map(user => user.id === returnedUser.id ? returnedUser : user));

            showNotification(`Cập nhật thành công người dùng: ${returnedUser.name}`, 'success');
            setEditingUser(null);
            setIsEditMode(false);

        } catch (err) {
            console.error('Update user error:', err);
            showNotification(err.response?.data?.message || 'Đã có lỗi xảy ra khi cập nhật.', 'error');
        }
    };

    const handleSearch = async () => {
        setCurrentPage(1); // Reset to first page on new search
        if (!searchInput.trim()) {
            setUsers(originalUsers);
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
            const response = await api.get(`/users/${searchInput}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.data && response.data.statusCode === 200) {
                setUsers(response.data.data ? [response.data.data] : []);
                if (!response.data.data) {
                    setError(`User with ID ${searchInput} not found.`);
                }
            } else {
                setUsers([]);
                setError(response.data.message || `User with ID ${searchInput} not found.`);
            }
        } catch (err) {
            setUsers([]);
            if (err.response && err.response.data && err.response.data.message) {
                setError(err.response.data.message);
            } else {
                setError(`User with ID ${searchInput} not found or an error occurred.`);
            }
            console.error('Search error:', err);
        }
    };

    const handleKeyPress = (event) => {
        if (event.key === 'Enter') {
            handleSearch();
        }
    };

    const handlePreviousPage = () => {
        setCurrentPage((prev) => (prev > 1 ? prev - 1 : prev));
    };

    const handleNextPage = () => {
        setCurrentPage((prev) => (prev < totalPages ? prev + 1 : prev));
    };

    // Pagination Logic
    const indexOfLastUser = currentPage * usersPerPage;
    const indexOfFirstUser = indexOfLastUser - usersPerPage;
    const currentUsers = users.slice(indexOfFirstUser, indexOfLastUser);
    const totalPages = Math.ceil(users.length / usersPerPage);

    return (
        <div className="user-table-container">
            <div className="table-header">
                <h2>User Management</h2>
                <div className="search-container">
                    <input
                        type="text"
                        placeholder="Search by ID..."
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                        onKeyPress={handleKeyPress}
                        className="search-input"
                    />
                    <button onClick={handleSearch} className="search-button">Search</button>
                </div>
            </div>

            {error && <p className="search-error-message">{error}</p>}

            {users.length > 0 ? (
                <table>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Name</th>
                            <th>Email</th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentUsers.map(user => (
                            <tr 
                                key={user.id}
                                className={`${isDeleteMode ? 'deletable-row' : ''} ${isEditMode ? 'editable-row' : ''}`}
                                onClick={() => {
                                    if (isDeleteMode) {
                                        handleDeleteUser(user.id);
                                    } else if (isEditMode) {
                                        setEditingUser(user);
                                    }
                                }}
                            >
                                <td>{user.id}</td>
                                <td>{user.name}</td>
                                <td>{user.email}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            ) : (
                !error && <p className="info-message">No users found.</p>
            )}

            {totalPages > 1 && (
                <div className="pagination-controls">
                    {currentPage > 1 && (
                        <span onClick={handlePreviousPage} className="page-link prev-next">
                            Trước
                        </span>
                    )}

                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                        <span 
                            key={page}
                            onClick={() => setCurrentPage(page)}
                            className={`page-link ${currentPage === page ? 'active' : ''}`}>
                            {page}
                        </span>
                    ))}

                    {currentPage < totalPages && (
                        <span onClick={handleNextPage} className="page-link prev-next">
                            Tiếp
                        </span>
                    )}
                </div>
            )}

            {notification.message && (
                <div className={`notification ${notification.type}`}>
                    {notification.message}
                </div>
            )}

            <div className="table-footer">
                <button onClick={() => { setUsers(originalUsers); setError(null); setIsDeleteMode(false); setIsEditMode(false); setCurrentPage(1); }} className="show-all-button">
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

            {editingUser && (
                <EditUserModal 
                    user={editingUser}
                    onSave={handleUpdateUser}
                    onClose={() => {
                        setEditingUser(null);
                        setIsEditMode(false);
                    }}
                />
            )}

            {isAddModalOpen && (
                <AddUserModal 
                    onSave={handleCreateUser}
                    onClose={() => setIsAddModalOpen(false)}
                />
            )}

            {showDeleteConfirm && userToDelete && (
                <ConfirmationPopup
                    message={`Bạn có chắc chắn muốn xóa người dùng "${userToDelete.name}" (ID: ${userToDelete.id}) không?`}
                    onConfirm={confirmDeleteUser}
                    onCancel={cancelDeleteUser}
                    isLoading={isLoading}
                />
            )}
        </div>
    );
};

export default UserPage;
