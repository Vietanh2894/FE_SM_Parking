# 🎯 FACE RECOGNITION INTEGRATION GUIDE

## 📋 **TỔNG QUAN**

Hệ thống đã được cải tiến để tích hợp **Face Recognition** vào quy trình:
- ✅ **Đăng ký tháng** (lưu khuôn mặt chủ xe)
- ✅ **Xe vào** (xác thực khuôn mặt)  
- ✅ **Xe ra** (xác thực khuôn mặt)

## 🏗️ **KIẾN TRÚC TÍCH HỢP**

```
Mobile App → Spring Boot → SimpleFaceRecognitionService → Python FastAPI
     ↓             ↓                    ↓                      ↓
   GUI        Business Logic      HTTP Client            AI Processing
              + Database         (RestTemplate)         (YOLOv8 + InsightFace)
```

## 📊 **DATABASE CHANGES**

### **Bảng `dang_ky_thang`** - Thêm 3 cột:
- `face_id` VARCHAR(100) - ID khuôn mặt từ FastAPI
- `face_similarity` DECIMAL(5,3) - Độ tương đồng (0.000-1.000)  
- `face_registered_date` DATETIME - Thời gian đăng ký khuôn mặt

### **Bảng `parking_transactions`** - Thêm 5 cột:
- `face_id_entry` VARCHAR(100) - ID khuôn mặt khi xe vào
- `face_id_exit` VARCHAR(100) - ID khuôn mặt khi xe ra
- `face_similarity_entry` DECIMAL(5,3) - Độ tương đồng khi vào
- `face_similarity_exit` DECIMAL(5,3) - Độ tương đồng khi ra
- `face_verification_status` VARCHAR(20) - Trạng thái xác thực

### **Face Verification Status Values:**
- `NOT_VERIFIED` - Chưa xác thực
- `VERIFIED_ENTRY` - Đã xác thực vào
- `VERIFIED_EXIT` - Đã xác thực ra  
- `VERIFIED_BOTH` - Đã xác thực cả vào và ra
- `FAILED_ENTRY` - Xác thực vào thất bại
- `FAILED_EXIT` - Xác thực ra thất bại
- `BYPASSED` - Bỏ qua xác thực

## 🚀 **API ENDPOINTS MỚI**

### **1. Đăng Ký Tháng với Face Recognition**

```http
POST /dang-ky-thang/with-face
Content-Type: application/json
{
  "bienSoXe": "13-123.45",
  "tenXe": "Honda Wave",
  "maNhanVien": "NV001",
  "soThang": 2,
  "cccd": "101951780952",
  "soCavet": "CV909216356",
  "diaChi": "123 Nguyễn Văn A, Quận 1, TPHCM",
  "email": "usertest7@gmail.com",
  "soDienThoai": "0889205597",
  "maLoaiXe": "LX001",
  "enableFaceRecognition": true,
  "faceImageBase64": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAASABIAAD..."
}
```

