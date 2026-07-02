# USER MANUAL APLIKASI SAPA ARCAWINANGUN

Dokumen ini disusun untuk menjelaskan cara penggunaan aplikasi SAPA Arcawinangun secara lengkap untuk kebutuhan presentasi, demo, dan operasional administrasi kelurahan.

## 1. Ringkasan Aplikasi

SAPA Arcawinangun adalah aplikasi administrasi kelurahan berbasis desktop (Electron + React) yang berfokus pada:

- Pengelolaan data warga.
- Pembuatan berbagai surat administrasi.
- Rekap monografi penduduk.
- Pengaturan data profil dan struktur pemerintah kelurahan.
- Backup dan restore data.

Karakter utama aplikasi:

- Berjalan offline.
- Data disimpan lokal pada perangkat pengguna.
- Ditujukan untuk operator/perangkat kelurahan.

## 2. Ruang Lingkup Fitur

Fitur utama yang tersedia di aplikasi:

- Dashboard ringkasan statistik.
- Modul Data Warga (CRUD + pencarian + field kustom).
- Modul Monografi (8 jenis rekap + ekspor PDF).
- Modul Surat (17 jenis formulir surat + ekspor/print + riwayat).
- Modul Pengaturan kelurahan dan backup data.
- Modul Bantuan penggunaan.

## 3. Menjalankan Aplikasi

### 3.1 Opsi Menjalankan dari Source Code

1. Pastikan Node.js dan npm sudah terpasang.
2. Buka folder project.
3. Jalankan:

```bash
npm install
npm run start
```

### 3.2 Script Penting

- `npm run start`: menjalankan aplikasi (mode development Electron).
- `npm run package`: membuat package aplikasi.
- `npm run make`: membuat installer/build distribusi.

## 4. Struktur Navigasi Menu

Menu utama pada sidebar:

1. Dashboard
2. Data Warga
3. Monografi
4. Surat
5. Pengaturan
6. Bantuan

Submenu penting:

- Data Warga: Daftar Warga, Tambah Warga, Field Kustom.
- Monografi: Agama, Jenis Kelamin, Golongan Darah, Kepala Keluarga, Pekerjaan, Pendidikan, Status Pernikahan, Umur.
- Surat: Riwayat Surat, Buat Surat.

## 5. Detail Fitur per Modul

### 5.1 Dashboard

Fungsi Dashboard:

- Menampilkan profil kelurahan (nama kelurahan, kode kelurahan, kecamatan, kabupaten, lurah).
- Menampilkan total warga.
- Menampilkan 5 riwayat surat terbaru.

Manfaat untuk operator:

- Pemantauan cepat kondisi data.
- Ringkasan aktivitas surat terakhir.

### 5.2 Data Warga

#### A. Daftar Warga

Kemampuan utama:

- Menampilkan warga dikelompokkan berdasarkan nomor KK.
- Setiap KK dapat di-expand/collapse.
- Pencarian warga berdasarkan nama, NIK, atau alamat.
- Pengaturan kolom tampil (misal NIK, Nama, Umur, Alamat, SHDK, dll).
- Aksi cepat: lihat detail, edit, hapus.

Catatan:

- Penghapusan warga akan ditolak jika warga masih memiliki surat terkait.

#### B. Tambah Warga

Form dibagi ke beberapa kelompok data:

1. Informasi Pribadi:

- NIK, nama, tempat/tanggal lahir, jenis kelamin.

2. Informasi Keluarga dan Alamat:

- No KK, RT, RW, alamat, SHDK, nama ayah, nama ibu.

3. Dokumen:

- Status KTP elektronik.
- Status/no akta lahir.

4. Informasi Perkawinan:

- Status perkawinan.
- Status/no akta nikah.
- Status/no akta cerai.

5. Pendidikan dan Pekerjaan:

- Pendidikan terakhir.
- Pekerjaan.

6. Informasi Tambahan:

- Agama, golongan darah, disabilitas fisik.

Validasi utama:

- NIK wajib 16 digit angka.
- KK wajib 16 digit angka.
- RT/RW numerik.
- NIK unik (tidak boleh duplikat).

#### C. Edit Warga

Fitur sama seperti Tambah Warga, dengan kemampuan:

- Memperbarui data warga.
- Menjaga validasi data (termasuk cek konflik NIK).

#### D. Detail Warga

Menampilkan:

- Seluruh informasi profil warga.
- Informasi tambahan dari field kustom.
- Daftar surat terkait warga (jika ada).

Tombol aksi:

- Edit data warga.
- Hapus data warga.
- Buat surat baru untuk warga tersebut.

#### E. Field Kustom

Digunakan untuk menambah atribut data di luar field standar.

Tipe field yang didukung:

- Text
- Number
- Date
- Select (opsi dipisahkan koma)

Kemampuan:

- Tambah field kustom.
- Edit field kustom.
- Hapus field kustom.
- Tandai field sebagai wajib.

Dampak penting:

- Jika field kustom dihapus, nilai field tersebut pada semua warga ikut terhapus.

### 5.3 Monografi

Modul Monografi menyajikan rekap demografi dan sosial berdasarkan RW/RT, disertai total laki-laki/perempuan/jumlah.

Jenis monografi yang tersedia:

1. Monografi Agama
2. Monografi Jenis Kelamin
3. Monografi Golongan Darah
4. Monografi Kepala Keluarga
5. Monografi Pekerjaan
6. Monografi Pendidikan
7. Monografi Status Pernikahan
8. Monografi Umur

Fitur ekspor:

- Setiap halaman monografi memiliki tombol Download PDF.
- Dokumen PDF berisi rekap tabel siap cetak.

### 5.4 Surat

Modul Surat terdiri dari:

- Riwayat Surat
- Buat Surat

#### A. Riwayat Surat

Fungsi:

- Menampilkan log surat yang sudah diproses.
- Pencarian riwayat berdasarkan nama.
- Hapus item riwayat.

#### B. Buat Surat

Daftar jenis surat yang tersedia:

1. Surat Keterangan Keramaian
2. Surat Keterangan Usaha
3. Surat Keterangan Domisili
4. Surat Keterangan Tidak Mampu
5. Surat Pengantar
6. Surat Keterangan (umum)
7. Surat Keterangan Domisili Usaha
8. Surat Pengantar Catatan Kepolisian (SKCK)
9. Surat Keterangan Ahli Waris
10. Surat Keterangan Wali Nikah
11. Pengantar Numpang Nikah
12. Surat Pernyataan Belum Menikah
13. Surat Keterangan Kematian (Model N6)
14. Surat Pengantar Nikah (Model N1)
15. Permohonan Kehendak Nikah (Model N2)
16. Persetujuan Calon Pengantin (Model N4)
17. Surat Izin Orang Tua (Model N5)

#### C. Pola Umum Pengisian Surat

Mayoritas form surat mendukung:

- Pencarian warga berdasarkan NIK/Nama untuk isi otomatis data.
- Edit manual data hasil autofill.
- Preview surat di layar (pada sebagian jenis surat).
- Export PDF.
- Print surat.

#### D. Ringkasan Input Penting per Kelompok Surat

1. Surat administrasi umum (Domisili, Usaha, Tidak Mampu, Pengantar, Keterangan, SKCK):

- Identitas warga.
- Alamat.
- Nomor surat dan data referensi RT/RW/registrasi.
- Keperluan surat.

2. Surat usaha/domisili usaha:

- Identitas pemilik.
- Nama usaha, jenis usaha, alamat usaha.
- Data tambahan usaha (jumlah karyawan, luas, waktu usaha) pada form tertentu.

3. Surat keluarga/waris:

- Data pewaris/almarhum.
- Data ahli waris/anggota keluarga.
- Hubungan keluarga.

4. Surat nikah (N1, N2, N4, N5, Wali Nikah, Numpang Nikah, Belum Menikah):

- Data calon mempelai/orang tua/wali sesuai format surat.
- Identitas pendukung (NIK, TTL, agama, pekerjaan, alamat).
- Data jadwal/pernyataan sesuai model formulir.

#### E. Detail Surat Tersimpan (jika ada)

Pada sebagian alur, surat dapat tersimpan ke tabel dokumen internal. Jika dokumen tersimpan dan dibuka di halaman detail surat, tersedia aksi:

- Lihat metadata surat.
- Hapus surat.
- Ekspor PDF.
- Ekspor DOCX.

### 5.5 Pengaturan

Halaman Pengaturan mencakup:

1. Informasi Kelurahan:

- Nama kelurahan
- Alamat
- Kecamatan
- Kabupaten/Kota
- Provinsi
- Kode Kemendagri
- Nomor telepon

2. Informasi Pemerintah Kelurahan:

- Nama lurah
- Sekretaris Kelurahan (Seklur)
- Kasi Pemerintahan dan Pembangunan
- Kasi Kesejahteraan Sosial (Kesos)
- Kasi Ketentraman dan Ketertiban Umum (Trantib)
- Staf Administrasi/Tenaga IT
- Tenaga Kebersihan/Umum
- Staf pendukung kelurahan (opsional)

3. Backup and Restore Data:

- Ekspor data ke JSON.
- Impor data dari JSON.

Perhatian saat impor:

- Pada implementasi saat ini, proses impor di halaman Pengaturan fokus pada data `residents`.
- Data warga lama akan ditimpa oleh data warga dari file impor.
- Pastikan file JSON valid dan memiliki field `residents`.

### 5.6 Bantuan

Halaman Bantuan berisi:

- Penjelasan aplikasi.
- Ringkasan fitur.
- Panduan langkah penggunaan umum.

## 6. Alur Operasional yang Direkomendasikan

Untuk penggunaan harian operator kelurahan, urutan terbaik:

1. Isi menu Pengaturan terlebih dahulu (profil kelurahan dan aparat).
2. Input/rapikan Data Warga.
3. Tambahkan Field Kustom bila dibutuhkan oleh kelurahan.
4. Proses pembuatan surat sesuai kebutuhan warga.
5. Gunakan Monografi untuk rekap statistik.
6. Lakukan backup data rutin (misalnya mingguan atau bulanan).

## 7. Data dan Penyimpanan

Karakter penyimpanan:

- Data disimpan lokal di perangkat (database browser internal via Dexie/IndexedDB).
- Tidak ada sinkronisasi cloud bawaan.
- Data antar perangkat tidak otomatis terhubung.

Implikasi:

- Backup wajib dilakukan rutin.
- Pindah perangkat perlu proses ekspor-impor.

## 8. Troubleshooting

### 8.1 Warga tidak bisa dihapus

Kemungkinan penyebab:

- Warga memiliki surat terkait.

Solusi:

- Hapus keterkaitan surat terlebih dahulu (jika kebijakan memungkinkan).

### 8.2 Data tidak muncul di pencarian

Kemungkinan penyebab:

- Kata kunci terlalu pendek pada beberapa form.

Solusi:

- Gunakan minimal 2-3 karakter, atau cari dengan NIK.

### 8.3 Gagal impor JSON

Kemungkinan penyebab:

- Format JSON tidak sesuai.
- Tidak ada field `residents`.

Solusi:

- Gunakan file hasil ekspor aplikasi.
- Validasi struktur JSON sebelum impor.

### 8.4 Monografi kosong

Kemungkinan penyebab:

- Data warga belum diinput.

Solusi:

- Tambahkan data warga terlebih dahulu.

## 9. Catatan Implementasi dan Batasan Versi

1. Fitur edit surat lewat route `letters/edit/:id` saat ini belum diaktifkan di routing utama.
2. Menu manajemen template dinamis sudah tidak dipakai (digantikan form khusus per jenis surat).
3. Beberapa fungsi legacy masih ada di source code, namun operasional utama sudah berpusat pada form surat spesifik.
4. Penyimpanan data surat dan riwayat pada versi ini lebih menonjol pada log riwayat dan output PDF/print.
5. Template/form surat kelahiran masih ada di source code, namun tidak muncul pada menu Buat Surat utama.

## 10. Checklist Pengujian Demo untuk Dosen

Gunakan checklist ini saat presentasi aplikasi:

1. Buka Dashboard dan tunjukkan ringkasan profil kelurahan + total warga.
2. Tambah 1 warga baru di Data Warga.
3. Cari warga tersebut di Daftar Warga.
4. Buat 1 surat (contoh: Domisili) dengan autofill dari data warga.
5. Export PDF surat.
6. Cek Riwayat Surat.
7. Buka 1 halaman Monografi lalu Download PDF.
8. Ekspor backup JSON dari Pengaturan.

## 11. Penutup

Dokumen ini dapat dipakai sebagai panduan pengguna akhir, bahan demo, dan lampiran penjelasan fungsional aplikasi SAPA Arcawinangun.

Jika diperlukan, manual ini bisa dikembangkan lagi menjadi:

- SOP operator harian.
- SOP backup bulanan.
- Panduan admin teknis (maintenance dan distribusi build aplikasi).
