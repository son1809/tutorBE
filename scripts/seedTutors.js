require('dotenv').config();
const bcrypt = require('bcryptjs');
const sequelize = require('../config/db');
const { User, Tutor } = require('../models');

const password = 'Tutor@123';

const tutors = [
  {
    full_name: 'Nguyen Minh Anh',
    email: 'minhanh.tutor@edumatch.local',
    phone: '0901000001',
    title: 'Giao vien Toan THCS',
    subject: 'Toán',
    grade_level: 'THCS',
    about: 'Co 6 nam day Toan THCS, tap trung lap lo hong kien thuc va ren ky nang giai de.',
    education: ['Cu nhan Su pham Toan - Dai hoc Su pham Ha Noi'],
    experience: ['2019 - Nay: Giao vien Toan THCS', '2021 - Nay: Gia su luyen thi vao lop 10'],
    fee_min: 180000,
    fee_max: 250000,
    location: 'Ha Noi / Online',
    rating_avg: 4.8,
    total_students: 86,
  },
  {
    full_name: 'Tran Quoc Bao',
    email: 'quocbao.tutor@edumatch.local',
    phone: '0901000002',
    title: 'Gia su Vat Ly THPT',
    subject: 'Vật Lý',
    grade_level: 'THPT',
    about: 'Chuyen Vat Ly 10-12, luyen thi THPT Quoc gia theo lo trinh ca nhan.',
    education: ['Ky su Vat ly Ky thuat - Dai hoc Bach Khoa Ha Noi'],
    experience: ['2020 - Nay: Gia su Vat Ly THPT', '2022 - Nay: Day nhom luyen thi THPT'],
    fee_min: 220000,
    fee_max: 320000,
    location: 'Ha Noi / Online',
    rating_avg: 4.9,
    total_students: 74,
  },
  {
    full_name: 'Le Thao Linh',
    email: 'thaolinh.tutor@edumatch.local',
    phone: '0901000003',
    title: 'IELTS 8.0, giao vien Tieng Anh',
    subject: 'Tiếng Anh',
    grade_level: 'THPT',
    about: 'Day ngu phap, giao tiep va IELTS Foundation cho hoc sinh cap 3.',
    education: ['Cu nhan Ngon ngu Anh - Dai hoc Ha Noi', 'IELTS 8.0'],
    experience: ['2018 - Nay: Giao vien Tieng Anh', '2020 - Nay: Luyen IELTS Foundation'],
    fee_min: 250000,
    fee_max: 400000,
    location: 'Online',
    rating_avg: 5,
    total_students: 132,
  },
  {
    full_name: 'Pham Hoang Nam',
    email: 'hoangnam.tutor@edumatch.local',
    phone: '0901000004',
    title: 'Thac si Hoa hoc',
    subject: 'Hóa Học',
    grade_level: 'THPT',
    about: 'Day Hoa 10-12, he thong ly thuyet ngan gon, bai tap theo chuyen de.',
    education: ['Thac si Hoa hoc - Dai hoc Khoa hoc Tu nhien'],
    experience: ['2017 - Nay: Giao vien Hoa hoc', '2019 - Nay: Gia su luyen thi THPT'],
    fee_min: 220000,
    fee_max: 350000,
    location: 'TP HCM / Online',
    rating_avg: 4.7,
    total_students: 95,
  },
  {
    full_name: 'Do Mai Chi',
    email: 'maichi.tutor@edumatch.local',
    phone: '0901000005',
    title: 'Giao vien Ngu Van',
    subject: 'Ngữ Văn',
    grade_level: 'THCS',
    about: 'Ren doc hieu, viet doan van, viet bai van nghi luan cho hoc sinh THCS.',
    education: ['Cu nhan Su pham Ngu Van - Dai hoc Su pham TP HCM'],
    experience: ['2019 - Nay: Giao vien Ngu Van THCS'],
    fee_min: 180000,
    fee_max: 260000,
    location: 'TP HCM / Online',
    rating_avg: 4.8,
    total_students: 64,
  },
  {
    full_name: 'Vu Khanh My',
    email: 'khanhmy.tutor@edumatch.local',
    phone: '0901000006',
    title: 'Gia su Sinh hoc',
    subject: 'Sinh Học',
    grade_level: 'THPT',
    about: 'Day Sinh hoc lop 10-12, on thi tot nghiep va xet tuyen khoi B.',
    education: ['Cu nhan Cong nghe Sinh hoc - Dai hoc Khoa hoc Tu nhien'],
    experience: ['2020 - Nay: Gia su Sinh hoc THPT'],
    fee_min: 200000,
    fee_max: 300000,
    location: 'Online',
    rating_avg: 4.6,
    total_students: 51,
  },
  {
    full_name: 'Hoang Duc Huy',
    email: 'duchuy.tutor@edumatch.local',
    phone: '0901000007',
    title: 'Gia su Lich Su',
    subject: 'Lịch Sử',
    grade_level: 'THPT',
    about: 'He thong moc thoi gian, su kien, ky nang viet cau tra loi tu luan.',
    education: ['Cu nhan Lich su - Dai hoc Khoa hoc Xa hoi va Nhan van'],
    experience: ['2018 - Nay: Gia su Lich Su'],
    fee_min: 170000,
    fee_max: 250000,
    location: 'Ha Noi / Online',
    rating_avg: 4.7,
    total_students: 43,
  },
  {
    full_name: 'Nguyen Ha Phuong',
    email: 'haphuong.tutor@edumatch.local',
    phone: '0901000008',
    title: 'Gia su Dia Ly',
    subject: 'Địa Lý',
    grade_level: 'THPT',
    about: 'Day Dia ly theo atlat, bieu do, nhan xet bang so lieu va on thi THPT.',
    education: ['Cu nhan Su pham Dia ly - Dai hoc Su pham Ha Noi'],
    experience: ['2019 - Nay: Gia su Dia Ly THPT'],
    fee_min: 170000,
    fee_max: 250000,
    location: 'Online',
    rating_avg: 4.8,
    total_students: 39,
  },
];

