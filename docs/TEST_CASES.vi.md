# Bộ test case Demo EduMatch

## 1. Chuẩn bị môi trường

Khởi động ứng dụng:

```bash
podman compose up -d --build
```

Địa chỉ:

- Web: `http://localhost:5173`
- Kiểm tra API: `http://localhost:5000`
- Đăng nhập quản trị: `http://localhost:5173/admin/login`

Tài khoản mẫu:

| Vai trò | Email | Mật khẩu |
|---|---|---|
| Quản trị viên | `admin@edumatch.local` | `Demo@123` |
| Học viên | `student@edumatch.local` | `Demo@123` |
| Gia sư | `minhanh.tutor@edumatch.local` | `Demo@123` |

Dùng ngày bắt đầu trong tương lai cho test booking. Nếu database đã có booking, chọn gia sư/ngày/khung giờ khác hoặc reset dữ liệu demo.

## 2. Kịch bản demo nhanh trong 5 phút

| ID | Người thực hiện | Thao tác | Kết quả mong đợi |
|---|---|---|---|
| SM-01 | Khách | Mở `/tutors`, chọn một gia sư và xem chi tiết | Danh sách và thông tin gia sư được tải |
| SM-02 | Học viên | Đăng nhập bằng tài khoản học viên mẫu | Đăng nhập thành công, hiển thị điều hướng học viên |
| SM-03 | Học viên | Tại chi tiết gia sư, nhập booking hợp lệ và gửi | Hiển thị thành công; booking được lưu với trạng thái `pending` |
| SM-04 | Học viên | Mở `/schedule` | Booking mới hiển thị đúng gia sư, ngày, lịch học, giá và trạng thái |
| SM-05 | Quản trị viên | Đăng xuất, mở `/admin/login`, đăng nhập admin | Dashboard quản trị được tải |
| SM-06 | Quản trị viên | Mở Booking, tìm booking mới và đổi sang `matched` | Cập nhật thành công và vẫn đúng sau khi tải lại trang |
| SM-07 | Gia sư | Đăng nhập tài khoản gia sư đã được đặt và mở `/tutor/bookings` | Booking hiển thị đúng học viên, lịch và trạng thái matched |
| SM-08 | Học viên | Đăng nhập lại và mở lịch học | Trạng thái matched mới được hiển thị |

## 3. Test case chức năng

### Xác thực và phân quyền

| ID | Kịch bản / thao tác | Kết quả mong đợi | Ưu tiên |
|---|---|---|---|
| AUTH-01 | Đăng ký học viên bằng email mới hợp lệ và mật khẩu tối thiểu 6 ký tự | Thành công; trả về user, token và role student | Cao |
| AUTH-02 | Đăng ký bằng email đã tồn tại | Bị từ chối với thông báo “Email đã được sử dụng.” | Cao |
| AUTH-03 | Đăng nhập `student@edumatch.local / Demo@123` | Thành công và tải thông tin học viên | Nghiêm trọng |
| AUTH-04 | Đăng nhập đúng email, sai mật khẩu | Bị từ chối bằng thông báo chung về thông tin đăng nhập sai | Cao |
| AUTH-05 | Mở `/admin/dashboard` khi chưa đăng nhập hoặc đang là học viên | Bị chuyển hướng/từ chối; không dùng được chức năng admin | Nghiêm trọng |
| AUTH-06 | Mở `/tutor/dashboard` bằng tài khoản học viên | Bị chuyển hướng/từ chối; không dùng được chức năng gia sư | Nghiêm trọng |
| AUTH-07 | Cập nhật họ tên, điện thoại, trường và lớp rồi tải lại trang | Dữ liệu mới vẫn được giữ | Trung bình |

### Tìm kiếm và hồ sơ gia sư

| ID | Kịch bản / thao tác | Kết quả mong đợi | Ưu tiên |
|---|---|---|---|
| TUT-01 | Mở `/tutors` với vai trò khách | Danh sách gia sư mẫu tải được không cần đăng nhập | Nghiêm trọng |
| TUT-02 | Mở `/subject/toan` | Hiển thị gia sư của trang môn học | Cao |
| TUT-03 | Mở chi tiết gia sư từ một thẻ | Hiển thị các dữ liệu hiện có về gia sư | Nghiêm trọng |
| TUT-04 | Mở `/tutors/999999` | Hiển thị lỗi/không tìm thấy; ứng dụng không bị crash | Trung bình |
| TUT-05 | Gia sư cập nhật tiêu đề, môn, mức phí, khu vực và giới thiệu | Lưu thành công và dữ liệu tồn tại sau refresh | Cao |
| TUT-06 | Gia sư tải lên ảnh chứng chỉ hợp lệ | Chứng chỉ được lưu và xuất hiện trong danh sách | Trung bình |
| TUT-07 | Admin thay đổi trạng thái xác minh gia sư | Trạng thái thay đổi và tồn tại sau refresh | Cao |

### Booking và lịch học

