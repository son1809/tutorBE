# Đặc tả yêu cầu phần mềm EduMatch (Phiên bản Demo)

## 1. Mục đích

EduMatch là nền tảng web kết nối học viên với gia sư, đồng thời cung cấp công cụ để quản trị người dùng, gia sư, lịch học, đánh giá, môn học, bài viết, báo cáo và hội thoại hỗ trợ.

Tài liệu này mô tả các chức năng thực sự có trong mã nguồn hiện tại. Tài liệu phục vụ demo và kiểm thử nghiệm thu, không khẳng định hệ thống đã sẵn sàng cho môi trường sản xuất.

## 2. Phạm vi

### 2.1 Trong phạm vi

- Xem và tìm kiếm gia sư, môn học công khai
- Đăng ký, đăng nhập tài khoản học viên và gia sư
- Giao diện riêng theo vai trò học viên, gia sư và quản trị viên
- Quản lý hồ sơ và chứng chỉ gia sư
- Đăng ký lịch học và kiểm tra trùng lịch
- Xem lịch học của học viên và gia sư
- Các chức năng quản trị hệ thống
- Đánh giá, yêu thích, thông báo, blog, báo cáo và chat hỗ trợ thời gian thực

### 2.2 Ngoài phạm vi hoặc chưa hoàn thiện

- Chức năng “Tìm gia sư mới” trong dashboard học viên chỉ mô phỏng gửi thành công, chưa lưu dữ liệu.
- Form đánh giá trong dashboard học viên hiện là giao diện tĩnh. Chỉ các luồng đánh giá có kết nối backend mới lưu dữ liệu.
- Thanh toán thật chưa hoàn thiện: frontend gọi các API VNPay/lịch sử thanh toán nhưng backend chưa khai báo route tương ứng. Frontend đang có cơ chế dự phòng cho demo.
- Đăng nhập Google chỉ hoạt động khi cấu hình Google OAuth Client ID hợp lệ.
- Chưa cam kết các tiêu chuẩn production về bảo mật, mở rộng, độ sẵn sàng, sao lưu và phục hồi.

## 3. Tổng quan sản phẩm

### 3.1 Công nghệ

- Frontend: React, Vite, React Router
- Backend: Node.js, Express, Sequelize
- Cơ sở dữ liệu: MariaDB/MySQL
- Giao tiếp thời gian thực: Socket.IO
- Xác thực: JWT Bearer Token lưu trên trình duyệt
- Môi trường demo: container chạy bằng Compose

### 3.2 Vai trò người dùng

| Vai trò | Chức năng chính |
|---|---|
| Khách | Xem gia sư, môn học, đánh giá, blog đã xuất bản; xem chi tiết gia sư; đăng ký hoặc đăng nhập |
| Học viên | Quản lý hồ sơ, đăng ký/hủy lịch học, xem lịch, yêu thích/đánh giá/báo cáo gia sư, nhận thông báo, viết blog và liên hệ hỗ trợ |
| Gia sư | Quản lý hồ sơ giảng dạy và chứng chỉ, xem lớp học, lịch dạy, thống kê thu nhập và thông báo |
| Quản trị viên | Xem thống kê và quản lý người dùng, gia sư, booking, đánh giá, môn học, blog, báo cáo và chat hỗ trợ |

## 4. Yêu cầu chức năng

### FR-01 Xác thực và phân quyền

- Hệ thống phải cho phép đăng ký tài khoản học viên hoặc gia sư bằng họ tên, email và mật khẩu.
- Hệ thống phải từ chối email đã được đăng ký.
- Hệ thống phải cho phép người dùng hợp lệ đăng nhập và trả về JWT cùng thông tin người dùng.
- Hệ thống phải từ chối thông tin đăng nhập sai mà không tiết lộ email hay mật khẩu nào bị sai.
- Khi đăng ký vai trò gia sư, hệ thống phải tự tạo hồ sơ gia sư ban đầu.
- Hệ thống phải giới hạn trang gia sư cho tài khoản gia sư và trang quản trị cho quản trị viên.
- Người dùng đã đăng nhập phải có thể xem và cập nhật thông tin cá nhân cơ bản.

### FR-02 Tìm kiếm gia sư

