"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import Link from "next/link";
import Image from "next/image";

// Mock data for recommendations based on mood
// In a real app, this would come from the backend/API
const moodBasedFoods = {
  happy: [
    {
      id: 1,
      name: "Pisang",
      image: "/images/foods/banana.jpg",
      description:
        "Mengandung tryptophan yang meningkatkan serotonin, membantu mempertahankan mood positif.",
      nutrients: ["Vitamin B6", "Potassium", "Tryptophan"],
      preparation:
        "Bisa dimakan langsung, ditambahkan ke dalam smoothie, atau diolah menjadi pisang goreng atau panggang.",
    },
    {
      id: 2,
      name: "Yogurt",
      image: "/images/foods/yogurt.jpg",
      description:
        "Probiotik dalam yogurt mendukung kesehatan usus yang berkaitan dengan produksi serotonin.",
      nutrients: ["Probiotik", "Kalsium", "Protein", "Vitamin D"],
      preparation:
        "Konsumsi yogurt plain dengan buah segar, granola, atau madu untuk rasa manis alami.",
    },
    {
      id: 3,
      name: "Kacang Almond",
      image: "/images/foods/almonds.jpg",
      description:
        "Kaya akan magnesium dan vitamin E yang mendukung fungsi otak dan menjaga energi.",
      nutrients: ["Magnesium", "Vitamin E", "Protein", "Lemak Sehat"],
      preparation:
        "Konsumsi sebagai camilan, tambahkan ke salad, atau olah menjadi selai kacang almond.",
    },
  ],
  sad: [
    {
      id: 4,
      name: "Cokelat Hitam",
      image: "/images/foods/dark-chocolate.jpg",
      description:
        "Mengandung senyawa yang meningkatkan endorfin dan serotonin, membantu memperbaiki mood.",
      nutrients: ["Flavonoid", "Magnesium", "Tryptophan", "Antioksidan"],
      preparation:
        "Nikmati 1-2 kotak cokelat hitam dengan kandungan kakao minimal 70% untuk manfaat optimal.",
    },
    {
      id: 5,
      name: "Telur",
      image: "/images/foods/eggs.jpg",
      description:
        "Kaya akan vitamin B dan protein yang mendukung produksi neurotransmitter untuk mood.",
      nutrients: ["Vitamin B12", "Vitamin D", "Protein", "Kolin"],
      preparation:
        "Bisa dimasak dengan berbagai cara: direbus, diceplok, atau dijadikan omelet dengan sayuran.",
    },
    {
      id: 6,
      name: "Salmon",
      image: "/images/foods/salmon.jpg",
      description:
        "Omega-3 dalam salmon berperan penting dalam fungsi otak dan regulasi mood.",
      nutrients: ["Omega-3", "Vitamin D", "Protein", "Selenium"],
      preparation:
        "Panggang atau kukus dengan bumbu sederhana seperti lemon, bawang putih, dan rempah-rempah.",
    },
  ],
  angry: [
    {
      id: 7,
      name: "Alpukat",
      image: "/images/foods/avocado.jpg",
      description:
        "Lemak sehat dalam alpukat membantu menstabilkan mood dan mengurangi peradangan.",
      nutrients: ["Lemak Sehat", "Vitamin K", "Folat", "Potassium"],
      preparation:
        "Tambahkan ke roti panggang, salad, atau olah menjadi guacamole.",
    },
    {
      id: 8,
      name: "Teh Chamomile",
      image: "/images/foods/chamomile-tea.jpg",
      description:
        "Memiliki efek menenangkan yang dapat membantu mengurangi kemarahan dan stres.",
      nutrients: ["Flavonoid", "Antioksidan"],
      preparation:
        "Seduh dengan air panas, tambahkan madu jika diinginkan. Minum saat hangat.",
    },
    {
      id: 9,
      name: "Kacang Brazil",
      image: "/images/foods/brazil-nuts.jpg",
      description:
        "Kaya akan selenium yang dapat membantu mengurangi iritabilitas dan memperbaiki mood.",
      nutrients: ["Selenium", "Magnesium", "Thiamin", "Vitamin E"],
      preparation:
        "Konsumsi 1-2 kacang Brazil per hari sebagai camilan atau tambahkan ke dalam campuran trail mix.",
    },
  ],
  anxious: [
    {
      id: 10,
      name: "Blueberry",
      image: "/images/foods/blueberry.jpg",
      description:
        "Kaya akan antioksidan yang membantu mengurangi stres dan kecemasan.",
      nutrients: ["Antioksidan", "Vitamin C", "Vitamin K", "Mangan"],
      preparation:
        "Konsumsi langsung, tambahkan ke dalam yogurt, oatmeal, atau smoothie.",
    },
    {
      id: 11,
      name: "Teh Hijau",
      image: "/images/foods/green-tea.jpg",
      description:
        "Mengandung L-theanine yang membantu menenangkan pikiran dan mengurangi kecemasan.",
      nutrients: ["L-theanine", "Antioksidan", "Polifenol"],
      preparation:
        "Seduh dengan air panas, jangan terlalu lama agar tidak pahit. Minum 1-2 gelas per hari.",
    },
    {
      id: 12,
      name: "Ubi Jalar",
      image: "/images/foods/sweet-potato.jpg",
      description:
        "Karbohidrat kompleks yang membantu produksi serotonin dan menstabilkan gula darah.",
      nutrients: ["Vitamin A", "Vitamin C", "Mangan", "Serat"],
      preparation:
        "Panggang, kukus, atau olah menjadi pure dengan sedikit kayu manis.",
    },
  ],
  stressed: [
    {
      id: 13,
      name: "Bayam",
      image: "/images/foods/spinach.jpg",
      description:
        "Kaya akan magnesium yang membantu relaksasi otot dan mengurangi stres.",
      nutrients: ["Magnesium", "Zat Besi", "Vitamin A", "Vitamin C"],
      preparation:
        "Tumis sebagai lauk, campurkan ke dalam smoothie, atau jadikan dasar salad.",
    },
    {
      id: 14,
      name: "Oatmeal",
      image: "/images/foods/oatmeal.jpg",
      description:
        "Melepaskan serotonin secara perlahan dan membantu menjaga kadar gula darah stabil.",
      nutrients: ["Serat", "Mangan", "Fosfor", "Magnesium"],
      preparation:
        "Masak dengan susu atau air, tambahkan buah-buahan, kacang-kacangan, dan madu.",
    },
    {
      id: 15,
      name: "Jeruk",
      image: "/images/foods/orange.jpg",
      description:
        "Vitamin C membantu menurunkan hormon stres seperti kortisol.",
      nutrients: ["Vitamin C", "Folat", "Potassium", "Serat"],
      preparation:
        "Konsumsi langsung atau peras menjadi jus segar tanpa tambahan gula.",
    },
  ],
  tired: [
    {
      id: 16,
      name: "Quinoa",
      image: "/images/foods/quinoa.jpg",
      description:
        "Karbohidrat kompleks dan protein yang memberikan energi tahan lama.",
      nutrients: ["Protein", "Mangan", "Magnesium", "Serat"],
      preparation:
        "Masak seperti nasi, tambahkan ke dalam salad, atau jadikan bahan dasar bowl.",
    },
    {
      id: 17,
      name: "Kacang Lentil",
      image: "/images/foods/lentils.jpg",
      description:
        "Kaya akan zat besi yang membantu mengatasi kelelahan dan meningkatkan energi.",
      nutrients: ["Zat Besi", "Protein", "Folat", "Serat"],
      preparation:
        "Masak sebagai sup, tambahkan ke dalam salad, atau olah menjadi patty vegetarian.",
    },
    {
      id: 18,
      name: "Kale",
      image: "/images/foods/kale.jpg",
      description:
        "Kaya akan antioksidan, vitamin, dan mineral yang membantu energi dan daya tahan.",
      nutrients: ["Vitamin K", "Vitamin C", "Vitamin A", "Mangan"],
      preparation:
        "Tumis dengan bawang putih, olah menjadi chips, atau tambahkan ke dalam smoothie.",
    },
  ],
};

