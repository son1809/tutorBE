require('dotenv').config();
const bcrypt = require('bcryptjs');
const sequelize = require('./config/db');
require('./models');
const { User, Tutor } = require('./models');

const tutorsData = [
  {
    user: { full_name: 'Nguyễn Thị Lan', email: 'lan.nguyen@tutor.com', phone: '0901234567' },
    tutor: {
      title: 'Giáo viên Toán THPT chuyên luyện thi đại học',
      subject: 'Toán',
      grade_level: 'THPT',
      about: 'Tốt nghiệp Đại học Sư phạm TP.HCM, 8 năm kinh nghiệm giảng dạy Toán THPT và luyện thi đại học. Phương pháp giảng dạy dễ hiểu, nhiều học sinh đạt điểm 9-10.',
      fee_min: 150000, fee_max: 250000,
      location: 'Hà Nội',
      is_verified: true, rating_avg: 4.8, total_students: 45,
    }
  },
  {
    user: { full_name: 'Trần Văn Minh', email: 'minh.tran@tutor.com', phone: '0912345678' },
    tutor: {
      title: 'Gia sư Tiếng Anh giao tiếp & IELTS',
      subject: 'Tiếng Anh',
      grade_level: 'THCS',
      about: 'Cử nhân ngôn ngữ Anh, IELTS 8.0, 6 năm dạy tiếng Anh giao tiếp và luyện IELTS. Cam kết cải thiện điểm số rõ rệt sau 3 tháng.',
      fee_min: 200000, fee_max: 350000,
      location: 'TP.HCM',
      is_verified: true, rating_avg: 4.9, total_students: 62,
    }
  },
  {
    user: { full_name: 'Lê Thị Hoa', email: 'hoa.le@tutor.com', phone: '0923456789' },
    tutor: {
      title: 'Giáo viên Văn học chuyên luyện thi THPT Quốc Gia',
      subject: 'Văn học',
      grade_level: 'THPT',
      about: 'Thạc sĩ Ngữ văn, 10 năm kinh nghiệm. Giúp học sinh nắm vững kỹ năng phân tích văn học và viết văn nghị luận.',
      fee_min: 130000, fee_max: 200000,
      location: 'Đà Nẵng',
      is_verified: true, rating_avg: 4.7, total_students: 38,
    }
  },
  {
    user: { full_name: 'Phạm Quốc Hùng', email: 'hung.pham@tutor.com', phone: '0934567890' },
    tutor: {
      title: 'Kỹ sư Vật lý - Gia sư Vật lý chuyên sâu',
      subject: 'Vật lý',
      grade_level: 'THPT',
      about: 'Kỹ sư Vật lý ứng dụng, 5 năm dạy kèm. Giỏi trực quan hóa bài toán Vật lý khó, nhiều học sinh thi đậu trường top.',
      fee_min: 180000, fee_max: 280000,
      location: 'Hà Nội',
      is_verified: true, rating_avg: 4.6, total_students: 29,
    }
  },
  {
    user: { full_name: 'Võ Thị Thu', email: 'thu.vo@tutor.com', phone: '0945678901' },
    tutor: {
      title: 'Gia sư Hóa học - Chuyên luyện thi ĐH',
      subject: 'Hóa học',
      grade_level: 'THPT',
      about: 'Cử nhân Hóa học, 7 năm kinh nghiệm. Phương pháp giải toán Hóa nhanh gọn, giúp học sinh nhớ lâu.',
      fee_min: 160000, fee_max: 260000,
      location: 'TP.HCM',
      is_verified: true, rating_avg: 4.7, total_students: 34,
    }
  },
  {
    user: { full_name: 'Đặng Hữu Nam', email: 'nam.dang@tutor.com', phone: '0956789012' },
    tutor: {
      title: 'Gia sư Sinh học - Ôn thi THPT và đại học',
      subject: 'Sinh học',
      grade_level: 'THPT',
      about: 'Cử nhân Sinh học, 4 năm dạy kèm. Hệ thống hóa kiến thức Sinh học dễ nhớ qua sơ đồ tư duy.',
      fee_min: 140000, fee_max: 220000,
      location: 'Cần Thơ',
      is_verified: true, rating_avg: 4.5, total_students: 21,
    }
  },
  {
    user: { full_name: 'Bùi Thị Ngọc', email: 'ngoc.bui@tutor.com', phone: '0967890123' },
    tutor: {
      title: 'Giáo viên Tiểu học - Chuyên dạy lớp 1-5',
      subject: 'Toán',
      grade_level: 'Tiểu học',
      about: 'Giáo viên tiểu học 9 năm kinh nghiệm. Dạy Toán và Tiếng Việt cho học sinh lớp 1-5 theo phương pháp vui học.',
      fee_min: 100000, fee_max: 160000,
      location: 'Hà Nội',
      is_verified: true, rating_avg: 4.9, total_students: 55,
    }
  },
  {
    user: { full_name: 'Hoàng Văn Đức', email: 'duc.hoang@tutor.com', phone: '0978901234' },
    tutor: {
      title: 'Gia sư Lập trình - Python, Web, Thuật toán',
      subject: 'Tin học',
      grade_level: 'THPT',
      about: 'Kỹ sư phần mềm, 4 năm kinh nghiệm. Dạy lập trình Python, web cơ bản và thuật toán cho học sinh và sinh viên.',
      fee_min: 250000, fee_max: 400000,
      location: 'TP.HCM',
      is_verified: true, rating_avg: 4.8, total_students: 27,
    }
  },
  {
    user: { full_name: 'Nguyễn Thị Mai', email: 'mai.nguyen2@tutor.com', phone: '0989012345' },
    tutor: {
      title: 'Gia sư Toán Tiểu học & THCS',
      subject: 'Toán',
      grade_level: 'THCS',
      about: 'Giáo viên Toán 7 năm kinh nghiệm dạy tiểu học và THCS. Kiên nhẫn, tận tâm, giúp học sinh xây dựng nền tảng vững chắc.',
      fee_min: 120000, fee_max: 190000,
      location: 'Hải Phòng',
      is_verified: true, rating_avg: 4.6, total_students: 40,
    }
  },
  {
    user: { full_name: 'Trần Thị Bình', email: 'binh.tran@tutor.com', phone: '0990123456' },
    tutor: {
      title: 'Gia sư Tiếng Anh thiếu nhi - Phát âm chuẩn',
      subject: 'Tiếng Anh',
      grade_level: 'Tiểu học',
      about: 'Tốt nghiệp ĐH Ngoại ngữ, IELTS 7.5. Chuyên dạy tiếng Anh cho trẻ em 5-12 tuổi qua trò chơi và bài hát.',
      fee_min: 150000, fee_max: 230000,
      location: 'Hà Nội',
      is_verified: true, rating_avg: 4.8, total_students: 48,
    }
  },
  {
    user: { full_name: 'Lý Văn Tùng', email: 'tung.ly@tutor.com', phone: '0901122334' },
    tutor: {
      title: 'Gia sư Vật lý THCS - Giải bài tập chuyên sâu',
      subject: 'Vật lý',
      grade_level: 'THCS',
      about: 'Thạc sĩ Vật lý, 6 năm dạy kèm THCS. Giúp học sinh yêu thích Vật lý qua các thí nghiệm thực tế.',
      fee_min: 150000, fee_max: 240000,
      location: 'TP.HCM',
      is_verified: true, rating_avg: 4.5, total_students: 32,
    }
  },
  {
    user: { full_name: 'Phạm Thị Hằng', email: 'hang.pham@tutor.com', phone: '0912233445' },
    tutor: {
      title: 'Gia sư Hóa học THCS - Nền tảng vững chắc',
      subject: 'Hóa học',
      grade_level: 'THCS',
      about: 'Cử nhân Hóa học, 5 năm kinh nghiệm. Dạy Hóa THCS theo chương trình mới, dễ hiểu và thực hành nhiều.',
      fee_min: 130000, fee_max: 200000,
      location: 'Đà Nẵng',
      is_verified: true, rating_avg: 4.4, total_students: 25,
    }
  },
  {
    user: { full_name: 'Ngô Anh Khoa', email: 'khoa.ngo@tutor.com', phone: '0923344556' },
    tutor: {
      title: 'Gia sư Toán - Luyện thi chuyên đề nâng cao',
      subject: 'Toán',
      grade_level: 'THPT',
      about: 'Cử nhân Toán học, từng đoạt giải Toán cấp tỉnh. 5 năm dạy kèm Toán chuyên sâu, nhiều học sinh đạt giải Toán học sinh giỏi.',
      fee_min: 200000, fee_max: 320000,
      location: 'Hà Nội',
      is_verified: true, rating_avg: 4.9, total_students: 30,
    }
  },
  {
    user: { full_name: 'Đinh Thị Phương', email: 'phuong.dinh@tutor.com', phone: '0934455667' },
    tutor: {
      title: 'Gia sư Lịch sử - Địa lý THCS & THPT',
      subject: 'Lịch sử',
      grade_level: 'THCS',
      about: 'Cử nhân Sư phạm Lịch sử, 6 năm dạy kèm. Dạy Lịch sử qua câu chuyện thú vị giúp học sinh nhớ lâu và yêu thích môn học.',
      fee_min: 120000, fee_max: 180000,
      location: 'Cần Thơ',
      is_verified: true, rating_avg: 4.5, total_students: 28,
    }
  },
  {
    user: { full_name: 'Vũ Tiến Dũng', email: 'dung.vu@tutor.com', phone: '0945566778' },
    tutor: {
      title: 'Gia sư IELTS - TOEIC - Tiếng Anh thương mại',
      subject: 'Tiếng Anh',
      grade_level: 'THPT',
      about: 'IELTS 8.5, từng sống và học tập tại Anh 2 năm. Chuyên luyện IELTS Speaking/Writing và tiếng Anh thương mại cho người đi làm.',
      fee_min: 300000, fee_max: 500000,
      location: 'TP.HCM',
      is_verified: true, rating_avg: 5.0, total_students: 18,
    }
  },
  {
    user: { full_name: 'Cao Thị Thúy', email: 'thuy.cao@tutor.com', phone: '0956677889' },
    tutor: {
      title: 'Gia sư Toán Tiểu học - Phương pháp Singapore',
      subject: 'Toán',
      grade_level: 'Tiểu học',
      about: 'Giáo viên tiểu học 8 năm, được đào tạo phương pháp Toán Singapore. Giúp trẻ em tư duy logic từ sớm.',
      fee_min: 110000, fee_max: 170000,
      location: 'Hà Nội',
      is_verified: true, rating_avg: 4.7, total_students: 52,
    }
  },
  {
    user: { full_name: 'Lưu Minh Quân', email: 'quan.luu@tutor.com', phone: '0967788990' },
    tutor: {
      title: 'Gia sư Tin học - Lập trình C++, Java',
      subject: 'Tin học',
      grade_level: 'THCS',
      about: 'Kỹ sư CNTT, 3 năm kinh nghiệm dạy lập trình. Dạy C++, Java, thuật toán cho học sinh THCS và THPT.',
      fee_min: 200000, fee_max: 350000,
      location: 'Hà Nội',
      is_verified: false, rating_avg: 4.3, total_students: 15,
    }
  },
  {
    user: { full_name: 'Trịnh Thị Ánh', email: 'anh.trinh@tutor.com', phone: '0978899001' },
    tutor: {
      title: 'Gia sư Văn học THCS - Cảm thụ văn chương',
      subject: 'Văn học',
      grade_level: 'THCS',
      about: 'Cử nhân Ngữ văn, 5 năm dạy kèm. Chuyên rèn kỹ năng cảm thụ văn học và viết đoạn văn cho học sinh THCS.',
      fee_min: 120000, fee_max: 180000,
      location: 'TP.HCM',
      is_verified: true, rating_avg: 4.6, total_students: 36,
    }
  },
  {
    user: { full_name: 'Đỗ Văn Long', email: 'long.do@tutor.com', phone: '0989900112' },
    tutor: {
      title: 'Gia sư Địa lý & GDCD THPT',
      subject: 'Địa lý',
      grade_level: 'THPT',
      about: 'Cử nhân Địa lý, 4 năm dạy kèm. Dạy Địa lý và GDCD theo hướng thực tế, giúp học sinh ghi nhớ dễ dàng và vận dụng tốt.',
      fee_min: 120000, fee_max: 190000,
      location: 'Đà Nẵng',
      is_verified: true, rating_avg: 4.4, total_students: 22,
    }
  },
  {
    user: { full_name: 'Phan Thị Cẩm', email: 'cam.phan@tutor.com', phone: '0901011223' },
    tutor: {
      title: 'Gia sư Tiếng Anh THCS - Phát âm & Ngữ pháp',
      subject: 'Tiếng Anh',
      grade_level: 'THCS',
      about: 'Cử nhân Sư phạm Tiếng Anh, IELTS 7.0, 5 năm dạy kèm. Chú trọng phát âm chuẩn và ngữ pháp nền tảng cho học sinh THCS.',
      fee_min: 140000, fee_max: 220000,
      location: 'Hải Phòng',
      is_verified: true, rating_avg: 4.6, total_students: 31,
    }
  }
];

