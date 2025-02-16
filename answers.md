# Technical Questions Answers

## 1. Timezone Conflicts
Untuk menangani konflik zona waktu antara partisipan dalam sebuah appointment, sistem dapat menampilkan alert yang menunjukkan partisipan mana yang berada di luar jam kerja berdasarkan zona waktunya. Saat ini, di frontend, aplikasi telah menggunakan fungsi `convertToUserTimezone()` untuk menampilkan waktu appointment sesuai dengan zona waktu pengguna.

## 2. Database Optimization
- **Menggunakan filter query MongoDB** untuk hanya mengambil appointment yang terkait dengan pengguna berdasarkan `creator_id` atau `participants`.
- **Melakukan populate pada `creator_id` dan `participants`** untuk mendapatkan nama pembuat dan partisipan appointment.
- **Memilih field yang diperlukan saja** dengan `.select("title creator_id start end participants")` sehingga tidak semua field diambil.

## 3. Additional Features
- **Meningkatkan User Experience (UX)** dengan mengganti tampilan daftar appointment ke bentuk kalender yang lebih interaktif.
- **Menambahkan fitur ubah dan hapus appointment** sehingga pengguna dapat mengelola jadwal mereka dengan lebih fleksibel.
- **Menyediakan pengaturan profil pengguna**, termasuk opsi untuk mengganti preferensi zona waktu dan informasi akun lainnya.
- **Mengintegrasikan dengan notifikasi push** untuk mengingatkan pengguna mengenai appointment yang akan datang.

## 4. Session Management
- **JWT hanya berisi informasi penting seperti `id` dan `username`** untuk menjaga payload tetap kecil.
- **Menggunakan `bcrypt` untuk hash password** guna menjaga keamanan autentikasi pengguna.