"use client";

import { Suspense, useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import Link from "next/link";
import Image from "next/image";

export default function RecommendationResultWrapper() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Memuat...</div>}>
      <RecommendationResult />
    </Suspense>
  );
}

function RecommendationResult() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const supabase = createClientComponentClient();
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedFood, setSelectedFood] = useState(null);
  const [user, setUser] = useState(null);
  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        // Jika tidak ada user, redirect ke login
        router.push("/login?redirectedFrom=/recommendation/result");
        return;
      }

      setUser(user);
    };

    getUser();
    fetchRecommendations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const fetchRecommendations = async () => {
    try {
      const mood = searchParams.get("mood");
      if (!mood) {
        setError("Mood tidak ditemukan");
        setLoading(false);
        return;
      }

      // Mapping mood dari bahasa Indonesia ke bahasa Inggris
      const moodMap = {
        senang: "happy",
        netral: "neutral",
        sedih: "sad",
      };

      const englishMood = moodMap[mood];

      console.log(
        "Mencari rekomendasi untuk mood:",
        mood,
        "(",
        englishMood,
        ")"
      );

      // Mencoba cari rekomendasi dengan mood bahasa Indonesia
      let { data, error } = await supabase
        .from("food_recommendations")
        .select("*")
        .eq("mood", mood)
        .limit(3);

      // Jika tidak menemukan, coba dengan mood bahasa Inggris
      if ((!data || data.length === 0) && englishMood) {
        const { data: engData, error: engError } = await supabase
          .from("food_recommendations")
          .select("*")
          .eq("mood", englishMood)
          .limit(3);

        if (!engError && engData && engData.length > 0) {
          data = engData;
          error = null;
        }
      }

      // Jika masih tidak ada data, gunakan data sampel statis
      if (!data || data.length === 0) {
        console.log("Menggunakan data sampel statis untuk mood:", mood);

        // Data sampel statis untuk tiap mood
        const staticRecommendations = {
          senang: [
            {
              id: "sample-1-senang",
              food_name: "Salmon Panggang",
              description:
                "Salmon panggang dengan lemon dan rempah-rempah, kaya akan Omega-3 yang baik untuk otak dan suasana hati",
              image_url:
                "https://images.unsplash.com/photo-1485921325833-c519f76c4927?q=80&w=1364&auto=format&fit=crop",
              calories: 300,
              protein: 25,
              carbs: 10,
              fat: 15,
              nutrients: ["Omega-3", "Protein", "Vitamin D"],
              preparation:
                "Panggang salmon dengan air lemon, garam, dan merica selama 15-20 menit pada suhu 180°C",
              mood: "senang",
            },
            {
              id: "sample-2-senang",
              food_name: "Oatmeal dengan Buah",
              description:
                "Sarapan sehat dengan oatmeal dan aneka buah segar untuk memberikan energi sepanjang hari",
              image_url:
                "https://images.unsplash.com/photo-1517673132405-a56a62b18caf?q=80&w=1176&auto=format&fit=crop",
              calories: 250,
              protein: 8,
              carbs: 45,
              fat: 5,
              nutrients: ["Serat", "Vitamin C", "Antioksidan"],
              preparation:
                "Masak oatmeal dengan susu, tambahkan madu dan buah-buahan segar seperti pisang, stroberi, atau blueberry",
              mood: "senang",
            },
            {
              id: "sample-3-senang",
              food_name: "Dark Chocolate",
              description:
                "Cokelat hitam dengan kandungan kakao tinggi dapat membantu melepaskan endorfin",
              image_url:
                "https://images.unsplash.com/photo-1511381939415-e44015466834?q=80&w=1172&auto=format&fit=crop",
              calories: 150,
              protein: 2,
              carbs: 15,
              fat: 9,
              nutrients: ["Flavonoid", "Magnesium", "Antioksidan"],
              preparation:
                "Konsumsi sekitar 30 gram dark chocolate (minimal 70% kakao) sebagai camilan",
              mood: "senang",
            },
          ],
          netral: [
            {
              id: "sample-1-netral",
              food_name: "Omelet Sayur",
              description:
                "Omelet telur dengan berbagai sayuran untuk sarapan yang seimbang nutrisi",
              image_url:
                "https://images.unsplash.com/photo-1510693206972-df098062cb71?q=80&w=1098&auto=format&fit=crop",
              calories: 280,
              protein: 20,
              carbs: 8,
              fat: 18,
              nutrients: ["Protein", "Vitamin A", "Folat"],
              preparation:
                "Kocok 2 telur, tambahkan sayuran cincang seperti paprika, bayam, dan jamur. Masak dengan api sedang hingga matang",
              mood: "netral",
            },
            {
              id: "sample-2-netral",
              food_name: "Smoothie Buah",
              description:
                "Smoothie dengan campuran buah-buahan dan yogurt untuk energi yang stabil",
              image_url:
                "https://images.unsplash.com/photo-1553530666-ba11a7da3888?q=80&w=1171&auto=format&fit=crop",
              calories: 200,
              protein: 10,
              carbs: 30,
              fat: 5,
              nutrients: ["Vitamin C", "Potasium", "Probiotik"],
              preparation:
                "Blend pisang, stroberi, blueberry dengan yogurt dan sedikit madu hingga halus",
              mood: "netral",
            },
            {
              id: "sample-3-netral",
              food_name: "Sup Ayam",
              description:
                "Sup ayam hangat dengan sayuran dan rempah untuk makan siang yang menenangkan",
              image_url:
                "https://images.unsplash.com/photo-1547592166-23ac45744acd?q=80&w=1171&auto=format&fit=crop",
              calories: 220,
              protein: 18,
              carbs: 15,
              fat: 8,
              nutrients: ["Protein", "Vitamin A", "Seng"],
              preparation:
                "Rebus ayam dengan berbagai sayuran seperti wortel, seledri, dan bawang. Tambahkan garam, merica, dan rempah sesuai selera",
              mood: "netral",
            },
          ],
          sedih: [
            {
              id: "sample-1-sedih",
              food_name: "Banana Oatmeal",
              description:
                "Oatmeal dengan pisang dan kayu manis untuk meningkatkan kadar serotonin",
              image_url:
                "https://images.unsplash.com/photo-1495214783159-3503fd1b572d?q=80&w=1170&auto=format&fit=crop",
              calories: 240,
              protein: 6,
              carbs: 40,
              fat: 4,
              nutrients: ["Triptofan", "Vitamin B6", "Serat"],
              preparation:
                "Masak oatmeal dengan susu, tambahkan pisang matang yang dihancurkan dan taburkan kayu manis",
              mood: "sedih",
            },
            {
              id: "sample-2-sedih",
              food_name: "Salmon dengan Quinoa",
              description:
                "Kombinasi salmon dan quinoa yang kaya akan asam lemak omega-3 dan protein",
              image_url:
                "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?q=80&w=1170&auto=format&fit=crop",
              calories: 350,
              protein: 30,
              carbs: 25,
              fat: 15,
              nutrients: ["Omega-3", "Protein", "Vitamin D"],
              preparation:
                "Panggang salmon dengan bumbu dan sajikan dengan quinoa yang dimasak dengan kaldu sayuran",
              mood: "sedih",
            },
            {
              id: "sample-3-sedih",
              food_name: "Turkey Sandwich",
              description:
                "Sandwich daging kalkun yang kaya akan triptofan untuk meningkatkan mood",
              image_url:
                "https://images.unsplash.com/photo-1553909489-cd47e0907980?q=80&w=1025&auto=format&fit=crop",
              calories: 320,
              protein: 22,
              carbs: 35,
              fat: 8,
              nutrients: ["Triptofan", "Protein", "Vitamin B"],
              preparation:
                "Susun sandwich dengan roti gandum utuh, irisan kalkun, selada, tomat, dan sedikit mayonnaise rendah lemak",
              mood: "sedih",
            },
          ],
        };

        // Gunakan data sampel sesuai mood yang dipilih
        if (staticRecommendations[mood]) {
          data = staticRecommendations[mood];
        } else {
          // Jika mood tidak cocok dengan yang ada di data sampel
          setError("Tidak ada rekomendasi yang tersedia untuk mood ini.");
          setLoading(false);
          return;
        }
      }
      if (error) {
        console.error("Error from DB:", error);
      }

      // Set recommendations
      setRecommendations(data || []);
      console.log("Setting recommendations:", data?.length || 0, "items");
    } catch (error) {
      console.error("Error fetching recommendations:", error);
      setError("Terjadi kesalahan saat mengambil rekomendasi");
    } finally {
      setLoading(false);
    }
  };

  const handleFoodClick = (food) => {
    setSelectedFood(food);
  };

  const closeModal = () => {
    setSelectedFood(null);
  };

  const saveToFavorites = async (food) => {
    if (!user) {
      alert("Silakan login terlebih dahulu untuk menyimpan ke favorit");
      return;
    }

    try {
      const { data, error } = await supabase
        .from("user_favorites")
        .insert([
          {
            user_id: user.id,
            recommendation_id: food.id,
          },
        ])
        .select();

      if (error) {
        if (error.code === "23505") {
          alert("Makanan ini sudah ada di favorit Anda");
        } else {
          throw error;
        }
      } else {
        alert("Berhasil disimpan ke favorit!");
      }
    } catch (error) {
      console.error("Error saving to favorites:", error);
      alert("Gagal menyimpan ke favorit");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-neutral-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">
            Memuat rekomendasi...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-neutral-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 dark:text-red-400">{error}</p>
          <Link
            href="/recommendation"
            className="mt-4 inline-block text-primary-600 hover:text-primary-700"
          >
            Kembali ke halaman rekomendasi
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-neutral-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white sm:text-4xl">
            Rekomendasi Makanan
          </h1>
          <p className="mt-3 text-lg text-gray-500 dark:text-gray-400">
            Berikut adalah rekomendasi makanan yang sesuai dengan mood Anda
          </p>
        </div>

        <div className="space-y-6">
          {recommendations.map((food) => (
            <div
              key={food.id}
              className="bg-white dark:bg-neutral-800 rounded-lg shadow p-6 cursor-pointer"
              onClick={() => handleFoodClick(food)}
            >
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 h-12 w-12 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center overflow-hidden">
                  {food.image_url ? (
                    <Image
                      src={food.image_url}
                      alt={food.food_name}
                      width={48}
                      height={48}
                      className="object-cover w-full h-full"
                    />
                  ) : (
                    <svg
                      className="h-6 w-6 text-primary-600 dark:text-primary-300"
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
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                    {food.food_name}
                  </h3>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    {food.description}
                  </p>
                  <div className="mt-4 grid grid-cols-4 gap-4">
                    <div className="text-center">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {food.calories || "-"}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Kalori
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {food.protein ? `${food.protein}g` : "-"}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Protein
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {food.carbs ? `${food.carbs}g` : "-"}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Karbohidrat
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {food.fat ? `${food.fat}g` : "-"}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Lemak
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 text-center">
          <Link
            href="/dashboard"
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
          >
            Kembali ke Dashboard
          </Link>
        </div>
      </div>

      {/* Food Detail Modal */}
      {selectedFood && (
        <div
          className="fixed inset-0 z-50 overflow-y-auto"
          aria-labelledby="modal-title"
          role="dialog"
          aria-modal="true"
        >
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div
              className="fixed inset-0 bg-gray-500 bg-opacity-75 dark:bg-gray-900 dark:bg-opacity-75 transition-opacity"
              onClick={closeModal}
            ></div>

            <span
              className="hidden sm:inline-block sm:align-middle sm:h-screen"
              aria-hidden="true"
            >
              &#8203;
            </span>

            <div className="inline-block align-bottom bg-white dark:bg-neutral-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
              <div className="relative h-64 w-full sm:h-72 md:h-80">
                {selectedFood.image_url ? (
                  <Image
                    src={selectedFood.image_url}
                    alt={selectedFood.food_name}
                    className="object-cover"
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                ) : (
                  <div className="h-full w-full flex items-center justify-center bg-gray-100 dark:bg-neutral-700">
                    <svg
                      className="h-24 w-24 text-gray-400 dark:text-gray-500"
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
                )}
                <button
                  className="absolute top-2 right-2 bg-white dark:bg-neutral-800 rounded-full p-2 shadow-md"
                  onClick={closeModal}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6 text-gray-500 dark:text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
              <div className="p-6">
                <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
                  {selectedFood.food_name}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  {selectedFood.description}
                </p>
                <div className="mb-4">
                  <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    Nutrisi Utama
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {(selectedFood.nutrients || []).map((nutrient, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 rounded-full text-sm font-medium bg-primary-100 text-primary-800 dark:bg-primary-900/30 dark:text-primary-300"
                      >
                        {nutrient}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    Cara Penyajian
                  </h4>
                  <p className="text-gray-600 dark:text-gray-300">
                    {selectedFood.preparation}
                  </p>
                </div>
                <div className="mt-6 flex justify-end gap-3">
                  <button
                    type="button"
                    className="inline-flex justify-center rounded-md border shadow-sm px-4 py-2 bg-white dark:bg-neutral-700 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-neutral-600 border-gray-300 dark:border-neutral-600"
                    onClick={closeModal}
                  >
                    Tutup
                  </button>
                  <button
                    type="button"
                    className="inline-flex justify-center rounded-md border shadow-sm px-4 py-2 bg-primary-600 text-sm font-medium text-white hover:bg-primary-700"
                    onClick={() => saveToFavorites(selectedFood)}
                  >
                    Simpan ke Favorit
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
