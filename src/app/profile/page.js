"use client";

import { useState, useEffect } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useRouter } from "next/navigation";
import Image from 'next/image';

export default function Profile() {
    const supabase = createClientComponentClient();
    const router = useRouter();
    const [user, setUser] = useState(null);
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [formData, setFormData] = useState({
        full_name: "",
        age: "",
        gender: "",
        height: "",
        weight: "",
        activity_level: "",
        dietary_preferences: [],
        health_conditions: [],
    });

    useEffect(() => {
        fetchUserData();
        // Listen to auth state changes
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
            if (!session?.user) router.push("/login");
        });
        return () => subscription.unsubscribe();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [router, supabase]);

    const fetchUserData = async () => {
        try {
            const {
                data: { user },
            } = await supabase.auth.getUser();
            if (!user) {
                router.push("/login");
                return;
            }
            setUser(user);

            // Fetch profile data
            const { data: profile, error } = await supabase
                .from("profiles")
                .select("*")
                .eq("user_id", user.id)
                .single();

            if (error) {
                if (error.code === 'PGRST116') {
                    // Profile belum ada, buat baru
                    const { data: newProfile, error: createError } = await supabase
                        .from("profiles")
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
                    setFormData({
                        full_name: newProfile.full_name || "",
                        age: newProfile.age || "",
                        gender: newProfile.gender || "",
                        height: newProfile.height || "",
                        weight: newProfile.weight || "",
                        activity_level: newProfile.activity_level || "",
                        dietary_preferences: newProfile.dietary_preferences || [],
                        health_conditions: newProfile.health_conditions || [],
                    });
                } else {
                    throw error;
                }
            } else {
                setProfile(profile);
                setFormData({
                    full_name: profile.full_name || "",
                    age: profile.age || "",
                    gender: profile.gender || "",
                    height: profile.height || "",
                    weight: profile.weight || "",
                    activity_level: profile.activity_level || "",
                    dietary_preferences: profile.dietary_preferences || [],
                    health_conditions: profile.health_conditions || [],
                });
            }
        } catch (error) {
            console.error("Error fetching user data:", error);
            alert("Terjadi kesalahan saat mengambil data pengguna. Silakan coba lagi.");
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleMultiSelect = (e) => {
        const { name, value } = e.target;
        const values = Array.from(e.target.selectedOptions, option => option.value);
        setFormData(prev => ({
            ...prev,
            [name]: values
        }));
    };

    const handleImageUpload = async (e) => {
        try {
            setUploading(true);
            const file = e.target.files[0];
            if (!file) return;

            // Validasi ukuran file (maksimal 5MB)
            if (file.size > 5 * 1024 * 1024) {
                throw new Error('Ukuran file terlalu besar. Maksimal 5MB');
            }

            // Validasi tipe file
            if (!file.type.startsWith('image/')) {
                throw new Error('File harus berupa gambar');
            }

            // Upload image to Supabase Storage dengan format yang benar
            const fileExt = file.name.split('.').pop();
            const fileName = `${user.id}/${Date.now()}.${fileExt}`;
            const { error: uploadError } = await supabase.storage
                .from('avatars')
                .upload(fileName, file, {
                    cacheControl: '3600',
                    upsert: true
                });

            if (uploadError) throw uploadError;

            // Get public URL
            const { data: { publicUrl } } = supabase.storage
                .from('avatars')
                .getPublicUrl(fileName);

            // Update profile with new avatar URL
            const { error: updateError } = await supabase
                .from('profiles')
                .update({ avatar_url: publicUrl })
                .eq('user_id', user.id);

            if (updateError) throw updateError;

            // Refresh profile data
            await fetchUserData();
        } catch (error) {
            console.error('Error uploading image:', error);
            alert(error.message || 'Error uploading image. Please try again.');
        } finally {
            setUploading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const { error } = await supabase
                .from("profiles")
                .upsert([{
                    user_id: user.id,
                    ...formData,
                    updated_at: new Date().toISOString(),
                }], {
                    onConflict: 'user_id'
                });

            if (error) throw error;

            // Refresh data setelah update
            await fetchUserData();
            setEditMode(false);
            alert("Profil berhasil diperbarui!");
        } catch (error) {
            console.error("Error updating profile:", error);
            alert("Terjadi kesalahan saat memperbarui profil. Silakan coba lagi.");
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-neutral-900 py-12">
                <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="animate-pulse">
                        <div className="h-32 bg-gray-200 dark:bg-neutral-800 rounded-lg mb-8"></div>
                        <div className="space-y-4">
                            <div className="h-4 bg-gray-200 dark:bg-neutral-800 rounded w-3/4"></div>
                            <div className="h-4 bg-gray-200 dark:bg-neutral-800 rounded"></div>
                            <div className="h-4 bg-gray-200 dark:bg-neutral-800 rounded w-5/6"></div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-neutral-900 py-12">
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-lg overflow-hidden">
                    {/* Profile Header */}
                    <div className="relative h-48 bg-gradient-to-r from-primary-600 to-secondary-500">
                        <div className="absolute -bottom-16 left-8">
                            <div className="relative">
                                <div className="h-32 w-32 rounded-full border-4 border-white dark:border-neutral-800 overflow-hidden">
                                    {profile?.avatar_url ? (
                                        <Image
                                            src={profile.avatar_url}
                                            alt="Profile"
                                            width={128}
                                            height={128}
                                            className="h-full w-full object-cover"
                                        />
                                    ) : (
                                        <div className="h-full w-full bg-gray-200 dark:bg-neutral-700 flex items-center justify-center">
                                            <span className="text-4xl text-gray-500 dark:text-gray-400">
                                                {user?.email?.charAt(0).toUpperCase()}
                                            </span>
                                        </div>
                                    )}
                                </div>
                                <label
                                    htmlFor="avatar-upload"
                                    className="absolute bottom-0 right-0 bg-white dark:bg-neutral-700 rounded-full p-2 shadow-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-neutral-600"
                                >
                                    <svg
                                        className="h-5 w-5 text-gray-600 dark:text-gray-300"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                                        />
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                                        />
                                    </svg>
                                    <input
                                        id="avatar-upload"
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={handleImageUpload}
                                        disabled={uploading}
                                    />
                                </label>
                            </div>
                        </div>
                    </div>

                    {/* Profile Content */}
                    <div className="pt-20 pb-8 px-8">
                        <div className="flex justify-between items-center mb-8">
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                                    {profile?.full_name || "Pengguna"}
                                </h1>
                                <p className="text-gray-500 dark:text-gray-400">{user?.email}</p>
                            </div>
                            <button
                                onClick={() => setEditMode(!editMode)}
                                className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
                            >
                                {editMode ? "Batal" : "Edit Profil"}
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Nama Lengkap
                                    </label>
                                    <input
                                        type="text"
                                        name="full_name"
                                        value={formData.full_name}
                                        onChange={handleInputChange}
                                        disabled={!editMode}
                                        className="mt-1 block w-full rounded-md border-gray-300 dark:border-neutral-700 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-neutral-900 dark:text-white sm:text-sm"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Usia
                                    </label>
                                    <input
                                        type="number"
                                        name="age"
                                        value={formData.age}
                                        onChange={handleInputChange}
                                        disabled={!editMode}
                                        className="mt-1 block w-full rounded-md border-gray-300 dark:border-neutral-700 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-neutral-900 dark:text-white sm:text-sm"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Jenis Kelamin
                                    </label>
                                    <select
                                        name="gender"
                                        value={formData.gender}
                                        onChange={handleInputChange}
                                        disabled={!editMode}
                                        className="mt-1 block w-full rounded-md border-gray-300 dark:border-neutral-700 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-neutral-900 dark:text-white sm:text-sm"
                                    >
                                        <option value="">Pilih Jenis Kelamin</option>
                                        <option value="male">Laki-laki</option>
                                        <option value="female">Perempuan</option>
                                        <option value="other">Lainnya</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Tinggi Badan (cm)
                                    </label>
                                    <input
                                        type="number"
                                        name="height"
                                        value={formData.height}
                                        onChange={handleInputChange}
                                        disabled={!editMode}
                                        className="mt-1 block w-full rounded-md border-gray-300 dark:border-neutral-700 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-neutral-900 dark:text-white sm:text-sm"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Berat Badan (kg)
                                    </label>
                                    <input
                                        type="number"
                                        name="weight"
                                        value={formData.weight}
                                        onChange={handleInputChange}
                                        disabled={!editMode}
                                        className="mt-1 block w-full rounded-md border-gray-300 dark:border-neutral-700 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-neutral-900 dark:text-white sm:text-sm"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Tingkat Aktivitas
                                    </label>
                                    <select
                                        name="activity_level"
                                        value={formData.activity_level}
                                        onChange={handleInputChange}
                                        disabled={!editMode}
                                        className="mt-1 block w-full rounded-md border-gray-300 dark:border-neutral-700 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-neutral-900 dark:text-white sm:text-sm"
                                    >
                                        <option value="">Pilih Tingkat Aktivitas</option>
                                        <option value="sedentary">Sedentary (Jarang Olahraga)</option>
                                        <option value="light">Light (Olahraga Ringan 1-3x/minggu)</option>
                                        <option value="moderate">Moderate (Olahraga Sedang 3-5x/minggu)</option>
                                        <option value="active">Active (Olahraga Berat 6-7x/minggu)</option>
                                        <option value="very_active">Very Active (Olahraga Sangat Berat)</option>
                                    </select>
                                </div>

                                <div className="sm:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Preferensi Diet
                                    </label>
                                    <select
                                        name="dietary_preferences"
                                        multiple
                                        value={formData.dietary_preferences}
                                        onChange={handleMultiSelect}
                                        disabled={!editMode}
                                        className="mt-1 block w-full rounded-md border-gray-300 dark:border-neutral-700 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-neutral-900 dark:text-white sm:text-sm"
                                    >
                                        <option value="vegetarian">Vegetarian</option>
                                        <option value="vegan">Vegan</option>
                                        <option value="pescatarian">Pescatarian</option>
                                        <option value="gluten_free">Gluten Free</option>
                                        <option value="dairy_free">Dairy Free</option>
                                        <option value="halal">Halal</option>
                                        <option value="kosher">Kosher</option>
                                    </select>
                                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                        Tekan Ctrl (Windows) atau Command (Mac) untuk memilih lebih dari satu
                                    </p>
                                </div>

                                <div className="sm:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Kondisi Kesehatan
                                    </label>
                                    <select
                                        name="health_conditions"
                                        multiple
                                        value={formData.health_conditions}
                                        onChange={handleMultiSelect}
                                        disabled={!editMode}
                                        className="mt-1 block w-full rounded-md border-gray-300 dark:border-neutral-700 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-neutral-900 dark:text-white sm:text-sm"
                                    >
                                        <option value="diabetes">Diabetes</option>
                                        <option value="hypertension">Hipertensi</option>
                                        <option value="heart_disease">Penyakit Jantung</option>
                                        <option value="celiac">Celiac</option>
                                        <option value="lactose_intolerant">Intoleransi Laktosa</option>
                                        <option value="none">Tidak Ada</option>
                                    </select>
                                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                        Tekan Ctrl (Windows) atau Command (Mac) untuk memilih lebih dari satu
                                    </p>
                                </div>
                            </div>

                            {editMode && (
                                <div className="flex justify-end">
                                    <button
                                        type="submit"
                                        className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
                                    >
                                        Simpan Perubahan
                                    </button>
                                </div>
                            )}
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
