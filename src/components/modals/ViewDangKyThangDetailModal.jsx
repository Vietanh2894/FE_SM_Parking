import React, { useState, useEffect } from 'react';
import dangKyThangService from '../../services/dangKyThangService';

const ViewDangKyThangDetailModal = ({ isOpen, onClose, dangKyThangId }) => {
  const [loading, setLoading] = useState(false);
  const [dangKyThangDetail, setDangKyThangDetail] = useState(null);

  useEffect(() => {
    if (isOpen && dangKyThangId) {
      fetchDangKyThangDetail();
    }
  }, [isOpen, dangKyThangId]);

  const fetchDangKyThangDetail = async () => {
    setLoading(true);
    try {
      const result = await dangKyThangService.getDangKyThangById(dangKyThangId);
      if (result.success) {
        setDangKyThangDetail(result.data);
      } else {
        console.error('Failed to fetch detail:', result.message);
      }
    } catch (error) {
      console.error('Error fetching detail:', error);
    }
    setLoading(false);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Không có thông tin';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN') + ' ' + date.toLocaleTimeString('vi-VN');
  };

  const formatCurrency = (amount) => {
    if (!amount) return '0 VNĐ';
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      'ACTIVE': { label: 'Đang hoạt động', color: 'bg-green-100 text-green-800' },
      'INACTIVE': { label: 'Không hoạt động', color: 'bg-red-100 text-red-800' },
      'EXPIRED': { label: 'Hết hạn', color: 'bg-yellow-100 text-yellow-800' },
      'CANCELLED': { label: 'Đã hủy', color: 'bg-gray-100 text-gray-800' }
    };
    
    const statusInfo = statusMap[status] || { label: status, color: 'bg-gray-100 text-gray-800' };
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusInfo.color}`}>
        {statusInfo.label}
      </span>
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Chi tiết đăng ký tháng</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
          </div>
        ) : dangKyThangDetail ? (
          <div className="space-y-6">
            {/* Thông tin cơ bản */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-3">Thông tin đăng ký</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">ID:</label>
                  <p className="text-gray-900">{dangKyThangDetail.id}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Biển số xe:</label>
                  <p className="text-gray-900 font-mono">{dangKyThangDetail.bienSoXe}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Số tháng đăng ký:</label>
                  <p className="text-gray-900">{dangKyThangDetail.soThang} tháng</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Trạng thái:</label>
                  <p className="text-gray-900">{getStatusBadge(dangKyThangDetail.trangThai)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Số CCCD:</label>
                  <p className="text-gray-900">{dangKyThangDetail.cccd || 'Không có thông tin'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Số cavet:</label>
                  <p className="text-gray-900">{dangKyThangDetail.soCavet || 'Không có thông tin'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Địa chỉ:</label>
                  <p className="text-gray-900">{dangKyThangDetail.diaChi || 'Không có thông tin'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Số tiền thanh toán:</label>
                  <p className="text-gray-900 font-semibold text-green-600">{formatCurrency(dangKyThangDetail.soTienThanhToan)}</p>
                </div>
              </div>
            </div>

            {/* Thông tin gia hạn */}
            <div className="bg-purple-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-3">Thông tin gia hạn</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Trạng thái:</label>
                  <div className={`inline-block px-3 py-1 text-xs font-medium rounded-md mt-1 ${
                    (dangKyThangDetail.lanGiaHan || 0) === 0 
                      ? 'bg-blue-100 text-blue-800 border border-blue-200' 
                      : 'bg-green-100 text-green-800 border border-green-200'
                  }`}>
                    {(dangKyThangDetail.lanGiaHan || 0) === 0 ? '🏁 Đăng ký gốc' : `🔄 Gia hạn lần ${dangKyThangDetail.lanGiaHan}`}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Số lần gia hạn:</label>
                  <p className="text-gray-900 font-semibold">{dangKyThangDetail.lanGiaHan || 0}</p>
                </div>
                {dangKyThangDetail.parentId && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">Liên kết từ đăng ký gốc:</label>
                    <p className="text-gray-900 font-mono">#{dangKyThangDetail.parentId}</p>
                  </div>
                )}
                <div>
                  <label className="text-sm font-medium text-gray-600">ID hiện tại:</label>
                  <p className="text-gray-900 font-mono">#{dangKyThangDetail.id}</p>
                </div>
              </div>
            </div>

            {/* Thông tin thời gian */}
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-3">Thông tin thời gian</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Thời gian bắt đầu:</label>
                  <p className="text-gray-900">{formatDate(dangKyThangDetail.thoiGianBatDau)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Thời gian hết hạn:</label>
                  <p className="text-gray-900">{formatDate(dangKyThangDetail.thoiGianHetHan)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Ngày tạo:</label>
                  <p className="text-gray-900">{formatDate(dangKyThangDetail.createdDate)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Ngày cập nhật:</label>
                  <p className="text-gray-900">{formatDate(dangKyThangDetail.updatedDate)}</p>
                </div>
              </div>
            </div>

            {/* Thông tin xe */}
            {dangKyThangDetail.vehicle && (
              <div className="bg-green-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold mb-3">Thông tin xe</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Tên xe:</label>
                    <p className="text-gray-900">{dangKyThangDetail.vehicle.tenXe || 'Không có thông tin'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Loại xe:</label>
                    <p className="text-gray-900">
                      {dangKyThangDetail.vehicle.maLoaiXe?.tenLoaiXe || dangKyThangDetail.loaiXe?.tenLoaiXe || 'Không có thông tin'}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Mã loại xe:</label>
                    <p className="text-gray-900">
                      {dangKyThangDetail.vehicle.maLoaiXe?.maLoaiXe || dangKyThangDetail.loaiXe?.maLoaiXe || 'Không có thông tin'}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Số cavet xe:</label>
                    <p className="text-gray-900">{dangKyThangDetail.vehicle.soCavet || 'Không có thông tin'}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Thông tin chủ xe */}
            {dangKyThangDetail.vehicle?.owner && (
              <div className="bg-purple-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold mb-3">Thông tin chủ xe</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Tên chủ xe:</label>
                    <p className="text-gray-900">{dangKyThangDetail.vehicle.owner.name}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Email:</label>
                    <p className="text-gray-900">{dangKyThangDetail.vehicle.owner.email}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">CCCD:</label>
                    <p className="text-gray-900">{dangKyThangDetail.vehicle.owner.cccd}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Số điện thoại:</label>
                    <p className="text-gray-900">{dangKyThangDetail.vehicle.owner.sdt}</p>
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-sm font-medium text-gray-600">Địa chỉ:</label>
                    <p className="text-gray-900">{dangKyThangDetail.vehicle.owner.diaChi}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Thông tin nhân viên tạo */}
            {dangKyThangDetail.nhanVienTao && (
              <div className="bg-yellow-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold mb-3">Thông tin nhân viên tạo</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Mã nhân viên:</label>
                    <p className="text-gray-900">{dangKyThangDetail.nhanVienTao.maNV}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Họ tên:</label>
                    <p className="text-gray-900">{dangKyThangDetail.nhanVienTao.hoTen}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Chức vụ:</label>
                    <p className="text-gray-900">{dangKyThangDetail.nhanVienTao.chucVu}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Email:</label>
                    <p className="text-gray-900">{dangKyThangDetail.nhanVienTao.email}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Số điện thoại:</label>
                    <p className="text-gray-900">{dangKyThangDetail.nhanVienTao.sdt}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Ngày vào làm:</label>
                    <p className="text-gray-900">{dangKyThangDetail.nhanVienTao.ngayVaoLam}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Ghi chú */}
            {dangKyThangDetail.ghiChu && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold mb-3">Ghi chú</h3>
                <p className="text-gray-900">{dangKyThangDetail.ghiChu}</p>
              </div>
            )}

            {/* Trạng thái */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-3">Trạng thái hệ thống</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Đang hoạt động:</label>
                  <p className="text-gray-900">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      dangKyThangDetail.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {dangKyThangDetail.active ? 'Có' : 'Không'}
                    </span>
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Đã hết hạn:</label>
                  <p className="text-gray-900">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      dangKyThangDetail.expired ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                    }`}>
                      {dangKyThangDetail.expired ? 'Có' : 'Không'}
                    </span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500">Không thể tải thông tin chi tiết.</p>
          </div>
        )}

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};

export default ViewDangKyThangDetailModal;