async function seed() {
  try {
    await sequelize.authenticate();
    console.log('✅ Kết nối DB thành công!');

    const hashedPassword = await bcrypt.hash('tutor123', 10);
    let created = 0;
    let skipped = 0;

    for (const item of tutorsData) {
      const { user: userData, tutor: tutorData } = item;

      // Kiểm tra email đã tồn tại chưa
      const existing = await User.findOne({ where: { email: userData.email } });
      if (existing) {
        console.log(`⚠️  Bỏ qua (đã tồn tại): ${userData.email}`);
        skipped++;
        continue;
      }

      // Tạo User
      const user = await User.create({
        full_name: userData.full_name,
        email: userData.email,
        password: hashedPassword,
        phone: userData.phone,
        role: 'tutor',
      });

      // Tạo hồ sơ Tutor
      await Tutor.create({
        user_id: user.id,
        title: tutorData.title,
        subject: tutorData.subject,
        grade_level: tutorData.grade_level,
        about: tutorData.about,
        fee_min: tutorData.fee_min,
        fee_max: tutorData.fee_max,
        location: tutorData.location,
        is_verified: tutorData.is_verified,
        rating_avg: tutorData.rating_avg,
        total_students: tutorData.total_students,
        education: JSON.stringify([]),
        experience: JSON.stringify([]),
      });

      console.log(`✨ Đã tạo gia sư: ${userData.full_name} (${userData.email})`);
      created++;
    }

    console.log(`\n🎉 Hoàn tất! Đã tạo ${created} gia sư, bỏ qua ${skipped} (đã tồn tại).`);
    process.exit(0);
  } catch (err) {
    console.error('❌ Lỗi:', err.message || err);
    process.exit(1);
  }
}

seed();
