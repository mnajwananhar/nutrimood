'use client';

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';

export default function FoodJournal() {
    const supabase = createClientComponentClient();
    const router = useRouter();
    const [journalEntries, setJournalEntries] = useState([]);
    const [showAddForm, setShowAddForm] = useState(false);
    const [newEntry, setNewEntry] = useState({
        date: new Date().toISOString().split('T')[0],
        time: new Date().toTimeString().slice(0, 5),
        meal: '',
        foods: [{ name: '', quantity: '', calories: '' }],
        mood: '',
        notes: ''
    });

    // Mengambil data dari Supabase
    useEffect(() => {
        fetchJournalEntries();
    }, []);

    const fetchJournalEntries = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                router.push('/login');
                return;
            }

            const { data, error } = await supabase
                .from('food_journal')
                .select('*')
                .eq('user_id', user.id)
                .order('date', { ascending: false });

            if (error) throw error;
            setJournalEntries(data || []);
        } catch (error) {
            console.error('Error fetching journal entries:', error);
        }
    };

    const handleAddFood = () => {
        setNewEntry(prev => ({
            ...prev,
            foods: [...prev.foods, { name: '', quantity: '', calories: '' }]
        }));
    };

    const handleFoodChange = (index, field, value) => {
        const updatedFoods = [...newEntry.foods];
        updatedFoods[index] = { ...updatedFoods[index], [field]: value };
        setNewEntry(prev => ({ ...prev, foods: updatedFoods }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                router.push('/login');
                return;
            }

            // Validasi input
            if (!newEntry.date || !newEntry.time || !newEntry.meal || !newEntry.mood) {
                alert('Mohon lengkapi semua field yang diperlukan');
                return;
            }

            // Menyimpan ke Supabase
            const { error } = await supabase
                .from('food_journal')
                .insert([
                    {
                        user_id: user.id,
                        date: newEntry.date,
                        time: newEntry.time,
                        meal: newEntry.meal,
                        foods: newEntry.foods,
                        mood: newEntry.mood,
                        notes: newEntry.notes
                    }
                ]);

            if (error) throw error;

            // Reset form dan refresh data
            setNewEntry({
                date: new Date().toISOString().split('T')[0],
                time: new Date().toTimeString().slice(0, 5),
                meal: '',
                foods: [{ name: '', quantity: '', calories: '' }],
                mood: '',
                notes: ''
            });
            setShowAddForm(false);
            fetchJournalEntries();
        } catch (error) {
            console.error('Error saving journal entry:', error);
            alert('Terjadi kesalahan saat menyimpan data');
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Apakah Anda yakin ingin menghapus catatan ini?')) return;

        try {
            const { error } = await supabase
                .from('food_journal')
                .delete()
                .eq('id', id);

            if (error) throw error;
            fetchJournalEntries();
        } catch (error) {
            console.error('Error deleting journal entry:', error);
            alert('Terjadi kesalahan saat menghapus data');
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-neutral-900">
            {/* Header */}
            <header className="bg-white dark:bg-neutral-800 shadow">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex justify-between items-center">
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Jurnal Makanan</h1>
                        <button
                            onClick={() => setShowAddForm(true)}
                            className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
                        >
                            Tambah Catatan
                        </button>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Form Tambah Catatan */}
                {showAddForm && (
                    <div className="bg-white dark:bg-neutral-800 rounded-lg shadow p-6 mb-8">
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Tambah Catatan Baru</h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Tanggal</label>
                                    <input
                                        type="date"
                                        required
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-neutral-700 dark:border-neutral-600"
                                        value={newEntry.date}
                                        onChange={(e) => setNewEntry(prev => ({ ...prev, date: e.target.value }))}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Waktu</label>
                                    <input
                                        type="time"
                                        required
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-neutral-700 dark:border-neutral-600"
                                        value={newEntry.time}
                                        onChange={(e) => setNewEntry(prev => ({ ...prev, time: e.target.value }))}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Jenis Makanan</label>
                                    <select
                                        required
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-neutral-700 dark:border-neutral-600"
                                        value={newEntry.meal}
                                        onChange={(e) => setNewEntry(prev => ({ ...prev, meal: e.target.value }))}
                                    >
                                        <option value="">Pilih...</option>
                                        <option value="Sarapan">Sarapan</option>
                                        <option value="Makan Siang">Makan Siang</option>
                                        <option value="Makan Malam">Makan Malam</option>
                                        <option value="Cemilan">Cemilan</option>
                                    </select>
                                </div>
                            </div>

                            {/* Daftar Makanan */}
                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">Makanan</h3>
                                    <button
                                        type="button"
                                        onClick={handleAddFood}
                                        className="text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400"
                                    >
                                        + Tambah Makanan
                                    </button>
                                </div>
                                {newEntry.foods.map((food, index) => (
                                    <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div>
                                            <input
                                                type="text"
                                                required
                                                placeholder="Nama Makanan"
                                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-neutral-700 dark:border-neutral-600"
                                                value={food.name}
                                                onChange={(e) => handleFoodChange(index, 'name', e.target.value)}
                                            />
                                        </div>
                                        <div>
                                            <input
                                                type="text"
                                                required
                                                placeholder="Jumlah"
                                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-neutral-700 dark:border-neutral-600"
                                                value={food.quantity}
                                                onChange={(e) => handleFoodChange(index, 'quantity', e.target.value)}
                                            />
                                        </div>
                                        <div>
                                            <input
                                                type="number"
                                                required
                                                placeholder="Kalori"
                                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-neutral-700 dark:border-neutral-600"
                                                value={food.calories}
                                                onChange={(e) => handleFoodChange(index, 'calories', e.target.value)}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Mood</label>
                                    <select
                                        required
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-neutral-700 dark:border-neutral-600"
                                        value={newEntry.mood}
                                        onChange={(e) => setNewEntry(prev => ({ ...prev, mood: e.target.value }))}
                                    >
                                        <option value="">Pilih...</option>
                                        <option value="senang">Senang</option>
                                        <option value="netral">Netral</option>
                                        <option value="sedih">Sedih</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Catatan</label>
                                    <textarea
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-neutral-700 dark:border-neutral-600"
                                        rows="3"
                                        value={newEntry.notes}
                                        onChange={(e) => setNewEntry(prev => ({ ...prev, notes: e.target.value }))}
                                    ></textarea>
                                </div>
                            </div>

                            <div className="flex justify-end space-x-4">
                                <button
                                    type="button"
                                    onClick={() => setShowAddForm(false)}
                                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 dark:border-neutral-600 dark:text-gray-300 dark:hover:bg-neutral-700"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
                                >
                                    Simpan
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Daftar Catatan */}
                <div className="space-y-6">
                    {journalEntries.map((entry) => (
                        <div key={entry.id} className="bg-white dark:bg-neutral-800 rounded-lg shadow p-6">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">{entry.meal}</h3>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        {entry.date} - {entry.time}
                                    </p>
                                </div>
                                <div className="flex items-center space-x-4">
                                    <span className={`px-3 py-1 rounded-full text-sm ${entry.mood === 'senang' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' :
                                        entry.mood === 'netral' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300' :
                                            'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                                        }`}>
                                        {entry.mood}
                                    </span>
                                    <button
                                        onClick={() => handleDelete(entry.id)}
                                        className="text-red-600 hover:text-red-700 dark:text-red-400"
                                    >
                                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-2">
                                {entry.foods.map((food, index) => (
                                    <div key={index} className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-neutral-700 last:border-0">
                                        <div>
                                            <p className="text-gray-900 dark:text-white">{food.name}</p>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">{food.quantity}</p>
                                        </div>
                                        <p className="text-gray-600 dark:text-gray-300">{food.calories} kal</p>
                                    </div>
                                ))}
                            </div>

                            {entry.notes && (
                                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-neutral-700">
                                    <p className="text-gray-600 dark:text-gray-300 italic">{entry.notes}</p>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </main>
        </div>
    );
} 