# 📊 SM Parking - Báo Cáo Dự Án Frontend Chi Tiết

## 🎯 **TỔNG QUAN DỰ ÁN**

**Tên dự án**: SM Parking - Smart Parking Management System  
**Công nghệ**: React + Vite + Tailwind CSS  
**Phiên bản**: 0.0.0  
**Loại**: Single Page Application (SPA)  
**Backend API**: Spring Boot (localhost:8080)  

### 🏗️ **Kiến trúc dự án**
- **Frontend Framework**: React 19.1.1 với JSX
- **Build Tool**: Vite 7.1.2 (thay thế Create React App)
- **CSS Framework**: Tailwind CSS 3.4.0
- **HTTP Client**: Axios 1.11.0
- **Routing**: React Router DOM 7.8.1
- **Icons**: Heroicons/React 2.0.18 + React Icons 5.5.0
- **State Management**: React Hooks (useState, useEffect)

---

## 📁 **CẤU TRÚC DỰ ÁN**

### **Thư mục gốc**
```
SM_Parking/
├── 📄 package.json                     # Cấu hình dependencies và scripts
├── 📄 index.html                       # Entry point HTML
├── 📄 vite.config.js                   # Cấu hình Vite build tool
├── 📄 tailwind.config.js               # Cấu hình Tailwind CSS
├── 📄 postcss.config.js                # Cấu hình PostCSS
├── 📄 eslint.config.js                 # Cấu hình ESLint
├── 📄 .gitignore                       # Git ignore rules
├── 📁 public/                          # Static assets
└── 📁 src/                             # Source code chính
```

### **Thư mục src/**
```
src/
├── 📄 main.jsx                         # React app entry point
├── 📄 App.jsx                          # Main app component với routing
├── 📄 index.css                        # Global CSS styles
├── 📁 assets/                          # Static resources
├── 📁 components/                      # Reusable UI components
├── 📁 hooks/                           # Custom React hooks
├── 📁 layouts/                         # Layout components
├── 📁 pages/                           # Page components
├── 📁 services/                        # API service layers
├── 📁 styles/                          # CSS files
├── 📁 types/                           # Type definitions & utilities
└── 📁 utils/                           # Utility functions
```

---

## 🔧 **DEPENDENCIES & PACKAGES**

### **Production Dependencies**
- `react`: 19.1.1 - Core React library
- `react-dom`: 19.1.1 - React DOM rendering
- `react-router-dom`: 7.8.1 - Client-side routing
- `axios`: 1.11.0 - HTTP client for API calls
- `@heroicons/react`: 2.0.18 - Heroicons icon library
- `react-icons`: 5.5.0 - Popular icon library
- `tailwindcss`: 3.4.0 - Utility-first CSS framework

### **Development Dependencies**
- `vite`: 7.1.2 - Fast build tool
- `@vitejs/plugin-react`: 5.0.0 - Vite React plugin
- `eslint`: 9.33.0 - JavaScript linter
- `autoprefixer`: 10.4.21 - CSS vendor prefixing
- `postcss`: 8.5.6 - CSS post-processor

---

## 🎨 **COMPONENTS ARCHITECTURE**

### **📁 components/common/** - Shared Components
```
common/
├── AuthStatusCard.jsx                  # Authentication status display
├── ConfirmationPopup.jsx               # Generic confirmation dialog
├── DashboardNavigation.jsx             # Main navigation sidebar
├── ImageUpload.jsx                     # File upload with preview
├── LogoutConfirmation.jsx              # Logout confirmation dialog
├── NotificationToast.jsx               # Toast notification system
├── Pagination.jsx                      # Table pagination component
├── PendingRequestList.jsx              # Pending requests display
├── ProtectedRoute.jsx                  # Route protection wrapper
├── QuickCheckActiveStatus.jsx          # Quick status check
├── RegistrationCard.jsx                # Registration info card
└── Toast.jsx                           # Toast message component
```

