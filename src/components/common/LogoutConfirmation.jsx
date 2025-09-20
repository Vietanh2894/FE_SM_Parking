import React from 'react';

const LogoutConfirmation = ({ onConfirm, onCancel, isLoading = false }) => {
    return (
        <div className="popup-backdrop">
            <div className="popup-content logout-confirmation">
                <div className="logout-icon">
                    <i className="bi bi-box-arrow-right"></i>
                </div>
                <h3>Xác nhận đăng xuất</h3>
                <p>Bạn có chắc chắn muốn đăng xuất khỏi hệ thống không?</p>
                <div className="popup-actions">
                    <button 
                        onClick={onCancel} 
                        className="popup-btn cancel"
                        disabled={isLoading}
                    >
                        Hủy
                    </button>
                    <button 
                        onClick={onConfirm} 
                        className="popup-btn confirm logout-btn"
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <>
                                <i className="bi bi-hourglass-split spinning"></i>
                                Đang đăng xuất...
                            </>
                        ) : (
                            <>
                                <i className="bi bi-box-arrow-right"></i>
                                Đăng xuất
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default LogoutConfirmation;
