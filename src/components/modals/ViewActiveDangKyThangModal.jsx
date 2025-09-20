import React, { useState } from 'react';
import dangKyThangService from '../../services/dangKyThangService';

const ViewActiveDangKyThangModal = ({ isOpen, onClose }) => {
  const [bienSoXe, setBienSoXe] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async () => {
    if (!bienSoXe.trim()) {
      alert('Vui lòng nhập biển số xe cần tìm');
      return;
    }

    const formattedPlate = bienSoXe.trim().toUpperCase();
    setLoading(true);
    setHasSearched(false);
    
    try {
      const response = await dangKyThangService.getActiveDangKyThangByBienSoXe(formattedPlate);
      console.log('Active registration result:', response);
      
      setResult({
        success: response.success,
        data: response.data,
        message: response.message,
        bienSoXe: formattedPlate
      });
      setHasSearched(true);
    } catch (error) {
      console.error('Error getting active registration:', error);
      setResult({
        success: false,
        data: null,
        message: 'Có lỗi xảy ra khi tìm kiếm',
        bienSoXe: formattedPlate
      });
      setHasSearched(true);
    }
    setLoading(false);
  };

  const handleReset = () => {
    setBienSoXe('');
    setResult(null);
    setHasSearched(false);
  };

  const handleClose = () => {
    handleReset();
    onClose();
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Tìm đăng ký tháng còn hiệu lực</h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="space-y-4">
          {/* Input tìm kiếm */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Biển số xe:
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={bienSoXe}
                onChange={(e) => setBienSoXe(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Nhập biển số xe (VD: 72C2-7777)"
                className="flex-1 border-2 border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 p-2 rounded transition-colors duration-200"
                disabled={loading}
              />
              <button
                onClick={handleSearch}
                disabled={loading || !bienSoXe.trim()}
                className="bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 disabled:cursor-not-allowed text-white py-2 px-4 rounded flex items-center gap-1 transition-colors duration-200"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Đang tìm...
                  </>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    Tìm kiếm
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Hiển thị kết quả */}
          {hasSearched && result && (
            <div className="mt-6">
              {result.success && result.data ? (
                <div className="space-y-6">
                  {/* Header với trạng thái */}
                  <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                    <div className="flex items-center gap-2 mb-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="font-semibold text-green-800">Tìm thấy đăng ký tháng còn hiệu lực!</span>
                    </div>
                    <p className="text-green-700 text-sm">
                      Xe <strong>{result.bienSoXe}</strong> có đăng ký tháng đang hoạt động
                    </p>
                  </div>

                  {/* Thông tin chi tiết đăng ký */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold mb-3">Thông tin đăng ký</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-600">ID đăng ký:</label>
                        <p className="text-gray-900">{result.data.id}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600">Biển số xe:</label>
                        <p className="text-gray-900 font-mono">{result.data.bienSoXe}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600">Số tháng đăng ký:</label>
                        <p className="text-gray-900">{result.data.soThang} tháng</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600">Số tiền đã thanh toán:</label>
                        <p className="text-gray-900 font-semibold text-green-600">{formatCurrency(result.data.soTienThanhToan)}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600">Thời gian bắt đầu:</label>
                        <p className="text-gray-900">{formatDate(result.data.thoiGianBatDau)}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600">Thời gian hết hạn:</label>
                        <p className="text-gray-900">{formatDate(result.data.thoiGianHetHan)}</p>
                      </div>
                    </div>
                  </div>

                  {/* Thông tin xe và chủ xe */}
                  {result.data.vehicle && (
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h3 className="text-lg font-semibold mb-3">Thông tin xe và chủ xe</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium text-gray-600">Tên xe:</label>
                          <p className="text-gray-900">{result.data.vehicle.tenXe || 'Không có thông tin'}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-600">Loại xe:</label>
                          <p className="text-gray-900">{result.data.loaiXe?.tenLoaiXe || 'Không có thông tin'}</p>
                        </div>
                        {result.data.vehicle.owner && (
                          <>
                            <div>
                              <label className="text-sm font-medium text-gray-600">Tên chủ xe:</label>
                              <p className="text-gray-900">{result.data.vehicle.owner.name}</p>
                            </div>
                            <div>
                              <label className="text-sm font-medium text-gray-600">Số điện thoại:</label>
                              <p className="text-gray-900">{result.data.vehicle.owner.sdt || 'Không có thông tin'}</p>
                            </div>
                            <div className="md:col-span-2">
                              <label className="text-sm font-medium text-gray-600">Email:</label>
                              <p className="text-gray-900">{result.data.vehicle.owner.email}</p>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Ghi chú */}
                  {result.data.ghiChu && (
                    <div className="bg-yellow-50 p-4 rounded-lg">
                      <h3 className="text-lg font-semibold mb-2">Ghi chú</h3>
                      <p className="text-gray-900">{result.data.ghiChu}</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                  <div className="flex items-center gap-2 mb-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="font-semibold text-red-800">Không tìm thấy đăng ký tháng còn hiệu lực</span>
                  </div>
                  <p className="text-red-700 text-sm mb-3">
                    Xe <strong>{result.bienSoXe}</strong> không có đăng ký tháng đang hoạt động
                  </p>
                  <div className="bg-orange-50 p-3 rounded border-l-4 border-orange-400">
                    <p className="text-orange-800 text-sm">
                      <strong>Gợi ý:</strong> Xe này có thể đã hết hạn đăng ký tháng hoặc chưa có đăng ký. 
                      Vui lòng kiểm tra lại hoặc tạo đăng ký tháng mới.
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="mt-6 flex justify-end gap-2">
          {hasSearched && (
            <button
              onClick={handleReset}
              className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors duration-200"
            >
              Tìm kiếm mới
            </button>
          )}
          <button
            onClick={handleClose}
            className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 transition-colors duration-200"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};

export default ViewActiveDangKyThangModal;