const seedTutors = async () => {
  await sequelize.sync();

  const hashedPassword = await bcrypt.hash(password, 10);

  for (const item of tutors) {
    const [user] = await User.findOrCreate({
      where: { email: item.email },
      defaults: {
        full_name: item.full_name,
        email: item.email,
        password: hashedPassword,
        phone: item.phone,
        role: 'tutor',
        avatar: '/tutor_profile.png',
      },
    });

    await user.update({
      full_name: item.full_name,
      phone: item.phone,
      role: 'tutor',
      avatar: user.avatar || '/tutor_profile.png',
    });

    const [tutor] = await Tutor.findOrCreate({
      where: { user_id: user.id },
      defaults: {
        user_id: user.id,
        title: item.title,
        subject: item.subject,
        grade_level: item.grade_level,
        about: item.about,
        education: item.education,
        experience: item.experience,
        fee_min: item.fee_min,
        fee_max: item.fee_max,
        location: item.location,
        is_verified: true,
        rating_avg: item.rating_avg,
        total_students: item.total_students,
      },
    });

    if (tutor) {
      await tutor.update({
        title: item.title,
        subject: item.subject,
        grade_level: item.grade_level,
        about: item.about,
        education: item.education,
        experience: item.experience,
        fee_min: item.fee_min,
        fee_max: item.fee_max,
        location: item.location,
        is_verified: true,
        rating_avg: item.rating_avg,
        total_students: item.total_students,
      });
    }
  }

  console.log(`Seeded ${tutors.length} tutors. Default password: ${password}`);
};

seedTutors()
  .then(() => sequelize.close())
  .catch(async (err) => {
    console.error(err.message || err);
    await sequelize.close();
    process.exit(1);
  });