### **📁 components/modals/** - Modal Components (47+ files)
```
modals/
├── 🆕 CreateVehicleModal.jsx           # Tạo xe mới
├── 🆕 CreateMonthlyRegistrationModal.jsx # Yêu cầu đăng ký tháng
├── ExtensionRequestModal.jsx           # Yêu cầu gia hạn đăng ký
├── AddAccountModal.jsx                 # Thêm tài khoản mới
├── AddDangKyThangModal.jsx             # Thêm đăng ký tháng
├── AddParkingLotModal.jsx              # Thêm bãi đỗ xe
├── AddStaffModal.jsx                   # Thêm nhân viên
├── AddUserModal.jsx                    # Thêm người dùng
├── AddVehicleModal.jsx                 # Thêm xe
├── ApproveExitModal.jsx                # Duyệt xe ra
├── VehicleEntryModal.jsx               # Cho xe vào bãi
├── VehicleExitModal.jsx                # Cho xe ra bãi
├── VehicleStatusModal.jsx              # Kiểm tra trạng thái xe
└── ... (30+ edit modals)               # Các modal chỉnh sửa
```

### **📁 components/examples/**
```
examples/
└── ResponsivePageExample.jsx           # Example responsive page
```

---

## 📄 **PAGES ARCHITECTURE**

### **🏠 Core Pages**
```
pages/
├── HomePage.jsx                        # Landing page after login
├── LoginPage.jsx                       # Authentication page
├── DashboardPage.jsx                   # Admin dashboard (staff)
└── UserDashboardPage.jsx               # User dashboard (customer)
```

### **👥 Management Pages**
```
├── AccountPage.jsx                     # Quản lý tài khoản
├── UserPage.jsx                        # Quản lý người dùng
├── StaffPage.jsx                       # Quản lý nhân viên
├── RolePage.jsx                        # Quản lý vai trò
├── VehiclePage.jsx                     # Quản lý xe
├── VehicleTypePage.jsx                 # Quản lý loại xe
├── DangKyThangPage.jsx                 # Quản lý đăng ký tháng
├── ParkingLotPage.jsx                  # Quản lý bãi đỗ xe
├── ParkingModePage.jsx                 # Quản lý chế độ đỗ xe
├── ParkingTransactionPage.jsx          # Quản lý giao dịch đỗ xe
├── ParkingStatisticsPage.jsx           # Thống kê bãi đỗ xe
└── PricePage.jsx                       # Quản lý giá cả
```

### **👤 Face Recognition Pages**
```
├── FaceRecognitionDemo.jsx             # Demo tổng quan
├── FaceRegistrationPage.jsx            # Đăng ký khuôn mặt
├── FaceRecognitionPage.jsx             # Nhận diện khuôn mặt
├── FaceComparisonPage.jsx              # So sánh khuôn mặt
├── FaceManagementPage.jsx              # Quản lý khuôn mặt
└── FaceApiTestPage.jsx                 # Test Face API
```

---

## 🔌 **SERVICES LAYER**

### **API Services**
```
services/
├── api.js                              # Base API configuration
├── authService.js                      # Authentication & authorization
├── userDashboardService.js             # User dashboard APIs
├── accountService.js                   # Account management
├── userService.js                      # User CRUD operations
├── staffService.js                     # Staff management
├── roleService.js                      # Role management
├── vehicleService.js                   # Vehicle management
├── vehicleTypeService.js               # Vehicle type management
├── dangKyThangService.js               # Monthly registration
├── parkingTransactionService.js        # Parking transactions
├── faceRecognitionService.js           # Face Recognition APIs
└── index.js                            # Service exports
```

### **Key Service Features**
- **JWT Token Management**: Tự động thêm token vào headers
- **Request/Response Interceptors**: Xử lý lỗi 401/403 tự động
- **Error Handling**: Standardized error response format
- **Mock Data Support**: Fallback khi backend không khả dụng

---

