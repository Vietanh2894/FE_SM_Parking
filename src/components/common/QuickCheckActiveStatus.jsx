import React, { useState } from 'react';
import dangKyThangService from '../../services/dangKyThangService';

const QuickCheckActiveStatus = ({ bienSoXe, currentStatus }) => {
  const [loading, setLoading] = useState(false);
  const [apiResult, setApiResult] = useState(null);
  const [showTooltip, setShowTooltip] = useState(false);

  const handleQuickCheck = async () => {
    if (loading || !bienSoXe) return;
    
    setLoading(true);
    try {
      const result = await dangKyThangService.checkActiveDangKyThang(bienSoXe);
      setApiResult(result);
    } catch (error) {
      console.error('Error in quick check:', error);
      setApiResult({ success: false, data: false });
    }
    setLoading(false);
  };

  const getDisplayStatus = () => {
    if (apiResult !== null) {
      // Hiển thị kết quả từ API
      return {
        isValid: apiResult.success && apiResult.data,
        source: 'API',
        className: apiResult.success && apiResult.data 
          ? 'bg-green-100 text-green-800 border-green-200' 
          : 'bg-red-100 text-red-800 border-red-200',
        text: apiResult.success && apiResult.data ? 'Còn hiệu lực' : 'Hết hiệu lực',
        icon: apiResult.success && apiResult.data ? '✓' : '✗'
      };
    } else {
      // Hiển thị trạng thái từ dữ liệu local
      return {
        isValid: currentStatus.isValid,
        source: 'Local',
        className: currentStatus.className + ' border border-gray-200',
        text: currentStatus.text,
        icon: currentStatus.isValid ? '✓' : '✗'
      };
    }
  };

  const displayStatus = getDisplayStatus();

  return (
    <div className="relative">
      <button
        onClick={handleQuickCheck}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        disabled={loading}
        className={`px-2 py-1 rounded-full text-xs font-medium transition-all duration-200 hover:shadow-sm ${displayStatus.className} ${
          loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:opacity-80'
        }`}
        title="Nhấn để kiểm tra thời gian thực"
      >
        {loading ? (
          <span className="flex items-center gap-1">
            <div className="animate-spin rounded-full h-3 w-3 border border-current border-t-transparent"></div>
            Đang kiểm tra...
          </span>
        ) : (
          <span className="flex items-center gap-1">
            <span>{displayStatus.icon}</span>
            {displayStatus.text}
            {displayStatus.source === 'API' && (
              <span className="text-xs opacity-75">(RT)</span>
            )}
          </span>
        )}
      </button>

      {/* Tooltip */}
      {showTooltip && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 z-10">
          <div className="bg-gray-800 text-white text-xs rounded py-1 px-2 whitespace-nowrap">
            {apiResult !== null ? (
              <span>Kết quả từ server (thời gian thực)</span>
            ) : (
              <span>Nhấn để kiểm tra thời gian thực từ server</span>
            )}
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-800"></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuickCheckActiveStatus;
