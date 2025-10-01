# 🎯 Face Recognition System - Hệ thống Nhận diện Khuôn mặt

## 📋 Tổng quan

Hệ thống Face Recognition được tích hợp vào SM Parking với 4 chức năng chính:
- **Đăng ký khuôn mặt**: Thêm khuôn mặt mới vào hệ thống
- **Nhận diện khuôn mặt**: Xác định danh tính từ ảnh
- **So sánh khuôn mặt**: So sánh độ tương đồng giữa 2 khuôn mặt
- **Quản lý khuôn mặt**: Quản lý danh sách khuôn mặt đã đăng ký

## 🗂️ Cấu trúc thư mục

```
src/
├── pages/
│   ├── FaceRecognitionDemo.jsx      # Trang demo tổng quan
│   ├── FaceRegistrationPage.jsx     # Đăng ký khuôn mặt
│   ├── FaceRecognitionPage.jsx      # Nhận diện khuôn mặt
│   ├── FaceComparisonPage.jsx       # So sánh khuôn mặt
│   └── FaceManagementPage.jsx       # Quản lý khuôn mặt
├── services/
│   └── faceRecognitionService.js    # Service API integration
├── types/
│   └── faceRecognitionTypes.js      # Type definitions & utilities
└── components/
    └── common/
        └── ImageUpload.jsx          # Component upload ảnh
```

## 🚀 Routing

Các route đã được cấu hình trong `App.jsx`:

```jsx
// Face Recognition routes
/face-recognition-demo    → FaceRecognitionDemo
/face-registration       → FaceRegistrationPage  
/face-recognition        → FaceRecognitionPage
/face-comparison         → FaceComparisonPage
/face-management         → FaceManagementPage
```

## 🧭 Navigation

Menu Face Recognition đã được thêm vào `DashboardNavigation.jsx` với cấu trúc:

```
📱 SM Parking Dashboard
├── 🏠 Dashboard
├── 👥 Người dùng
├── 🚗 Xe
├── ... (các menu khác)
└── 👤 Nhận diện khuôn mặt
    ├── 🧪 Face Recognition Demo
    ├── 📋 Quản lý khuôn mặt
    ├── ➕ Đăng ký khuôn mặt
    ├── 🔍 Nhận diện khuôn mặt
    └── 🔄 So sánh khuôn mặt
```

## 🔌 API Integration

### Backend Endpoints

Hệ thống được thiết kế để tích hợp với Spring Boot backend:

```
POST   /api/v1/simple-face/test           # Test connection
GET    /api/v1/simple-face/health         # Health check
POST   /api/v1/simple-face/register       # Đăng ký khuôn mặt
POST   /api/v1/simple-face/recognize      # Nhận diện khuôn mặt
POST   /api/v1/simple-face/compare        # So sánh khuôn mặt
GET    /api/v1/simple-face/list           # Danh sách khuôn mặt
DELETE /api/v1/simple-face/{id}           # Xóa khuôn mặt
```

### Service Layer

`faceRecognitionService.js` cung cấp:

```javascript
// API Methods
testConnection()                    // Test API connection
registerFace(faceData)             // Đăng ký khuôn mặt
recognizeFace(imageData, threshold) // Nhận diện khuôn mặt
compareFaces(image1, image2)       // So sánh 2 khuôn mặt
listRegisteredFaces()              // Lấy danh sách khuôn mặt
deleteFace(faceId)                 // Xóa khuôn mặt

// File Upload Helpers
registerFaceFromFile(file, name, description)
recognizeFaceFromFile(file, threshold)
compareFacesFromFiles(file1, file2)
```

## 🎨 Components

### ImageUpload Component

Component reusable cho upload ảnh:

```jsx
<ImageUpload
  title="Tiêu đề"
  description="Mô tả"
  onImageSelect={handleImageSelect}
  onImageRemove={handleImageRemove}
  preview={imagePreview}
  error={error}
  loading={loading}
  disabled={disabled}
/>
```

**Features:**
- Drag & drop support
- Image preview
- File validation (type, size)
- Error handling
- Loading states

### NotificationToast Integration

Tất cả các trang đều tích hợp với hệ thống toast:

```javascript
import { useToast } from '../components/common/NotificationToast';

const toast = useToast();

// Success
toast?.showSuccess('Thành công', 'Tiêu đề', 'Chi tiết');

// Error  
toast?.showError('Lỗi', 'Tiêu đề', 'Chi tiết');

// Warning
toast?.showWarning('Cảnh báo', 'Tiêu đề', 'Chi tiết');
```

## 📊 Type System

`faceRecognitionTypes.js` cung cấp:

### Constants

```javascript
CONFIDENCE_LEVELS     // Cấp độ tin cậy
IMAGE_CONSTRAINTS     // Giới hạn ảnh (size, format)
SUPPORTED_FORMATS     // Format ảnh được hỗ trợ
```

### Validation Functions

```javascript
validateImageFile(file)           // Validate file ảnh
validatePersonData(data)          // Validate dữ liệu người
getConfidenceLevel(confidence)    // Lấy level tin cậy
formatConfidencePercentage(val)   // Format % tin cậy
```

