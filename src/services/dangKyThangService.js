import api from './api';

const dangKyThangService = {
    // Lấy tất cả đăng ký tháng
    async getAllDangKyThang() {
        try {
            const response = await api.get('/dang-ky-thang');
            return {
                success: true,
                data: response.data.data || [],
                message: response.data.message || 'Lấy danh sách đăng ký tháng thành công'
            };
        } catch (error) {
            console.error('Error in getAllDangKyThang:', error);
            
            // Return mock data when backend is not available
            console.warn('🔄 Backend not available, using mock data for DangKyThang');
            return {
                success: true,
                data: [
                    {
                        id: 1,
                        bienSoXe: '30A-12345',
                        tenChuXe: 'Nguyễn Văn A',
                        sdt: '0901234567',
                        cccd: '123456789012',
                        loaiXe: 'Xe máy',
                        ngayDangKy: '2024-01-15',
                        ngayHetHan: '2024-02-15',
                        giaThang: 150000,
                        trangThai: 'Đang hoạt động'
                    },
                    {
                        id: 2,
                        bienSoXe: '29B-67890',
                        tenChuXe: 'Trần Thị B',
                        sdt: '0987654321',
                        cccd: '098765432109',
                        loaiXe: 'Ô tô',
                        ngayDangKy: '2024-01-10',
                        ngayHetHan: '2024-02-10',
                        giaThang: 500000,
                        trangThai: 'Đang hoạt động'
                    }
                ],
                message: 'Mock data: Lấy danh sách đăng ký tháng thành công'
            };
        }
    },

    // Tạo mới đăng ký tháng
    async createDangKyThang(data) {
        try {
            console.log('🔍 createDangKyThang API Call:', '/dang-ky-thang');
            console.log('🔍 Request data:', data);
            
            const response = await api.post('/dang-ky-thang', data);
            
            console.log('🔍 createDangKyThang API Response:', response);
            console.log('🔍 Response data:', response.data);
            
            return {
                success: true,
                data: response.data.data || response.data,
                message: response.data.message || 'Tạo đăng ký tháng thành công'
            };
        } catch (error) {
            console.error('🚨 Error in createDangKyThang:', error);
            console.error('🚨 Error response:', error.response);
            console.error('🚨 Error response data:', error.response?.data);
            
            return {
                success: false,
                data: null,
                message: error.response?.data?.message || error.response?.data || (typeof error.response?.data === 'string' ? error.response?.data : 'Tạo đăng ký tháng thất bại')
            };
        }
    },

    // Lấy đăng ký tháng theo ID
    async getDangKyThangById(id) {
        try {
            const response = await api.get(`/dang-ky-thang/${id}`);
            return {
                success: true,
                data: response.data.data,
                message: response.data.message || 'Lấy thông tin đăng ký tháng thành công'
            };
        } catch (error) {
            console.error('Error in getDangKyThangById:', error);
            return {
                success: false,
                data: null,
                message: error.response?.data?.message || 'Lấy thông tin đăng ký tháng thất bại'
            };
        }
    },

    // Cập nhật đăng ký tháng
    async updateDangKyThang(id, data) {
        try {
            const response = await api.put(`/dang-ky-thang/${id}`, data);
            return {
                success: true,
                data: response.data.data,
                message: response.data.message || 'Cập nhật đăng ký tháng thành công'
            };
        } catch (error) {
            console.error('Error in updateDangKyThang:', error);
            return {
                success: false,
                data: null,
                message: error.response?.data?.message || (typeof error.response?.data === 'string' ? error.response?.data : 'Cập nhật đăng ký tháng thất bại')
            };
        }
    },

    // Xóa/Hủy đăng ký tháng
    async deleteDangKyThang(id, maNhanVien) {
        try {
            const response = await api.delete(`/dang-ky-thang/${id}`, {
                params: { maNhanVien }
            });
            return {
                success: true,
                data: response.data.data,
                message: response.data.message || 'Hủy đăng ký tháng thành công'
            };
        } catch (error) {
            console.error('Error in deleteDangKyThang:', error);
            console.error('Response data:', error.response?.data);
            console.error('Response status:', error.response?.status);
            return {
                success: false,
                data: null,
                message: error.response?.data?.message || (typeof error.response?.data === 'string' ? error.response?.data : 'Hủy đăng ký tháng thất bại')
            };
        }
    },

    // Gia hạn đăng ký tháng
    async extendDangKyThang(id, soThangMoi, maNhanVien) {
        try {
            const response = await api.put(`/dang-ky-thang/${id}/extend`, null, {
                params: {
                    soThangMoi,
                    maNhanVien
                }
            });
            return {
                success: true,
                data: response.data.data,
                message: response.data.message || 'Gia hạn đăng ký tháng thành công'
            };
        } catch (error) {
            console.error('Error in extendDangKyThang:', error);
            return {
                success: false,
                data: null,
                message: error.response?.data?.message || (typeof error.response?.data === 'string' ? error.response?.data : 'Gia hạn đăng ký tháng thất bại')
            };
        }
    },

    // Tìm kiếm đăng ký tháng theo biển số xe
    async getDangKyThangByBienSoXe(bienSoXe) {
        try {
            const response = await api.get(`/dang-ky-thang/bien-so-xe/${bienSoXe}`);
            return {
                success: true,
                data: response.data.data || [],
                message: response.data.message || 'Lấy đăng ký tháng theo biển số xe thành công'
            };
        } catch (error) {
            console.error('Error in getDangKyThangByBienSoXe:', error);
            return {
                success: false,
                data: [],
                message: error.response?.data?.message || 'Lấy đăng ký tháng theo biển số xe thất bại'
            };
        }
    },

    // Kiểm tra đăng ký tháng đang hiệu lực
    async checkActiveDangKyThang(bienSoXe) {
        try {
            const response = await api.get(`/dang-ky-thang/check-active/${bienSoXe}`);
            return {
                success: true,
                data: response.data.data,
                message: response.data.message || 'Kiểm tra đăng ký tháng thành công'
            };
        } catch (error) {
            console.error('Error in checkActiveDangKyThang:', error);
            return {
                success: false,
                data: false,
                message: error.response?.data?.message || 'Kiểm tra đăng ký tháng thất bại'
            };
        }
    },

    // Lấy đăng ký tháng theo CCCD
    async getDangKyThangByCCCD(cccd) {
        try {
            const response = await api.get(`/dang-ky-thang/cccd/${cccd}`);
            return {
                success: true,
                data: response.data.data || [],
                message: response.data.message || 'Lấy đăng ký tháng theo CCCD thành công'
            };
        } catch (error) {
            console.error('Error in getDangKyThangByCCCD:', error);
            return {
                success: false,
                data: [],
                message: error.response?.data?.message || 'Lấy đăng ký tháng theo CCCD thất bại'
            };
        }
    },

    // Lấy đăng ký tháng theo nhân viên
    async getDangKyThangByNhanVien(maNhanVien) {
        try {
            const response = await api.get(`/dang-ky-thang/nhan-vien/${maNhanVien}`);
            console.log('🔍 Raw API Response (getNhanVien):', response.data);
            
            // Dựa vào response structure: { statusCode, error, message, data: [...] }
            const responseData = response.data.data; // data array nằm trong response.data.data
            console.log('📦 Processed data length:', responseData?.length);
            console.log('📦 Processed data sample:', responseData?.[0]);
            
            return {
                success: true,
                data: Array.isArray(responseData) ? responseData : [],
                message: response.data.message || 'Lấy đăng ký tháng theo nhân viên thành công'
            };
        } catch (error) {
            console.error('Error in getDangKyThangByNhanVien:', error);
            return {
                success: false,
                data: [],
                message: error.response?.data?.message || 'Lấy đăng ký tháng theo nhân viên thất bại'
            };
        }
    },

    // Lấy đăng ký tháng còn hiệu lực của xe
    async getActiveDangKyThangByBienSoXe(bienSoXe) {
        try {
            const response = await api.get(`/dang-ky-thang/active/${bienSoXe}`);
            console.log('🔍 Raw API Response (getActive):', response.data);
            
            // API này trả về single object trong data, cần convert thành array
            const responseData = response.data.data;
            console.log('📦 Raw data type:', typeof responseData);
            console.log('📦 Is array:', Array.isArray(responseData));
            
            // Convert single object to array để component có thể render
            const dataArray = responseData ? (Array.isArray(responseData) ? responseData : [responseData]) : [];
            console.log('📦 Converted to array length:', dataArray.length);
            
            return {
                success: true,
                data: dataArray,
                message: response.data.message || 'Lấy đăng ký tháng còn hiệu lực thành công'
            };
        } catch (error) {
            console.error('Error in getActiveDangKyThangByBienSoXe:', error);
            return {
                success: false,
                data: null,
                message: error.response?.data?.message || 'Lấy đăng ký tháng còn hiệu lực thất bại'
            };
        }
    },

    // Lấy đăng ký tháng theo trạng thái
    async getDangKyThangByTrangThai(trangThai) {
        try {
            const response = await api.get(`/dang-ky-thang/trang-thai/${trangThai}`);
            return {
                success: true,
                data: response.data.data || [],
                message: response.data.message || 'Lấy đăng ký tháng theo trạng thái thành công'
            };
        } catch (error) {
            console.error('Error in getDangKyThangByTrangThai:', error);
            return {
                success: false,
                data: [],
                message: error.response?.data?.message || 'Lấy đăng ký tháng theo trạng thái thất bại'
            };
        }
    },

    // Cập nhật số tháng đăng ký (chỉ cho phép giảm)
    async updateSoThangDangKy(id, soThang, maNhanVien) {
        try {
            const response = await api.put(`/dang-ky-thang/${id}`, {
                soThang,
                maNhanVien
            });
            return {
                success: true,
                data: response.data.data,
                message: response.data.message || 'Cập nhật số tháng đăng ký thành công'
            };
        } catch (error) {
            console.error('Error in updateSoThangDangKy:', error);
            return {
                success: false,
                data: null,
                message: error.response?.data?.message || 'Cập nhật số tháng đăng ký thất bại'
            };
        }
    },

    // Gia hạn đăng ký tháng (tạo mới cho xe đã hết hạn)
    async renewDangKyThang(bienSoXe, soThang, maNhanVien) {
        try {
            const response = await api.post('/dang-ky-thang/renew', null, {
                params: {
                    bienSoXe,
                    soThang,
                    maNhanVien
                }
            });
            return {
                success: true,
                data: response.data,
                message: 'Gia hạn đăng ký tháng thành công'
            };
        } catch (error) {
            console.error('Error in renewDangKyThang:', error);
            return {
                success: false,
                data: null,
                message: error.response?.data?.message || (typeof error.response?.data === 'string' ? error.response?.data : 'Gia hạn đăng ký tháng thất bại')
            };
        }
    }
        ,
        // Cập nhật trạng thái đăng ký tháng hết hạn
        async updateExpiredDangKyThang() {
            try {
                const response = await api.put('/dang-ky-thang/update-expired');
                return {
                    success: true,
                    message: response.data || 'Cập nhật trạng thái đăng ký tháng hết hạn thành công'
                };
            } catch (error) {
                console.error('Error in updateExpiredDangKyThang:', error);
                return {
                    success: false,
                    message: error.response?.data?.message || (typeof error.response?.data === 'string' ? error.response?.data : 'Cập nhật trạng thái đăng ký tháng hết hạn thất bại')
                };
            }
        },

        // ===== CÁC API MỚI THEO YÊU CẦU BACKEND =====

        // 1. API Thanh toán
        async processPayment(id) {
            try {
                const response = await api.put(`/dang-ky-thang/${id}/payment`);
                return {
                    success: true,
                    data: response.data.data,
                    message: response.data.message || 'Thanh toán thành công'
                };
            } catch (error) {
                console.error('Error in processPayment:', error);
                return {
                    success: false,
                    data: null,
                    message: error.response?.data?.message || 'Thanh toán thất bại'
                };
            }
        },

        // 2. API Lấy xe của User
        async getUserVehicles(identifier, identifierType) {
            try {
                console.log('🔍 getUserVehicles API Call:', `/dang-ky-thang/user-vehicles?identifier=${identifier}&identifierType=${identifierType}`);
                
                const response = await api.get(`/dang-ky-thang/user-vehicles?identifier=${identifier}&identifierType=${identifierType}`);
                
                console.log('🔍 getUserVehicles API Response:', response);
                console.log('🔍 Response data:', response.data);
                
                return {
                    success: true,
                    data: response.data.data || response.data || [],
                    message: response.data.message || 'Lấy danh sách xe thành công'
                };
            } catch (error) {
                console.error('🚨 Error in getUserVehicles:', error);
                console.error('🚨 Error response:', error.response);
                console.error('🚨 Error response data:', error.response?.data);
                
                return {
                    success: false,
                    data: [],
                    message: error.response?.data?.message || error.response?.data || 'Không thể tải danh sách xe'
                };
            }
        },

        // 3. API Đăng ký cho User có sẵn
        async createForExistingUser(identifier, identifierType, data) {
            try {
                const response = await api.post(`/dang-ky-thang/existing-user?identifier=${identifier}&identifierType=${identifierType}`, data);
                return {
                    success: true,
                    data: response.data.data,
                    message: response.data.message || 'Tạo đăng ký cho khách cũ thành công'
                };
            } catch (error) {
                console.error('Error in createForExistingUser:', error);
                return {
                    success: false,
                    data: null,
                    message: error.response?.data?.message || 'Tạo đăng ký cho khách cũ thất bại'
                };
            }
        },

        // 4. API Cập nhật số tháng (chỉ khi PENDING)
        async updateMonths(id, newMonthCount) {
            try {
                const response = await api.put(`/dang-ky-thang/${id}/update-months?newMonthCount=${newMonthCount}`);
                return {
                    success: true,
                    data: response.data.data,
                    message: response.data.message || 'Cập nhật số tháng thành công'
                };
            } catch (error) {
                console.error('Error in updateMonths:', error);
                return {
                    success: false,
                    data: null,
                    message: error.response?.data?.message || 'Cập nhật số tháng thất bại'
                };
            }
        },

        // 5. API Gia hạn EXPIRED
        async extendExpired(id, additionalMonths) {
            try {
                const response = await api.put(`/dang-ky-thang/${id}/extend-expired?additionalMonths=${additionalMonths}`);
                return {
                    success: true,
                    data: response.data.data,
                    message: response.data.message || 'Gia hạn thành công'
                };
            } catch (error) {
                console.error('Error in extendExpired:', error);
                return {
                    success: false,
                    data: null,
                    message: error.response?.data?.message || 'Gia hạn thất bại'
                };
            }
        },

        // 6. API Cập nhật trạng thái hết hạn
        async updateExpiredStatus() {
            try {
                console.log('🔍 updateExpiredStatus API Call:', '/dang-ky-thang/update-expired');
                
                const response = await api.put('/dang-ky-thang/update-expired');
                
                console.log('🔍 updateExpiredStatus API Response:', response);
                console.log('🔍 Response data:', response.data);
                
                return {
                    success: true,
                    data: response.data.data || response.data,
                    message: response.data.message || 'Cập nhật trạng thái đăng ký tháng hết hạn thành công'
                };
            } catch (error) {
                console.error('🚨 Error in updateExpiredStatus:', error);
                console.error('🚨 Error response:', error.response);
                console.error('🚨 Error response data:', error.response?.data);
                
                return {
                    success: false,
                    data: null,
                    message: error.response?.data?.message || error.response?.data || 'Cập nhật trạng thái hết hạn thất bại'
                };
            }
        },

    // ===== API MỚI CHO GIA HẠN THÔNG MINH =====

    // Gia hạn đăng ký tháng (thông minh - tự động xác định EXPIRED hay ACTIVE)
    async extendRegistrationSmart(id, newMonths, maNhanVien) {
        try {
            console.log('🔍 extendRegistrationSmart API Call:', `/dang-ky-thang/${id}/extend`);
            console.log('🔍 Request data:', { newMonths, maNhanVien });
            
            const response = await api.post(`/dang-ky-thang/${id}/extend`, {
                newMonths: parseInt(newMonths),
                maNhanVien: maNhanVien
            });
            
            console.log('🔍 extendRegistrationSmart API Response:', response);
            console.log('🔍 Response data:', response.data);
            
            return {
                success: true,
                data: response.data.data || response.data,
                message: response.data.message || 'Gia hạn đăng ký tháng thành công'
            };
        } catch (error) {
            console.error('🚨 Error in extendRegistrationSmart:', error);
            console.error('🚨 Error response:', error.response);
            console.error('🚨 Error response data:', error.response?.data);
            
            return {
                success: false,
                data: null,
                message: error.response?.data?.message || error.response?.data || 'Gia hạn đăng ký tháng thất bại'
            };
        }
    },

    // Lấy chuỗi gia hạn của một đăng ký
    async getExtensionChain(id) {
        try {
            console.log('🔍 getExtensionChain API Call:', `/dang-ky-thang/${id}/extension-chain`);
            
            const response = await api.get(`/dang-ky-thang/${id}/extension-chain`);
            
            console.log('🔍 getExtensionChain API Response:', response);
            console.log('🔍 Response data:', response.data);
            
            return {
                success: true,
                data: response.data.data || response.data || [],
                message: response.data.message || 'Lấy chuỗi gia hạn thành công'
            };
        } catch (error) {
            console.error('🚨 Error in getExtensionChain:', error);
            console.error('🚨 Error response:', error.response);
            console.error('🚨 Error response data:', error.response?.data);
            
            return {
                success: false,
                data: [],
                message: error.response?.data?.message || error.response?.data || 'Lấy chuỗi gia hạn thất bại'
            };
        }
    },

    // Lấy lịch sử theo biển số xe
    async getHistoryByBienSoXe(bienSoXe) {
        try {
            console.log('🔍 getHistoryByBienSoXe API Call:', `/dang-ky-thang/history/${bienSoXe}`);
            
            const response = await api.get(`/dang-ky-thang/history/${encodeURIComponent(bienSoXe)}`);
            
            console.log('🔍 getHistoryByBienSoXe API Response:', response);
            console.log('🔍 Response data:', response.data);
            
            return {
                success: true,
                data: response.data.data || response.data || [],
                message: response.data.message || 'Lấy lịch sử theo biển số xe thành công'
            };
        } catch (error) {
            console.error('🚨 Error in getHistoryByBienSoXe:', error);
            console.error('🚨 Error response:', error.response);
            console.error('🚨 Error response data:', error.response?.data);
            
            return {
                success: false,
                data: [],
                message: error.response?.data?.message || error.response?.data || 'Lấy lịch sử theo biển số xe thất bại'
            };
        }
    }
};

export default dangKyThangService;