// Mock data for health condition restrictions
const healthConditionRestrictions = {
  diabetes: {
    avoid: [
      "Makanan dengan indeks glikemik tinggi",
      "Gula olahan",
      "Minuman manis",
    ],
    prefer: [
      "Karbohidrat kompleks",
      "Makanan tinggi serat",
      "Protein tanpa lemak",
    ],
  },
  hypertension: {
    avoid: ["Makanan tinggi sodium", "Daging olahan", "Makanan kaleng"],
    prefer: [
      "Makanan kaya potassium",
      "Produk susu rendah lemak",
      "Whole grains",
    ],
  },
  heart_disease: {
    avoid: ["Lemak trans", "Daging merah", "Makanan tinggi kolesterol"],
    prefer: ["Ikan berlemak", "Buah dan sayuran", "Biji-bijian utuh"],
  },
  high_cholesterol: {
    avoid: ["Makanan tinggi lemak jenuh", "Kuning telur", "Jeroan"],
    prefer: [
      "Makanan tinggi serat larut",
      "Lemak tak jenuh tunggal",
      "Protein nabati",
    ],
  },
  ibs: {
    avoid: ["Makanan tinggi FODMAP", "Kafein", "Makanan pedas"],
    prefer: ["Makanan rendah FODMAP", "Probiotik", "Makanan mudah dicerna"],
  },
  gerd: {
    avoid: ["Makanan asam", "Makanan berlemak", "Cokelat dan kafein"],
    prefer: ["Makanan alkali", "Protein rendah lemak", "Sayuran non-asam"],
  },
  celiac: {
    avoid: ["Makanan mengandung gluten", "Gandum", "Barley dan rye"],
    prefer: ["Beras", "Quinoa", "Gandum hitam"],
  },
  lactose_intolerance: {
    avoid: ["Susu", "Keju", "Es krim dan yogurt"],
    prefer: [
      "Susu nabati",
      "Produk bebas laktosa",
      "Sumber kalsium alternatif",
    ],
  },
  nut_allergy: {
    avoid: [
      "Segala jenis kacang",
      "Selai kacang",
      "Makanan yang mungkin terkontaminasi kacang",
    ],
    prefer: ["Sumber protein alternatif", "Biji-bijian", "Legum"],
  },
  shellfish_allergy: {
    avoid: ["Udang", "Kepiting", "Kerang dan seafood sejenisnya"],
    prefer: ["Ikan bersirip", "Protein nabati", "Protein hewani non-seafood"],
  },
};

