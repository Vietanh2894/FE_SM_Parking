import React, { useState } from 'react';
import dangKyThangService from '../../services/dangKyThangService';

const CheckActiveDangKyThangModal = ({ isOpen, onClose }) => {
  const [bienSoXe, setBienSoXe] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [hasChecked, setHasChecked] = useState(false);

  const handleCheck = async () => {
    if (!bienSoXe.trim()) {
      alert('Vui lòng nhập biển số xe cần kiểm tra');
      return;
    }

    const formattedPlate = bienSoXe.trim().toUpperCase();
    setLoading(true);
    setHasChecked(false);
    
    try {
      const response = await dangKyThangService.checkActiveDangKyThang(formattedPlate);
      console.log('Check active result:', response);
      
      setResult({
        success: response.success,
        isActive: response.data,
        message: response.message,
        bienSoXe: formattedPlate
      });
      setHasChecked(true);
    } catch (error) {
      console.error('Error checking active status:', error);
      setResult({
        success: false,
        isActive: false,
        message: 'Có lỗi xảy ra khi kiểm tra',
        bienSoXe: formattedPlate
      });
      setHasChecked(true);
    }
    setLoading(false);
  };

  const handleReset = () => {
    setBienSoXe('');
    setResult(null);
    setHasChecked(false);
  };

  const handleClose = () => {
    handleReset();
    onClose();
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleCheck();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Kiểm tra hiệu lực đăng ký tháng</h2>
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
          {/* Input biển số xe */}
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
                onClick={handleCheck}
                disabled={loading || !bienSoXe.trim()}
                className="bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 disabled:cursor-not-allowed text-white py-2 px-4 rounded flex items-center gap-1 transition-colors duration-200"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Đang kiểm tra...
                  </>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Kiểm tra
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Hiển thị kết quả */}
          {hasChecked && result && (
            <div className="mt-6 p-4 border rounded-lg">
              <div className="flex items-center gap-2 mb-3">
                {result.success && result.isActive ? (
                  <div className="flex items-center text-green-600">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="font-semibold">Còn hiệu lực</span>
                  </div>
                ) : (
                  <div className="flex items-center text-red-600">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="font-semibold">Không còn hiệu lực</span>
                  </div>
                )}
              </div>
              
              <div className="space-y-2 text-sm">
                <p><strong>Biển số xe:</strong> <span className="font-mono">{result.bienSoXe}</span></p>
                <p><strong>Trạng thái:</strong> 
                  <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${
                    result.success && result.isActive 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {result.success && result.isActive ? 'Đang hoạt động' : 'Không hoạt động'}
                  </span>
                </p>
                {result.message && (
                  <p><strong>Thông báo:</strong> {result.message}</p>
                )}
              </div>

              {/* Thông tin bổ sung */}
              <div className="mt-4 p-3 bg-gray-50 rounded">
                <p className="text-xs text-gray-600 mb-2">
                  <strong>Lưu ý:</strong> 
                  {result.success && result.isActive 
                    ? ' Xe này có đăng ký tháng còn hiệu lực. Xe có thể ra vào bãi đỗ mà không cần thanh toán phí theo giờ.'
                    : ' Xe này không có đăng ký tháng hiệu lực hoặc đã hết hạn. Xe sẽ tính phí theo giờ khi sử dụng bãi đỗ.'
                  }
                </p>
                
                {result.success && result.isActive && (
                  <div className="mt-2 text-xs text-green-600">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 inline mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Để xem thông tin chi tiết về đăng ký tháng, vui lòng tìm kiếm trong danh sách đăng ký tháng.
                  </div>
                )}
                
                {(!result.success || !result.isActive) && (
                  <div className="mt-2 text-xs text-orange-600">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 inline mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                    Nếu cần đăng ký tháng mới, vui lòng sử dụng chức năng "Gia hạn đăng ký mới".
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="mt-6 flex justify-end gap-2">
          {hasChecked && (
            <button
              onClick={handleReset}
              className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors duration-200"
            >
              Kiểm tra lại
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

export default CheckActiveDangKyThangModal;