## 🛠️ **UTILITIES & CONFIGURATION**

### **📁 utils/**
```
utils/
├── constants.js                        # App constants & enums
├── helpers.js                          # Utility functions
└── devConfig.js                        # Development configuration
```

### **📁 types/**
```
types/
├── index.js                            # Type exports
├── extensionTypes.js                   # Extension request types
└── faceRecognitionTypes.js             # Face Recognition types
```

### **📁 hooks/**
```
hooks/
├── useAuth.js                          # Authentication hook
└── useModal.js                         # Modal management hook
```

### **📁 layouts/**
```
layouts/
├── index.js                            # Layout exports
└── DashboardLayout.jsx                 # Main dashboard layout
```

---

## 🎨 **STYLING SYSTEM**

### **CSS Architecture**
```
styles/
├── DashboardLayout.css                 # Dashboard layout styles
├── DashboardNavigation.css             # Navigation styles
├── DashboardPage.css                   # Dashboard page styles
├── DashboardSections.css               # Dashboard sections
├── HomePage.css                        # Home page styles
└── LoginPage.css                       # Login page styles
```

### **Tailwind CSS Configuration**
- **Utility-first approach**: Sử dụng Tailwind utilities
- **Custom colors**: Brand color palette
- **Responsive design**: Mobile-first breakpoints
- **Component-based styling**: Reusable style patterns

---

## 🔒 **AUTHENTICATION & AUTHORIZATION**

### **Authentication Flow**
1. **Unified Login**: Hỗ trợ cả User và Staff login
2. **JWT Token**: Stored in localStorage
3. **Auto-logout**: Khi token expired (401/403)
4. **Route Protection**: ProtectedRoute wrapper
5. **Role-based Access**: User vs Staff permissions

### **User Types**
- **USER**: Customer - access to UserDashboardPage
- **STAFF**: Admin - access to full dashboard

### **Protected Routes**
- Tất cả routes (trừ `/login`) đều require authentication
- Auto-redirect to `/login` when not authenticated
- Auto-redirect based on user type after login

---

## 🗄️ **STATE MANAGEMENT**

### **State Architecture**
- **Local State**: React useState cho component state
- **Global State**: Service layer + localStorage
- **Form State**: Controlled components với validation
- **Modal State**: Centralized modal management
- **Loading State**: Per-component loading indicators

### **Data Flow**
```
Component → Service → API → Backend
    ↓         ↓       ↓       ↓
   UI    → Cache  → Axios → Spring Boot
```

---

## 🚀 **ROUTING SYSTEM**

### **Route Structure**
```jsx
Routes:
├── / → redirect to /login
├── /login → LoginPage
├── /home → HomePage (protected)
├── /dashboard → DashboardPage (staff)
├── /user/dashboard → UserDashboardPage (user)
├── /users → UserPage (staff)
├── /vehicles → VehiclePage (staff)
├── /vehicle-types → VehicleTypePage (staff)
├── /parking-lots → ParkingLotPage (staff)
├── /staff → StaffPage (staff)
├── /accounts → AccountPage (staff)
├── /roles → RolePage (staff)
├── /parking-transactions → ParkingTransactionPage (staff)
├── /dang-ky-thang → DangKyThangPage (staff)
├── /face-recognition-demo → FaceRecognitionDemo
├── /face-registration → FaceRegistrationPage
├── /face-recognition → FaceRecognitionPage
├── /face-comparison → FaceComparisonPage
├── /face-management → FaceManagementPage
└── /* → redirect to /login
```

---

## 🎪 **CHỨC NĂNG CHÍNH**

### **👤 User Dashboard Features**
```
UserDashboardPage:
├── 📊 Dashboard Overview
│   ├── Thống kê tổng quan (xe, đăng ký, số tiền)
│   ├── Danh sách yêu cầu chờ xử lý
│   └── Quick actions
├── 🚗 Xe của tôi
│   ├── Danh sách xe sở hữu
│   ├── ➕ Tạo xe mới (CreateVehicleModal)
│   ├── 📝 Yêu cầu đăng ký tháng (CreateMonthlyRegistrationModal)
│   └── 📋 Lịch sử đăng ký theo xe
└── 🔄 Gia hạn đăng ký
    ├── ExtensionRequestModal
    └── RegistrationCard với chức năng gia hạn
```