**Response:**
```json
{
    "statusCode": 201,
    "error": null,
    "message": "CALL API SUCCESS",
    "data": {
        "faceRecognitionEnabled": true,
        "faceSimilarity": 0,
        "dangKyThang": {
            "id": 60,
            "bienSoXe": "13-123.45",
            "vehicle": {
                "bienSoXe": "13-123.45",
                "tenXe": "Honda Wave",
                "soCavet": "CV909216356",
                "maLoaiXe": {
                    "maLoaiXe": "LX001",
                    "tenLoaiXe": "Xe máy"
                },
                "createdDate": "2025-10-04T22:30:28.0357744",
                "owner": {
                    "id": 36,
                    "name": "Chủ xe 13-123.45",
                    "email": "usertest7@gmail.com",
                    "password": "$2a$10$2Q2PuaqBuuvwfSywsxpxKOK6iFWOqBKd5JoeQrjkQPOmv1XB9fUV6",
                    "cccd": "101951780952",
                    "sdt": "0889205597",
                    "diaChi": "123 Nguyễn Văn A, Quận 1, TPHCM",
                    "createdDate": "2025-10-04T22:30:28.0269495",
                    "updatedDate": "2025-10-04T22:30:28.0269495"
                }
            },
            "nhanVienTao": {
                "maNV": "NV001",
                "hoTen": "Tao tên Admin",
                "sdt": "0901234567",
                "email": "admin@test.com",
                "cccd": "123456789012",
                "chucVu": "ADMIN",
                "ngayVaoLam": "2024-01-15",
                "account": {
                    "username": "admin001",
                    "password": "$2a$10$7HflaOoqsC6lV26VvfGL3OP12hoIrg42FlhEUpet9kYUpbsVInSBS",
                    "trangThai": "ENABLE",
                    "role": {
                        "roleId": "ADMIN",
                        "roleName": "Quản trị viên"
                    },
                    "createdDate": "2025-08-24T20:57:19.322953",
                    "updatedDate": "2025-08-25T11:18:01.230539",
                    "active": true
                },
                "createdDate": "2025-08-24T20:59:01.756041",
                "updatedDate": "2025-08-25T07:36:04.05127",
                "admin": true,
                "baoVe": false,
                "activeAccount": true
            },
            "soThang": 2,
            "cccd": "101951780952",
            "soCavet": "CV909216356",
            "diaChi": "123 Nguyễn Văn A, Quận 1, TPHCM",
            "loaiXe": {
                "maLoaiXe": "LX001",
                "tenLoaiXe": "Xe máy"
            },
            "thoiGianBatDau": "2025-10-04T22:30:28.0357744",
            "thoiGianHetHan": "2025-12-04T22:30:28.0357744",
            "trangThai": "PENDING",
            "createdDate": "2025-10-04T22:30:28.0418052",
            "updatedDate": "2025-10-04T22:30:28.5294541",
            "ghiChu": null,
            "soTienThanhToan": 240000.00,
            "trangThaiThanhToan": "PENDING",
            "parentId": null,
            "lanGiaHan": 0,
            "faceId": "16",
            "faceSimilarity": 0,
            "faceRegisteredDate": "2025-10-04T22:30:28.5284455",
            "active": false,
            "root": true,
            "expired": false,
            "pending": true,
            "extension": false
        },
        "faceId": "16",
        "faceRegistrationSuccess": true,
        "message": "Đăng ký tháng và khuôn mặt thành công"
    }
}
```

### **2. Xe Vào với Face Recognition**

```http
POST /parking-transactions/direct-entry-with-face
Content-Type: application/json

{
  "bienSoXe": "30A-123.45",
  "maBaiDo": "P001",
  "maLoaiXe": "LX001",
  "faceImageBase64": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAASABIAAD..."
}
```

