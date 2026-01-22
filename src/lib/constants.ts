
export const METU_DEPARTMENTS = [
  "İngilizce Hazırlık Programı",
  "Bilgisayar Mühendisliği",
  "Elektrik-Elektronik Mühendisliği",
  "Makina Mühendisliği",
  "İnşaat Mühendisliği",
  "Endüstri Mühendisliği",
  "Havacılık ve Uzay Mühendisliği",
  "Kimya Mühendisliği",
  "Çevre Mühendisliği",
  "Gıda Mühendisliği",
  "Jeoloji Mühendisliği",
  "Maden Mühendisliği",
  "Metalurji ve Malzeme Mühendisliği",
  "Petrol ve Doğalgaz Mühendisliği",
  "Mimarlık",
  "Şehir ve Bölge Planlama",
  "Endüstriyel Tasarım",
  "Psikoloji",
  "Sosyoloji",
  "Felsefe",
  "Tarih",
  "İktisat",
  "İşletme",
  "Siyaset Bilimi ve Kamu Yönetimi",
  "Uluslararası İlişkiler",
  "Matematik",
  "Fizik",
  "Kimya",
  "Biyoloji",
  "İstatistik",
  "Moleküler Biyoloji ve Genetik",
  "İngilizce Öğretmenliği",
  "Okul Öncesi Eğitimi",
  "Bilgisayar ve Öğretim Teknolojileri Eğitimi",
  "Fen Bilgisi Öğretmenliği",
  "İlköğretim Matematik Öğretmenliği",
  "Beden Eğitimi ve Spor",
  "Diğer"
];

export const BILKENT_DEPARTMENTS = [
  "Bilgisayar Mühendisliği",
  "Elektrik ve Elektronik Mühendisliği",
  "Endüstri Mühendisliği",
  "Makine Mühendisliği",
  "İşletme",
  "İktisat",
  "Uluslararası İlişkiler",
  "Siyaset Bilimi ve Kamu Yönetimi",
  "Psikoloji",
  "Mimarlık",
  "İç Mimarlık ve Çevre Tasarımı",
  "Grafik Tasarım",
  "İletişim ve Tasarım",
  "Turizm ve Otel İşletmeciliği",
  "Hukuk",
  "Fizik",
  "Kimya",
  "Matematik",
  "Moleküler Biyoloji ve Genetik",
  "İngiliz Dili ve Edebiyatı",
  "Amerikan Kültürü ve Edebiyatı",
  "Arkeoloji",
  "Felsefe",
  "Diğer"
];

export const CANKAYA_DEPARTMENTS = [
  "Bilgisayar Mühendisliği",
  "Elektrik-Elektronik Mühendisliği",
  "Endüstri Mühendisliği",
  "İnşaat Mühendisliği",
  "Makine Mühendisliği",
  "Mekatronik Mühendisliği",
  "İç Mimarlık",
  "Mimarlık",
  "Şehir ve Bölge Planlama",
  "Hukuk",
  "İktisat",
  "İşletme",
  "Uluslararası Ticaret",
  "Siyaset Bilimi ve Uluslararası İlişkiler",
  "Psikoloji",
  "Matematik",
  "İngiliz Dili ve Edebiyatı",
  "Mütercim-Tercümanlık",
  "Diğer"
];

export const ADMIN_EMAIL = "dogan.kerem@metu.edu.tr";
export const ADMIN_NAME = "Kerem Doğan";

export const SUPER_ADMIN_NAMES = [
  "Kerem Doğan",
  "Berke Şen",
  "Salih Kızıler",
  "Salih Kiziler"
];

export const SUPER_ADMIN_EMAILS = [
  "dogan.kerem@metu.edu.tr",
  "e277326@metu.edu.tr"
];

export const METU_CLASSES = [
  "Hazırlık",
  "1. Sınıf",
  "2. Sınıf",
  "3. Sınıf",
  "4. Sınıf",
  "Yüksek Lisans",
  "Doktora",
  "Mezun"
];

export const BAN_CATEGORIES = [
  { id: 'spam', label: 'Spam / Reklam', description: 'İstenmeyen içerik paylaşımı' },
  { id: 'harassment', label: 'Taciz / Zorbalık', description: 'Diğer kullanıcılara karşı taciz' },
  { id: 'hate_speech', label: 'Nefret Söylemi', description: 'Ayrımcı veya nefret içerikli söylem' },
  { id: 'inappropriate', label: 'Uygunsuz İçerik', description: 'Müstehcen veya uygunsuz içerik' },
  { id: 'impersonation', label: 'Kimlik Taklidi', description: 'Başka bir kişi veya kurum taklidi' },
  { id: 'misinformation', label: 'Yanlış Bilgi', description: 'Kasıtlı yanıltıcı bilgi paylaşımı' },
  { id: 'security', label: 'Güvenlik İhlali', description: 'Sistem güvenliğini tehdit eden davranış' },
  { id: 'terms_violation', label: 'Kullanım Koşulları İhlali', description: 'Site kurallarının ihlali' },
  { id: 'other', label: 'Diğer', description: 'Belirtilen kategorilere uymayan sebep' }
];

export const REPORT_CATEGORIES = [
  { id: 'spam', label: 'Spam / Reklam', description: 'İstenmeyen içerik veya reklam' },
  { id: 'harassment', label: 'Taciz / Zorbalık', description: 'Kişiye yönelik taciz' },
  { id: 'hate_speech', label: 'Nefret Söylemi', description: 'Ayrımcı içerik' },
  { id: 'inappropriate', label: 'Uygunsuz İçerik', description: 'Müstehcen veya rahatsız edici' },
  { id: 'misinformation', label: 'Yanlış Bilgi', description: 'Yanıltıcı bilgi' },
  { id: 'violence', label: 'Şiddet / Tehdit', description: 'Şiddet içeren veya tehditkar' },
  { id: 'copyright', label: 'Telif Hakkı İhlali', description: 'İzinsiz içerik kullanımı' },
  { id: 'other', label: 'Diğer', description: 'Diğer sebepler' }
];

export const COMMUNITY_CATEGORIES = [
  "Sanat",
  "Spor",
  "Bilim",
  "Teknoloji",
  "Kültür",
  "Müzik",
  "Sosyal Sorumluluk",
  "Girişimcilik",
  "Mesleki",
  "Oyun",
  "Diğer"
];