### **🎯 Face Recognition System**
```
Face Recognition Features:
├── 🧪 Demo & Testing
├── 📋 Face Management (CRUD)
├── ➕ Face Registration 
├── 🔍 Face Recognition
└── 🔄 Face Comparison
```

### **🏢 Staff Management Features**
```
Staff Dashboard:
├── 👥 Quản lý người dùng, nhân viên
├── 🚗 Quản lý xe, loại xe
├── 🏢 Quản lý bãi đỗ, chế độ đỗ xe
├── 💰 Quản lý giá cả
├── 📝 Quản lý đăng ký tháng
├── 🚦 Quản lý giao dịch đỗ xe
├── 📊 Thống kê & báo cáo
└── 🔐 Quản lý tài khoản, quyền
```

---

## 📡 **API INTEGRATION**

### **Backend Endpoints**
```
Base URL: http://localhost:8080

Authentication:
├── POST /login                         # Unified login

User APIs:
├── GET /user/dashboard                 # User dashboard data
├── POST /user/request-extension        # Request extension
├── POST /user/vehicles                 # Create vehicle
└── POST /user/monthly-registration-request # Request registration

Face Recognition APIs:
├── POST /api/v1/simple-face/register   # Register face
├── POST /api/v1/simple-face/recognize  # Recognize face
├── POST /api/v1/simple-face/compare    # Compare faces
├── GET /api/v1/simple-face/list        # List faces
└── DELETE /api/v1/simple-face/{id}     # Delete face

Management APIs:
├── CRUD /users                         # User management
├── CRUD /vehicles                      # Vehicle management
├── CRUD /vehicle-types                 # Vehicle type management
├── CRUD /staff                         # Staff management
├── CRUD /accounts                      # Account management
├── CRUD /roles                         # Role management
├── CRUD /parking-lots                  # Parking lot management
├── CRUD /dang-ky-thang                 # Monthly registration
└── CRUD /parking-transactions          # Transaction management
```

### **Response Format**
```javascript
// Standard API Response
{
  statusCode: 200,
  message: "Success message",
  error: null,
  data: { ... }
}

// Error Response
{
  statusCode: 400/401/403/500,
  message: "Error message",
  error: "ERROR_CODE",
  data: null
}
```

---

## 🛡️ **ERROR HANDLING & VALIDATION**

### **Error Handling Strategy**
- **API Errors**: Interceptors tự động xử lý 401/403
- **Network Errors**: Fallback to mock data khi có thể
- **Form Validation**: Client-side validation với error display
- **User Feedback**: Toast notifications cho success/error states

### **Validation System**
- **Form Validation**: Real-time validation với error messages
- **File Upload**: Size, type validation cho image uploads
- **Data Validation**: Type checking và sanitization
- **Server Validation**: Backend validation error handling

---

## 🔧 **DEVELOPMENT CONFIGURATION**

### **Development Features**
```javascript
// devConfig.js
DEV_CONFIG = {
  USE_MOCK_DATA: false,           # Toggle mock data
  ENABLE_API_CALLS: true,         # Toggle API calls
  ENABLE_CONSOLE_LOGS: true,      # Toggle debug logs
  SHOW_API_ERRORS: true,          # Toggle error logs
  API_BASE_URL: 'localhost:8080', # Backend URL
  MOCK_DATA: { ... }              # Fallback data
}
```

### **Build Configuration**
- **Vite**: Fast HMR development server
- **ESLint**: Code quality enforcement
- **PostCSS**: CSS processing pipeline
- **Tailwind**: JIT compilation

---

