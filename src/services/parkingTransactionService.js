import api from './api';

/**
 * Service for parking transaction operations
 */
class ParkingTransactionService {
    static async directVehicleEntry(entryData) {
        try {
            const response = await api.post('/parking-transactions/direct-entry', entryData);
            // Backend trả về { statusCode, error, message, data: { message, transaction, success } }
            return {
                success: true,
                data: response.data.data.transaction,
                message: response.data.data.message
            };
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || error.response?.data?.error || 'Lỗi khi cho xe vào bãi',
                error: error
            };
        }
    }

    static async checkVehicleStatus(bienSoXe) {
        try {
            const response = await api.get(`/parking-transactions/check-vehicle-status/${bienSoXe}`);
            return {
                success: true,
                data: response.data
            };
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.error || 'Lỗi khi kiểm tra trạng thái xe',
                error: error
            };
        }
    }

    static async directVehicleExit(exitData) {
        try {
            const response = await api.post('/parking-transactions/direct-exit', exitData);
            // Backend trả về { statusCode, error, message, data: { success, soTienThanhToan, transaction, message } }
            return {
                success: true,
                data: response.data.data.transaction,
                message: response.data.data.message,
                soTienThanhToan: response.data.data.soTienThanhToan
            };
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || error.response?.data?.error || 'Lỗi khi cho xe ra bãi',
                error: error
            };
        }
    }

    static async getVehiclesInParking() {
        try {
            const allResponse = await this.getAllTransactions();
            if (allResponse.success) {
                // Filter chỉ lấy xe đang trong bãi (APPROVED_IN)
                const vehiclesInParking = allResponse.data.content.filter(t => 
                    t.trangThai === 'APPROVED_IN' && t.active === true
                );
                return {
                    success: true,
                    data: vehiclesInParking
                };
            }
            return {
                success: false,
                message: 'Không thể tải danh sách xe trong bãi'
            };
        } catch (error) {
            return {
                success: false,
                message: 'Lỗi khi tải danh sách xe trong bãi',
                error: error
            };
        }
    }

    static async calculateParkingFee(maGiaoDich) {
        try {
            const response = await api.get(`/parking-transactions/${maGiaoDich}/calculate-fee`);
            return response.data;
        } catch (error) {
            throw error;
        }
    }

    static async cancelTransaction(maGiaoDich) {
        try {
            const response = await api.post(`/parking-transactions/${maGiaoDich}/cancel`);
            return response.data;
        } catch (error) {
            throw error;
        }
    }

    static async getTransactionById(maGiaoDich) {
        try {
            const response = await api.get(`/parking-transactions/${maGiaoDich}`);
            return response.data;
        } catch (error) {
            throw error;
        }
    }

    static async getAllTransactions() {
        try {
            const response = await api.get('/parking-transactions');
            // Backend trả về { statusCode, error, message, data: [...] }
            const transactions = response.data.data || [];
            return {
                success: true,
                data: {
                    content: transactions,
                    totalPages: 1,
                    totalElements: transactions.length
                }
            };
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.error || 'Lỗi khi tải danh sách giao dịch',
                error: error
            };
        }
    }

    static async getTransactionsByVehicle(bienSoXe) {
        try {
            const response = await api.get(`/parking-transactions/vehicle/${bienSoXe}`);
            return response.data;
        } catch (error) {
            throw error;
        }
    }

    static async getVehicleStatus(bienSoXe) {
        try {
            const response = await api.get(`/parking-transactions/vehicle/${bienSoXe}/status`);
            return response.data;
        } catch (error) {
            throw error;
        }
    }

    static async getTodayCompletedTransactions() {
        try {
            const response = await api.get('/parking-transactions/completed/today');
            return response.data;
        } catch (error) {
            throw error;
        }
    }

    static async getRevenueStatistics(startDate = null, endDate = null) {
        try {
            const params = new URLSearchParams();
            if (startDate) params.append('startDate', startDate);
            if (endDate) params.append('endDate', endDate);
            
            const response = await api.get(`/parking-transactions/statistics/revenue?${params.toString()}`);
            return response.data;
        } catch (error) {
            throw error;
        }
    }

    static async getVehicleCountStatistics(startDate = null, endDate = null) {
        try {
            const params = new URLSearchParams();
            if (startDate) params.append('startDate', startDate);
            if (endDate) params.append('endDate', endDate);
            
            const response = await api.get(`/parking-transactions/statistics/vehicle-count?${params.toString()}`);
            return response.data;
        } catch (error) {
            throw error;
        }
    }

    static async countActiveTransactionsByParkingLot(maBaiDo) {
        try {
            const response = await api.get(`/parking-transactions/count/parking-lot/${maBaiDo}`);
            return response.data;
        } catch (error) {
            throw error;
        }
    }

    // Utility methods for transaction status display
    static getStatusText(status) {
        const statusMap = {
            'PENDING_IN': 'Chờ duyệt vào',
            'APPROVED_IN': 'Đã duyệt vào',
            'PENDING_OUT': 'Chờ duyệt ra',
            'COMPLETED': 'Hoàn thành',
            'CANCELLED': 'Hủy bỏ'
        };
        return statusMap[status] || status;
    }

    static getStatusColor(status) {
        const colorMap = {
            'PENDING_IN': 'bg-yellow-100 text-yellow-800',
            'APPROVED_IN': 'bg-green-100 text-green-800',
            'PENDING_OUT': 'bg-blue-100 text-blue-800',
            'COMPLETED': 'bg-gray-100 text-gray-800',
            'CANCELLED': 'bg-red-100 text-red-800'
        };
        return colorMap[status] || 'bg-gray-100 text-gray-800';
    }

    static formatCurrency(amount) {
        if (!amount) return '0 VNĐ';
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(amount);
    }

    static formatDateTime(dateTime) {
        if (!dateTime) return '';
        return new Date(dateTime).toLocaleString('vi-VN');
    }

    static calculateDuration(startTime, endTime) {
        if (!startTime) return '';
        const start = new Date(startTime);
        const end = endTime ? new Date(endTime) : new Date();
        const diffMs = end - start;
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
        return `${diffHours}h ${diffMinutes}m`;
    }

    // Method to get statistics for dashboard
    static async getStatistics() {
        try {
            // Get all transactions to calculate statistics
            const allResponse = await this.getAllTransactions();
            const allTransactions = allResponse.success ? allResponse.data.content : [];

            // Calculate statistics from real data
            const totalTransactions = allTransactions.length;
            
            // Count vehicles currently inside (APPROVED_IN status)
            const totalVehiclesInside = allTransactions.filter(t => 
                t.trangThai === 'APPROVED_IN'
            ).length;
            
            // Calculate today's revenue from completed transactions
            const today = new Date();
            const todayTransactions = allTransactions.filter(t => {
                if (!t.thoiGianRa || t.trangThai !== 'COMPLETED') return false;
                const transactionDate = new Date(t.thoiGianRa);
                return transactionDate.toDateString() === today.toDateString();
            });
            
            const totalRevenue = todayTransactions.reduce((sum, t) => {
                return sum + (t.soTienThanhToan ? parseFloat(t.soTienThanhToan) : 0);
            }, 0);

            // Calculate occupancy rate based on active vehicles and parking lot capacity
            // Get unique parking lots and their capacities
            const parkingLots = {};
            allTransactions.forEach(t => {
                if (t.parkingLot && t.trangThai === 'APPROVED_IN') {
                    const lotId = t.parkingLot.maBaiDo;
                    if (!parkingLots[lotId]) {
                        parkingLots[lotId] = {
                            totalCapacity: t.parkingLot.tongSoCho || 0,
                            occupiedSpaces: 0
                        };
                    }
                    parkingLots[lotId].occupiedSpaces++;
                }
            });

            // Calculate overall occupancy rate
            let totalCapacity = 0;
            let totalOccupied = 0;
            Object.values(parkingLots).forEach(lot => {
                totalCapacity += lot.totalCapacity;
                totalOccupied += lot.occupiedSpaces;
            });

            const occupancyRate = totalCapacity > 0 ? Math.round((totalOccupied / totalCapacity) * 100) : 0;

            return {
                success: true,
                data: {
                    totalTransactions,
                    totalVehiclesInside,
                    totalRevenue,
                    occupancyRate
                }
            };
        } catch (error) {
            console.error('Error in getStatistics:', error);
            return {
                success: true, // Return success with default data to avoid breaking UI
                data: {
                    totalTransactions: 0,
                    totalVehiclesInside: 0,
                    totalRevenue: 0,
                    occupancyRate: 0
                }
            };
        }
    }
}

export default ParkingTransactionService;
export const parkingTransactionService = ParkingTransactionService;
