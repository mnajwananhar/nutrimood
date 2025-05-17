"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

const healthConditions = [
  { id: "diabetes", name: "Diabetes" },
  { id: "hypertension", name: "Hipertensi" },
  { id: "heart_disease", name: "Penyakit Jantung" },
  { id: "high_cholesterol", name: "Kolesterol Tinggi" },
  { id: "ibs", name: "Irritable Bowel Syndrome" },
  { id: "gerd", name: "GERD/Asam Lambung" },
  { id: "celiac", name: "Penyakit Celiac" },
  { id: "lactose_intolerance", name: "Intoleransi Laktosa" },
  { id: "nut_allergy", name: "Alergi Kacang" },
  { id: "shellfish_allergy", name: "Alergi Kerang" },
];

const dietaryRestrictions = [
  { id: "vegetarian", name: "Vegetarian" },
  { id: "vegan", name: "Vegan" },
  { id: "halal", name: "Halal" },
  { id: "kosher", name: "Kosher" },
  { id: "gluten_free", name: "Bebas Gluten" },
  { id: "dairy_free", name: "Bebas Susu" },
  { id: "low_sugar", name: "Rendah Gula" },
  { id: "low_salt", name: "Rendah Garam" },
];

export default function RecommendationForm() {
  const router = useRouter();
  const supabase = createClientComponentClient();

  const [mood, setMood] = useState("");
  const [intensity, setIntensity] = useState(5);
  const [selectedHealthConditions, setSelectedHealthConditions] = useState([]);
  const [selectedDietaryRestrictions, setSelectedDietaryRestrictions] =
    useState([]);
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleMoodSelect = (selectedMood) => {
    setMood(selectedMood);
  };

  const handleHealthConditionToggle = (conditionId) => {
    setSelectedHealthConditions((prev) =>
      prev.includes(conditionId)
        ? prev.filter((id) => id !== conditionId)
        : [...prev, conditionId]
    );
  };

  const handleDietaryRestrictionToggle = (restrictionId) => {
    setSelectedDietaryRestrictions((prev) =>
      prev.includes(restrictionId)
        ? prev.filter((id) => id !== restrictionId)
        : [...prev, restrictionId]
    );
  };

  const goToNextStep = () => {
    if (currentStep === 1 && !mood) {
      setError("Silakan pilih mood Anda terlebih dahulu");
      return;
    }
    setError("");
    setCurrentStep(currentStep + 1);
  };

  const goToPreviousStep = () => {
    setCurrentStep(currentStep - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }

      // Menyimpan mood ke database
      const { error: saveError } = await supabase
        .from('food_journal')
        .insert([
          {
            user_id: user.id,
            date: new Date().toISOString().split('T')[0],
            time: new Date().toTimeString().slice(0, 5),
            mood: mood,
            foods: []
          }
        ]);

      if (saveError) throw saveError;

      // Mengambil rekomendasi berdasarkan mood
      const { data: recommendations, error: recError } = await supabase
        .from('food_recommendations')
        .select('*')
        .eq('mood', mood)
        .limit(3);

      if (recError) throw recError;

      // Navigate ke halaman hasil dengan data rekomendasi
      router.push('/recommendation/result?mood=' + mood);
    } catch (error) {
      console.error('Error submitting form:', error);
      setError('Terjadi kesalahan. Silakan coba lagi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getMoodColor = (moodType) => {
    switch (moodType) {
      case 'senang':
        return 'bg-green-100 border-green-500 text-green-800 dark:bg-green-900 dark:border-green-600 dark:text-green-300';
      case 'netral':
        return 'bg-yellow-100 border-yellow-500 text-yellow-800 dark:bg-yellow-900 dark:border-yellow-600 dark:text-yellow-300';
      case 'sedih':
        return 'bg-red-100 border-red-500 text-red-800 dark:bg-red-900 dark:border-red-600 dark:text-red-300';
      default:
        return 'bg-gray-100 border-gray-500 text-gray-800 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300';
    }
  };

  return (
    <div className="bg-white dark:bg-neutral-900 py-12 px-4 sm:px-6 lg:px-8 min-h-screen">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white sm:text-4xl">
            Rekomendasi Makanan
          </h1>
          <p className="mt-3 text-lg text-gray-500 dark:text-gray-400">
            Pilih mood Anda untuk mendapatkan rekomendasi makanan yang sesuai
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white dark:bg-neutral-800 shadow-md rounded-lg p-6 mb-8">
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Bagaimana perasaanmu hari ini?
              </h2>
              <div className="grid grid-cols-3 gap-4">
                {['senang', 'netral', 'sedih'].map((moodType) => (
                  <button
                    key={moodType}
                    type="button"
                    className={`${mood === moodType
                      ? `${getMoodColor(moodType)} border-2`
                      : 'bg-gray-50 hover:bg-gray-100 dark:bg-neutral-700 dark:hover:bg-neutral-600'
                      } p-4 rounded-lg flex flex-col items-center justify-center transition-all`}
                    onClick={() => handleMoodSelect(moodType)}
                  >
                    <span className="text-4xl mb-2">
                      {moodType === 'senang' ? '😊' :
                        moodType === 'netral' ? '😐' : '😔'}
                    </span>
                    <span className="text-sm font-medium capitalize">
                      {moodType}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {error && (
              <div className="text-red-600 dark:text-red-400 text-sm">
                {error}
              </div>
            )}

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={!mood || isSubmitting}
                className={`px-6 py-3 rounded-md text-white font-medium ${!mood || isSubmitting
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-primary-600 hover:bg-primary-700'
                  }`}
              >
                {isSubmitting ? 'Memproses...' : 'Dapatkan Rekomendasi'}
              </button>
            </div>
          </div>
        </form>

        {/* Helpful Information */}
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 text-blue-800 dark:text-blue-300 text-sm">
          <div className="flex">
            <svg
              className="h-5 w-5 text-blue-500 dark:text-blue-400 mr-2"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                clipRule="evenodd"
              />
            </svg>
            <p>
              Rekomendasi makanan yang diberikan berdasarkan pada pengetahuan
              umum tentang hubungan makanan, mood, dan kondisi kesehatan. Ini
              bukan pengganti saran medis profesional. Konsultasikan dengan ahli
              gizi atau dokter untuk saran yang disesuaikan dengan kebutuhanmu.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