// Mock data for dietary preferences
const dietaryPreferenceOptions = {
  vegetarian: {
    avoid: ["Daging", "Unggas", "Ikan dan seafood"],
    prefer: ["Protein nabati", "Produk susu", "Telur"],
  },
  vegan: {
    avoid: ["Semua produk hewani", "Madu", "Gelatin"],
    prefer: ["Protein nabati", "Pengganti susu nabati", "Nutritional yeast"],
  },
  halal: {
    avoid: ["Daging babi", "Alkohol", "Daging tidak disembelih secara halal"],
    prefer: ["Daging halal", "Makanan tersertifikasi halal", "Produk nabati"],
  },
  kosher: {
    avoid: ["Kombinasi daging dan susu", "Makanan laut tanpa sisik", "Babi"],
    prefer: [
      "Makanan tersertifikasi kosher",
      "Daging kosher",
      "Parev (netral)",
    ],
  },
  gluten_free: {
    avoid: ["Gandum", "Barley", "Rye dan triticale"],
    prefer: ["Beras", "Quinoa", "Jagung dan buckwheat"],
  },
  dairy_free: {
    avoid: ["Susu", "Mentega", "Keju dan yogurt"],
    prefer: ["Susu nabati", "Yogurt nabati", "Keju nabati"],
  },
  low_sugar: {
    avoid: ["Gula tambahan", "Minuman manis", "Makanan olahan"],
    prefer: ["Pemanis alami", "Buah utuh", "Makanan tanpa gula tambahan"],
  },
  low_salt: {
    avoid: ["Makanan olahan", "Makanan kaleng", "Snack kemasan"],
    prefer: ["Makanan segar", "Rempah-rempah", "Bumbu non-garam"],
  },
};

