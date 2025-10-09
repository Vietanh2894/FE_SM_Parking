import React, { useState, useEffect } from 'react';
import dangKyThangService from '../../services/dangKyThangService';

const RenewDangKyThangModal = ({ 
  isOpen, 
  onClose, 
  onSuccess,
  showToast 
}) => {
  const [bienSoXe, setBienSoXe] = useState('');
  const [soThang, setSoThang] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setBienSoXe('');
      setSoThang('');
    }
  }, [isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!bienSoXe.trim()) {
      showToast('Vui lòng nhập biển số xe', 'error');
      return;
    }

    const soThangValue = parseInt(soThang);
    if (!soThang || soThangValue < 1 || soThangValue > 12) {
      showToast('Số tháng đăng ký phải từ 1 đến 12', 'error');
      return;
    }

    try {
      setIsSubmitting(true);
      
      // Lấy thông tin nhân viên từ localStorage
      const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
      const maNhanVien = currentUser.maNV || 'NV001'; // fallback

      const response = await dangKyThangService.renewDangKyThang(
        bienSoXe.trim(),
        soThangValue,
        maNhanVien
      );

      if (response.success) {
        console.log('Renew success, calling showToast and onSuccess...');
        showToast('Gia hạn đăng ký tháng thành công!', 'success');
        if (onSuccess) {
          console.log('Calling onSuccess callback...');
          await onSuccess(response.data);
        }
        console.log('Closing modal...');
        handleClose();
      } else {
        console.log('Renew failed:', response.message);
        showToast(response.message || 'Gia hạn thất bại', 'error');
      }
    } catch (error) {
      console.error('Error renewing registration:', error);
      showToast('Có lỗi xảy ra khi gia hạn', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setBienSoXe('');
    setSoThang('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="px-6 py-4 border-b border-gray-200 rounded-t-lg">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">
              Gia hạn đăng ký tháng (Tạo mới)
            </h2>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {/* Thông tin chức năng */}
          <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-start">
              <svg className="w-5 h-5 text-blue-600 mt-0.5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <h4 className="text-sm font-medium text-blue-800">Chức năng này dành cho:</h4>
                <p className="text-sm text-blue-700 mt-1">
                  Xe đã hết hạn đăng ký tháng và cần tạo đăng ký mới từ thời điểm hiện tại.
                  <br />
                  Hệ thống sẽ tự động sử dụng thông tin từ đăng ký cũ.
                </p>
              </div>
            </div>
          </div>

          {/* Form inputs */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Biển số xe <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={bienSoXe}
                onChange={(e) => setBienSoXe(e.target.value.toUpperCase())}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Nhập biển số xe (VD: 72C2-7777)"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Số tháng đăng ký <span className="text-red-500">*</span>
              </label>
              <select
                value={soThang}
                onChange={(e) => setSoThang(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="">Chọn số tháng</option>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(month => (
                  <option key={month} value={month}>
                    {month} tháng
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Warning */}
          <div className="mt-6 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
            <div className="flex items-start">
              <svg className="w-5 h-5 text-yellow-600 mt-0.5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 15.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <div>
                <h4 className="text-sm font-medium text-yellow-800">Lưu ý quan trọng:</h4>
                <ul className="text-sm text-yellow-700 mt-1 space-y-1">
                  <li>• Chỉ dành cho xe đã hết hạn đăng ký</li>
                  <li>• Thời gian bắt đầu từ thời điểm hiện tại</li>
                  <li>• Sử dụng thông tin từ đăng ký cũ</li>
                  <li>• Số tiền sẽ được tính tự động</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !bienSoXe.trim() || !soThang}
              className="px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Đang xử lý...' : 'Gia hạn đăng ký'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RenewDangKyThangModal;