**Response:**
```json
{
    "statusCode": 201,
    "error": null,
    "message": "CALL API SUCCESS",
    "data": {
        "success": true,
        "faceSimilarityEntry": 1.0,
        "message": "Xe đã được cho vào bãi đỗ với xác thực khuôn mặt thành công",
        "faceVerificationStatus": "VERIFIED_ENTRY",
        "transaction": {
            "maGiaoDich": 33,
            "bienSoXe": "13-123.45",
            "parkingLot": {
                "maBaiDo": "P001",
                "tenBaiDo": "Bãi đỗ xe máy",
                "soChoTrong": 77,
                "tongSoCho": 100,
                "maLoaiXe": {
                    "maLoaiXe": "LX001",
                    "tenLoaiXe": "Xe máy"
                },
                "diaChi": "456 Đường Cách Mạng Tháng 8, Quận 3, TP.HCM",
                "moTa": "Bãi đỗ xe máy tại siêu thị BigC",
                "trangThai": "ACTIVE",
                "createdDate": "2025-08-23T21:35:30.604167",
                "updatedDate": "2025-10-04T22:33:09.7472931",
                "occupancyRate": 23.0
            },
            "vehicleType": {
                "maLoaiXe": "LX001",
                "tenLoaiXe": "Xe máy"
            },
            "thoiGianVao": "2025-10-04T22:33:09.4045731",
            "thoiGianRa": null,
            "trangThai": "APPROVED_IN",
            "soTienThanhToan": null,
            "soTien": 0,
            "nhanVienVao": {
                "maNV": "NV001",
                "hoTen": "Tao tên Admin",
                "sdt": "0901234567",
                "email": "admin@test.com",
                "cccd": "123456789012",
                "chucVu": "ADMIN",
                "ngayVaoLam": "2024-01-15",
                "account": {
                    "username": "admin001",
                    "password": "$2a$10$7HflaOoqsC6lV26VvfGL3OP12hoIrg42FlhEUpet9kYUpbsVInSBS",
                    "trangThai": "ENABLE",
                    "role": {
                        "roleId": "ADMIN",
                        "roleName": "Quản trị viên"
                    },
                    "createdDate": "2025-08-24T20:57:19.322953",
                    "updatedDate": "2025-08-25T11:18:01.230539",
                    "active": true
                },
                "createdDate": "2025-08-24T20:59:01.756041",
                "updatedDate": "2025-08-25T07:36:04.05127",
                "admin": true,
                "baoVe": false,
                "activeAccount": true
            },
            "nhanVienRa": null,
            "ghiChu": " [Xe có đăng ký tháng - Xác thực khuôn mặt thành công - Miễn phí]",
            "createdDate": "2025-10-04T22:33:09.7422924",
            "updatedDate": "2025-10-04T22:33:09.7422924",
            "faceIdEntry": "16",
            "faceIdExit": null,
            "faceSimilarityEntry": 1.0,
            "faceSimilarityExit": null,
            "faceVerificationStatus": "VERIFIED_ENTRY",
            "faceVerified": false,
            "active": true,
            "parkingDurationInHours": 1
        }
    }
}
```

### **3. Xe Ra với Face Recognition**

```http
POST /parking-transactions/direct-exit-with-face
Content-Type: application/json

{
  "bienSoXe": "30A-123.45",
  "faceImageBase64": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAASABIAAD..."
}
```