- Hệ thống phải hiển thị danh sách hồ sơ gia sư.
- Hệ thống phải hỗ trợ bộ lọc gia sư thông qua tham số truy vấn được giao diện sử dụng.
- Hệ thống phải hiển thị các dữ liệu hiện có gồm danh tính, môn học, cấp lớp, giới thiệu, học phí, khu vực, trạng thái xác minh, đánh giá và kinh nghiệm.
- Hệ thống phải cung cấp trang danh sách gia sư theo môn học.
- Khi ID gia sư không tồn tại, hệ thống phải hiển thị trạng thái không tìm thấy hoặc lỗi phù hợp.

### FR-03 Quản lý hồ sơ gia sư

- Gia sư phải có thể xem và cập nhật hồ sơ giảng dạy.
- Gia sư phải có thể tải lên và xóa minh chứng/chứng chỉ.
- Quản trị viên phải có thể xác minh hoặc bỏ xác minh gia sư.
- Trạng thái xác minh phải có trong dữ liệu gia sư trả về cho client.

### FR-04 Quản lý lịch học

- Học viên đã đăng nhập phải có thể gửi booking gồm gia sư, môn học, cấp lớp, ngày bắt đầu, thời lượng, ngày học trong tuần, khung giờ, số buổi, giá dự kiến và ghi chú tùy chọn.
- Hệ thống phải từ chối booking cho gia sư không tồn tại.
- Hệ thống phải từ chối booking trùng với một booking chưa hủy của cùng gia sư khi khoảng thời gian khóa học giao nhau, có ít nhất một ngày học giống nhau và cùng khung giờ.
- Booking mới phải có trạng thái `pending` (chờ duyệt).
- Học viên phải có thể xem danh sách booking và hủy booking của chính mình.
- Gia sư phải có thể xem booking được gán cho hồ sơ của mình và xem thống kê booking.
- Quản trị viên phải có thể xem danh sách, đổi trạng thái sang giá trị hợp lệ (`pending`, `matched`, `cancelled`) và xóa booking.
- Các thao tác booking phải tạo thông báo trong ứng dụng tại những luồng đã được cài đặt; lỗi gửi email không được làm thất bại việc tạo booking.

### FR-05 Đánh giá, yêu thích và báo cáo

- Người dùng đã đăng nhập phải có thể gửi đánh giá gia sư qua luồng có kết nối backend.
- Khách phải có thể xem đánh giá của gia sư và danh sách đánh giá.
- Học viên phải có thể thêm/xóa gia sư khỏi danh sách yêu thích và xem danh sách đó.
- Người dùng đã đăng nhập phải có thể gửi báo cáo.
- Quản trị viên phải có thể xem, cập nhật, xóa báo cáo và xóa đánh giá không phù hợp.

### FR-06 Thông báo

- Người dùng đã đăng nhập phải có thể xem danh sách thông báo và số thông báo chưa đọc.
- Người dùng phải có thể đánh dấu đã đọc một thông báo hoặc toàn bộ thông báo.
- Người dùng phải có thể xóa thông báo.

### FR-07 Blog

- Khách phải có thể xem danh sách và nội dung bài viết đã xuất bản.
- Người dùng đã đăng nhập phải có thể tạo và quản lý bài viết của chính mình.
- Quản trị viên phải có thể tạo, sửa, xóa, xuất bản hoặc ẩn bài viết.

### FR-08 Chat hỗ trợ

- Người dùng đã đăng nhập phải có thể lấy hoặc tạo cuộc hội thoại hỗ trợ và xem tin nhắn.
- Người dùng và quản trị viên phải có thể trao đổi tin nhắn thời gian thực qua Socket.IO.
- Hệ thống phải lưu tin nhắn, cập nhật nội dung tin nhắn cuối, duy trì số chưa đọc và hỗ trợ đánh dấu đã đọc.
- Quản trị viên phải có thể xem các cuộc hội thoại hỗ trợ trong giao diện quản trị.

### FR-09 Quản trị hệ thống

- Hệ thống phải cung cấp số liệu tổng hợp cho dashboard quản trị.
- Quản trị viên phải có thể xem, cập nhật hoặc xóa người dùng.
- Quản trị viên phải có thể xem, xác minh hoặc xóa gia sư.
- Quản trị viên phải có thể quản lý booking, đánh giá, môn học, blog và báo cáo.
- Tài khoản không phải quản trị viên phải bị từ chối khi truy cập API hoặc trang quản trị được bảo vệ.