## 📱 **RESPONSIVE DESIGN**

### **Breakpoint Strategy**
- **Mobile First**: Base styles for mobile
- **Tailwind Breakpoints**: sm, md, lg, xl, 2xl
- **Grid System**: CSS Grid và Flexbox
- **Component Responsiveness**: Adaptive layouts

### **Mobile Optimizations**
- Touch-friendly buttons (min 44px)
- Readable font sizes (16px+)
- Optimized images
- Mobile navigation patterns

---

## 🧪 **TESTING & DEBUGGING**

### **Development Tools**
- **Console Logging**: Structured debug logs
- **Error Boundaries**: React error catching
- **API Testing**: Built-in API test pages
- **Mock Data**: Development fallback data

### **Debug Features**
- Face API tester component
- Development mode indicators
- API response logging
- Error state visualization

---

## 📈 **PERFORMANCE OPTIMIZATIONS**

### **Bundle Optimization**
- **Vite**: Fast build và HMR
- **Code Splitting**: Route-based splitting
- **Tree Shaking**: Unused code elimination
- **Asset Optimization**: Image và static asset handling

### **Runtime Performance**
- **Lazy Loading**: Component lazy loading
- **Memoization**: React.memo cho expensive components
- **Efficient Re-renders**: Proper state management
- **API Caching**: Service-level caching

---

## 🚀 **DEPLOYMENT & BUILD**

### **Build Scripts**
```json
{
  "dev": "vite",                  # Development server
  "build": "vite build",          # Production build
  "lint": "eslint .",             # Code linting
  "preview": "vite preview"       # Preview build
}
```

### **Production Considerations**
- **Environment Variables**: API endpoints configuration
- **Asset Optimization**: Minification, compression
- **Browser Compatibility**: Modern browser support
- **SEO Optimization**: Meta tags, structured data

---

## 📚 **DOCUMENTATION FILES**

### **Project Documentation**
```
├── README.md                           # Basic project info
├── FACE_RECOGNITION_README.md          # Face Recognition system guide
├── PARKING_TRANSACTION_FEATURE.md      # Parking transaction features
├── RESPONSIVE_OPTIMIZATION_GUIDE.md    # Responsive design guide
└── UNIFIED_LOGIN_CHANGES.js            # Login system changes log
```

---

## 🔮 **FUTURE ENHANCEMENTS**

### **Planned Features**
- **Real-time Updates**: WebSocket integration
- **PWA Support**: Service workers, offline support
- **Advanced Analytics**: Dashboard analytics
- **Multi-language**: i18n internationalization
- **Theme System**: Dark/light mode support

### **Technical Improvements**
- **TypeScript Migration**: Type safety
- **State Management**: Redux/Zustand integration
- **Testing Suite**: Jest + React Testing Library
- **CI/CD Pipeline**: Automated deployment
- **Performance Monitoring**: Error tracking

---

## 🎯 **CONCLUSION**

SM Parking là một hệ thống quản lý bãi đỗ xe hiện đại với kiến trúc frontend React hoàn chỉnh, tích hợp đầy đủ các tính năng:

✅ **Authentication & Authorization** hoàn chỉnh  
✅ **User & Staff Dashboard** với UX tối ưu  
✅ **Face Recognition System** tích hợp  
✅ **Parking Transaction Management** đầy đủ  
✅ **Responsive Design** cho mọi thiết bị  
✅ **Modern Tech Stack** với best practices  
✅ **Comprehensive API Integration** với Spring Boot backend  
✅ **Extensible Architecture** cho future development  

Dự án sử dụng những công nghệ hiện đại nhất và tuân thủ các best practices của React development, tạo nền tảng vững chắc cho việc mở rộng và bảo trì trong tương lai.

---

**📅 Ngày tạo báo cáo**: October 3, 2025  
**👨‍💻 Phân tích bởi**: AI Assistant  
**🔄 Trạng thái**: Active Development  
**📝 Version**: 1.0.0