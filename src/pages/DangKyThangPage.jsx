import React, { useState, useEffect } from 'react';
import dangKyThangService from '../services/dangKyThangService';
import vehicleTypeService from '../services/vehicleTypeService';
import AddDangKyThangModal from '../components/modals/AddDangKyThangModal';
import EditDangKyThangModal from '../components/modals/EditDangKyThangModal';
import ExistingUserModal from '../components/modals/ExistingUserModal';
import ExtendDangKyThangModal from '../components/modals/ExtendDangKyThangModal';
import ViewDangKyThangDetailModal from '../components/modals/ViewDangKyThangDetailModal';
import CheckActiveDangKyThangModal from '../components/modals/CheckActiveDangKyThangModal';
import ViewActiveDangKyThangModal from '../components/modals/ViewActiveDangKyThangModal';
import UpdateSoThangModal from '../components/modals/UpdateSoThangModal';
import SmartExtendModal from '../components/modals/SmartExtendModal';
import ExtensionChainModal from '../components/modals/ExtensionChainModal';
import VehicleHistoryModal from '../components/modals/VehicleHistoryModal';
import Toast from '../components/common/Toast';
import QuickCheckActiveStatus from '../components/common/QuickCheckActiveStatus';
import Pagination from '../components/common/Pagination';
import { ERROR_MESSAGES } from '../utils/constants';
import DashboardNavigation from '../components/DashboardNavigation';

