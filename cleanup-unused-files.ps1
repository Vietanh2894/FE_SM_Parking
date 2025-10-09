# SCRIPT XÓA CÁC FILE KHÔNG SỬ DỤNG
# Chạy script này trong PowerShell với quyền admin

Write-Host "🗑️ BẮT ĐẦU XÓA CÁC FILE KHÔNG SỬ DỤNG..." -ForegroundColor Yellow

# Danh sách các file backup/old không sử dụng
$filesToDelete = @(
    "src\pages\DangKyThangPage_backup.jsx",
    "src\pages\DashboardPage.jsx.backup", 
    "src\pages\UserDashboardPage_Old.jsx",
    "src\pages\DashboardPage_new.jsx",
    "src\pages\VehicleTypePage_New.jsx",
    "src\components\modals\AddRoleModal_New.jsx",
    "src\components\modals\AddStaffModal_New.jsx", 
    "src\components\modals\AddAccountModal_New.jsx",
    "src\components\modals\EditStaffModal_New.jsx",
    "src\components\modals\EditAccountModal_New.jsx",
    "src\components\modals\EditParkingLotModal_New.jsx",
    "src\components\modals\EditParkingLotModal_Old.jsx",
    "src\components\examples\ResponsivePageExample.jsx",
    "src\components\common\DashboardNavigation.jsx",
    "src\components\index.js",
    "src\services\index.js",
    "src\types\index.js",
    "UNIFIED_LOGIN_CHANGES.js"
)

$deletedCount = 0
$notFoundCount = 0

foreach ($file in $filesToDelete) {
    if (Test-Path $file) {
        try {
            Remove-Item $file -Force
            Write-Host "✅ Đã xóa: $file" -ForegroundColor Green
            $deletedCount++
        }
        catch {
            Write-Host "❌ Lỗi khi xóa: $file - $($_.Exception.Message)" -ForegroundColor Red
        }
    }
    else {
        Write-Host "⚠️ Không tìm thấy: $file" -ForegroundColor Yellow
        $notFoundCount++
    }
}

Write-Host "`n📊 TỔNG KẾT:" -ForegroundColor Cyan
Write-Host "✅ Đã xóa: $deletedCount files" -ForegroundColor Green
Write-Host "⚠️ Không tìm thấy: $notFoundCount files" -ForegroundColor Yellow

# Xóa các thư mục trống
Write-Host "`n🗂️ Kiểm tra và xóa thư mục trống..." -ForegroundColor Yellow

$emptyDirs = @(
    "src\components\examples"
)

foreach ($dir in $emptyDirs) {
    if (Test-Path $dir) {
        $items = Get-ChildItem $dir -Force
        if ($items.Count -eq 0) {
            try {
                Remove-Item $dir -Force
                Write-Host "✅ Đã xóa thư mục trống: $dir" -ForegroundColor Green
            }
            catch {
                Write-Host "❌ Lỗi khi xóa thư mục: $dir - $($_.Exception.Message)" -ForegroundColor Red
            }
        }
        else {
            Write-Host "⚠️ Thư mục không trống: $dir" -ForegroundColor Yellow
        }
    }
}

Write-Host "`n🎉 HOÀN THÀNH!" -ForegroundColor Green
Write-Host "Khuyến nghị: Chạy 'npm run build' để kiểm tra không có lỗi import nào" -ForegroundColor Cyan

# Pause để xem kết quả
Read-Host "`nNhấn Enter để thoát..."