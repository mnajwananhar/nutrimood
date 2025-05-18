'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function Dashboard() {
    const supabase = createClientComponentClient();
    const router = useRouter();
    const [moodHistory, setMoodHistory] = useState([]);
    const [recommendations, setRecommendations] = useState([]);
    const [user, setUser] = useState(null);
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalEntries: 0,
        averageMood: 0,
        streakDays: 0,
        lastEntry: null
    });

    useEffect(() => {
        fetchUserData();
        fetchMoodHistory();
        fetchRecommendations();
        fetchStats();
    }, []);

    const fetchUserData = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                router.push('/login');
                return;
            }
            setUser(user);

            // Fetch profile data
            const { data: profile, error: profileError } = await supabase
                .from('profiles')
                .select('*')
                .eq('user_id', user.id)
                .single();

            if (profileError) {
                if (profileError.code === 'PGRST116') {
                    // Profile belum ada, buat baru
                    const { data: newProfile, error: createError } = await supabase
                        .from('profiles')
                        .insert([{
                            user_id: user.id,
                            full_name: user.email,
                            created_at: new Date().toISOString(),
                            updated_at: new Date().toISOString()
                        }])
                        .select()
                        .single();

                    if (createError) throw createError;
                    setProfile(newProfile);
                } else {
                    throw profileError;
                }
            } else {
                setProfile(profile);
            }
        } catch (error) {
            console.error('Error fetching user data:', error);
            alert('Terjadi kesalahan saat mengambil data pengguna. Silakan coba lagi.');
        } finally {
            setLoading(false);
        }
    };

    const fetchMoodHistory = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data, error } = await supabase
                .from('food_journal')
                .select('date, mood, meal_type')
                .eq('user_id', user.id)
                .order('date', { ascending: false })
                .limit(7);

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
                    .limit(3);

                if (error) throw error;
                setRecommendations(data || []);
            }
        } catch (error) {
            console.error('Error fetching recommendations:', error);
        }
    };

    const fetchStats = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            // Get total entries
            const { count: totalEntries, error: countError } = await supabase
                .from('food_journal')
                .select('*', { count: 'exact', head: true })
                .eq('user_id', user.id);

            if (countError) throw countError;

            // Get average mood
            const { data: moods, error: moodsError } = await supabase
                .from('food_journal')
                .select('mood')
                .eq('user_id', user.id);

            if (moodsError) throw moodsError;

            const moodValues = {
                'happy': 5,
                'good': 4,
                'neutral': 3,
                'sad': 2,
                'angry': 1
            };

            const averageMood = moods?.length
                ? moods.reduce((acc, curr) => acc + moodValues[curr.mood], 0) / moods.length
                : 0;

            // Get streak days
            const { data: entries, error: entriesError } = await supabase
                .from('food_journal')
                .select('date')
                .eq('user_id', user.id)
                .order('date', { ascending: false });

            if (entriesError) throw entriesError;

            let streakDays = 0;
            if (entries && entries.length > 0) {
                const today = new Date();
                const lastEntry = new Date(entries[0].date);
                const diffTime = Math.abs(today - lastEntry);
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                if (diffDays <= 1) {
                    streakDays = 1;
                    for (let i = 1; i < entries.length; i++) {
                        const currentDate = new Date(entries[i].date);
                        const prevDate = new Date(entries[i - 1].date);
                        const dayDiff = Math.ceil((prevDate - currentDate) / (1000 * 60 * 60 * 24));

                        if (dayDiff === 1) {
                            streakDays++;
                        } else {
                            break;
                        }
                    }
                }
            }

            setStats({
                totalEntries: totalEntries || 0,
                averageMood: averageMood,
                streakDays: streakDays,
                lastEntry: entries?.[0]?.date || null
            });
        } catch (error) {
            console.error('Error fetching stats:', error);
            alert('Terjadi kesalahan saat mengambil statistik. Silakan coba lagi.');
        }
    };

    const getMoodEmoji = (mood) => {
        const emojis = {
            'happy': '😊',
            'good': '🙂',
            'neutral': '😐',
            'sad': '😢',
            'angry': '😠'
        };
        return emojis[mood] || '😐';
    };

    const getMoodColor = (mood) => {
        const colors = {
            'happy': 'text-green-600 dark:text-green-400',
            'good': 'text-blue-600 dark:text-blue-400',
            'neutral': 'text-yellow-600 dark:text-yellow-400',
            'sad': 'text-purple-600 dark:text-purple-400',
            'angry': 'text-red-600 dark:text-red-400'
        };
        return colors[mood] || 'text-gray-600 dark:text-gray-400';
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-neutral-900">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="animate-pulse space-y-8">
                        <div className="h-8 bg-gray-200 dark:bg-neutral-800 rounded w-1/4"></div>
                        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                            <div className="h-32 bg-gray-200 dark:bg-neutral-800 rounded"></div>
                            <div className="h-32 bg-gray-200 dark:bg-neutral-800 rounded"></div>
                            <div className="h-32 bg-gray-200 dark:bg-neutral-800 rounded"></div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-neutral-900">
            {/* Header */}
            <header className="bg-white dark:bg-neutral-800 shadow">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex items-center justify-between">
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
                        <Link
                            href="/dashboard/journal"
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
                        >
                            Tambah Jurnal
                        </Link>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                    {/* Sidebar */}
                    <div className="lg:col-span-1 space-y-6">
                        {/* Profil Ringkas */}
                        <div className="bg-white dark:bg-neutral-800 rounded-lg shadow p-6">
                            <div className="flex items-center space-x-4">
                                <div className="h-16 w-16 rounded-full bg-gray-200 dark:bg-neutral-700 flex items-center justify-center overflow-hidden">
                                    {profile?.avatar_url ? (
                                        <Image
                                            src={profile.avatar_url}
                                            alt={profile.full_name}
                                            width={64}
                                            height={64}
                                            className="h-full w-full object-cover"
                                        />
                                    ) : (
                                        <span className="text-2xl font-bold text-gray-500 dark:text-gray-400">
                                            {user?.email?.charAt(0).toUpperCase() || 'U'}
                                        </span>
                                    )}
                                </div>
                                <div>
                                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                                        {profile?.full_name || 'Pengguna'}
                                    </h2>
                                    <p className="text-gray-500 dark:text-gray-400">{user?.email}</p>
                                </div>
                            </div>
                        </div>

                        {/* Statistik */}
                        <div className="bg-white dark:bg-neutral-800 rounded-lg shadow p-6">
                            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                                Statistik
                            </h3>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-500 dark:text-gray-400">Total Jurnal</span>
                                    <span className="text-lg font-medium text-gray-900 dark:text-white">
                                        {stats.totalEntries}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-500 dark:text-gray-400">Rata-rata Mood</span>
                                    <span className="text-lg font-medium text-gray-900 dark:text-white">
                                        {stats.averageMood}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-500 dark:text-gray-400">Streak Hari Ini</span>
                                    <span className="text-lg font-medium text-gray-900 dark:text-white">
                                        {stats.streakDays} hari
                                    </span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-500 dark:text-gray-400">Jurnal Terakhir</span>
                                    <span className="text-sm text-gray-500 dark:text-gray-400">
                                        {stats.lastEntry
                                            ? new Date(stats.lastEntry).toLocaleDateString('id-ID')
                                            : '-'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Menu Navigasi */}
                        <div className="bg-white dark:bg-neutral-800 rounded-lg shadow p-6">
                            <nav className="space-y-2">
                                <Link
                                    href="/dashboard"
                                    className="flex items-center space-x-3 text-primary-600 dark:text-primary-400 font-medium"
                                >
                                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                                        />
                                    </svg>
                                    <span>Dashboard</span>
                                </Link>
                                <Link
                                    href="/dashboard/journal"
                                    className="flex items-center space-x-3 text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400"
                                >
                                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                                        />
                                    </svg>
                                    <span>Jurnal Makanan</span>
                                </Link>
                                <Link
                                    href="/recommendation"
                                    className="flex items-center space-x-3 text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400"
                                >
                                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                                        />
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
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                                Ringkasan Mood
                            </h2>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                                {moodHistory.map((entry, index) => (
                                    <div
                                        key={index}
                                        className="bg-gray-50 dark:bg-neutral-700 rounded-lg p-4 text-center"
                                    >
                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                            {new Date(entry.date).toLocaleDateString('id-ID')}
                                        </p>
                                        <p className={`text-2xl my-2 ${getMoodColor(entry.mood)}`}>
                                            {getMoodEmoji(entry.mood)}
                                        </p>
                                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                                            {entry.mood}
                                        </p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                            {entry.meal_type}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Rekomendasi Makanan */}
                        <div className="bg-white dark:bg-neutral-800 rounded-lg shadow p-6">
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                                Rekomendasi Makanan
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {recommendations.map((food) => (
                                    <div
                                        key={food.id}
                                        className="bg-gray-50 dark:bg-neutral-700 rounded-lg overflow-hidden"
                                    >
                                        {food.image_url && (
                                            <div className="aspect-w-16 aspect-h-9">
                                                <img
                                                    src={food.image_url}
                                                    alt={food.name}
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                        )}
                                        <div className="p-4">
                                            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                                                {food.name}
                                            </h3>
                                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                                                {food.description}
                                            </p>
                                            <div className="grid grid-cols-4 gap-2 text-center">
                                                <div>
                                                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                                                        {food.calories}
                                                    </p>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                                        Kalori
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                                                        {food.protein}g
                                                    </p>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                                        Protein
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                                                        {food.carbs}g
                                                    </p>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                                        Karbo
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                                                        {food.fat}g
                                                    </p>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                                        Lemak
                                                    </p>
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