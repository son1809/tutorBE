const nodemailer = require('nodemailer');

// Tạo transporter kết nối Gmail
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

// ─── Template cơ bản ────────────────────────────────────────────────────────
const baseTemplate = (content) => `
<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>EduMatch</title>
</head>
<body style="margin:0;padding:0;background:#f0f4ff;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f0f4ff;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">
          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#1d4ed8 0%,#2563eb 100%);border-radius:16px 16px 0 0;padding:28px 40px;text-align:center;">
              <!-- Logo inline SVG -->
              <div style="display:inline-flex;align-items:center;gap:12px;">
                <svg width="44" height="44" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <defs>
                    <linearGradient id="eg1" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#60a5fa"/><stop offset="100%" stop-color="#3b82f6"/></linearGradient>
                    <linearGradient id="eg2" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#93c5fd"/><stop offset="100%" stop-color="#60a5fa"/></linearGradient>
                  </defs>
                  <rect x="6" y="44" width="48" height="9" rx="4" fill="url(#eg1)"/>
                  <rect x="6" y="44" width="48" height="4" rx="2" fill="url(#eg2)" opacity="0.5"/>
                  <rect x="8" y="34" width="44" height="9" rx="3.5" fill="url(#eg2)"/>
                  <rect x="8" y="34" width="44" height="3.5" rx="2" fill="white" opacity="0.3"/>
                  <rect x="10" y="25" width="40" height="9" rx="3" fill="url(#eg1)" opacity="0.9"/>
                  <rect x="10" y="25" width="40" height="3" rx="2" fill="white" opacity="0.2"/>
                  <polygon points="32,7 58,19 32,31 6,19" fill="white" opacity="0.95"/>
                  <polygon points="32,7 58,19 32,19" fill="#bfdbfe" opacity="0.5"/>
                  <line x1="58" y1="19" x2="58" y2="32" stroke="#bfdbfe" stroke-width="2.5" stroke-linecap="round"/>
                  <circle cx="58" cy="33.5" r="2.5" fill="#dbeafe"/>
                </svg>
                <div style="text-align:left;">
                  <div style="color:#fff;font-size:24px;font-weight:800;letter-spacing:-0.5px;font-family:'Segoe UI',Arial,sans-serif;line-height:1.1;">EduMatch</div>
                  <div style="color:rgba(255,255,255,0.75);font-size:12px;font-family:'Segoe UI',Arial,sans-serif;">Kết nối tri thức</div>
                </div>
              </div>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="background:#ffffff;padding:40px;border-left:1px solid #e5e7eb;border-right:1px solid #e5e7eb;">
              ${content}
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background:#f8faff;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 16px 16px;padding:24px 40px;text-align:center;">
              <p style="margin:0;color:#9ca3af;font-size:13px;">
                © 2024 EduMatch · Email tự động, vui lòng không phản hồi.
              </p>
              <p style="margin:8px 0 0;color:#9ca3af;font-size:12px;">
                Nếu bạn cần hỗ trợ, hãy liên hệ
                <a href="mailto:${process.env.GMAIL_USER}" style="color:#4f46e5;text-decoration:none;">${process.env.GMAIL_USER}</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

// ─── Template thông tin lịch học ────────────────────────────────────────────
const bookingInfoBox = (booking, tutorName) => {
  const d = new Date(booking.booking_date);
  const formattedDate = d.toLocaleDateString('vi-VN');
  const duration = booking.duration_months ? `${booking.duration_months} tháng` : '1 tháng';
  const days = booking.days_of_week || 'Chưa chọn ngày';

  return `
    <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:24px;margin-bottom:24px;">
      <h3 style="margin:0 0 16px;color:#1e293b;font-size:16px;font-weight:600;border-bottom:1px solid #e2e8f0;padding-bottom:12px;">
        📌 Chi tiết khóa học
      </h3>
      
      <table width="100%" cellpadding="0" cellspacing="0" style="font-size:14px;">
        ${tutorName ? `
        <tr>
          <td style="padding:8px 0;color:#64748b;width:120px;">Gia sư:</td>
          <td style="padding:8px 0;color:#0f172a;font-weight:500;">${tutorName}</td>
        </tr>` : ''}
        <tr>
          <td style="padding:8px 0;color:#64748b;width:120px;">Môn học:</td>
          <td style="padding:8px 0;color:#0f172a;font-weight:500;">${booking.subject || '—'} (${booking.grade_level || '—'})</td>
        </tr>
        <tr>
          <td style="padding:8px 0;color:#64748b;">Thời lượng:</td>
          <td style="padding:8px 0;color:#0f172a;font-weight:500;">${duration}</td>
        </tr>
        <tr>
          <td style="padding:8px 0;color:#64748b;">Khai giảng:</td>
          <td style="padding:8px 0;color:#0f172a;font-weight:500;">${formattedDate}</td>
        </tr>
        <tr>
          <td style="padding:8px 0;color:#64748b;">Lịch học:</td>
          <td style="padding:8px 0;color:#0f172a;font-weight:500;">${days}</td>
        </tr>
        <tr>
          <td style="padding:8px 0;color:#64748b;">Khung giờ:</td>
          <td style="padding:8px 0;color:#2563eb;font-weight:600;">${booking.time_slot}</td>
        </tr>
        ${booking.note ? `
        <tr>
          <td style="padding:8px 0;color:#64748b;vertical-align:top;">Ghi chú:</td>
          <td style="padding:8px 0;color:#0f172a;font-weight:500;">${booking.note}</td>
        </tr>` : ''}
      </table>
    </div>
  `;
};

// ─── Hàm hỗ trợ ─────────────────────────────────────────────────────────────
const formatDate = (dateStr) => {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  return d.toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
};

// ─── 1. Gửi mail xác nhận đăng ký (học sinh vừa đặt lịch) ──────────────────
const sendBookingConfirmation = async ({ toEmail, studentName, booking, tutorName }) => {
  const content = `
    <p style="margin:0 0 8px;font-size:22px;font-weight:700;color:#111827;">
      Xin chào, ${studentName}! 👋
    </p>
    <p style="margin:0 0 4px;color:#4b5563;font-size:15px;line-height:1.6;">
      Chúng tôi đã nhận được yêu cầu đặt lịch học của bạn.
      Admin sẽ xem xét và xếp lịch phù hợp trong thời gian sớm nhất.
    </p>

    <div style="display:inline-block;background:#fef3c7;border:1px solid #fde68a;border-radius:8px;
                padding:8px 16px;margin:16px 0;font-size:13px;color:#92400e;">
      ⏳ Trạng thái: <strong>Chờ xét duyệt</strong>
    </div>

    ${bookingInfoBox(booking, tutorName)}

    <p style="margin:24px 0 8px;color:#4b5563;font-size:14px;line-height:1.6;">
      Bạn sẽ nhận được email thông báo ngay khi lịch học được xác nhận.
      Nếu cần thay đổi, hãy truy cập trang <strong>Lịch học của tôi</strong> để hủy và đặt lại.
    </p>

    <p style="margin:0;color:#4b5563;font-size:14px;">
      Cảm ơn bạn đã tin tưởng <strong style="color:#4f46e5;">EduMatch</strong>! 💜
    </p>
  `;

  await transporter.sendMail({
    from: `"EduMatch" <${process.env.GMAIL_USER}>`,
    to: toEmail,
    subject: '✅ Đặt lịch học thành công – Đang chờ xét duyệt',
    html: baseTemplate(content),
  });
};

// ─── 2. Gửi mail xác nhận lịch học được duyệt (matched) ────────────────────
const sendBookingApproved = async ({ toEmail, studentName, booking, tutorName }) => {
  const content = `
    <p style="margin:0 0 8px;font-size:22px;font-weight:700;color:#111827;">
      Lịch học đã được xác nhận! 🎉
    </p>
    <p style="margin:0 0 4px;color:#4b5563;font-size:15px;line-height:1.6;">
      Chúc mừng <strong>${studentName}</strong>! Yêu cầu đặt lịch học của bạn
      đã được Admin duyệt và ghép gia sư thành công.
    </p>

    <div style="display:inline-block;background:#d1fae5;border:1px solid #6ee7b7;border-radius:8px;
                padding:8px 16px;margin:16px 0;font-size:13px;color:#065f46;">
      ✅ Trạng thái: <strong>Đã xác nhận</strong>
    </div>

    ${bookingInfoBox(booking, tutorName)}

    <div style="background:#eff6ff;border-radius:12px;padding:20px 24px;margin:24px 0;">
      <p style="margin:0 0 8px;font-size:14px;font-weight:600;color:#1d4ed8;">📌 Lưu ý trước buổi học</p>
      <ul style="margin:0;padding-left:20px;color:#374151;font-size:14px;line-height:1.8;">
        <li>Chuẩn bị đầy đủ sách vở, bài tập cần hỏi.</li>
        <li>Vào đúng giờ để không ảnh hưởng lịch của gia sư.</li>
        <li>Nếu cần hủy, thông báo trước ít nhất <strong>24 giờ</strong>.</li>
      </ul>
    </div>

    <p style="margin:0;color:#4b5563;font-size:14px;">
      Chúc bạn có buổi học thật hiệu quả! 💪
    </p>
  `;

  await transporter.sendMail({
    from: `"EduMatch" <${process.env.GMAIL_USER}>`,
    to: toEmail,
    subject: '🎉 Lịch học đã được xác nhận – EduMatch',
    html: baseTemplate(content),
  });
};

// ─── 3. Gửi mail thông báo lịch bị huỷ ─────────────────────────────────────
const sendBookingCancelled = async ({ toEmail, studentName, booking, tutorName, cancelledBy }) => {
  const whoCancel = cancelledBy === 'admin' ? 'Admin' : 'bạn';
  const content = `
    <p style="margin:0 0 8px;font-size:22px;font-weight:700;color:#111827;">
      Lịch học đã bị hủy 😔
    </p>
    <p style="margin:0 0 4px;color:#4b5563;font-size:15px;line-height:1.6;">
      Xin chào <strong>${studentName}</strong>, lịch học dưới đây đã bị hủy bởi <strong>${whoCancel}</strong>.
    </p>

    <div style="display:inline-block;background:#fee2e2;border:1px solid #fca5a5;border-radius:8px;
                padding:8px 16px;margin:16px 0;font-size:13px;color:#991b1b;">
      ❌ Trạng thái: <strong>Đã hủy</strong>
    </div>

    ${bookingInfoBox(booking, tutorName)}

    <p style="margin:24px 0 8px;color:#4b5563;font-size:14px;line-height:1.6;">
      Nếu bạn muốn đặt lịch mới, hãy truy cập website và chọn gia sư phù hợp.
      Chúng tôi luôn sẵn sàng hỗ trợ bạn!
    </p>

    <p style="margin:0;color:#4b5563;font-size:14px;">
      Xin lỗi vì sự bất tiện này. Trân trọng, <strong style="color:#4f46e5;">EduMatch</strong>
    </p>
  `;

  await transporter.sendMail({
    from: `"EduMatch" <${process.env.GMAIL_USER}>`,
    to: toEmail,
    subject: '❌ Lịch học đã bị hủy – EduMatch',
    html: baseTemplate(content),
  });
};

module.exports = {
  sendBookingConfirmation,
  sendBookingApproved,
  sendBookingCancelled,
};