## 5. Yêu cầu dữ liệu

Các thực thể chính gồm: User, Tutor, Certificate, Subject, Booking, Review, FavoriteTutor, Notification, Blog, Report, Conversation, Message và Payment.

Ràng buộc quan trọng:

- Email người dùng là duy nhất.
- Vai trò người dùng là `student`, `tutor` hoặc `admin`.
- Trạng thái booking là `pending`, `matched` hoặc `cancelled`.
- Hồ sơ học viên/gia sư liên kết với người dùng bằng ID.
- Mỗi booking thuộc về một học viên và một gia sư.
- Mỗi tin nhắn thuộc về một cuộc hội thoại.
- File tải lên được truy cập qua đường dẫn `/uploads`.

## 6. Yêu cầu giao diện ngoài

### 6.1 Giao diện người dùng

- Giao diện demo phải truy cập được tại `http://localhost:5173`.
- Hệ thống phải có điều hướng công khai và layout riêng cho trang gia sư, quản trị và kết quả thanh toán.
- Form phải hiển thị trạng thái thành công, rỗng, đang tải hoặc lỗi tại các vị trí đã được cài đặt.

### 6.2 API

- REST API demo phải truy cập được tại `http://localhost:5000/api`.
- Request được bảo vệ phải gửi header `Authorization: Bearer <token>`.
- API sử dụng JSON, ngoại trừ tải file sử dụng multipart form data.

### 6.3 Email và OAuth

- Email phụ thuộc cấu hình SMTP; lỗi email không chặn việc tạo booking.
- Google Login phụ thuộc OAuth Web Client ID và không bắt buộc cho demo tiêu chuẩn.

## 7. Yêu cầu phi chức năng cho nghiệm thu demo

- NFR-01 Tính dễ dùng: tác vụ demo chính phải truy cập được qua điều hướng hoặc URL đã tài liệu hóa.
- NFR-02 Tương thích: giao diện phải chạy trên trình duyệt Chromium hiện hành ở kích thước desktop.
- NFR-03 Hiệu năng: thao tác danh sách/chi tiết trong môi trường local nên hoàn tất trong 3 giây sau khi container sẵn sàng.
- NFR-04 Toàn vẹn: mật khẩu phải lưu bằng bcrypt hash và không được trả về từ API đăng nhập/hồ sơ.
- NFR-05 Phân quyền: REST API được bảo vệ phải từ chối token thiếu, sai hoặc không đủ quyền.
- NFR-06 Lưu trữ: thay đổi trong cơ sở dữ liệu phải tồn tại sau khi tải lại trang và khởi động lại container nếu giữ nguyên volume database.
- NFR-07 Xử lý lỗi: tài nguyên không tồn tại và thao tác không hợp lệ phải trả về lỗi rõ ràng, không làm API dừng hoạt động.

## 8. Giả định và rủi ro đã biết

- Dữ liệu và tài khoản demo được nạp theo README ở thư mục gốc.
- API hiện tự đồng bộ schema khi khởi động.
- JWT hiện được lưu trong local storage của trình duyệt.
- Kiểm tra trùng booking thực hiện ở tầng ứng dụng, chưa an toàn với nhiều request đồng thời.
- Socket chat hiện tin cậy một số trường danh tính/cuộc hội thoại do client gửi; chỉ phù hợp demo có kiểm soát.
- Logic dự phòng và thông tin thanh toán trong frontend không được xem là thiết kế thanh toán production.

## 9. Tiêu chí nghiệm thu demo

Demo được nghiệm thu khi:

1. Các container khởi động và web/API truy cập được.
2. Danh sách và chi tiết gia sư tải được từ dữ liệu mẫu.
3. Học viên đăng nhập, tạo booking thật từ trang chi tiết gia sư và thấy booking trong lịch.
4. Quản trị viên thấy booking và thay đổi được trạng thái.
5. Gia sư tương ứng đăng nhập và thấy booking cùng trạng thái mới.
6. Phân quyền ngăn học viên truy cập trang quản trị.
7. Ít nhất một chức năng phụ—yêu thích, thông báo, blog, báo cáo hoặc chat—được demo thành công.