const DangKyThangPage = () => {
  const [dangKyThangs, setDangKyThangs] = useState([]);
  const [vehicleTypes, setVehicleTypes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchType, setSearchType] = useState('BIEN_SO');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isExtendModalOpen, setIsExtendModalOpen] = useState(false);
  const [isViewDetailModalOpen, setIsViewDetailModalOpen] = useState(false);
  const [isCheckActiveModalOpen, setIsCheckActiveModalOpen] = useState(false);
  const [isViewActiveModalOpen, setIsViewActiveModalOpen] = useState(false);
  const [isUpdateSoThangModalOpen, setIsUpdateSoThangModalOpen] = useState(false);
  const [isExistingUserModalOpen, setIsExistingUserModalOpen] = useState(false);
  
  // New modals for smart extend functionality
  const [isSmartExtendModalOpen, setIsSmartExtendModalOpen] = useState(false);
  const [isExtensionChainModalOpen, setIsExtensionChainModalOpen] = useState(false);
  const [isVehicleHistoryModalOpen, setIsVehicleHistoryModalOpen] = useState(false);
  const [selectedDangKyThang, setSelectedDangKyThang] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedDetailId, setSelectedDetailId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: '' });
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5); // 5 items per page as requested

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message: String(message), type });
  };

  const hideToast = () => {
    setToast({ show: false, message: '', type: '' });
  };

  const fetchDangKyThangs = async () => {
    try {
      setLoading(true);
      const result = await dangKyThangService.getAllDangKyThang();
      if (result.success) {
        setDangKyThangs(result.data || []);
      } else {
        showToast(result.message, 'error');
        setDangKyThangs([]);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      const errorMessage = error.response?.data?.message || 'Không thể tải danh sách đăng ký tháng';
      showToast(errorMessage, 'error');
      setDangKyThangs([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchVehicleTypes = async () => {
    try {
      const data = await vehicleTypeService.getAllVehicleTypes();
      console.log('🚗 Vehicle Types API Response:', data);
      console.log('🚗 Vehicle Types Array:', Array.isArray(data));
      console.log('🚗 Vehicle Types Length:', data?.length);
      
      // Handle different response structures
      let vehicleTypesArray = [];
      if (Array.isArray(data)) {
        vehicleTypesArray = data;
      } else if (data && data.data && Array.isArray(data.data)) {
        vehicleTypesArray = data.data;
      } else if (data && typeof data === 'object') {
        vehicleTypesArray = [data];
      }
      
      console.log('🚗 Final Vehicle Types Array:', vehicleTypesArray);
      setVehicleTypes(vehicleTypesArray);
    } catch (error) {
      console.error('Error fetching vehicle types:', error);
      setVehicleTypes([]);
      // Show toast notification for user
      showToast?.('Không thể tải danh sách loại xe', 'error');
    }
  };

  useEffect(() => {
    fetchDangKyThangs();
    fetchVehicleTypes();
  }, []);

  // Utility functions
  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString('vi-VN');
  };

  const formatCurrency = (amount) => {
    if (!amount) return '0 ₫';
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  // Error messages constants
  const ERROR_MESSAGES = {
    'Chỉ có thể cập nhật đăng ký tháng khi trạng thái thanh toán còn PENDING': 
      'Không thể sửa đổi sau khi đã thanh toán',
    'Xe đã có đăng ký tháng còn hiệu lực': 
      'Xe này đã có đăng ký đang hoạt động',
    'Không tìm thấy User': 
      'Không tìm thấy khách hàng với thông tin này'
  };

  // Validation Logic mới theo backend
  const canEdit = (dangKy) => {
    return dangKy.trangThaiThanhToan === 'PENDING';
  };

  const canExtend = (dangKy) => {
    return dangKy.trangThai === 'EXPIRED';
  };

  const canPay = (dangKy) => {
    return dangKy.trangThaiThanhToan === 'PENDING';
  };

  // Helper function để kiểm tra xem bản ghi có phải là bản ghi cuối cùng trong chuỗi gia hạn không  
  const isLatestInChain = (dangKy) => {
    // Với linked-list structure mới: Root → Ext1 → Ext2 → Ext3
    // Bản ghi cuối cùng = không có bản ghi nào khác có parentId trỏ đến nó
    const isLatest = !dangKyThangs.some(item => item.parentId === dangKy.id);
    

    console.log(`� Kiểm tra ID ${dangKy.id} (${dangKy.bienSoXe}):`);

    return !dangKyThangs.some(item => item.parentId === dangKy.id);
  };

  // Logic kiểm tra có thể gia hạn không - tương thích với linked-list structure từ backend
  const canSmartExtend = (dangKy) => {
    // Rule 1: CANCELLED không được gia hạn
    if (dangKy.trangThai === 'CANCELLED') {
      return false;
    }
    
    // Rule 2: CHỈ bản ghi cuối cùng trong chuỗi mới được gia hạn
    // Với linked-list: Root → Ext1 → Ext2 → Ext3, chỉ Ext3 có thể gia hạn tiếp
    if (!isLatestInChain(dangKy)) {
      return false;
    }
    
    // Rule 3: Chỉ ACTIVE và EXPIRED mới có thể gia hạn
    return dangKy.trangThai === 'ACTIVE' || dangKy.trangThai === 'EXPIRED';
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800 border border-yellow-200';
      case 'ACTIVE':
        return 'bg-green-100 text-green-800 border border-green-200';
      case 'EXPIRED':
        return 'bg-red-100 text-red-800 border border-red-200';
      case 'CANCELLED':
        return 'bg-gray-100 text-gray-800 border border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border border-gray-200';
    }
  };

  const getPaymentStatusClass = (trangThaiThanhToan) => {
    switch (trangThaiThanhToan) {
      case 'PENDING':
        return 'bg-orange-100 text-orange-800 border border-orange-200';
      case 'COMPLETE':
        return 'bg-blue-100 text-blue-800 border border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border border-gray-200';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'PENDING':
        return 'Chờ xử lý';
      case 'ACTIVE':
        return 'Còn hiệu lực';
      case 'EXPIRED':
        return 'Hết hạn';
      case 'CANCELLED':
        return 'Đã hủy';
      default:
        return status;
    }
  };

  const getPaymentStatusText = (trangThaiThanhToan) => {
    switch (trangThaiThanhToan) {
      case 'PENDING':
        return 'Chưa thanh toán';
      case 'COMPLETE':
        return 'Đã thanh toán';
      default:
        return trangThaiThanhToan;
    }
  };

  const checkValidityStatus = (item) => {
    const now = new Date();
    const endDate = new Date(item.thoiGianHetHan);
    return endDate > now ? 'ACTIVE' : 'EXPIRED';
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  // Helper function để map text tiếng Việt sang status code
  const getStatusCode = (vietnameseText) => {
    const text = vietnameseText.toLowerCase().trim();
    if (text.includes('còn hiệu lực') || text.includes('hoạt động') || text.includes('active')) {
      return 'ACTIVE';
    } else if (text.includes('hết hạn') || text.includes('expired')) {
      return 'EXPIRED';
    } else if (text.includes('hủy') || text.includes('cancelled')) {
      return 'CANCELLED';
    }
    return vietnameseText; // Trả về text gốc nếu không match
  };

  // Khi search bằng API, dangKyThangs đã chứa kết quả filtered từ server
  // Chỉ filter client-side khi không có searchTerm hoặc khi load all data
  const filteredDangKyThangs = dangKyThangs;

  // Pagination calculations
  const totalItems = filteredDangKyThangs.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentPageData = filteredDangKyThangs.slice(startIndex, endIndex);

  // Reset to page 1 when search changes
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, searchType]);

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  // Debug logs
  console.log('📊 dangKyThangs length:', dangKyThangs.length);
  console.log('📊 filteredDangKyThangs length:', filteredDangKyThangs.length);
  console.log('📊 currentPage:', currentPage, 'totalPages:', totalPages);
  console.log('📊 currentPageData length:', currentPageData.length);
  console.log('📊 searchTerm:', searchTerm);
  console.log('📊 searchType:', searchType);
  
  // Extension chain logic is now handled by optimized isLatestInChain() function

  const openAddModal = () => setIsAddModalOpen(true);
  const closeAddModal = () => {
    setIsAddModalOpen(false);
    setSelectedItem(null);
  };

  const openExtendModal = (item) => {
    setSelectedItem(item);
    setIsExtendModalOpen(true);
  };

  const closeExtendModal = () => {
    setSelectedItem(null);
    setIsExtendModalOpen(false);
  };

  const openExistingUserModal = () => setIsExistingUserModalOpen(true);
  const closeExistingUserModal = () => {
    setIsExistingUserModalOpen(false);
  };

  const handleExistingUserRegistration = async (submissionData) => {
    try {
      setSubmitting(true);
      const { userIdentifier, identifierType, registrationData } = submissionData;
      
      console.log('🔍 Existing user registration data:', {
        userIdentifier,
        identifierType,
        registrationData
      });
      
      const result = await dangKyThangService.createForExistingUser(
        userIdentifier, 
        identifierType, 
        registrationData
      );
      
      if (result.success) {
        await fetchDangKyThangs();
        closeExistingUserModal();
        showToast('Đăng ký cho khách hàng cũ thành công!', 'success');
      } else {
        showToast(result.message, 'error');
      }
    } catch (error) {
      console.error('Error in existing user registration:', error);
      const errorMessage = error.response?.data?.message || 'Có lỗi xảy ra khi đăng ký cho khách hàng cũ';
      showToast(errorMessage, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAdd = async (newItem) => {
    try {
      setSubmitting(true);
      console.log('🔍 Creating new DangKyThang with data:', newItem);
      
      const result = await dangKyThangService.createDangKyThang(newItem);
      console.log('🔍 API Result:', result);
      
      if (result.success) {
        await fetchDangKyThangs();
        closeAddModal();
        showToast('Thêm đăng ký tháng thành công!', 'success');
      } else {
        showToast(result.message || 'Có lỗi xảy ra khi thêm đăng ký tháng', 'error');
      }
    } catch (error) {
      console.error('Error adding item:', error);
      const errorMessage = error.response?.data?.message || 'Có lỗi xảy ra khi thêm đăng ký tháng';
      showToast(errorMessage, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleExtend = async (extendData) => {
    try {
      setSubmitting(true);
      const result = await dangKyThangService.extendDangKyThang(selectedItem.id, extendData.soThang, extendData.maNhanVien);
      if (result.success) {
        await fetchDangKyThangs();
        closeExtendModal();
        showToast(result.message, 'success');
      } else {
        showToast(result.message, 'error');
      }
    } catch (error) {
      console.error('Error extending item:', error);
      const errorMessage = error.response?.data?.message || 'Có lỗi xảy ra khi gia hạn';
      showToast(errorMessage, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Bạn có chắc chắn muốn hủy đăng ký này?')) {
      try {
        const result = await dangKyThangService.deleteDangKyThang(id, 'NV001'); // Sử dụng mã nhân viên đúng
        if (result.success) {
          await fetchDangKyThangs();
          showToast(result.message, 'success');
        } else {
          showToast(result.message, 'error');
        }
      } catch (error) {
        console.error('Error deleting item:', error);
        const errorMessage = error.response?.data?.message || 'Có lỗi xảy ra khi hủy đăng ký';
        showToast(errorMessage, 'error');
      }
    }
  };

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      await fetchDangKyThangs();
      return;
    }

    try {
      setLoading(true);
      let result;
      
      if (searchType === 'ACTIVE_BIEN_SO') {
        result = await dangKyThangService.getActiveDangKyThangByBienSoXe(searchTerm);
      } else if (searchType === 'BIEN_SO') {
        result = await dangKyThangService.getDangKyThangByBienSoXe(searchTerm);
      } else if (searchType === 'CCCD') {
        result = await dangKyThangService.getDangKyThangByCCCD(searchTerm);
      } else if (searchType === 'NHAN_VIEN') {
        result = await dangKyThangService.getDangKyThangByNhanVien(searchTerm);
      } else if (searchType === 'TRANG_THAI') {
        const statusCode = getStatusCode(searchTerm);
        result = await dangKyThangService.getDangKyThangByTrangThai(statusCode);
      }
      
      console.log('🔍 Search result:', result);
      
      if (result && result.success) {
        console.log('✅ Result data length:', result.data?.length);
        console.log('✅ Result data sample:', result.data?.[0]);
        
        // Khi search bằng API, clear searchTerm để tránh filter lại client-side
        setDangKyThangs(result.data || []);
        // Không clear searchTerm để giữ UI hiển thị đang tìm kiếm
        
        console.log('📋 State updated with items:', result.data?.length || 0);
        
        if (!result.data || result.data.length === 0) {
          showToast('Không tìm thấy kết quả nào', 'info');
        }
      } else {
        console.log('❌ Search failed:', result);
        showToast(result?.message || 'Không tìm thấy kết quả nào', 'info');
        setDangKyThangs([]);
      }
    } catch (error) {
      console.error('Error searching:', error);
      const errorMessage = error.response?.data?.message || 'Có lỗi xảy ra khi tìm kiếm';
      showToast(errorMessage, 'error');
      setDangKyThangs([]);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickSearch = async (type) => {
    try {
      setLoading(true);
      
      let result;
      let displayText;
      
      // Gọi API trực tiếp với status code đúng
      if (type === 'ACTIVE') {
        result = await dangKyThangService.getDangKyThangByTrangThai('ACTIVE');
        displayText = 'Còn hiệu lực';
      } else if (type === 'EXPIRED') {
        result = await dangKyThangService.getDangKyThangByTrangThai('EXPIRED');
        displayText = 'Hết hạn';
      } else if (type === 'CANCELLED') {
        result = await dangKyThangService.getDangKyThangByTrangThai('CANCELLED');
        displayText = 'Đã hủy';
      } else if (type === 'PENDING') {
        result = await dangKyThangService.getDangKyThangByTrangThai('PENDING');
        displayText = 'Chờ xử lý';
      }

      // Cập nhật state để hiển thị kết quả search
      setSearchType('TRANG_THAI');
      setSearchTerm(displayText);
      
      if (result && result.success) {
        setDangKyThangs(result.data || []);
        if (!result.data || result.data.length === 0) {
          showToast(`Không tìm thấy đăng ký nào với trạng thái "${displayText}"`, 'info');
        }
      } else {
        showToast(result?.message || `Không tìm thấy đăng ký nào với trạng thái "${displayText}"`, 'info');
        setDangKyThangs([]);
      }
    } catch (error) {
      console.error('Error in quick search:', error);
      const errorMessage = error.response?.data?.message || 'Có lỗi xảy ra';
      showToast(errorMessage, 'error');
      setDangKyThangs([]);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetail = (id) => {
    setSelectedDetailId(id);
    setIsViewDetailModalOpen(true);
  };

  const handleUpdateSoThang = (item) => {
    setSelectedItem(item);
    setIsUpdateSoThangModalOpen(true);
  };

  const handleUpdateSoThangSuccess = () => {
    setIsUpdateSoThangModalOpen(false);
    setSelectedItem(null);
    fetchDangKyThangs();
    showToast('Cập nhật số tháng thành công!', 'success');
  };

  const updateExpiredDangKyThang = async () => {
    try {
      const result = await dangKyThangService.updateExpiredDangKyThang();
      if (result.success) {
        await fetchDangKyThangs();
        showToast(result.message, 'success');
      } else {
        showToast(result.message, 'error');
      }
    } catch (error) {
      console.error('Error updating expired status:', error);
      const errorMessage = error.response?.data?.message || 'Có lỗi xảy ra khi cập nhật trạng thái';
      showToast(errorMessage, 'error');
    }
  };

  // ===== CÁC HANDLER MỚI THEO YÊU CẦU BACKEND =====

  // Handler thanh toán
  const handlePayment = async (id) => {
    try {
      setSubmitting(true);
      const result = await dangKyThangService.processPayment(id);
      if (result.success) {
        await fetchDangKyThangs();
        showToast(result.message, 'success');
      } else {
        showToast(result.message, 'error');
      }
    } catch (error) {
      console.error('Error processing payment:', error);
      const errorMessage = error.response?.data?.message || 'Có lỗi xảy ra khi xử lý thanh toán';
      showToast(errorMessage, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Handler cập nhật số tháng (chỉ khi PENDING)
  const handleUpdateMonths = async (item) => {
    const newMonthCount = prompt(`Nhập số tháng mới (hiện tại: ${item.soThang}):`, item.soThang);
    if (newMonthCount && newMonthCount !== item.soThang.toString()) {
      const monthNum = parseInt(newMonthCount);
      if (monthNum >= 1 && monthNum <= 12) {
        try {
          setSubmitting(true);
          const result = await dangKyThangService.updateMonths(item.id, monthNum);
          if (result.success) {
            await fetchDangKyThangs();
            showToast(result.message, 'success');
          } else {
            showToast(result.message, 'error');
          }
        } catch (error) {
          console.error('Error updating months:', error);
          const errorMessage = error.response?.data?.message || 'Có lỗi xảy ra khi cập nhật số tháng';
          showToast(errorMessage, 'error');
        } finally {
          setSubmitting(false);
        }
      } else {
        showToast('Số tháng phải từ 1 đến 12', 'error');
      }
    }
  };

  // Handler gia hạn EXPIRED
  const handleExtendExpired = async (item) => {
    const additionalMonths = prompt('Nhập số tháng muốn gia hạn thêm (1-12):');
    if (additionalMonths) {
      const monthNum = parseInt(additionalMonths);
      if (monthNum >= 1 && monthNum <= 12) {
        try {
          setSubmitting(true);
          const result = await dangKyThangService.extendExpired(item.id, monthNum);
          if (result.success) {
            await fetchDangKyThangs();
            showToast(result.message + ' (Trạng thái chuyển về PENDING để thanh toán)', 'success');
          } else {
            showToast(result.message, 'error');
          }
        } catch (error) {
          console.error('Error extending expired registration:', error);
          const errorMessage = error.response?.data?.message || 'Có lỗi xảy ra khi gia hạn';
          showToast(errorMessage, 'error');
        } finally {
          setSubmitting(false);
        }
      } else {
        showToast('Số tháng phải từ 1 đến 12', 'error');
      }
    }
  };

  // Handler cập nhật trạng thái hết hạn
  const handleUpdateExpiredStatus = async () => {
    const confirmUpdate = window.confirm('Bạn có chắc chắn muốn cập nhật trạng thái hết hạn cho tất cả đăng ký tháng?');
    if (confirmUpdate) {
      try {
        setSubmitting(true);
        console.log('🔍 Starting update expired status...');
        
        const result = await dangKyThangService.updateExpiredStatus();
        console.log('🔍 Update expired status result:', result);
        
        if (result.success) {
          await fetchDangKyThangs(); // Refresh data
          showToast(result.message, 'success');
        } else {
          showToast(result.message, 'error');
        }
      } catch (error) {
        console.error('Error updating expired status:', error);
        const errorMessage = error.response?.data?.message || 'Có lỗi xảy ra khi cập nhật trạng thái hết hạn';
        showToast(errorMessage, 'error');
      } finally {
        setSubmitting(false);
      }
    }
  };

  // Handler gia hạn thông minh
  const handleSmartExtend = (dangKyThang) => {
    setSelectedDangKyThang(dangKyThang);
    setIsSmartExtendModalOpen(true);
  };

  // Handler xem chuỗi gia hạn
  const handleViewExtensionChain = (dangKyThang) => {
    setSelectedDangKyThang(dangKyThang);
    setIsExtensionChainModalOpen(true);
  };

  // Handler xem lịch sử xe
  const handleViewVehicleHistory = (dangKyThang) => {
    setSelectedDangKyThang(dangKyThang);
    setIsVehicleHistoryModalOpen(true);
  };

  // Handler đóng modal gia hạn thông minh
  const handleSmartExtendSubmit = async (data) => {
    try {
      setSubmitting(true);
      console.log('🔍 Starting smart extend with data:', data);
      
      const result = await dangKyThangService.extendRegistrationSmart(
        selectedDangKyThang.id,
        data.newMonths,
        data.maNhanVien
      );
      
      console.log('🔍 Smart extend result:', result);
      
      if (result.success) {
        await fetchDangKyThangs(); // Refresh data
        setIsSmartExtendModalOpen(false);
        setSelectedDangKyThang(null);
        showToast(result.message || 'Gia hạn thông minh thành công!', 'success');
      } else {
        showToast(result.message || 'Có lỗi xảy ra khi gia hạn thông minh', 'error');
      }
    } catch (error) {
      console.error('Error in smart extend:', error);
      const errorMessage = error.response?.data?.message || 'Có lỗi xảy ra khi gia hạn thông minh';
      showToast(errorMessage, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Handler đóng modal chuỗi gia hạn
  const handleCloseExtensionChainModal = () => {
    setIsExtensionChainModalOpen(false);
    setSelectedDangKyThang(null);
  };

  // Handler đóng modal lịch sử xe
  const handleCloseVehicleHistoryModal = () => {
    setIsVehicleHistoryModalOpen(false);
    setSelectedDangKyThang(null);
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

          {/* Combined Search, Actions and Quick Actions */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-1">Tìm kiếm và thao tác nhanh</h3>
              <p className="text-sm text-gray-600">Tìm kiếm và các chức năng thường dùng</p>
            </div>
            
            {/* Search Row */}
            <div className="flex flex-col lg:flex-row lg:items-end gap-4 mb-4">
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
                </select>
              </div>

              <div className="flex flex-col gap-2 flex-1">
                <label className="text-sm font-semibold text-gray-700">Từ khóa tìm kiếm</label>
                <input
                  type="text"
                  placeholder="Nhập từ khóa..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="flex-1 border border-gray-300 rounded-lg px-4 py-2.5 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-gray-700">Lọc nhanh theo trạng thái</label>
                <select
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value) {
                      handleQuickSearch(value);
                      e.target.value = ''; // Reset dropdown after selection
                    }
                  }}
                  className="bg-white border border-gray-300 rounded-lg px-4 py-2.5 text-gray-900 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors min-w-[180px]"
                  defaultValue=""
                >
                  <option value="" disabled>-- Chọn trạng thái --</option>
                  <option value="PENDING">🟠 Chờ xử lý</option>
                  <option value="ACTIVE">🟢 Đang hoạt động</option>
                  <option value="EXPIRED">🟡 Đã hết hạn</option>
                  <option value="CANCELLED">🔴 Đã hủy</option>
                </select>
              </div>
            </div>

            {/* All Actions in One Row */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-7 gap-3">
              {/* Search Button */}
              <button
                onClick={handleSearch}
                disabled={loading}
                className="bg-sky-500 hover:bg-sky-600 text-white px-4 py-2.5 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                Tìm kiếm
              </button>

              {/* Add New Button */}
              <button
                onClick={openAddModal}
                className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2.5 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Thêm mới
              </button>
              
              {/* Existing Customer Button */}
              <button
                onClick={openExistingUserModal}
                className="bg-violet-500 hover:bg-violet-600 text-white px-4 py-2.5 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                </svg>
                Khách hàng cũ
              </button>

              {/* Check Validity Button */}
              <button
                onClick={() => setIsCheckActiveModalOpen(true)}
                className="bg-amber-100 hover:bg-amber-200 text-amber-700 px-4 py-2.5 rounded-lg flex items-center justify-center gap-2 font-medium transition-colors duration-200 border border-amber-200"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Kiểm tra hiệu lực
              </button>
              
              {/* View Active Button */}
              <button
                onClick={() => setIsViewActiveModalOpen(true)}
                className="bg-pink-100 hover:bg-pink-200 text-pink-700 px-4 py-2.5 rounded-lg flex items-center justify-center gap-2 font-medium transition-colors duration-200 border border-pink-200"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                Xem đăng ký hiệu lực
              </button>
              
              {/* Update Expired Button */}
              <button
                onClick={handleUpdateExpiredStatus}
                disabled={submitting}
                className="bg-rose-100 hover:bg-rose-200 disabled:bg-rose-50 text-rose-700 disabled:text-rose-400 px-4 py-2.5 rounded-lg flex items-center justify-center gap-2 font-medium transition-colors duration-200 border border-rose-200 disabled:border-rose-100"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Cập nhật hết hạn
              </button>
              
              {/* Refresh Button */}
              <button
                onClick={fetchDangKyThangs}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2.5 rounded-lg flex items-center justify-center gap-2 font-medium transition-colors duration-200 border border-gray-200"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Làm mới dữ liệu
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
          ) : (
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
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Thanh toán</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Lần gia hạn</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Thao tác</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {currentPageData.map((item, index) => (
                        <tr key={item.id} className="hover:bg-gray-50 transition-colors duration-150">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{startIndex + index + 1}</td>
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
                            <span className={`px-3 py-1 text-xs font-medium rounded-full ${getPaymentStatusClass(item.trangThaiThanhToan)}`}>
                              {getPaymentStatusText(item.trangThaiThanhToan)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 text-xs font-medium rounded-md ${
                              item.lanGiaHan === 0 
                                ? 'bg-blue-100 text-blue-800 border border-blue-200' 
                                : 'bg-green-100 text-green-800 border border-green-200'
                            }`}>
                              {item.lanGiaHan === 0 ? 'Gốc' : `Lần ${item.lanGiaHan}`}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex gap-2 flex-wrap">
                              {/* Nút Chi tiết - luôn hiển thị */}
                              <button 
                                onClick={() => handleViewDetail(item.id)}
                                className="px-3 py-1 bg-fuchsia-600 text-white text-xs font-medium rounded-md hover:bg-fuchsia-700 focus:outline-none focus:ring-2 focus:ring-fuchsia-500 focus:ring-offset-1 transition-colors duration-150"
                                title="Xem chi tiết"
                              >
                                Chi tiết
                              </button>
                              
                              {/* Nút Chuỗi gia hạn - luôn hiển thị */}
                              <button 
                                onClick={() => handleViewExtensionChain(item)}
                                className="px-3 py-1 bg-green-600 text-white text-xs font-medium rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-1 transition-colors duration-150"
                                title="Xem lịch sử chuỗi gia hạn"
                              >
                                Chuỗi gia hạn
                              </button>

                              {/* Nút Lịch sử xe - luôn hiển thị */}
                              <button 
                                onClick={() => handleViewVehicleHistory(item)}
                                className="px-3 py-1 bg-sky-600 text-white text-xs font-medium rounded-md hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-1 transition-colors duration-150"
                                title="Xem toàn bộ lịch sử của xe này"
                              >
                                Lịch sử xe
                              </button>

                              {/* Các nút khác - chỉ hiển thị khi KHÔNG phải CANCELLED */}
                              {item.trangThai !== 'CANCELLED' && (
                                <>
                                  {/* Nút thanh toán - chỉ hiện khi PENDING payment */}
                                  {canPay(item) && (
                                    <button 
                                      onClick={() => handlePayment(item.id)}
                                      className="px-3 py-1 bg-amber-500 text-white text-xs font-medium rounded-md hover:bg-amber-600 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-1 transition-colors duration-150"
                                      title="Xử lý thanh toán"
                                    >
                                      Thanh toán
                                    </button>
                                  )}
                                  
                                  {/* Nút cập nhật số tháng - chỉ khi PENDING payment */}
                                  {canEdit(item) && (
                                    <button 
                                      onClick={() => handleUpdateMonths(item)}
                                      className="px-3 py-1 bg-pink-500 text-white text-xs font-medium rounded-md hover:bg-pink-600 focus:outline-none focus:ring-2 focus:ring-pink-400 focus:ring-offset-1 transition-colors duration-150"
                                      title="Cập nhật số tháng (chỉ khi chưa thanh toán)"
                                    >
                                      Sửa số tháng
                                    </button>
                                  )}
                                  
                                  {/* Nút hủy - chỉ khi có thể chỉnh sửa */}
                                  {canEdit(item) && (
                                    <button 
                                      onClick={() => handleDelete(item.id)}
                                      className="px-3 py-1 bg-red-600 text-white text-xs font-medium rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1 transition-colors duration-150"
                                      title="Hủy đăng ký (chỉ khi chưa thanh toán)"
                                    >
                                      Hủy
                                    </button>
                                  )}

                                  {/* Nút gia hạn thông minh - theo logic mới */}
                                  {canSmartExtend(item) && (
                                    <button 
                                      onClick={() => handleSmartExtend(item)}
                                      className="px-3 py-1 bg-orange-500 text-white text-xs font-medium rounded-md hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:ring-offset-1 transition-colors duration-150"
                                      title={
                                        item.trangThai === 'ACTIVE' 
                                          ? "Gia hạn từ ngày hết hạn hiện tại" 
                                          : "Gia hạn từ ngày hiện tại (do đã hết hạn)"
                                      }
                                    >
                                      Gia hạn
                                    </button>
                                  )}
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              
              {/* Pagination - Show outside of conditional to always display when there's data */}
              {filteredDangKyThangs.length > 0 && (
                <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
                  <Pagination
                    currentPage={currentPage}
                    totalItems={totalItems}
                    itemsPerPage={itemsPerPage}
                    onPageChange={handlePageChange}
                  />
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
      
      <ExistingUserModal
        isOpen={isExistingUserModalOpen}
        onClose={closeExistingUserModal}
        onSave={handleExistingUserRegistration}
        isSubmitting={submitting}
        vehicleTypes={Array.isArray(vehicleTypes) ? vehicleTypes : []}
        showToast={showToast}
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
      
      <SmartExtendModal
        isOpen={isSmartExtendModalOpen}
        onClose={() => setIsSmartExtendModalOpen(false)}
        dangKy={selectedDangKyThang}
        onSubmit={handleSmartExtendSubmit}
        isSubmitting={submitting}
      />
      
      <ExtensionChainModal
        isOpen={isExtensionChainModalOpen}
        onClose={handleCloseExtensionChainModal}
        dangKy={selectedDangKyThang}
      />
      
      <VehicleHistoryModal
        isOpen={isVehicleHistoryModalOpen}
        onClose={handleCloseVehicleHistoryModal}
        dangKy={selectedDangKyThang}
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