| ID | Kịch bản / thao tác | Kết quả mong đợi | Ưu tiên |
|---|---|---|---|
| BKG-01 | Học viên gửi đủ trường bắt buộc cho gia sư tồn tại và lịch chưa dùng | Booking được tạo ở trạng thái `pending` | Nghiêm trọng |
| BKG-02 | Lặp BKG-01 với cùng gia sư, khoảng ngày giao nhau, có ngày học chung và cùng khung giờ | Bị từ chối với thông báo trùng lịch | Nghiêm trọng |
| BKG-03 | Cùng gia sư, khoảng ngày và khung giờ nhưng không có ngày học chung | Booking được chấp nhận | Cao |
| BKG-04 | Cùng gia sư, khoảng ngày và ngày học nhưng khác khung giờ | Booking được chấp nhận | Cao |
| BKG-05 | Mở lịch học viên sau khi tạo booking | Thông tin hiển thị đúng dữ liệu đã gửi | Nghiêm trọng |
| BKG-06 | Học viên hủy booking pending của chính mình | Trạng thái thành `cancelled` và được lưu | Cao |
| BKG-07 | Admin đổi booking pending thành `matched` | Trạng thái cập nhật ở giao diện admin, học viên và gia sư | Nghiêm trọng |
| BKG-08 | Gia sư tìm/lọc booking theo học viên, môn và trạng thái | Chỉ hiển thị dòng phù hợp; modal chi tiết đủ dữ liệu | Trung bình |
| BKG-09 | Gửi API booking với tutor ID không tồn tại | API trả 404 và không tạo booking | Cao |

### Chức năng phụ

| ID | Kịch bản / thao tác | Kết quả mong đợi | Ưu tiên |
|---|---|---|---|
| SEC-01 | Học viên yêu thích gia sư, mở `/favorites`, sau đó bỏ yêu thích | Gia sư lần lượt được thêm, hiển thị và xóa | Trung bình |
| SEC-02 | Tạo đánh giá qua form có kết nối backend, sau đó mở lại đánh giá gia sư | Đánh giá xuất hiện và dữ liệu liên quan được cập nhật | Trung bình |
| SEC-03 | Gửi báo cáo khi đã đăng nhập; admin mở mục Báo cáo | Báo cáo được lưu và hiển thị cho admin | Trung bình |
| SEC-04 | Mở thông báo; đánh dấu một thông báo rồi toàn bộ là đã đọc | Trạng thái đọc và số chưa đọc được cập nhật | Trung bình |
| SEC-05 | Mở danh sách blog đã xuất bản và trang chi tiết | Khách xem được nội dung đã xuất bản | Thấp |
| SEC-06 | Người dùng tạo blog và mở luồng bài viết của tôi | Bài được lưu; tác giả có thể sửa/xóa | Thấp |
| SEC-07 | Mở chat bằng học viên và admin; mỗi bên gửi một tin | Tin xuất hiện thời gian thực và vẫn còn khi mở lại | Trung bình |
| SEC-08 | Admin tạo/sửa/xóa một môn học | Danh sách môn phản ánh đúng từng thao tác | Trung bình |

## 4. Kiểm thử lỗi và độ tin cậy

| ID | Kịch bản / thao tác | Kết quả mong đợi |
|---|---|---|
| NEG-01 | Gọi API được bảo vệ mà không có token | API trả 401 |
| NEG-02 | Gọi API admin bằng token học viên | API trả 403 |
| NEG-03 | Gọi API route không tồn tại | API trả 404 với “Route không tồn tại.” |
| NEG-04 | Ngắt SMTP rồi tạo booking hợp lệ | Booking vẫn thành công; lỗi email chỉ được ghi log |
| NEG-05 | Tải lại trang sau khi lưu hồ sơ/trạng thái | Thay đổi từ database vẫn hiển thị |
| NEG-06 | Xóa token khỏi local storage rồi mở URL được bảo vệ | Nội dung được bảo vệ không hiển thị |

## 5. Chức năng chỉ dành cho demo, không trình bày là đã lưu dữ liệu

| ID | Hành vi hiện tại | Hướng dẫn demo |
|---|---|---|
| GAP-01 | Dashboard học viên → “Tìm gia sư mới” chờ ngắn rồi báo thành công nhưng không gọi API | Không dùng để chứng minh lưu yêu cầu; hãy booking thật từ Chi tiết gia sư |
| GAP-02 | Dashboard học viên → “Đánh giá gia sư” là giao diện tĩnh | Dùng luồng đánh giá có backend hoặc chỉ demo danh sách đánh giá |
| GAP-03 | Frontend gọi route thanh toán chưa được backend mount rồi dùng logic VNPay phía client | Tránh demo thanh toán trực tiếp |
| GAP-04 | API service frontend có endpoint huy hiệu nhưng backend không mount | Không đưa huy hiệu vào phạm vi nghiệm thu |
| GAP-05 | Google Login cần cấu hình OAuth bên ngoài | Dùng email/mật khẩu nếu OAuth chưa được kiểm thử |

## 6. Biên bản kết quả demo

Sao chép bảng này cho buổi trình bày:

| Test ID | Kết quả (Đạt/Không đạt/Bị chặn) | Bằng chứng / ghi chú | Người test | Ngày |
|---|---|---|---|---|
| SM-01 |  |  |  |  |
| SM-02 |  |  |  |  |
| SM-03 |  |  |  |  |
| SM-04 |  |  |  |  |
| SM-05 |  |  |  |  |
| SM-06 |  |  |  |  |
| SM-07 |  |  |  |  |
| SM-08 |  |  |  |  |
