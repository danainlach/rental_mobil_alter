# 🚗 Website Rental Mobil Kelompok 1

## 📜 Deskripsi

Website Rental Mobil ini dikembangkan untuk memenuhi kriteria nilai UAS pada mata kuliah **Pengembangan Web**. Kami menggunakan **Express.js** sebagai framework utama dalam membangun aplikasi ini. Website ini bertujuan untuk memberikan kemudahan bagi pengguna dalam melakukan pemesanan dan pengelolaan sewa mobil secara online.

### 🔑 Fitur Utama
- **Pendaftaran Pengguna**: Pengguna dapat mendaftar dan membuat akun.
- **Login & Logout**: Pengguna dapat login ke dalam sistem dan keluar setelah selesai.
- **Manajemen Mobil**: Admin dapat menambah, mengedit, dan menghapus data mobil yang tersedia untuk disewa.
- **Pemesanan Mobil**: Pengguna dapat melakukan pemesanan mobil sesuai dengan pilihan yang tersedia.
- **Riwayat Transaksi**: Pengguna dapat melihat riwayat transaksi sewa mobil mereka.
- **Fitur Chat**: Pengguna dan Admin dapat berkomunikasi langsung lewat chat.

## ⚙️ Teknologi yang Digunakan

- **Node.js**: Platform untuk menjalankan server aplikasi menggunakan JavaScript.
- **Express.js**: Framework minimalis untuk membangun aplikasi web.
- **EJS**: Template engine untuk rendering tampilan dinamis.
- **MongoDB**: Basis data NoSQL untuk menyimpan data pengguna dan mobil.
- **Bootstrap**: Kerangka kerja CSS untuk desain responsif dan antarmuka pengguna.
- **HTML/CSS/JavaScript**: Digunakan untuk membangun tampilan dan interaktivitas.

## 🚀 Setup Proyek

Untuk memulai proyek ini, Anda perlu mengikuti beberapa langkah berikut:

### 1. Clone repositori ini

```bash
git clone https://github.com/username/repository-name.git

```markdown
### 2. Install dependensi yang diperlukan

Masuk ke folder proyek dan instal semua dependensi yang diperlukan:

```bash
cd repository-name
npm install
```
### 3. Menjalankan aplikasi

Untuk menjalankan aplikasi secara lokal, gunakan perintah:

```bash
npm start
```

Aplikasi akan berjalan pada [http://localhost:3000](http://localhost:3000).

### 4. Konfigurasi Database

Pastikan Anda telah menyiapkan **MongoDB**. Sesuaikan konfigurasi koneksi di file `config/db.js` agar aplikasi dapat terhubung dengan database Anda.

---

## 🗂️ Struktur Direktori

Berikut adalah struktur direktori proyek ini:

```bash
├── config/                # Konfigurasi aplikasi (termasuk pengaturan database)
├── models/                # Model untuk MongoDB (Schema untuk pengguna, mobil, dan transaksi)
├── routes/                # Mengatur route aplikasi web
├── views/                 # Views untuk EJS templates
├── public/                # Berkas statis seperti CSS, JavaScript, dan gambar
├── app.js                 # File utama Express.js yang menjalankan server
├── package.json           # Daftar dependensi proyek
└── README.md              # Dokumentasi proyek
```

---

## 🎨 Preview Tampilan

**Halaman Depan (Homepage)**:  
Pengguna dapat melihat daftar mobil yang tersedia untuk disewa. Desain yang responsif memudahkan akses pada berbagai perangkat.

![Homepage Preview](https://via.placeholder.com/600x400.png?text=Homepage+Preview)

**Halaman Pemesanan Mobil**:  
Pengguna dapat memilih mobil, mengisi form pemesanan, dan melihat status pesanan mereka.

![Booking Page Preview](https://via.placeholder.com/600x400.png?text=Booking+Page+Preview)

---

## 💬 Cara Menggunakan

### 1. **Pengguna**:
- Pengguna dapat **mendaftar** dan **login** untuk mengakses fitur pemesanan.
- Pilih mobil dari daftar dan lakukan **pemesanan** melalui form yang telah disediakan.
- Lihat riwayat transaksi sewa mobil melalui dashboard pengguna.

### 2. **Admin**:
- Admin dapat **mengelola mobil** (menambah, mengedit, dan menghapus mobil yang tersedia).
- Admin juga dapat **melihat riwayat transaksi** sewa mobil pengguna.
- Fitur **chat** tersedia untuk komunikasi antara admin dan pengguna secara langsung.

---

## 💻 Kontribusi

Kami menerima kontribusi dari siapa saja yang ingin memperbaiki atau meningkatkan proyek ini. Jika Anda ingin berkontribusi, ikuti langkah-langkah berikut:

1. Fork repositori ini.
2. Buat branch baru untuk fitur atau perbaikan yang ingin Anda kerjakan:
   ```bash
   git checkout -b fitur-baru
   ```
3. Commit perubahan Anda:
   ```bash
   git commit -am 'Menambahkan fitur baru'
   ```
4. Push branch ke repositori Anda:
   ```bash
   git push origin fitur-baru
   ```
5. Kirim pull request untuk review.

---

## 📄 Lisensi

Proyek ini dilisensikan di bawah **MIT License**. Lihat file [LICENSE](LICENSE) untuk detail lebih lanjut.

---

Terima kasih telah menggunakan atau berkontribusi pada proyek kami! 🚗💨
```

Dengan penambahan visual seperti preview gambar dan langkah-langkah yang lebih jelas, README ini menjadi lebih interaktif dan mudah dipahami. Anda bisa mengganti placeholder gambar dengan screenshot nyata dari aplikasi Anda untuk membuatnya lebih menarik.
