export interface TenantThemeConfig {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  hoverColor: string;
  headline: string;
  subheadline: string;
  aboutHeadline: string;
  aboutStory: string;
  aboutMission: string;
  aboutImgPlaceholder: string;
  stats: Array<{ number: string; label: string }>;
  whyChooseUs: Array<{ title: string; desc: string; icon: string }>;
  testimonials: Array<{ name: string; role: string; text: string; avatarUrl?: string }>;
  faqs: Array<{ q: string; a: string }>;
}

export const defaultThemeConfig: TenantThemeConfig = {
  primaryColor: '#4F46E5', // Indigo 600
  secondaryColor: '#6366F1', // Indigo 500
  accentColor: '#EEF2F6', // Slate 100
  hoverColor: '#4338CA', // Indigo 700
  headline: 'Solusi Ritel Webstore Instan & Terpercaya',
  subheadline: 'Temukan produk pilihan terbaik kami dengan kualitas terjamin dan layanan closing langsung ke WhatsApp.',
  aboutHeadline: 'Membangun Hubungan Erat Lewat Produk Berkualitas',
  aboutStory: 'Toko kami didedikasikan untuk menyediakan produk-produk unggulan pilihan yang dirancang dengan perhatian penuh terhadap kualitas dan kepuasan pelanggan. Kami percaya bahwa belanja online haruslah mudah, aman, dan personal.',
  aboutMission: 'Memberikan layanan transaksi belanja online yang transparan, bersahabat, dan terjangkau bagi semua pelanggan di Indonesia.',
  aboutImgPlaceholder: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=1200&auto=format&fit=crop',
  stats: [
    { number: '100+', label: 'Pelanggan Puas' },
    { number: '500+', label: 'Produk Terkirim' },
    { number: '2 Tahun', label: 'Pengalaman' },
    { number: '4.8/5', label: 'Rating Kepuasan' },
  ],
  whyChooseUs: [
    { title: 'Kualitas Premium', desc: 'Setiap produk melalui proses kurasi ketat sebelum dikirim.', icon: 'award' },
    { title: 'Pengiriman Cepat', desc: 'Kemitraan logistik tepercaya menjamin paket sampai tepat waktu.', icon: 'truck' },
    { title: 'Respons WhatsApp', desc: 'Admin kami siap membantu konsultasi dan konfirmasi belanja.', icon: 'message' },
    { title: 'Transaksi Aman', desc: 'Transfer bank manual aman dengan verifikasi instan.', icon: 'shield' },
  ],
  testimonials: [
    { name: 'Andi Pratama', role: 'Pelanggan Setia', text: 'Pelayanan luar biasa cepat, respon admin via WhatsApp sangat ramah dan pesanan dikemas dengan aman.', avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=100' },
    { name: 'Siti Rahma', role: 'Ibu Rumah Tangga', text: 'Produk aslinya sangat bagus dan sesuai foto. Recomended banget untuk belanja di toko online ini.', avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=100' },
  ],
  faqs: [
    { q: 'Bagaimana cara melakukan pemesanan?', a: 'Pilih produk yang Anda minati di katalog toko, klik tombol Beli atau Tanya via WhatsApp, lalu Anda akan diarahkan langsung untuk mengirimkan pesan belanja otomatis ke admin kami.' },
    { q: 'Metode pembayaran apa saja yang didukung?', a: 'Saat ini kami melayani pembayaran transfer bank manual langsung ke nomor rekening resmi toko kami yang akan diberikan admin saat chat.' },
  ],
};

const toyaNusantaraThemeConfig: TenantThemeConfig = {
  primaryColor: '#166534', // Green 800 (Hijau Hutan Premium)
  secondaryColor: '#22C55E', // Green 500
  accentColor: '#E8F5E9', // Green 50 (Sangat lembut untuk background section)
  hoverColor: '#15803D', // Green 700
  headline: 'Rotan Latihan Berkualitas Untuk Praktisi Bela Diri Indonesia',
  subheadline: 'Kuat, lentur, lurus, dan tahan lama untuk kebutuhan latihan harian maupun perguruan bela diri.',
  aboutHeadline: 'Menjaga Tradisi Bela Diri dengan Kualitas Toya Rotan Terbaik',
  aboutStory: 'Toya Nusantara lahir dari kepedulian mendalam terhadap kebutuhan praktisi bela diri tradisional di Indonesia. Kami memahami betapa pentingnya memiliki toya latihan yang lurus, halus, seimbang, dan kokoh demi keamanan serta efisiensi berlatih. Oleh karena itu, kami bermitra langsung dengan perajin rotan lokal pilihan untuk menyeleksi rotan terbaik, memolesnya secara halus, dan memastikannya memiliki kelenturan alami yang kuat terhadap benturan keras. Setiap unit toya dibuat presisi untuk mendampingi perjalanan latihan Anda menuju prestasi terbaik.',
  aboutMission: 'Mendukung digitalisasi perajin rotan lokal Indonesia serta menyediakan peralatan bela diri tradisional bersertifikasi kekuatan premium bagi seluruh perguruan di Nusantara.',
  aboutImgPlaceholder: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=1200&auto=format&fit=crop',
  stats: [
    { number: '100+', label: 'Pelanggan Puas' },
    { number: '500+', label: 'Produk Terjual' },
    { number: '5 Tahun', label: 'Pengalaman' },
    { number: '4.9/5', label: 'Kepuasan Pelanggan' },
  ],
  whyChooseUs: [
    { title: '🏆 Kualitas Terjamin', desc: 'Toya rotan pilihan yang lurus, halus, kuat, dan seimbang.', icon: 'award' },
    { title: '🚚 Pengiriman Nasional', desc: 'Kemasan ekstra aman dengan proteksi kayu/buble wrap untuk seluruh Indonesia.', icon: 'truck' },
    { title: '💬 Respon Cepat WhatsApp', desc: 'Konsultasi ukuran panjang, berat, dan jenis perguruan silat secara langsung.', icon: 'message' },
    { title: '🔒 Transaksi Tepercaya', desc: 'Transfer bank langsung aman dengan konfirmasi instan dari admin kami.', icon: 'shield' },
  ],
  testimonials: [
    { name: 'Aris Nugraha', role: 'Pelatih Pencak Silat', text: 'Toya dari Toya Nusantara memiliki kelenturan yang pas untuk latihan jurus ganda. Sangat tangguh untuk benturan tanding.', avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=100' },
    { name: 'Dewi Lestari', role: 'Praktisi Wushu', text: 'Respon cepat via WhatsApp. Pengiriman ke luar pulau cepat, aman, dan terbungkus sangat rapi. Kualitas rotannya jempolan!', avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=100' },
    { name: 'Budi Pratama', role: 'Pemilik Perguruan Bela Diri', text: 'Memesan 50 unit untuk perguruan dan semuanya lurus, halus, dengan ukuran seragam. Sangat direkomendasikan untuk pemesanan massal.', avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=100' },
  ],
  faqs: [
    { q: 'Bagaimana cara memesan produk di Toya Nusantara?', a: 'Cukup telusuri katalog produk di bawah, pilih produk yang Anda inginkan (misal Toya 150cm atau 180cm), lalu klik tombol Beli atau Tanya via WhatsApp. Anda akan otomatis dialihkan ke chat admin kami dengan pesan pemesanan yang sudah terformat.' },
    { q: 'Apakah bisa mengirim pesanan ke luar kota atau luar pulau?', a: 'Tentu saja! Kami berpengalaman mengirimkan paket toya rotan ke seluruh Indonesia. Kami menggunakan kemasan tabung karton tebal atau plastik gelembung tebal agar toya sampai ke alamat Anda dalam kondisi prima.' },
    { q: 'Berapa lama estimasi waktu pengiriman barang?', a: 'Untuk pulau Jawa biasanya berkisar antara 2-4 hari kerja. Untuk luar pulau Jawa, estimasi pengiriman kargo hemat adalah sekitar 5-10 hari kerja bergantung pada kelancaran ekspedisi logistik.' },
    { q: 'Bagaimana metode pembayaran yang tersedia?', a: 'Kami melayani pembayaran aman melalui transfer bank manual ke rekening resmi perguruan kami. Detail rekening dan total nominal beserta ongkos kirim akan dikonfirmasi admin via WhatsApp.' },
  ],
};

export function getTenantThemeConfig(slugOrSubdomain: string): TenantThemeConfig {
  const normalized = (slugOrSubdomain || '').toLowerCase().trim();
  if (normalized === 'toya-nusantara' || normalized === 'toyanusantara') {
    return toyaNusantaraThemeConfig;
  }
  return defaultThemeConfig;
}
