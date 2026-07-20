const express = require('express');
const router = express.Router();
const refundController = require('../controllers/refundController');
const auth = require('../middleware/auth');

// ─── Refund Requests ────────────────────────────────────────────────────────
// Preview số tiền hoàn (không tạo request)
router.get('/preview/:bookingId', auth, refundController.previewRefund);

// Gửi yêu cầu hoàn tiền
router.post('/', auth, refundController.createRefundRequest);

// Học sinh xem yêu cầu hoàn tiền của mình
router.get('/my', auth, refundController.getMyRefunds);

// Admin xem tất cả yêu cầu hoàn tiền
router.get('/admin', auth, refundController.getAllRefunds);

// Admin duyệt / từ chối / đã xử lý
router.patch('/:id/status', auth, refundController.updateRefundStatus);

// ─── Withdrawal Requests ────────────────────────────────────────────────────
// Gửi yêu cầu rút tiền
router.post('/withdraw', auth, refundController.createWithdrawal);

// Xem lịch sử rút tiền của mình
router.get('/withdrawals/my', auth, refundController.getMyWithdrawals);

// Admin xem tất cả yêu cầu rút tiền
router.get('/withdrawals/admin', auth, refundController.getAllWithdrawals);

// Admin duyệt / từ chối rút tiền
router.patch('/withdrawals/:id/status', auth, refundController.updateWithdrawalStatus);

module.exports = router;
