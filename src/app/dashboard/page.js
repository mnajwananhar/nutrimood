'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';

export default function Dashboard() {
    const supabase = createClientComponentClient();
    const router = useRouter();
    const [moodHistory, setMoodHistory] = useState([]);
    const [recommendations, setRecommendations] = useState([]);
    const [user, setUser] = useState(null);

    useEffect(() => {
        fetchUserData();
        fetchMoodHistory();
        fetchRecommendations();
    }, []);

    const fetchUserData = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                router.push('/login');
                return;
            }
            setUser(user);
        } catch (error) {
            console.error('Error fetching user data:', error);
        }
    };

    const fetchMoodHistory = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data, error } = await supabase
                .from('food_journal')
                .select('date, mood')
                .eq('user_id', user.id)
                .order('date', { ascending: false })
                .limit(3);

            if (error) throw error;
            setMoodHistory(data || []);
        } catch (error) {
            console.error('Error fetching mood history:', error);
        }
    };

    const fetchRecommendations = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            // Mengambil rekomendasi berdasarkan mood terakhir
            const { data: lastMood } = await supabase
                .from('food_journal')
                .select('mood')
                .eq('user_id', user.id)
                .order('date', { ascending: false })
                .limit(1)
                .single();

            if (lastMood) {
                // Mengambil rekomendasi makanan berdasarkan mood
                const { data, error } = await supabase
                    .from('food_recommendations')
                    .select('*')
                    .eq('mood', lastMood.mood)
                    .limit(2);

                if (error) throw error;
                setRecommendations(data || []);
            }
        } catch (error) {
            console.error('Error fetching recommendations:', error);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-neutral-900">
            {/* Header */}
            <header className="bg-white dark:bg-neutral-800 shadow">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                    {/* Sidebar */}
                    <div className="lg:col-span-1">
                        {/* Profil Ringkas */}
                        <div className="bg-white dark:bg-neutral-800 rounded-lg shadow p-6 mb-6">
                            <div className="flex items-center space-x-4">
                                <div className="h-16 w-16 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center">
                                    <span className="text-2xl font-bold text-primary-600 dark:text-primary-300">
                                        {user?.email?.charAt(0).toUpperCase() || 'U'}
                                    </span>
                                </div>
                                <div>
                                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                                        {user?.email || 'Pengguna'}
                                    </h2>
                                    <p className="text-gray-500 dark:text-gray-400">Pengguna Aktif</p>
                                </div>
                            </div>
                        </div>

                        {/* Menu Navigasi */}
                        <div className="bg-white dark:bg-neutral-800 rounded-lg shadow p-6">
                            <nav className="space-y-2">
                                <Link href="/dashboard" className="flex items-center space-x-3 text-primary-600 dark:text-primary-400 font-medium">
                                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                                    </svg>
                                    <span>Dashboard</span>
                                </Link>
                                <Link href="/dashboard/journal" className="flex items-center space-x-3 text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400">
                                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                    </svg>
                                    <span>Jurnal Makanan</span>
                                </Link>
                                <Link href="/recommendation" className="flex items-center space-x-3 text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400">
                                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                    </svg>
                                    <span>Rekomendasi</span>
                                </Link>
                            </nav>
                        </div>
                    </div>

                    {/* Konten Utama */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Ringkasan Mood */}
                        <div className="bg-white dark:bg-neutral-800 rounded-lg shadow p-6">
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Ringkasan Mood</h2>
                            <div className="grid grid-cols-3 gap-4">
                                {moodHistory.map((entry, index) => (
                                    <div key={index} className="bg-gray-50 dark:bg-neutral-700 rounded-lg p-4">
                                        <p className="text-sm text-gray-500 dark:text-gray-400">{entry.date}</p>
                                        <p className={`text-lg font-medium mt-1 ${entry.mood === 'senang' ? 'text-green-600 dark:text-green-400' :
                                            entry.mood === 'netral' ? 'text-yellow-600 dark:text-yellow-400' :
                                                'text-red-600 dark:text-red-400'
                                            }`}>
                                            {entry.mood}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Rekomendasi Makanan */}
                        <div className="bg-white dark:bg-neutral-800 rounded-lg shadow p-6">
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Rekomendasi Makanan</h2>
                            <div className="space-y-4">
                                {recommendations.map((food) => (
                                    <div key={food.id} className="flex space-x-4 bg-gray-50 dark:bg-neutral-700 rounded-lg p-4">
                                        <div className="flex-shrink-0 h-12 w-12 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center">
                                            <svg className="h-6 w-6 text-primary-600 dark:text-primary-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                            </svg>
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="text-lg font-medium text-gray-900 dark:text-white">{food.name}</h3>
                                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{food.description}</p>
                                            <div className="mt-2 grid grid-cols-4 gap-2">
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
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
} 