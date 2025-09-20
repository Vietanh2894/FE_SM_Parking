# Chức năng Quản lý Giao dịch Đỗ xe

## Tổng quan
Chức năng quản lý giao dịch đỗ xe được phát triển dựa trên API backend Spring Boot, hỗ trợ đầy đủ các thao tác quản lý xe vào/ra bãi đỗ với giao diện Tailwind CSS hiện đại.

## Các tính năng chính

### 1. Trang quản lý giao dịch (`ParkingTransactionPage`)
- **Đường dẫn**: `/parking-transactions`
- **Chức năng**:
  - Xem danh sách tất cả giao dịch với phân trang
  - Lọc theo trạng thái (Chờ duyệt vào, Chờ duyệt ra, Hoàn thành, v.v.)
  - Tìm kiếm theo biển số xe, mã bãi đỗ
  - Thao tác nhanh: Cho xe vào, Cho xe ra, Kiểm tra trạng thái xe
  - Duyệt giao dịch vào/ra trực tiếp từ bảng

### 2. Trang thống kê (`ParkingStatisticsPage`)
- **Đường dẫn**: `/parking-statistics`
- **Chức năng**:
  - Thống kê doanh thu theo khoảng thời gian
  - Thống kê số lượt xe theo loại
  - Báo cáo giao dịch hoàn thành trong ngày
  - Chọn khoảng thời gian linh hoạt (hôm nay, 7 ngày, 30 ngày, tùy chỉnh)

## Các Modal chức năng

### 1. VehicleEntryModal - Cho xe vào bãi đỗ
- Kiểm tra trạng thái xe (đăng ký tháng, đang đỗ)
- Chọn loại xe và bãi đỗ tương ứng
- Tự động lọc bãi đỗ theo loại xe
- Hiển thị thông báo xe có đăng ký tháng (miễn phí)

### 2. VehicleExitModal - Cho xe ra bãi đỗ
- Kiểm tra xe có đang đỗ trong bãi
- Tính phí tự động dựa trên thời gian đỗ
- Hiển thị thông tin giao dịch chi tiết
- Hỗ trợ nhập phí thủ công hoặc tính tự động

### 3. VehicleStatusModal - Kiểm tra trạng thái xe
- Tab "Trạng thái hiện tại": Xem xe có đang đỗ, đăng ký tháng
- Tab "Lịch sử giao dịch": Xem lịch sử tháng gần đây
- Hiển thị thông tin chi tiết từng giao dịch

### 4. ApproveExitModal - Duyệt xe ra và thanh toán
- Dành cho duyệt giao dịch chờ ra
- Tính phí tự động hoặc nhập thủ công
- Hiển thị thông tin giao dịch đầy đủ

## API Services

### ParkingTransactionService
Tất cả các method tương ứng với API backend:

```javascript
// Thao tác cơ bản
createEntryRequest(requestData)          // Tạo yêu cầu vào
directVehicleEntry(entryData)           // Cho xe vào trực tiếp
directVehicleExit(exitData)             // Cho xe ra trực tiếp
approveEntry(maGiaoDich)                // Duyệt xe vào
approveExit(maGiaoDich, paymentData)    // Duyệt xe ra
cancelTransaction(maGiaoDich)           // Hủy giao dịch

// Kiểm tra và tính toán
checkVehicleStatus(bienSoXe)            // Kiểm tra trạng thái xe
getVehicleStatus(bienSoXe)              // Lấy trạng thái đỗ xe
calculateParkingFee(maGiaoDich)         // Tính phí đỗ xe

// Truy vấn dữ liệu
getAllTransactions()                    // Tất cả giao dịch
getPendingInTransactions()              // Chờ duyệt vào
getPendingOutTransactions()             // Chờ duyệt ra
getTodayCompletedTransactions()         // Hoàn thành hôm nay
getTransactionsByVehicle(bienSoXe)      // Lịch sử theo xe

// Thống kê
getRevenueStatistics(startDate, endDate)           // Doanh thu
getVehicleCountStatistics(startDate, endDate)      // Số lượt xe
countActiveTransactionsByParkingLot(maBaiDo)       // Số xe trong bãi
```

## Cách sử dụng

### 1. Thêm vào routing
```javascript
import { ParkingTransactionPage, ParkingStatisticsPage } from './pages';

// Trong routing config
{
  path: '/parking-transactions',
  element: <ParkingTransactionPage />
},
{
  path: '/parking-statistics', 
  element: <ParkingStatisticsPage />
}
```

### 2. Thêm vào navigation menu
```javascript
// Trong DashboardNavigation component
const menuItems = [
  // ... existing items
  {
    icon: '🚗',
    label: 'Giao dịch đỗ xe',
    path: '/parking-transactions'
  },
  {
    icon: '📊',
    label: 'Thống kê đỗ xe',
    path: '/parking-statistics'
  }
];
```

## Giao diện và UX

### Thiết kế Tailwind CSS
- **Responsive**: Tối ưu cho desktop, tablet, mobile
- **Loading states**: Spinner và disabled states
- **Error handling**: Toast notifications và inline errors
- **Color scheme**: Blue primary, Green success, Red error, Orange warning
- **Icons**: Emoji icons cho dễ nhận diện

### Trạng thái giao dịch
- 🟡 **PENDING_IN**: Chờ duyệt vào
- 🟢 **APPROVED_IN**: Đã duyệt vào (đang đỗ)
- 🔵 **PENDING_OUT**: Chờ duyệt ra
- 🟣 **COMPLETED**: Hoàn thành
- 🔴 **CANCELLED**: Hủy bỏ

### Tính năng nổi bật
- **Auto-refresh**: Tự động làm mới sau thao tác
- **Smart filtering**: Lọc bãi đỗ theo loại xe
- **Fee calculation**: Tính phí tự động theo thời gian
- **Monthly registration**: Hiển thị xe đăng ký tháng
- **Quick actions**: Thao tác nhanh từ danh sách

## API Backend tương ứng

Chức năng này tương ứng với các endpoints:

```
POST   /parking-transactions/entry-request
POST   /parking-transactions/direct-entry  
POST   /parking-transactions/direct-exit
GET    /parking-transactions/check-vehicle-status/{bienSoXe}
POST   /parking-transactions/{id}/approve-entry
POST   /parking-transactions/{id}/approve-exit
GET    /parking-transactions/{id}/calculate-fee
POST   /parking-transactions/{id}/cancel
GET    /parking-transactions
GET    /parking-transactions/pending-in
GET    /parking-transactions/pending-out
GET    /parking-transactions/completed/today
GET    /parking-transactions/statistics/revenue
GET    /parking-transactions/statistics/vehicle-count
```

## Lưu ý
- Cần có token authentication trong localStorage
- API base URL được cấu hình trong `api.js`
- Toast notification component cần được import
- DashboardNavigation component cần được cập nhật menu
