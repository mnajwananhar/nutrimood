// !!PERHATIAN: File ini telah dinonaktifkan, gunakan src/middleware.js untuk authentikasi!!
// Kedua middleware TIDAK dapat dijalankan bersamaan karena akan menyebabkan konflik

// Fungsi dummy yang tidak melakukan apa-apa
export async function middleware(req) {
  // Middleware ini dinonaktifkan total, gunakan src/middleware.js
  return null;
}

// Config kosong agar tidak menangkap rute apapun
export const config = {
  matcher: [], // Kosongkan matcher agar middleware ini tidak aktif sama sekali
};
