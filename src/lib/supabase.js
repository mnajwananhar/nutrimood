import { createClient } from "@supabase/supabase-js";

// Cek apakah environment variables tersedia
if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  throw new Error("Missing environment variable: NEXT_PUBLIC_SUPABASE_URL");
}

if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  throw new Error(
    "Missing environment variable: NEXT_PUBLIC_SUPABASE_ANON_KEY"
  );
}

// Inisialisasi klien Supabase
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// Autentikasi helper functions
export const signIn = async ({ email, password }) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw error;
  return data;
};

export const signUp = async ({ email, password, name }) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: name,
      },
    },
  });

  if (error) throw error;
  return data;
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
};

export const getUser = async () => {
  const { data, error } = await supabase.auth.getUser();
  if (error) throw error;
  return data?.user;
};

// API helper functions untuk data manipulasi
export const getUserProfile = async (userId) => {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();

  if (error) throw error;
  return data;
};

export const updateUserProfile = async (userId, updates) => {
  const { data, error } = await supabase
    .from("profiles")
    .update(updates)
    .eq("id", userId)
    .select();

  if (error) throw error;
  return data;
};

export const getMoodEntries = async (userId) => {
  const { data, error } = await supabase
    .from("mood_entries")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
};

export const createMoodEntry = async (entry) => {
  const { data, error } = await supabase
    .from("mood_entries")
    .insert(entry)
    .select();

  if (error) throw error;
  return data;
};

export const getFoodRecommendations = async (moodId, healthConditions) => {
  // Implementasi ini untuk data dummy
  // Ketika model ML sudah siap, ini bisa diganti dengan panggilan ke endpoint ML atau logika yang sesuai

  const { data, error } = await supabase
    .from("food_recommendations")
    .select("*")
    .eq("mood_id", moodId)
    // Filter berdasarkan kondisi kesehatan bisa ditambahkan nanti
    .limit(10);

  if (error) throw error;
  return data;
};
