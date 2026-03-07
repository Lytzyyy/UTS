============================================================
PANDUAN PENGERJAAN PROYEK CRUD - AHMAD HAFIZH RAFII
============================================================

Dokumen ini berisi langkah-langkah teknis pengerjaan sistem 
manajemen user menggunakan Node.js, PostgreSQL, dan MinIO 
di lingkungan Docker Debian.

------------------------------------------------------------
LANGKAH 1: INISIALISASI STRUKTUR PROYEK
------------------------------------------------------------
1. Buka terminal Debian dan buat direktori utama:
   $ mkdir minio-project && cd minio-project
2. Buat sub-direktori untuk masing-masing layanan:
   $ mkdir api backend frontend
3. Buat file orkestrasi di root folder:
   $ touch docker-compose.yml

------------------------------------------------------------
LANGKAH 2: KONFIGURASI LAYANAN API DATA (PORT 8080)
------------------------------------------------------------
1. Masuk ke folder api: $ cd api
2. Inisialisasi npm: $ npm init -y
3. Instalasi library pendukung:
   $ npm install express sequelize pg pg-hstore minio multer cors
4. Buat file 'server.js' dan masukkan kodingan CRUD. 
   - Pastikan port diset ke 8080.
   - Tambahkan logika hapus file di MinIO (removeObject) sebelum 
     menghapus record di database agar storage tetap bersih.
5. Buat file 'Dockerfile' menggunakan base image 'node:18-alpine'.

------------------------------------------------------------
LANGKAH 3: KONFIGURASI LAYANAN STATUS BACKEND (PORT 8081)
------------------------------------------------------------
1. Masuk ke folder backend: $ cd ../backend
2. Inisialisasi npm dan install express: $ npm install express
3. Buat file 'server.js' port 8081.
4. Masukkan endpoint /users yang memberikan response JSON berupa 
   status operasional sistem sebagai layanan pemantau internal.
5. Buat file 'Dockerfile' serupa dengan folder api.

------------------------------------------------------------
LANGKAH 4: PENGEMBANGAN FRONTEND & UI (PORT 80)
------------------------------------------------------------
1. Masuk ke folder frontend: $ cd ../frontend
2. Buat file 'index.html'.
3. Gunakan Bootstrap CDN untuk tampilan profesional.
4. PENTING: Pada bagian script fetch, arahkan API_URL ke port 8080:
   "http://[IP_DEBIAN]:8080/users".
5. Pastikan form menggunakan 'FormData' agar file gambar bisa 
   terkirim ke API dengan benar.

------------------------------------------------------------
LANGKAH 5: ORKESTRASI DOCKER COMPOSE
------------------------------------------------------------
1. Kembali ke root folder, edit 'docker-compose.yml'.
2. Definisikan 5 service: postgres, minio, api, backend, frontend.
3. Mapping port host 8080 ke api, dan port host 8081 ke backend.
4. Hubungkan semua ke 'app-network' dengan driver bridge.

------------------------------------------------------------
LANGKAH 6: DEPLOYMENT & SETUP STORAGE
------------------------------------------------------------
1. Jalankan perintah build:
   $ docker compose up -d --build
2. Setelah semua container 'Up', buka browser: http://[IP]:9001.
3. Login ke MinIO (minioadmin / minioadmin).
4. Buat bucket baru bernama 'uts'.
5. Masuk ke setelan bucket, ubah Access Policy menjadi 'Public' 
   agar foto profil bisa diakses oleh browser luar.

------------------------------------------------------------
LANGKAH 7: PENGUJIAN DAN VERIFIKASI SINKRONISASI
------------------------------------------------------------
1. Akses Web (Port 80): Coba tambah user baru dengan foto.
2. Cek API (Port 8080/users): Pastikan data muncul dalam format JSON.
3. Cek Status (Port 8081/users): Pastikan muncul status internal backend.
4. Uji Fitur Edit: Ganti nama/foto, pastikan foto lama di MinIO terhapus otomatis.
5. Uji Fitur Delete: Hapus user, pastikan record di DB dan file di MinIO hilang.
============================================================ 