**Response:**
```json
{
    "statusCode": 200,
    "error": null,
    "message": "CALL API SUCCESS",
    "data": {
        "soTienThanhToan": 0,
        "success": true,
        "faceSimilarityExit": 1.0,
        "message": "Xe đã được cho ra bãi đỗ với xác thực khuôn mặt thành công",
        "faceVerificationStatus": "VERIFIED_BOTH",
        "transaction": {
            "maGiaoDich": 33,
            "bienSoXe": "13-123.45",
            "parkingLot": {
                "maBaiDo": "P001",
                "tenBaiDo": "Bãi đỗ xe máy",
                "soChoTrong": 78,
                "tongSoCho": 100,
                "maLoaiXe": {
                    "maLoaiXe": "LX001",
                    "tenLoaiXe": "Xe máy"
                },
                "diaChi": "456 Đường Cách Mạng Tháng 8, Quận 3, TP.HCM",
                "moTa": "Bãi đỗ xe máy tại siêu thị BigC",
                "trangThai": "ACTIVE",
                "createdDate": "2025-08-23T21:35:30.604167",
                "updatedDate": "2025-10-04T22:51:56.1464274",
                "occupancyRate": 22.0
            },
            "vehicleType": {
                "maLoaiXe": "LX001",
                "tenLoaiXe": "Xe máy"
            },
            "thoiGianVao": "2025-10-04T22:33:09.404573",
            "thoiGianRa": "2025-10-04T22:51:55.8373604",
            "trangThai": "COMPLETED",
            "soTienThanhToan": 0,
            "soTien": 0.00,
            "nhanVienVao": {
                "maNV": "NV001",
                "hoTen": "Tao tên Admin",
                "sdt": "0901234567",
                "email": "admin@test.com",
                "cccd": "123456789012",
                "chucVu": "ADMIN",
                "ngayVaoLam": "2024-01-15",
                "account": {
                    "username": "admin001",
                    "password": "$2a$10$7HflaOoqsC6lV26VvfGL3OP12hoIrg42FlhEUpet9kYUpbsVInSBS",
                    "trangThai": "ENABLE",
                    "role": {
                        "roleId": "ADMIN",
                        "roleName": "Quản trị viên"
                    },
                    "createdDate": "2025-08-24T20:57:19.322953",
                    "updatedDate": "2025-08-25T11:18:01.230539",
                    "active": true
                },
                "createdDate": "2025-08-24T20:59:01.756041",
                "updatedDate": "2025-08-25T07:36:04.05127",
                "admin": true,
                "baoVe": false,
                "activeAccount": true
            },
            "nhanVienRa": {
                "maNV": "NV001",
                "hoTen": "Tao tên Admin",
                "sdt": "0901234567",
                "email": "admin@test.com",
                "cccd": "123456789012",
                "chucVu": "ADMIN",
                "ngayVaoLam": "2024-01-15",
                "account": {
                    "username": "admin001",
                    "password": "$2a$10$7HflaOoqsC6lV26VvfGL3OP12hoIrg42FlhEUpet9kYUpbsVInSBS",
                    "trangThai": "ENABLE",
                    "role": {
                        "roleId": "ADMIN",
                        "roleName": "Quản trị viên"
                    },
                    "createdDate": "2025-08-24T20:57:19.322953",
                    "updatedDate": "2025-08-25T11:18:01.230539",
                    "active": true
                },
                "createdDate": "2025-08-24T20:59:01.756041",
                "updatedDate": "2025-08-25T07:36:04.05127",
                "admin": true,
                "baoVe": false,
                "activeAccount": true
            },
            "ghiChu": " [Xe có đăng ký tháng - Xác thực khuôn mặt thành công - Miễn phí] [Xe ra - Xác thực khuôn mặt thành công - Miễn phí]",
            "createdDate": "2025-10-04T22:33:09.742292",
            "updatedDate": "2025-10-04T22:51:56.1464274",
            "faceIdEntry": "16",
            "faceIdExit": "16",
            "faceSimilarityEntry": 1.000,
            "faceSimilarityExit": 1.0,
            "faceVerificationStatus": "VERIFIED_BOTH",
            "faceVerified": false,
            "active": false,
            "parkingDurationInHours": 1
        }
    }
}
```

## 🔄 **QUY TRÌNH BUSINESS LOGIC**

### **Scenario 1: Xe có Đăng Ký Tháng**

#### **Xe Vào:**
1. Mobile gửi: `bienSoXe` + `faceImageBase64`
2. Backend gọi FastAPI: nhận diện → `face_id` + `similarity`
3. Backend so sánh `face_id` với `face_id` trong `dang_ky_thang`
4. ✅ **Khớp** → Cho vào, miễn phí, status = `VERIFIED_ENTRY`
5. ❌ **Không khớp** → Cảnh báo, status = `FAILED_ENTRY`

#### **Xe Ra:**
1. Mobile gửi: `bienSoXe` + `faceImageBase64`
2. Backend nhận diện → `face_id_exit`
3. So sánh với `face_id` trong `dang_ky_thang`
4. ✅ **Khớp** → Cho ra, miễn phí, status = `VERIFIED_BOTH`
5. ❌ **Không khớp** → Cảnh báo, status = `FAILED_EXIT`

### **Scenario 2: Xe Vãng Lai**

#### **Xe Vào:**
1. Mobile gửi: `bienSoXe` + `faceImageBase64`
2. Backend nhận diện → lưu `face_id_entry`
3. Cho vào, status = `VERIFIED_ENTRY`

#### **Xe Ra:**
1. Mobile gửi: `bienSoXe` + `faceImageBase64`
2. Backend nhận diện → `face_id_exit`
3. So sánh `face_id_exit` với `face_id_entry`
4. ✅ **Khớp** → Cho ra, tính phí, status = `VERIFIED_BOTH`
5. ❌ **Không khớp** → Cảnh báo, status = `FAILED_EXIT`

---

**🎯 Face Recognition Integration - Successfully Implemented!** ✅