// Function to get mood name in Bahasa Indonesia
const getMoodIndonesianName = (mood) => {
  switch (mood) {
    case "happy":
      return "Senang";
    case "sad":
      return "Sedih";
    case "angry":
      return "Marah";
    case "anxious":
      return "Cemas";
    case "stressed":
      return "Stres";
    case "tired":
      return "Lelah";
    default:
      return mood;
  }
};

export default function RecommendationResult() {
  const searchParams = useSearchParams();
  const supabase = createClientComponentClient();
  const [recommendations, setRecommendations] = useState([]);
  const [restrictions, setRestrictions] = useState({ avoid: [], prefer: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedFood, setSelectedFood] = useState(null);

  useEffect(() => {
    fetchRecommendations();
  }, []);

  const fetchRecommendations = async () => {
    try {
      const mood = searchParams.get("mood");
      if (!mood) {
        setError("Mood tidak ditemukan");
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("food_recommendations")
        .select("*")
        .eq("mood", mood)
        .limit(3);

      if (error) throw error;
      setRecommendations(data || []);
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

  const getMoodEmoji = (mood) => {
    switch (mood) {
      case "happy":
        return "😊";
      case "sad":
        return "😔";
      case "angry":
        return "😠";
      case "anxious":
        return "😰";
      case "stressed":
        return "😩";
      case "tired":
        return "😴";
      default:
        return "😐";
    }
  };

  const getMoodColor = (mood) => {
    switch (mood) {
      case "happy":
        return "bg-yellow-50 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300";
      case "sad":
        return "bg-blue-50 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300";
      case "angry":
        return "bg-red-50 text-red-800 dark:bg-red-900/30 dark:text-red-300";
      case "anxious":
        return "bg-purple-50 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300";
      case "stressed":
        return "bg-orange-50 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300";
      case "tired":
        return "bg-gray-50 text-gray-800 dark:bg-gray-800/30 dark:text-gray-300";
      default:
        return "bg-gray-50 text-gray-800 dark:bg-gray-800/30 dark:text-gray-300";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-neutral-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Memuat rekomendasi...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-neutral-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 dark:text-red-400">{error}</p>
          <Link href="/recommendation" className="mt-4 inline-block text-primary-600 hover:text-primary-700">
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
            <div key={food.id} className="bg-white dark:bg-neutral-800 rounded-lg shadow p-6">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 h-12 w-12 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center">
                  <svg className="h-6 w-6 text-primary-600 dark:text-primary-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">{food.name}</h3>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{food.description}</p>
                  <div className="mt-4 grid grid-cols-4 gap-4">
                    <div className="text-center">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{food.calories}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Kalori</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{food.protein}g</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Protein</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{food.carbs}g</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Karbohidrat</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{food.fat}g</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Lemak</p>
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
                <Image
                  src={selectedFood.image}
                  alt={selectedFood.name}
                  className="object-cover"
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
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
                  {selectedFood.name}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  {selectedFood.description}
                </p>
                <div className="mb-4">
                  <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    Nutrisi Utama
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedFood.nutrients.map((nutrient, index) => (
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
                    className="inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-white dark:bg-neutral-700 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-neutral-600 border-gray-300 dark:border-neutral-600"
                    onClick={closeModal}
                  >
                    Tutup
                  </button>
                  <button
                    type="button"
                    className="inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary-600 text-sm font-medium text-white hover:bg-primary-700"
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