## 🔧 Development Configuration

### DEV_CONFIG System

Hệ thống có cơ chế fallback cho development:

```javascript
// services/faceRecognitionService.js
const DEV_CONFIG = {
  useMockData: true,  // Dùng mock data khi API không available
  apiTimeout: 10000,  // Timeout cho API calls
  retryAttempts: 3    // Số lần retry
};
```

### Mock Data

Khi backend chưa sẵn sàng, hệ thống sử dụng mock data:

```javascript
// Mock responses cho development
mockRegisterResponse = { success: true, data: {...} }
mockRecognitionResponse = { success: true, data: {...} }
mockComparisonResponse = { success: true, data: {...} }
```

## 🎯 Tính năng chi tiết

### 1. FaceRegistrationPage
- Form đăng ký với validation
- Upload ảnh với preview
- Integration với ImageUpload component
- Success/Error handling với toast

### 2. FaceRecognitionPage  
- Upload ảnh cần nhận diện
- Slider điều chỉnh threshold
- Hiển thị kết quả chi tiết
- Confidence score visualization

### 3. FaceComparisonPage
- Upload 2 ảnh side-by-side
- So sánh độ tương đồng
- Progress bar hiển thị similarity
- Detailed comparison results

### 4. FaceManagementPage
- Danh sách khuôn mặt đã đăng ký
- Search & filter functionality
- Grid/List view modes
- Pagination support
- Bulk delete operations
- Sort by multiple criteria

### 5. FaceRecognitionDemo
- Trang tổng quan hệ thống
- Quick navigation đến các tính năng
- Hướng dẫn sử dụng
- System status display

## 🔒 Security & Validation

### Image Validation
- File size limit: 10MB
- Supported formats: JPG, JPEG, PNG, WEBP
- Dimension validation
- File type verification

### Data Validation
- Required field validation
- Name length limits
- Description length limits
- Confidence threshold ranges

## 📱 Responsive Design

Tất cả các trang đều responsive:
- Mobile-first approach
- Breakpoints: sm, md, lg, xl
- Touch-friendly interactions
- Adaptive layouts

## 🛠️ Cách sử dụng

### 1. Khởi động Development Server

```bash
cd SM_Parking
npm run dev
```

### 2. Truy cập ứng dụng

```
http://localhost:5173
```

### 3. Đăng nhập và Navigation

1. Đăng nhập vào hệ thống
2. Sử dụng sidebar navigation
3. Chọn "Nhận diện khuôn mặt" section
4. Bắt đầu với "Face Recognition Demo"

### 4. Workflow thông thường

1. **Demo Page** → Tìm hiểu hệ thống
2. **Đăng ký** → Thêm khuôn mặt mới
3. **Nhận diện** → Test nhận diện
4. **So sánh** → So sánh 2 ảnh
5. **Quản lý** → Xem và quản lý data

## 🐛 Troubleshooting

### Common Issues

1. **API Connection Failed**
   - Check backend server status
   - Verify API endpoints
   - Check network connectivity

2. **Image Upload Issues**
   - Verify file format (JPG, PNG, WEBP)
   - Check file size < 10MB
   - Ensure valid image file

3. **Toast Notifications Not Working**
   - Verify ToastProvider wrapper
   - Check import statements
   - Ensure useToast hook usage

### Debug Mode

Để bật debug mode:

```javascript
// Trong faceRecognitionService.js
const DEV_CONFIG = {
  useMockData: true,    // Bật mock data
  debug: true,          // Bật console logs
  verboseLogging: true  // Chi tiết logs
};
```

## 🚀 Production Deployment

### Checklist trước khi deploy

- [ ] Cấu hình backend API URLs
- [ ] Tắt mock data mode
- [ ] Test tất cả tính năng
- [ ] Verify responsive design
- [ ] Check error handling
- [ ] Test with real backend

### Environment Variables

```env
VITE_API_BASE_URL=https://your-backend-api.com
VITE_FACE_RECOGNITION_ENDPOINT=/api/v1/simple-face
```

## 📈 Future Enhancements

### Planned Features
- [ ] Batch face registration
- [ ] Advanced search filters
- [ ] Face recognition analytics
- [ ] Export/Import face data
- [ ] Real-time face detection
- [ ] Integration with camera
- [ ] Face matching history
- [ ] User permission management

### Technical Improvements
- [ ] Add unit tests
- [ ] Implement caching
- [ ] Optimize image processing
- [ ] Add offline support
- [ ] Performance monitoring
- [ ] Error tracking integration

## 📞 Support

Nếu gặp vấn đề, hãy kiểm tra:

1. **Console Errors**: F12 → Console tab
2. **Network Tab**: Kiểm tra API calls
3. **Component State**: React DevTools
4. **Backend Logs**: Server console

---

**🎉 Hệ thống Face Recognition đã sẵn sàng sử dụng!**

Truy cập `http://localhost:5173/face-recognition-demo` để bắt đầu khám phá.