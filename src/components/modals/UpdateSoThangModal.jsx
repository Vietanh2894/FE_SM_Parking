import React, { useState, useEffect } from 'react';
import dangKyThangService from '../../services/dangKyThangService';

const UpdateSoThangModal = ({ 
  isOpen, 
  onClose, 
  dangKy,
  onSuccess,
  showToast
}) => {
  const [soThangMoi, setSoThangMoi] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen && dangKy) {
      setSoThangMoi(dangKy.soThang || '');
    }
  }, [isOpen, dangKy]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!dangKy) {
      showToast('Không tìm thấy thông tin đăng ký', 'error');
      return;
    }

    const soThangHienTai = dangKy.soThang;
    const soThangMoiValue = parseInt(soThangMoi);

    // Validation
    if (!soThangMoi || soThangMoiValue <= 0) {
      showToast('Vui lòng nhập số tháng hợp lệ', 'error');
      return;
    }

    if (soThangMoiValue > soThangHienTai) {
      showToast('Chỉ được phép giảm số tháng đăng ký', 'error');
      return;
    }

    if (soThangMoiValue === soThangHienTai) {
      showToast('Số tháng mới phải khác số tháng hiện tại', 'warning');
      return;
    }

    try {
      setIsSubmitting(true);
      
      // Lấy thông tin nhân viên từ localStorage hoặc auth context
      const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
      const maNhanVien = currentUser.maNV || 'NV001'; // fallback

      const response = await dangKyThangService.updateSoThangDangKy(
        dangKy.id, 
        soThangMoiValue, 
        maNhanVien
      );

      if (response.success) {
        console.log('Update success, calling showToast and onSuccess...');
        showToast('Cập nhật số tháng đăng ký thành công!', 'success');
        // Gọi callback để cập nhật danh sách và đóng modal
        if (onSuccess) {
          console.log('Calling onSuccess callback...');
          await onSuccess(response.data);
        }
        // Đảm bảo đóng modal
        console.log('Closing modal...');
        handleClose();
      } else {
        console.log('Update failed:', response.message);
        showToast(response.message || 'Cập nhật thất bại', 'error');
      }
    } catch (error) {
      console.error('Error updating so thang:', error);
      showToast('Có lỗi xảy ra khi cập nhật', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setSoThangMoi('');
    onClose();
  };

  if (!isOpen) return null;

  // Tính toán thông tin hiển thị
  const soThangHienTai = dangKy?.soThang || 0;
  const soThangMoiValue = parseInt(soThangMoi) || 0;
  const chenhLech = soThangHienTai - soThangMoiValue;
  const giaPerThang = dangKy?.soTienThanhToan ? (dangKy.soTienThanhToan / soThangHienTai) : 0;
  const soTienMoi = giaPerThang * soThangMoiValue;
  const soTienHoanLai = giaPerThang * chenhLech;

  // Tính toán thời gian mới
  const thoiGianBatDau = dangKy?.thoiGianBatDau ? new Date(dangKy.thoiGianBatDau) : null;
  const thoiGianHetHanMoi = thoiGianBatDau ? new Date(thoiGianBatDau.getTime() + (soThangMoiValue * 30 * 24 * 60 * 60 * 1000)) : null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white px-6 py-4 border-b border-gray-200 rounded-t-lg">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">
              Cập nhật số tháng đăng ký
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
          {/* Thông tin đăng ký hiện tại */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="text-lg font-medium text-gray-900 mb-3">Thông tin hiện tại</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-600">Biển số xe:</label>
                <p className="text-sm text-gray-900">{dangKy?.bienSoXe}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600">Số tháng hiện tại:</label>
                <p className="text-sm text-gray-900">{soThangHienTai} tháng</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600">Số tiền đã thanh toán:</label>
                <p className="text-sm text-gray-900">{dangKy?.soTienThanhToan?.toLocaleString('vi-VN')} VNĐ</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600">Thời gian hết hạn hiện tại:</label>
                <p className="text-sm text-gray-900">
                  {dangKy?.thoiGianHetHan ? new Date(dangKy.thoiGianHetHan).toLocaleDateString('vi-VN') : 'N/A'}
                </p>
              </div>
            </div>
          </div>

          {/* Form nhập số tháng mới */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Số tháng mới <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              value={soThangMoi}
              onChange={(e) => setSoThangMoi(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Nhập số tháng mới"
              min="1"
              max={soThangHienTai - 1}
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Chỉ được phép giảm từ {soThangHienTai} tháng xuống (1 - {soThangHienTai - 1} tháng)
            </p>
          </div>

          {/* Preview thông tin mới */}
          {soThangMoi && soThangMoiValue > 0 && soThangMoiValue < soThangHienTai && (
            <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h3 className="text-lg font-medium text-blue-900 mb-3">Thông tin sau khi cập nhật</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-blue-700">Số tháng mới:</label>
                  <p className="text-sm text-blue-900 font-semibold">{soThangMoiValue} tháng</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-blue-700">Giảm:</label>
                  <p className="text-sm text-blue-900 font-semibold">{chenhLech} tháng</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-blue-700">Số tiền mới:</label>
                  <p className="text-sm text-blue-900 font-semibold">{soTienMoi.toLocaleString('vi-VN')} VNĐ</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-green-700">Số tiền hoàn lại:</label>
                  <p className="text-sm text-green-900 font-semibold">+{soTienHoanLai.toLocaleString('vi-VN')} VNĐ</p>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-blue-700">Thời gian hết hạn mới:</label>
                  <p className="text-sm text-blue-900 font-semibold">
                    {thoiGianHetHanMoi ? thoiGianHetHanMoi.toLocaleDateString('vi-VN') : 'N/A'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Warning */}
          <div className="mb-6 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
            <div className="flex items-start">
              <svg className="w-5 h-5 text-yellow-600 mt-0.5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 15.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <div>
                <h4 className="text-sm font-medium text-yellow-800">Lưu ý quan trọng:</h4>
                <p className="text-sm text-yellow-700 mt-1">
                  - Chỉ được phép giảm số tháng đăng ký, không được tăng
                  <br />
                  - Thời gian hết hạn sẽ được tính lại từ thời gian bắt đầu
                  <br />
                  - Số tiền thừa sẽ được hoàn lại cho khách hàng
                </p>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !soThangMoi || soThangMoiValue <= 0 || soThangMoiValue >= soThangHienTai}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Đang cập nhật...' : 'Cập nhật'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UpdateSoThangModal;
