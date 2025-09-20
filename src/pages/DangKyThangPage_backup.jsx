import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import dangKyThangService from '../services/dangKyThangService';
import { vehicleService } from '../services/index';
import { vehicleTypeService } from '../services'; // Fix import to use the correct service
import AuthService from '../services/authService';
import Toast from '../components/common/Toast';
import DashboardNavigation from '../components/DashboardNavigation';

// Import modals
import AddDangKyThangModal from '../components/modals/AddDangKyThangModal';
import ExtendDangKyThangModal from '../components/modals/ExtendDangKyThangModal';
import ViewDangKyThangDetailModal from '../components/modals/ViewDangKyThangDetailModal';
import CheckActiveDangKyThangModal from '../components/modals/CheckActiveDangKyThangModal';
import ViewActiveDangKyThangModal from '../components/modals/ViewActiveDangKyThangModal';
import UpdateSoThangModal from '../components/modals/UpdateSoThangModal';
import RenewDangKyThangModal from '../components/modals/RenewDangKyThangModal';
import QuickCheckActiveStatus from '../components/common/QuickCheckActiveStatus';

const DangKyThangPage = () => {
  const navigate = useNavigate();
  const [dangKyThangs, setDangKyThangs] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [vehicleTypes, setVehicleTypes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchType, setSearchType] = useState('BIEN_SO'); // BIEN_SO, CCCD, NHAN_VIEN, ACTIVE_BIEN_SO, TRANG_THAI
  const [filterStatus, setFilterStatus] = useState('ALL');
  
  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isExtendModalOpen, setIsExtendModalOpen] = useState(false);
  const [isViewDetailModalOpen, setIsViewDetailModalOpen] = useState(false);
  const [isCheckActiveModalOpen, setIsCheckActiveModalOpen] = useState(false);
  const [isViewActiveModalOpen, setIsViewActiveModalOpen] = useState(false);
  const [isUpdateSoThangModalOpen, setIsUpdateSoThangModalOpen] = useState(false);
  const [isRenewModalOpen, setIsRenewModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedDetailId, setSelectedDetailId] = useState(null);
  
  // Toast state
  const [toast, setToast] = useState({ 
    show: false, 
    message: '', 
    type: '' 
  });

  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    // Lấy thông tin user hiện tại
    const token = localStorage.getItem('token');
    if (token) {
      const payload = AuthService.getTokenPayload(token);
      if (payload) {
        setCurrentUser({
          maNV: payload.maNV || 'NV001', // fallback nếu không có
          username: payload.sub
        });
      }
    }
    
    console.log('DangKyThangPage - useEffect running');
    fetchDangKyThangs();
    fetchVehicles();
    fetchVehicleTypes();
  }, []);

  // Hiển thị thông báo
  const showToast = (message, type = 'info') => {
    // Đảm bảo message luôn là string
    const messageText = typeof message === 'string' ? message : 
                       typeof message === 'object' ? JSON.stringify(message) : 
                       String(message);
    setToast({ show: true, message: messageText, type });
  };

  // Đóng thông báo
  const hideToast = () => {
    setToast({ show: false, message: '', type: '' });
  };

  // Lấy danh sách đăng ký tháng
  const fetchDangKyThangs = async () => {
    setLoading(true);
    try {
      const result = await dangKyThangService.getAllDangKyThang();
      if (result.success) {
        setDangKyThangs(result.data || []);
      } else {
        showToast(result.message, 'error');
        setDangKyThangs([]);
      }
    } catch (error) {
      console.error('Error in fetchDangKyThangs:', error);
      showToast('Có lỗi xảy ra khi tải dữ liệu', 'error');
      setDangKyThangs([]);
    }
    setLoading(false);
  };

  // Lấy danh sách xe
  const fetchVehicles = async () => {
    try {
      const result = await vehicleService.getAllVehicles();
      if (result && result.data) {
        setVehicles(result.data);
      }
    } catch (error) {
      console.error('Error fetching vehicles:', error);
    }
  };

  // Lấy danh sách loại xe
  const fetchVehicleTypes = async () => {
    try {
      console.log('Fetching vehicle types...');
      // Making direct API call to ensure proper data format
      const response = await fetch('http://localhost:8080/vehicle-types', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      
      const responseData = await response.json();
      console.log('Vehicle types direct API result:', responseData);
      
      if (responseData && responseData.data && Array.isArray(responseData.data)) {
        setVehicleTypes(responseData.data);
        console.log('Set vehicle types:', responseData.data);
      } else {
        console.warn('Vehicle types data is not in expected format:', responseData);
        setVehicleTypes([]);
      }
    } catch (error) {
      console.error('Error fetching vehicle types:', error);
      setVehicleTypes([]);
    }
  };

  // Xử lý thêm mới đăng ký tháng
  const handleAdd = async (formData) => {
    if (!currentUser) {
      showToast('Không thể xác định thông tin người dùng', 'error');
      return;
    }

    setSubmitting(true);
    try {
      // Thêm maNhanVien vào dữ liệu gửi đi
      const dataToSend = {
        ...formData,
        maNhanVien: currentUser.maNV
      };

      console.log('Sending data:', dataToSend);
      
      const result = await dangKyThangService.createDangKyThang(dataToSend);
      console.log('Create result:', result);
      
      if (result.success) {
        showToast(result.message || 'Tạo đăng ký tháng thành công', 'success');
        setIsAddModalOpen(false);
        fetchDangKyThangs(); // Tải lại danh sách
      } else {
        showToast(result.message || 'Tạo đăng ký tháng thất bại', 'error');
      }
    } catch (error) {
      console.error('Error creating đăng ký tháng:', error);
      showToast('Có lỗi xảy ra khi tạo đăng ký tháng', 'error');
    }
    setSubmitting(false);
  };

  // Xử lý gia hạn đăng ký tháng
  const handleExtend = async (formData) => {
    if (!selectedItem || !currentUser) {
      showToast('Không thể xác định thông tin cần gia hạn', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const result = await dangKyThangService.extendDangKyThang(
        selectedItem.id, 
        formData.soThangMoi,
        currentUser.maNV
      );
      
      if (result.success) {
        showToast(result.message || 'Gia hạn thành công', 'success');
        setIsExtendModalOpen(false);
        fetchDangKyThangs();
      } else {
        showToast(result.message || 'Gia hạn thất bại', 'error');
      }
    } catch (error) {
      console.error('Error extending đăng ký tháng:', error);
      showToast('Có lỗi xảy ra khi gia hạn', 'error');
    }
    setSubmitting(false);
  };

  // Xử lý cập nhật số tháng đăng ký
  const handleUpdateSoThang = (dangKy) => {
    setSelectedItem(dangKy);
    setIsUpdateSoThangModalOpen(true);
  };

  const handleUpdateSoThangSuccess = async (updatedData) => {
    console.log('handleUpdateSoThangSuccess called with:', updatedData);
    // Chỉ refresh dữ liệu, modal sẽ tự đóng
    setSelectedItem(null);
    console.log('Fetching updated data...');
    await fetchDangKyThangs();
    console.log('Data fetch completed');
  };

  // Xử lý gia hạn đăng ký tháng (tạo mới cho xe đã hết hạn)
  const handleRenewDangKyThang = () => {
    setIsRenewModalOpen(true);
  };

  const handleRenewSuccess = async (renewedData) => {
    console.log('handleRenewSuccess called with:', renewedData);
    // Refresh dữ liệu, modal sẽ tự đóng
    await fetchDangKyThangs();
    console.log('Renew data fetch completed');
  };

  // Xử lý xóa/hủy đăng ký tháng
  const handleDelete = async (id) => {
    if (!currentUser) {
      showToast('Không thể xác định thông tin người dùng', 'error');
      return;
    }

    if (window.confirm('Bạn có chắc chắn muốn hủy đăng ký tháng này?')) {
      setLoading(true);
      try {
        const result = await dangKyThangService.deleteDangKyThang(id, currentUser.maNV);
        if (result.success) {
          showToast(result.message || 'Hủy đăng ký tháng thành công', 'success');
          fetchDangKyThangs();
        } else {
          showToast(result.message || 'Hủy đăng ký tháng thất bại', 'error');
        }
      } catch (error) {
        console.error('Error deleting đăng ký tháng:', error);
        showToast('Có lỗi xảy ra khi hủy đăng ký tháng', 'error');
      }
      setLoading(false);
    }
  };

  // Xử lý xem chi tiết đăng ký tháng
  const handleViewDetail = (id) => {
    setSelectedDetailId(id);
    setIsViewDetailModalOpen(true);
  };

  // Xử lý nhập liệu tìm kiếm
  const handleSearchInput = (e) => {
    setSearchTerm(e.target.value);
  };

  // Xử lý tìm kiếm theo nhiều loại
  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      let message = 'Vui lòng nhập ';
      switch (searchType) {
        case 'BIEN_SO':
          message += 'biển số xe cần tìm';
          break;
        case 'CCCD':
          message += 'số CCCD cần tìm';
          break;
        case 'NHAN_VIEN':
          message += 'mã nhân viên cần tìm';
          break;
        case 'ACTIVE_BIEN_SO':
          message += 'biển số xe để lấy đăng ký còn hiệu lực';
          break;
        case 'TRANG_THAI':
          message += 'trạng thái (ACTIVE, EXPIRED, CANCELLED)';
          break;
        default:
          message += 'thông tin cần tìm';
      }
      showToast(message, 'warning');
      return;
    }

    const formattedSearchTerm = searchTerm.trim();
    
    setLoading(true);
    try {
      let result;
      let searchLabel = '';
      
      switch (searchType) {
        case 'BIEN_SO':
          result = await dangKyThangService.getDangKyThangByBienSoXe(formattedSearchTerm.toUpperCase());
          searchLabel = `biển số "${formattedSearchTerm.toUpperCase()}"`;
          break;
        case 'CCCD':
          result = await dangKyThangService.getDangKyThangByCCCD(formattedSearchTerm);
          searchLabel = `CCCD "${formattedSearchTerm}"`;
          break;
        case 'NHAN_VIEN':
          result = await dangKyThangService.getDangKyThangByNhanVien(formattedSearchTerm);
          searchLabel = `nhân viên "${formattedSearchTerm}"`;
          break;
        case 'ACTIVE_BIEN_SO':
          result = await dangKyThangService.getActiveDangKyThangByBienSoXe(formattedSearchTerm.toUpperCase());
          searchLabel = `đăng ký còn hiệu lực của biển số "${formattedSearchTerm.toUpperCase()}"`;
          // Chuyển đổi single object thành array để tương thích với UI
          if (result.success && result.data) {
            result.data = [result.data];
          }
          break;
        case 'TRANG_THAI':
          const trangThaiUpper = formattedSearchTerm.toUpperCase();
          if (!['ACTIVE', 'EXPIRED', 'CANCELLED'].includes(trangThaiUpper)) {
            showToast('Trạng thái phải là ACTIVE, EXPIRED hoặc CANCELLED', 'warning');
            setLoading(false);
            return;
          }
          result = await dangKyThangService.getDangKyThangByTrangThai(trangThaiUpper);
          searchLabel = `trạng thái "${trangThaiUpper}"`;
          break;
        default:
          showToast('Loại tìm kiếm không hợp lệ', 'error');
          return;
      }
      
      console.log('Search result:', result);
      
      if (result.success && Array.isArray(result.data) && result.data.length > 0) {
        // Có kết quả
        setDangKyThangs(result.data);
        showToast(`Đã tìm thấy ${result.data.length} đăng ký cho ${searchLabel}`, 'success');
      } else {
        // Không có kết quả
        setDangKyThangs([]);
        showToast(`Không tìm thấy đăng ký nào cho ${searchLabel}`, 'warning');
      }
    } catch (error) {
      console.error('Error searching:', error);
      showToast('Có lỗi xảy ra khi tìm kiếm', 'error');
      setDangKyThangs([]);
    }
    setLoading(false);
  };

  // Giữ lại hàm cũ để tương thích (nếu cần)
  const handleSearchByPlate = () => {
    setSearchType('BIEN_SO');
    handleSearch();
  };

  // Xử lý phím Enter trong ô tìm kiếm
  const handleSearchKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleActiveSearch = async () => {
    if (!searchTerm.trim()) {
      showToast('Vui lòng nhập biển số xe', 'error');
      return;
    }

    setIsViewActiveModalOpen(true);
  };

  const handleQuickSearch = async (status) => {
    setSearchType('TRANG_THAI');
    setSearchTerm(status);
    
    try {
      setLoading(true);
      const response = await dangKyThangService.getDangKyThangByTrangThai(status);
      if (response.success && response.data) {
        setDangKyThangs(response.data);
        showToast(`Tìm thấy ${response.data.length} đăng ký với trạng thái ${status}`, 'success');
      } else {
        setDangKyThangs([]);
        showToast('Không tìm thấy đăng ký nào', 'warning');
      }
    } catch (error) {
      console.error('Error searching by status:', error);
      showToast('Có lỗi xảy ra khi tìm kiếm', 'error');
      setDangKyThangs([]);
    } finally {
      setLoading(false);
    }
  };

  // Xử lý lọc theo trạng thái
  const handleFilterChange = (e) => {
    setFilterStatus(e.target.value);
  };
  
  // Reset tìm kiếm và tải lại danh sách
  const handleResetSearch = () => {
    // Reset search term
    setSearchTerm('');
    
    // Reset filter to ALL
    setFilterStatus('ALL');
    
    // Show loading indicator
    setLoading(true);
    
    // Reload all data
    fetchDangKyThangs();
    
    // Show toast notification
    showToast('Đã tải lại danh sách đăng ký tháng', 'info');
  };

  // Cập nhật trạng thái đăng ký tháng hết hạn
  const handleUpdateExpiredStatus = async () => {
    // Hiển thị confirm dialog
    const isConfirmed = window.confirm(
      'Bạn có chắc chắn muốn cập nhật trạng thái cho tất cả đăng ký tháng đã hết hạn?\n\n' +
      'Hệ thống sẽ tự động kiểm tra và chuyển các đăng ký đã hết hạn sang trạng thái EXPIRED.'
    );

    if (!isConfirmed) {
      return;
    }

    setSubmitting(true);
    try {
      const result = await dangKyThangService.updateExpiredDangKyThang();
      
      if (result.success) {
        showToast(result.message || 'Cập nhật trạng thái đăng ký tháng hết hạn thành công', 'success');
        
        // Tải lại danh sách để hiển thị thay đổi
        await fetchDangKyThangs();
      } else {
        showToast(result.message || 'Cập nhật trạng thái thất bại', 'error');
      }
    } catch (error) {
      console.error('Error in handleUpdateExpiredStatus:', error);
      showToast('Có lỗi xảy ra khi cập nhật trạng thái hết hạn', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Lọc danh sách đăng ký tháng
  const filteredDangKyThangs = dangKyThangs.filter((item) => {
    // Lọc theo trạng thái
    if (filterStatus !== 'ALL' && item.trangThai !== filterStatus) {
      return false;
    }
    
    // Lọc local theo tìm kiếm (chỉ áp dụng khi không dùng tìm kiếm API)
    // Note: Khi tìm kiếm bằng API thì searchTerm có thể có giá trị nhưng không cần lọc thêm
    // vì kết quả đã được lọc từ server
    
    return true;
  });

  // Format ngày giờ
  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  // Format tiền tệ
  const formatCurrency = (amount) => {
    if (amount === undefined || amount === null) return 'N/A';
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  // Kiểm tra hiệu lực dựa trên dữ liệu có sẵn
  const checkValidityStatus = (item) => {
    const now = new Date();
    const endDate = new Date(item.thoiGianHetHan);
    
    // Kiểm tra tích hợp: active, không expired và chưa hết hạn
    const isValid = item.active && !item.expired && item.trangThai === 'ACTIVE' && endDate > now;
    
    return {
      isValid,
      className: isValid 
        ? 'bg-green-100 text-green-800' 
        : 'bg-red-100 text-red-800',
      text: isValid ? 'Còn hiệu lực' : 'Hết hiệu lực'
    };
  };

  // Lấy lớp CSS cho trạng thái
  const getStatusClass = (status) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-green-100 text-green-800';
      case 'EXPIRED':
        return 'bg-red-100 text-red-800';
      case 'CANCELED':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  // Lấy text hiển thị cho trạng thái
  const getStatusText = (status) => {
    switch (status) {
      case 'ACTIVE':
        return 'Đang hoạt động';
      case 'EXPIRED':
        return 'Đã hết hạn';
      case 'CANCELED':
        return 'Đã hủy';
      default:
        return status;
    }
  };

  // Modal Control Functions
  const openAddModal = () => {
    console.log('Opening add modal with vehicleTypes:', vehicleTypes);
    setIsAddModalOpen(true);
  };
  const closeAddModal = () => setIsAddModalOpen(false);

  const openExtendModal = (item) => {
    setSelectedItem(item);
    setIsExtendModalOpen(true);
  };
  const closeExtendModal = () => {
    setSelectedItem(null);
    setIsExtendModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardNavigation />
      
      {/* Main Content */}
      <div className="lg:ml-64 transition-all duration-300">
        <div className="p-6">
          {/* Page Header */}
          <div className="mb-8">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">Quản lý đăng ký tháng</h1>
                  <p className="text-gray-600">Quản lý các đăng ký tháng của khách hàng</p>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">
                    {dangKyThangs.length} đăng ký
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Toast notification */}
          {toast.show && (
            <Toast 
              message={toast.message} 
              type={toast.type} 
              show={toast.show}
              onClose={hideToast}
            />
          )}

          {/* Search and Filter Card */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
              <div className="flex flex-col md:flex-row gap-4 md:items-end flex-1">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold text-gray-700">Loại tìm kiếm</label>
                  <select
                    value={searchType}
                    onChange={(e) => setSearchType(e.target.value)}
                    className="bg-white border border-gray-300 rounded-lg px-4 py-2.5 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors min-w-[180px]"
                  >
                <option value="BIEN_SO">Biển số xe</option>
                <option value="CCCD">CCCD</option>
                <option value="NHAN_VIEN">Nhân viên</option>
                <option value="ACTIVE_BIEN_SO">Đăng ký còn hiệu lực</option>
                <option value="TRANG_THAI">Trạng thái</option>
                  </select>
                
                <div className="flex flex-col gap-2 flex-1">
                  <label className="text-sm font-semibold text-gray-700">Tìm kiếm</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                    <input
                      type="text"
                      placeholder={
                        searchType === 'BIEN_SO' ? 'Nhập biển số xe (VD: 72C2-7777)...' :
                        searchType === 'CCCD' ? 'Nhập số CCCD (VD: 123456789012)...' :
                        searchType === 'NHAN_VIEN' ? 'Nhập mã nhân viên (VD: NV001)...' :
                        searchType === 'ACTIVE_BIEN_SO' ? 'Nhập biển số xe để lấy đăng ký còn hiệu lực...' :
                        searchType === 'TRANG_THAI' ? 'Nhập trạng thái (ACTIVE/EXPIRED/CANCELLED)...' :
                        'Nhập thông tin tìm kiếm...'
                      }
                      className="bg-white border border-gray-300 rounded-lg pl-10 pr-10 py-2.5 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors w-full min-w-[300px]"
                      value={searchTerm}
                      onChange={handleSearchInput}
                      onKeyPress={handleSearchKeyPress}
                    />
                    {searchTerm && (
                      <button 
                        onClick={() => setSearchTerm('')}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                        title="Xóa từ khóa tìm kiếm"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col md:flex-row gap-3">
                <button
                  onClick={handleSearch}
                  disabled={!searchTerm.trim()}
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white py-2.5 px-4 rounded-lg flex items-center gap-2 font-medium transition-colors duration-200"
                  title={`Tìm kiếm theo ${
                    searchType === 'BIEN_SO' ? 'biển số xe' :
                    searchType === 'CCCD' ? 'CCCD' :
                    searchType === 'NHAN_VIEN' ? 'nhân viên' :
                    searchType === 'ACTIVE_BIEN_SO' ? 'đăng ký còn hiệu lực' :
                    searchType === 'TRANG_THAI' ? 'trạng thái' :
                    'thông tin'
                  }`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  Tìm kiếm
                </button>
                
                <button
                  onClick={handleResetSearch}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 py-2.5 px-4 rounded-lg flex items-center gap-2 font-medium transition-colors duration-200"
                  title="Tải lại danh sách đăng ký tháng"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Tải lại
                </button>
                
                {searchType === 'ACTIVE_BIEN_SO' && (
                  <button
                    onClick={handleActiveSearch}
                    disabled={!searchTerm.trim()}
                    className="bg-green-600 hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white py-2.5 px-4 rounded-lg flex items-center gap-2 font-medium transition-colors duration-200"
                    title="Xem đăng ký còn hiệu lực của xe"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Xem đăng ký còn hiệu lực
                  </button>
                )}
                
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold text-gray-700">Lọc theo trạng thái</label>
                  <select
                    className="bg-white border border-gray-300 rounded-lg px-4 py-2.5 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors min-w-[160px]"
                    value={filterStatus}
                    onChange={handleFilterChange}
                  >
                    <option value="ALL">Tất cả trạng thái</option>
                    <option value="ACTIVE">Đang hoạt động</option>
                    <option value="EXPIRED">Đã hết hạn</option>
                    <option value="CANCELED">Đã hủy</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons Card */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">Thao tác nhanh</h3>
                <p className="text-sm text-gray-600">Các chức năng thường sử dụng</p>
              </div>
              
              <div className="flex flex-wrap gap-3">
                <button
                  className="bg-green-600 hover:bg-green-700 text-white py-2.5 px-4 rounded-lg flex items-center gap-2 font-medium transition-colors duration-200"
                  onClick={() => setIsCheckActiveModalOpen(true)}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Kiểm tra hiệu lực
                </button>
                
                <button
                  className="bg-purple-600 hover:bg-purple-700 text-white py-2.5 px-4 rounded-lg flex items-center gap-2 font-medium transition-colors duration-200"
                  onClick={() => setIsViewActiveModalOpen(true)}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  Xem đăng ký hiệu lực
                </button>
                
                <button
                  className="bg-blue-600 hover:bg-blue-700 text-white py-2.5 px-4 rounded-lg flex items-center gap-2 font-medium transition-colors duration-200"
                  onClick={openAddModal}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Thêm đăng ký mới
                </button>
                
                <button
                  className="bg-orange-600 hover:bg-orange-700 text-white py-2.5 px-4 rounded-lg flex items-center gap-2 font-medium transition-colors duration-200"
                  onClick={handleRenewDangKyThang}
                  title="Gia hạn đăng ký cho xe đã hết hạn (Tạo mới từ thời điểm hiện tại)"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Gia hạn (Tạo mới)
                </button>
                
                <button
                  className="bg-red-600 hover:bg-red-700 text-white py-2.5 px-4 rounded-lg flex items-center gap-2 font-medium transition-colors duration-200"
                  disabled={submitting}
                  title="Cập nhật trạng thái cho tất cả đăng ký tháng đã hết hạn thành EXPIRED"
                >
                  {submitting ? (
                    <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  )}
                  {submitting ? 'Đang cập nhật...' : 'Cập nhật trạng thái hết hạn'}
                </button>
              </div>
            </div>
          </div>

          {/* Quick Status Filter */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-1">Lọc nhanh theo trạng thái</h3>
              <p className="text-sm text-gray-600">Nhấn để lọc danh sách theo trạng thái cụ thể</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => handleQuickSearch('ACTIVE')}
                className="bg-green-100 hover:bg-green-200 text-green-800 px-4 py-2 rounded-lg flex items-center gap-2 font-medium transition-colors duration-200 border border-green-300"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Đang hoạt động
              </button>
              
              <button
                onClick={() => handleQuickSearch('EXPIRED')}
                className="bg-yellow-100 hover:bg-yellow-200 text-yellow-800 px-4 py-2 rounded-lg flex items-center gap-2 font-medium transition-colors duration-200 border border-yellow-300"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Đã hết hạn
              </button>
              
              <button
                onClick={() => handleQuickSearch('CANCELLED')}
                className="bg-red-100 hover:bg-red-200 text-red-800 px-4 py-2 rounded-lg flex items-center gap-2 font-medium transition-colors duration-200 border border-red-300"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Đã hủy
              </button>
            </div>
          </div>

          {/* Search result status */}
          {searchTerm && dangKyThangs.length > 0 && !loading && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-blue-800">
                Kết quả tìm kiếm cho <strong>{
                  searchType === 'BIEN_SO' ? 'biển số' :
                  searchType === 'CCCD' ? 'CCCD' :
                  searchType === 'NHAN_VIEN' ? 'nhân viên' :
                  searchType === 'ACTIVE_BIEN_SO' ? 'đăng ký còn hiệu lực của biển số' :
                  searchType === 'TRANG_THAI' ? 'trạng thái' :
                  'thông tin'
                }</strong>: <span className="font-semibold">"{searchTerm}"</span>
              </span>
            </div>
          )}

          {/* Data Table */}
          {loading ? (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12">
              <div className="flex flex-col items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
                <p className="text-gray-600 font-medium">Đang tải dữ liệu...</p>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              {filteredDangKyThangs.length === 0 ? (
                <div className="p-12 text-center">
                  <div className="flex flex-col items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <span className="text-lg font-medium text-gray-900 mb-1">Không có dữ liệu</span>
                    <span className="text-sm text-gray-500">
                      {searchTerm ? `Không tìm thấy đăng ký tháng nào cho "${searchTerm}"` : 'Chưa có đăng ký tháng nào được tìm thấy'}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full table-auto">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">STT</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Biển số xe</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Loại xe</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Thời gian bắt đầu</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Thời gian hết hạn</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Số tiền</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trạng thái</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hiệu lực</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Thao tác</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {filteredDangKyThangs.map((item, index) => (
                        <tr key={item.id} className="hover:bg-gray-50 transition-colors duration-150">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{index + 1}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.bienSoXe}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.loaiXe?.tenLoaiXe || 'N/A'}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatDateTime(item.thoiGianBatDau)}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatDateTime(item.thoiGianHetHan)}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatCurrency(item.soTienThanhToan)}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusClass(item.trangThai)}`}>
                              {getStatusText(item.trangThai)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <QuickCheckActiveStatus 
                              bienSoXe={item.bienSoXe}
                              currentStatus={checkValidityStatus(item)}
                            />
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex gap-2 flex-wrap">
                              <button 
                                onClick={() => handleViewDetail(item.id)}
                                className="px-3 py-1 bg-purple-600 text-white text-xs font-medium rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-1 transition-colors duration-150"
                                title="Xem chi tiết"
                              >
                                Chi tiết
                              </button>
                              
                              {item.trangThai === 'ACTIVE' && (
                                <>
                                  <button 
                                    onClick={() => openExtendModal(item)}
                                    className="px-3 py-1 bg-green-600 text-white text-xs font-medium rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-1 transition-colors duration-150"
                                  >
                                    Gia hạn
                                  </button>
                                  
                                  <button 
                                    onClick={() => handleUpdateSoThang(item)}
                                    className="px-3 py-1 bg-orange-600 text-white text-xs font-medium rounded-md hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-1 transition-colors duration-150"
                                    title="Cập nhật số tháng (chỉ cho phép giảm)"
                                  >
                                    Cập nhật số tháng
                                  </button>
                                  
                                  <button 
                                    onClick={() => handleDelete(item.id)}
                                    className="px-3 py-1 bg-red-600 text-white text-xs font-medium rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1 transition-colors duration-150"
                                  >
                                    Hủy
                                  </button>
                                </>
                              )}
                              
                              {item.trangThai === 'EXPIRED' && (
                                <button
                                  onClick={() => updateExpiredDangKyThang(item.id)}
                                  className="px-3 py-1 bg-blue-600 text-white text-xs font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 transition-colors duration-150"
                                >
                                  Cập nhật hết hạn
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      
      {/* Modals */}
      <AddDangKyThangModal 
        isOpen={isAddModalOpen}
        onClose={closeAddModal}
        onSave={handleAdd}
        isSubmitting={submitting}
        vehicleTypes={Array.isArray(vehicleTypes) ? vehicleTypes : []}
      />
      
      <ExtendDangKyThangModal
        isOpen={isExtendModalOpen}
        onClose={closeExtendModal}
        onSave={handleExtend}
        isSubmitting={submitting}
        selectedItem={selectedItem}
      />
      
      <ViewDangKyThangDetailModal
        isOpen={isViewDetailModalOpen}
        onClose={() => setIsViewDetailModalOpen(false)}
        dangKyThangId={selectedDetailId}
      />
      
      <CheckActiveDangKyThangModal
        isOpen={isCheckActiveModalOpen}
        onClose={() => setIsCheckActiveModalOpen(false)}
      />
      
      <ViewActiveDangKyThangModal
        isOpen={isViewActiveModalOpen}
        onClose={() => setIsViewActiveModalOpen(false)}
      />
      
      <UpdateSoThangModal
        isOpen={isUpdateSoThangModalOpen}
        onClose={() => setIsUpdateSoThangModalOpen(false)}
        dangKy={selectedItem}
        onSuccess={handleUpdateSoThangSuccess}
        showToast={showToast}
      />
      
      <RenewDangKyThangModal
        isOpen={isRenewModalOpen}
        onClose={() => setIsRenewModalOpen(false)}
        onSuccess={handleRenewSuccess}
        showToast={showToast}
      />
      
      <Toast
        show={toast.show}
        message={toast.message}
        type={toast.type}
        onClose={hideToast}
      />
    </div>
  );
};

export default DangKyThangPage;