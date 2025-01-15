Website Rental Mobil Kelompok 1
Deskripsi
Website Rental Mobil ini dikembangkan untuk memenuhi kriteria nilai UAS pada mata kuliah Pengembangan Web. Kami menggunakan Express.js sebagai framework utama dalam membangun aplikasi ini. Website ini bertujuan untuk memberikan kemudahan bagi pengguna dalam melakukan pemesanan dan pengelolaan sewa mobil secara online.

Fitur Utama
Pendaftaran Pengguna: Pengguna dapat mendaftar dan membuat akun.
Login & Logout: Pengguna dapat login ke dalam sistem dan keluar setelah selesai.
Manajemen Mobil: Admin dapat menambah, mengedit, dan menghapus data mobil yang tersedia untuk disewa.
Pemesanan Mobil: Pengguna dapat melakukan pemesanan mobil sesuai dengan pilihan yang tersedia.
Riwayat Transaksi: Pengguna dapat melihat riwayat transaksi sewa mobil mereka.
Teknologi yang Digunakan
Node.js: Untuk menjalankan server Express.js.
Express.js: Framework yang digunakan untuk membangun aplikasi web.
EJS: Template engine untuk rendering tampilan dinamis.
MongoDB: Basis data untuk menyimpan data pengguna dan mobil.
Bootstrap: Untuk desain responsif dan antarmuka pengguna yang menarik.
CSS/HTML: Untuk styling tampilan web.
Setup Proyek
Kloning repositori ini:

bash
Salin kode
git clone https://github.com/username/repository-name.git
Install dependensi:

Setelah mengkloning repositori, masuk ke dalam folder proyek dan jalankan perintah berikut untuk menginstal semua dependensi yang diperlukan:

bash
Salin kode
cd repository-name
npm install
Menjalankan aplikasi:

Untuk menjalankan aplikasi, gunakan perintah berikut:

bash
Salin kode
npm start
Aplikasi akan berjalan pada http://localhost:3000.

Konfigurasi Database:

Pastikan Anda memiliki database MongoDB yang telah disiapkan dan sesuaikan konfigurasi koneksi di file config/db.js.

Struktur Direktori
bash
Salin kode
├── config/                # Konfigurasi aplikasi (termasuk database)
├── models/                # Model untuk MongoDB
├── routes/                # Route untuk aplikasi
├── views/                 # Views untuk EJS templates
├── public/                # Berkas statis (CSS, JavaScript, Gambar)
├── app.js                 # File utama Express.js
├── package.json           # Dependensi proyek
└── README.md              # Dokumentasi proyek
Penggunaan
Halaman Depan: Menampilkan daftar mobil yang tersedia untuk disewa.
Pendaftaran dan Login: Pengguna dapat mendaftar atau login untuk melakukan pemesanan mobil.
Admin Panel: Admin dapat mengelola mobil, seperti menambah dan mengedit data mobil.
Pemesanan: Pengguna dapat memilih mobil, mengisi data pemesanan, dan melihat status pesanan.
Kontribusi
Kami menerima kontribusi dari siapa saja yang tertarik untuk meningkatkan proyek ini. Jika Anda ingin memberikan kontribusi, harap lakukan fork pada repositori ini, buat cabang (branch) baru untuk perubahan Anda, kemudian kirimkan pull request.

Langkah-langkah kontribusi:

Fork repositori ini
Buat branch baru (git checkout -b feature/fitur-baru)
Commit perubahan (git commit -am 'Add fitur baru')
Push ke branch baru (git push origin feature/fitur-baru)
Buat pull request
Lisensi
Proyek ini dilisensikan di bawah lisensi MIT - lihat file LICENSE untuk informasi lebih lanjut.
