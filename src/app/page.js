import Image from "next/image";
import Link from "next/link";
// No need for explicit imports since we're not using the icons

export default function Home() {
  return (
    <div className="bg-white dark:bg-neutral-950">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary-50/70 to-secondary-50/70 dark:from-primary-950/30 dark:to-secondary-950/30 z-0"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28 relative z-10">
          <div className="lg:grid lg:grid-cols-12 lg:gap-8">
            <div className="sm:text-center md:max-w-2xl md:mx-auto lg:col-span-6 lg:text-left">
              <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 dark:text-white sm:text-5xl md:text-6xl lg:text-5xl xl:text-6xl">
                <span className="block">Makanan Sehat Sesuai</span>
                <span className="block text-primary-600 dark:text-primary-500">
                  Mood dan Kesehatanmu
                </span>
              </h1>
              <p className="mt-3 text-base text-gray-500 dark:text-gray-300 sm:mt-5 sm:text-xl lg:text-lg xl:text-xl">
                NutriMood adalah aplikasi inovatif yang menggunakan AI untuk
                merekomendasikan makanan yang sesuai dengan mood dan kondisi
                kesehatanmu. Temukan makanan terbaik untuk tubuh dan pikiranmu.
              </p>
              <div className="mt-8 sm:max-w-lg sm:mx-auto sm:text-center lg:text-left">
                <div className="flex flex-col sm:flex-row gap-4 w-full sm:justify-center lg:justify-start">
                  <Link
                    href="/recommendation"
                    className="flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 md:py-4 md:text-lg md:px-8 transition-all"
                  >
                    Coba Sekarang
                  </Link>
                  <Link
                    href="#features"
                    scroll={true}
                    className="flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-primary-600 bg-white border-primary-500 hover:bg-gray-50 dark:bg-transparent dark:text-primary-400 dark:border-primary-500 dark:hover:bg-primary-900/20 md:py-4 md:text-lg md:px-8 transition-all"
                  >
                    Pelajari Lebih Lanjut
                  </Link>
                </div>
              </div>
            </div>

            <div className="mt-12 relative sm:max-w-lg sm:mx-auto lg:mt-0 lg:max-w-none lg:mx-0 lg:col-span-6 lg:flex lg:items-center">
              <div className="relative mx-auto w-full rounded-lg shadow-lg lg:max-w-md">
                <div className="relative block w-full bg-white dark:bg-neutral-800 rounded-lg overflow-hidden">
                  <Image
                    src="/images/hero-image.jpg"
                    alt="Ilustrasi NutriMood"
                    width={800}
                    height={600}
                    className="w-full rounded-lg"
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <button
                      type="button"
                      className="flex items-center justify-center h-16 w-16 rounded-full bg-white dark:bg-primary-600 bg-opacity-75 dark:bg-opacity-75 sm:h-20 sm:w-20"
                    >
                      <svg
                        className="h-8 w-8 text-primary-600 dark:text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        aria-hidden="true"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-primary-700 dark:bg-primary-900">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:py-16 lg:px-8 lg:flex lg:items-center lg:justify-between">
          <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            <span className="block">Siap untuk meningkatkan kesehatan</span>
            <span className="block">melalui pola makan yang tepat?</span>
          </h2>
          <div className="mt-8 flex lg:mt-0 lg:flex-shrink-0">
            <div className="inline-flex rounded-md shadow">
              <Link
                href="/register"
                className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-primary-600 bg-white hover:bg-gray-50"
              >
                Daftar Sekarang
              </Link>
            </div>
            <div className="ml-3 inline-flex rounded-md shadow">
              <Link
                href="#how-it-works"
                scroll={true}
                className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-primary-600 bg-white hover:bg-gray-50"
              >
                Daftar Sekarang
              </Link>
            </div>
            <div className="ml-3 inline-flex rounded-md shadow">
              <Link
                href="/recommendation"
                className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary-600 hover:bg-primary-500"
              >
                Coba Demo
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* How It Works Section */}
      <div className="py-16 bg-white dark:bg-neutral-900" id="how-it-works">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:text-center">
            <h2 className="text-base text-primary-600 dark:text-primary-400 font-semibold tracking-wide uppercase">
              Cara Kerja
            </h2>
            <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
              Makanan yang tepat untuk suasana hatimu
            </p>
            <p className="mt-4 max-w-2xl text-xl text-gray-500 dark:text-gray-300 lg:mx-auto">
              Ikuti 3 langkah mudah untuk mendapatkan rekomendasi makanan yang
              sesuai dengan mood dan kondisi kesehatanmu.
            </p>
          </div>

          <div className="mt-16">
            <div className="space-y-10 md:space-y-0 md:grid md:grid-cols-3 md:gap-x-8 md:gap-y-10">
              {/* Step 1 */}
              <div className="relative">
                <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-primary-500 text-white">
                  <span className="text-xl font-bold">1</span>
                </div>
                <div className="ml-16">
                  <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
                    Pilih Mood & Kondisi Kesehatan
                  </h3>
                  <p className="mt-2 text-base text-gray-500 dark:text-gray-400">
                    Beri tahu kami bagaimana perasaanmu hari ini dan kondisi
                    kesehatanmu. Kami akan menyesuaikan rekomendasi makanan
                    berdasarkan kebutuhanmu.
                  </p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="relative">
                <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-primary-500 text-white">
                  <span className="text-xl font-bold">2</span>
                </div>
                <div className="ml-16">
                  <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
                    Dapatkan Rekomendasi
                  </h3>
                  <p className="mt-2 text-base text-gray-500 dark:text-gray-400">
                    Algoritma AI kami akan menganalisis inputmu dan memberikan
                    rekomendasi makanan yang sesuai dengan mood dan kondisi
                    kesehatanmu.
                  </p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="relative">
                <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-primary-500 text-white">
                  <span className="text-xl font-bold">3</span>
                </div>
                <div className="ml-16">
                  <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
                    Nikmati & Rasakan Manfaatnya
                  </h3>
                  <p className="mt-2 text-base text-gray-500 dark:text-gray-400">
                    Konsumsi makanan yang direkomendasikan dan rasakan perubahan
                    positif pada mood dan kesehatanmu secara keseluruhan.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-16 bg-gray-50 dark:bg-neutral-950" id="features">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:text-center">
            <h2 className="text-base text-primary-600 dark:text-primary-400 font-semibold tracking-wide uppercase">
              Fitur Unggulan
            </h2>
            <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
              Lebih dari sekadar rekomendasi makanan
            </p>
            <p className="mt-4 max-w-2xl text-xl text-gray-500 dark:text-gray-300 lg:mx-auto">
              NutriMood menawarkan berbagai fitur yang akan membantu menjalani
              pola makan sehat yang sesuai dengan kondisi mental dan fisikmu.
            </p>
          </div>

          <div className="mt-16">
            <div className="space-y-10 md:space-y-0 md:grid md:grid-cols-2 lg:grid-cols-3 md:gap-8">
              {/* Feature 1 */}
              <div className="flex flex-col items-center p-6 bg-white dark:bg-neutral-800 rounded-xl shadow-md">
                <div className="flex items-center justify-center h-16 w-16 rounded-full bg-primary-100 dark:bg-primary-900 text-primary-600 dark:text-primary-300 mb-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-8 w-8"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                    />
                  </svg>
                </div>
                <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white text-center">
                  Rekomendasi Makanan Cerdas
                </h3>
                <p className="mt-2 text-base text-gray-500 dark:text-gray-400 text-center">
                  Dapatkan rekomendasi makanan yang dipersonalisasi berdasarkan
                  mood, kondisi kesehatan, dan preferensi makananmu.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="flex flex-col items-center p-6 bg-white dark:bg-neutral-800 rounded-xl shadow-md">
                <div className="flex items-center justify-center h-16 w-16 rounded-full bg-primary-100 dark:bg-primary-900 text-primary-600 dark:text-primary-300 mb-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-8 w-8"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                    />
                  </svg>
                </div>
                <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white text-center">
                  Pelacak Mood & Makan
                </h3>
                <p className="mt-2 text-base text-gray-500 dark:text-gray-400 text-center">
                  Lacak perubahan mood dan hubungkannya dengan makanan yang kamu
                  konsumsi untuk memahami polanya.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="flex flex-col items-center p-6 bg-white dark:bg-neutral-800 rounded-xl shadow-md">
                <div className="flex items-center justify-center h-16 w-16 rounded-full bg-primary-100 dark:bg-primary-900 text-primary-600 dark:text-primary-300 mb-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-8 w-8"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                    />
                  </svg>
                </div>
                <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white text-center">
                  Konten Edukasi
                </h3>
                <p className="mt-2 text-base text-gray-500 dark:text-gray-400 text-center">
                  Akses artikel dan materi edukasi tentang hubungan makanan,
                  mood, dan kesehatan mental.
                </p>
              </div>

              {/* Feature 4 */}
              <div className="flex flex-col items-center p-6 bg-white dark:bg-neutral-800 rounded-xl shadow-md">
                <div className="flex items-center justify-center h-16 w-16 rounded-full bg-primary-100 dark:bg-primary-900 text-primary-600 dark:text-primary-300 mb-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-8 w-8"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                </div>
                <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white text-center">
                  Jurnal Makanan Digital
                </h3>
                <p className="mt-2 text-base text-gray-500 dark:text-gray-400 text-center">
                  Catat makanan yang kamu konsumsi dan bangun riwayat yang dapat
                  membantu mengoptimalkan kesehatanmu.
                </p>
              </div>

              {/* Feature 5 */}
              <div className="flex flex-col items-center p-6 bg-white dark:bg-neutral-800 rounded-xl shadow-md">
                <div className="flex items-center justify-center h-16 w-16 rounded-full bg-primary-100 dark:bg-primary-900 text-primary-600 dark:text-primary-300 mb-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-8 w-8"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                </div>
                <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white text-center">
                  Komunitas & Berbagi
                </h3>
                <p className="mt-2 text-base text-gray-500 dark:text-gray-400 text-center">
                  Terhubung dengan komunitas yang memiliki minat dan kondisi
                  kesehatan serupa untuk berbagi pengalaman.
                </p>
              </div>

              {/* Feature 6 */}
              <div className="flex flex-col items-center p-6 bg-white dark:bg-neutral-800 rounded-xl shadow-md">
                <div className="flex items-center justify-center h-16 w-16 rounded-full bg-primary-100 dark:bg-primary-900 text-primary-600 dark:text-primary-300 mb-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-8 w-8"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                    />
                  </svg>
                </div>
                <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white text-center">
                  Pengingat & Notifikasi
                </h3>
                <p className="mt-2 text-base text-gray-500 dark:text-gray-400 text-center">
                  Dapatkan pengingat untuk makan makanan yang sesuai dengan mood
                  dan kesehatanmu saat ini.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Testimonials */}
      <div className="py-16 bg-white dark:bg-neutral-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:text-center">
            <h2 className="text-base text-primary-600 dark:text-primary-400 font-semibold tracking-wide uppercase">
              Testimoni
            </h2>
            <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
              Apa Kata Pengguna Kami
            </p>
            <p className="mt-4 max-w-2xl text-xl text-gray-500 dark:text-gray-300 lg:mx-auto">
              Berikut adalah pengalaman dari pengguna NutriMood yang telah
              merasakan manfaatnya.
            </p>
          </div>

          <div className="mt-16 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {/* Testimonial 1 */}
            <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-lg p-6 border border-gray-100 dark:border-neutral-700">
              <div className="flex items-center mb-4">
                <div className="h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center">
                  <span className="text-xl font-bold text-gray-600">AN</span>
                </div>
                <div className="ml-4">
                  <h4 className="text-lg font-medium text-gray-900 dark:text-white">
                    Andi Nugraha
                  </h4>
                  <p className="text-gray-500 dark:text-gray-400">
                    Karyawan, 28 Tahun
                  </p>
                </div>
              </div>
              <p className="text-gray-600 dark:text-gray-300 italic">
                "NutriMood sangat membantu saya memilih makanan yang tepat saat
                saya merasa stres. Rekomendasi dari aplikasi ini terbukti
                memperbaiki mood saya."
              </p>
              <div className="mt-4 flex">
                {[...Array(5)].map((_, i) => (
                  <svg
                    key={i}
                    className="h-5 w-5 text-yellow-400"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
            </div>

            {/* Testimonial 2 */}
            <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-lg p-6 border border-gray-100 dark:border-neutral-700">
              <div className="flex items-center mb-4">
                <div className="h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center">
                  <span className="text-xl font-bold text-gray-600">SW</span>
                </div>
                <div className="ml-4">
                  <h4 className="text-lg font-medium text-gray-900 dark:text-white">
                    Sri Widiastuti
                  </h4>
                  <p className="text-gray-500 dark:text-gray-400">
                    Ibu Rumah Tangga, 35 Tahun
                  </p>
                </div>
              </div>
              <p className="text-gray-600 dark:text-gray-300 italic">
                "Sebagai penderita diabetes, saya kesulitan menemukan makanan
                yang tidak memperburuk kondisi saya. NutriMood membantu dengan
                rekomendasi makanan sehat yang sesuai dengan kondisi kesehatan
                saya."
              </p>
              <div className="mt-4 flex">
                {[...Array(5)].map((_, i) => (
                  <svg
                    key={i}
                    className="h-5 w-5 text-yellow-400"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
            </div>

            {/* Testimonial 3 */}
            <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-lg p-6 border border-gray-100 dark:border-neutral-700">
              <div className="flex items-center mb-4">
                <div className="h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center">
                  <span className="text-xl font-bold text-gray-600">DH</span>
                </div>
                <div className="ml-4">
                  <h4 className="text-lg font-medium text-gray-900 dark:text-white">
                    Dian Hapsari
                  </h4>
                  <p className="text-gray-500 dark:text-gray-400">
                    Mahasiswa, 22 Tahun
                  </p>
                </div>
              </div>
              <p className="text-gray-600 dark:text-gray-300 italic">
                "Jurnal makanan di NutriMood membantu saya melihat pola antara
                apa yang saya makan dan bagaimana perasaan saya. Ini sangat
                membantu saat menjalani ujian yang menegangkan."
              </p>
              <div className="mt-4 flex">
                {[...Array(5)].map((_, i) => (
                  <svg
                    key={i}
                    className="h-5 w-5 text-yellow-400"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
