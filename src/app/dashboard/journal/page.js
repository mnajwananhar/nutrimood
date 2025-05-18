'use client';

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';
import { sendFoodJournalNotification } from '@/lib/notifications';

export default function FoodJournal() {
    const supabase = createClientComponentClient();
    const router = useRouter();
    const [user, setUser] = useState(null);
    const [journalEntries, setJournalEntries] = useState([]);
    const [newEntry, setNewEntry] = useState({
        food_name: '',
        mood: 'happy',
        meal_type: 'breakfast',
        notes: '',
        date: new Date().toISOString().split('T')[0]
    });

    useEffect(() => {
        const getUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            setUser(user);
            if (user) {
                fetchJournalEntries(user.id);
            }
        };

        getUser();
    }, []);

    const fetchJournalEntries = async (userId) => {
        try {
            const { data, error } = await supabase
                .from('food_journal')
                .select('*')
                .eq('user_id', userId)
                .order('date', { ascending: false })
                .order('created_at', { ascending: false });

            if (error) throw error;
            setJournalEntries(data || []);
        } catch (error) {
            console.error('Error fetching journal entries:', error);
            alert('Terjadi kesalahan saat mengambil data jurnal. Silakan coba lagi.');
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewEntry(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!user) {
            alert('Silakan login terlebih dahulu');
            router.push('/login');
            return;
        }

        try {
            // Validasi input
            if (!newEntry.food_name.trim()) {
                alert('Nama makanan tidak boleh kosong');
                return;
            }

            if (!newEntry.date) {
                alert('Tanggal tidak boleh kosong');
                return;
            }

            // Format data sebelum dikirim
            const entryData = {
                user_id: user.id,
                food_name: newEntry.food_name.trim(),
                mood: newEntry.mood,
                meal_type: newEntry.meal_type,
                notes: newEntry.notes.trim(),
                date: newEntry.date,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            };

            const { data, error } = await supabase
                .from('food_journal')
                .insert([entryData])
                .select()
                .single();

            if (error) {
                console.error('Error details:', error);
                throw error;
            }

            // Kirim notifikasi
            try {
                await sendFoodJournalNotification(user.id, newEntry.food_name);
            } catch (notifError) {
                console.error('Error sending notification:', notifError);
                // Lanjutkan meskipun notifikasi gagal
            }

            // Reset form
            setNewEntry({
                food_name: '',
                mood: 'happy',
                meal_type: 'breakfast',
                notes: '',
                date: new Date().toISOString().split('T')[0]
            });

            // Refresh entries
            await fetchJournalEntries(user.id);
            alert('Jurnal makanan berhasil ditambahkan!');
        } catch (error) {
            console.error('Error adding journal entry:', error);
            if (error.code === '23505') {
                alert('Jurnal untuk makanan ini pada tanggal tersebut sudah ada');
            } else if (error.code === '23503') {
                alert('Terjadi kesalahan: Data referensi tidak valid');
            } else {
                alert('Terjadi kesalahan saat menambahkan jurnal. Silakan coba lagi.');
            }
        }
    };

    const handleDelete = async (entryId) => {
        if (!confirm('Apakah Anda yakin ingin menghapus entri ini?')) return;

        try {
            const { error } = await supabase
                .from('food_journal')
                .delete()
                .eq('id', entryId)
                .eq('user_id', user.id);

            if (error) throw error;

            // Refresh entries
            await fetchJournalEntries(user.id);
            alert('Jurnal makanan berhasil dihapus!');
        } catch (error) {
            console.error('Error deleting journal entry:', error);
            alert('Terjadi kesalahan saat menghapus jurnal. Silakan coba lagi.');
        }
    };

    const handleUpdate = async (entryId, updates) => {
        try {
            const { error } = await supabase
                .from('food_journal')
                .update({
                    ...updates,
                    updated_at: new Date().toISOString()
                })
                .eq('id', entryId)
                .eq('user_id', user.id);

            if (error) throw error;

            // Refresh entries
            await fetchJournalEntries(user.id);
            alert('Jurnal makanan berhasil diperbarui!');
        } catch (error) {
            console.error('Error updating journal entry:', error);
            alert('Terjadi kesalahan saat memperbarui jurnal. Silakan coba lagi.');
        }
    };

    const getMoodEmoji = (mood) => {
        switch (mood) {
            case 'happy':
                return '😊';
            case 'sad':
                return '😢';
            case 'angry':
                return '😠';
            case 'tired':
                return '😴';
            case 'stressed':
                return '😰';
            default:
                return '😐';
        }
    };

    const getMealTypeText = (type) => {
        switch (type) {
            case 'breakfast':
                return 'Sarapan';
            case 'lunch':
                return 'Makan Siang';
            case 'dinner':
                return 'Makan Malam';
            case 'snack':
                return 'Cemilan';
            default:
                return type;
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-neutral-900">
            <header className="bg-white dark:bg-neutral-800 shadow">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Jurnal Makanan</h1>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                    {/* Form Input */}
                    <div className="lg:col-span-1">
                        <div className="bg-white dark:bg-neutral-800 rounded-lg shadow p-6">
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Tambah Catatan Makanan</h2>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label htmlFor="food_name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                            Nama Makanan
                                        </label>
                                        <input
                                            type="text"
                                            id="food_name"
                                            name="food_name"
                                            value={newEntry.food_name}
                                            onChange={handleInputChange}
                                            required
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-neutral-700 dark:border-neutral-600 dark:text-white"
                                        />
                                    </div>

                                    <div>
                                        <label htmlFor="meal_type" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                            Jenis Makanan
                                        </label>
                                        <select
                                            id="meal_type"
                                            name="meal_type"
                                            value={newEntry.meal_type}
                                            onChange={handleInputChange}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-neutral-700 dark:border-neutral-600 dark:text-white"
                                        >
                                            <option value="breakfast">Sarapan</option>
                                            <option value="lunch">Makan Siang</option>
                                            <option value="dinner">Makan Malam</option>
                                            <option value="snack">Cemilan</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label htmlFor="mood" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                            Mood
                                        </label>
                                        <select
                                            id="mood"
                                            name="mood"
                                            value={newEntry.mood}
                                            onChange={handleInputChange}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-neutral-700 dark:border-neutral-600 dark:text-white"
                                        >
                                            <option value="happy">😊 Bahagia</option>
                                            <option value="sad">😢 Sedih</option>
                                            <option value="angry">😠 Marah</option>
                                            <option value="tired">😴 Lelah</option>
                                            <option value="stressed">😰 Stres</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label htmlFor="date" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                            Tanggal
                                        </label>
                                        <input
                                            type="date"
                                            id="date"
                                            name="date"
                                            value={newEntry.date}
                                            onChange={handleInputChange}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-neutral-700 dark:border-neutral-600 dark:text-white"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label htmlFor="notes" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Catatan
                                    </label>
                                    <textarea
                                        id="notes"
                                        name="notes"
                                        value={newEntry.notes}
                                        onChange={handleInputChange}
                                        rows={3}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-neutral-700 dark:border-neutral-600 dark:text-white"
                                    />
                                </div>

                                <div className="flex justify-end">
                                    <button
                                        type="submit"
                                        className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                                    >
                                        Tambah Entri
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>

                    {/* Riwayat Jurnal */}
                    <div className="lg:col-span-2">
                        <div className="bg-white dark:bg-neutral-800 rounded-lg shadow p-6">
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Riwayat Jurnal</h2>
                            <div className="space-y-4">
                                {journalEntries.map((entry) => (
                                    <div key={entry.id} className="border-b border-gray-200 dark:border-neutral-700 pb-4">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h3 className="text-lg font-medium text-gray-900 dark:text-white">{entry.food_name}</h3>
                                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                                    {getMealTypeText(entry.meal_type)} • {new Date(entry.date).toLocaleDateString('id-ID')}
                                                </p>
                                            </div>
                                            <div className="text-2xl">
                                                {getMoodEmoji(entry.mood)}
                                            </div>
                                        </div>
                                        <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">{entry.notes}</p>
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