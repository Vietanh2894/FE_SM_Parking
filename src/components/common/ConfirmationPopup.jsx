import React from 'react';
import '../../styles/ConfirmationPopup.css';

const ConfirmationPopup = ({ message, onConfirm, onCancel, isLoading = false }) => {
    return (
        <div className="popup-backdrop">
            <div className="popup-content">
                <p>{message}</p>
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
                        className="popup-btn confirm"
                        disabled={isLoading}
                    >
                        {isLoading ? 'Đang xử lý...' : 'Xác nhận'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmationPopup;
