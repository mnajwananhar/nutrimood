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
// Function to refresh session token - used to prevent auth errors
// Track last refresh time to prevent excessive refreshes
let lastRefreshAttempt = 0;
let refreshInProgress = false;
const MIN_REFRESH_INTERVAL = 3000; // 3 seconds minimum between refresh attempts

export const refreshSession = async () => {
  // Prevent multiple simultaneous refresh attempts
  if (refreshPromise) {
    console.log(
      "[AUTH DEBUG] Already refreshing session, returning existing promise"
    );
    return refreshPromise;
  }

  // Check if we've tried to refresh too recently
  const now = Date.now();
  if (now - lastRefreshAttempt < MIN_REFRESH_INTERVAL) {
    console.log("[AUTH DEBUG] Refresh attempted too soon, skipping");
    return cachedUser; // Return cached user if available
  }

  // Set flag to track refresh attempt time
  lastRefreshAttempt = now;
  refreshInProgress = true;

  try {
    console.log("[AUTH DEBUG] Refreshing session token");
    refreshPromise = supabase.auth.refreshSession();
    const { data, error } = await refreshPromise;

    if (error) {
      console.error("[AUTH DEBUG] Error refreshing session:", error);

      // Check for specific error types
      if (error.message?.includes("Session expired")) {
        console.log("[AUTH DEBUG] Session has expired, clearing auth state");
        resetAuthState();
      }

      return null;
    }

    console.log("[AUTH DEBUG] Session refreshed successfully");
    if (data.session && data.user) {
      cachedUser = data.user;
      lastFetchTime = Date.now();

      // Update localStorage cache
      if (typeof window !== "undefined") {
        localStorage.setItem(
          "nutrimood_user",
          JSON.stringify({
            user: data.user,
            timestamp: Date.now(),
          })
        );
        sessionStorage.setItem("nutrimood_logged_in", "true");
      }

      return data.user;
    }
    return null;
  } catch (error) {
    console.error("[AUTH DEBUG] Exception refreshing session:", error);
    return null;
  } finally {
    refreshPromise = null;
    refreshInProgress = false;
  }
};

export const signIn = async ({ email, password }) => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error signing in:", error);
    throw error;
  }
};

export const signUp = async ({ email, password, name }) => {
  try {
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
  } catch (error) {
    console.error("Error signing up:", error);
    throw error;
  }
};

// Import auth-status utils
import { resetAuthState } from "./auth-status";

export const signOut = async () => {
  try {
    // Hapus semua cache user
    cachedUser = null;
    lastFetchTime = 0;

    // Reset global auth state
    resetAuthState();

    if (typeof window !== "undefined") {
      // Hapus localStorage cache
      localStorage.removeItem("nutrimood_user");
      sessionStorage.setItem("nutrimood_just_logged_out", "true");
      // Hapus sessionStorage values terkait auth
      sessionStorage.removeItem("nutrimood_logged_in");
      sessionStorage.removeItem("nutrimood_auth_state");

      // Hapus cookie Supabase juga untuk memastikan
      document.cookie.split(";").forEach((c) => {
        if (c.trim().startsWith("sb-")) {
          document.cookie =
            c.trim().split("=")[0] +
            "=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        }
      });
    }

    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  } catch (error) {
    console.error("Error signing out:", error);
    throw error;
  }
};

// Menyimpan user session dalam memori untuk mengurangi API calls
let cachedUser = null;
let lastFetchTime = 0;
let refreshPromise = null;
const CACHE_TTL = 10000; // 10 detik - lebih agresif untuk UI yang responsif

// Setup session refresh handler
supabase.auth.onAuthStateChange((event, session) => {
  console.log("[AUTH DEBUG] Auth state change event:", event);
  if (event === "TOKEN_REFRESHED") {
    console.log("[AUTH DEBUG] Token refreshed successfully");
    if (session && session.user) {
      cachedUser = session.user;
      lastFetchTime = Date.now();
      // Update localStorage cache
      if (typeof window !== "undefined") {
        localStorage.setItem(
          "nutrimood_user",
          JSON.stringify({
            user: session.user,
            timestamp: Date.now(),
          })
        );
        sessionStorage.setItem("nutrimood_logged_in", "true");
      }
    }
  }
});

// Helper untuk localStorage
const getLocalUserCache = () => {
  if (typeof window === "undefined") return null;

  try {
    const cachedData = localStorage.getItem("nutrimood_user");
    if (!cachedData) return null;

    const data = JSON.parse(cachedData);
    // Cek apakah data masih valid (30 menit)
    const CACHE_VALID_DURATION = 30 * 60 * 1000;

    if (
      data &&
      data.timestamp &&
      Date.now() - data.timestamp < CACHE_VALID_DURATION
    ) {
      return data.user;
    }
  } catch (e) {
    console.error("Error reading localStorage:", e);
  }
  return null;
};

// Flag to track if getUser is currently being executed to avoid infinite loops
let isGettingUser = false;

export const getUser = async () => {
  try {
    const now = Date.now();
    console.log("[AUTH DEBUG] getUser called");

    // Prevent recursive getUser calls
    if (isGettingUser) {
      console.log(
        "[AUTH DEBUG] getUser already in progress, using cached data"
      );
      return cachedUser;
    }

    isGettingUser = true;

    // Cek flag "just logged out" untuk memastikan UI konsisten setelah logout
    if (
      typeof window !== "undefined" &&
      sessionStorage.getItem("nutrimood_just_logged_out") === "true"
    ) {
      console.log("[AUTH DEBUG] Just logged out, returning null");
      sessionStorage.removeItem("nutrimood_just_logged_out");
      cachedUser = null;
      lastFetchTime = 0;
      return null;
    }

    // Cek quick auth flag untuk fast loading
    if (
      typeof window !== "undefined" &&
      sessionStorage.getItem("nutrimood_logged_in") === "true"
    ) {
      console.log("[AUTH DEBUG] Quick auth flag is set to logged in");
    }

    // Prioritas 1: Cek memcache
    if (cachedUser && now - lastFetchTime < CACHE_TTL) {
      console.log("[AUTH DEBUG] Using memory cache for user");
      return cachedUser;
    }

    // Prioritas 2: Cek localStorage
    const localCachedUser = getLocalUserCache();
    if (localCachedUser) {
      console.log("[AUTH DEBUG] Using localStorage cache for user");
      cachedUser = localCachedUser;
      lastFetchTime = now;

      // Trigger token refresh in background, don't await
      setTimeout(() => {
        refreshSession().catch((err) =>
          console.error("[AUTH DEBUG] Background token refresh error:", err)
        );
      }, 0);

      return localCachedUser;
    }

    // Prioritas 3: Ambil dari server
    console.log("[AUTH DEBUG] Fetching user from Supabase");
    const { data, error } = await supabase.auth.getUser();

    if (error) {
      console.error("[AUTH DEBUG] Error from Supabase auth.getUser():", error);
      throw error;
    }

    if (!data || !data.user) {
      console.log("[AUTH DEBUG] No user data returned from Supabase");
      cachedUser = null;
      lastFetchTime = now;

      // Hapus session flags jika tidak ada user
      if (typeof window !== "undefined") {
        sessionStorage.removeItem("nutrimood_logged_in");
        localStorage.removeItem("nutrimood_user");
      }

      return null;
    }

    console.log("[AUTH DEBUG] User fetched successfully");

    // Update cache
    cachedUser = data.user;
    lastFetchTime = now;

    // Juga simpan di localStorage untuk persistensi
    if (cachedUser && typeof window !== "undefined") {
      console.log("[AUTH DEBUG] Saving user to localStorage");
      localStorage.setItem(
        "nutrimood_user",
        JSON.stringify({
          user: cachedUser,
          timestamp: now,
        })
      );

      // Set quick auth flag
      sessionStorage.setItem("nutrimood_logged_in", "true");
    }
    return cachedUser;
  } catch (error) {
    console.error("[AUTH DEBUG] Error getting user:", error);

    // Jika error, coba gunakan cache sebagai fallback
    const localCachedUser = getLocalUserCache();
    if (localCachedUser) {
      console.log("[AUTH DEBUG] Using fallback localStorage cache after error");
      return localCachedUser;
    }

    // Cek session storage flag
    const quickLoginFlag =
      typeof window !== "undefined" &&
      sessionStorage.getItem("nutrimood_logged_in") === "true";

    if (quickLoginFlag) {
      console.log(
        "[AUTH DEBUG] Quick login flag exists but no user data found"
      );
      // Jangan hapus flag, mungkin pengguna benar-benar login
      // tapi ada masalah sementara dengan koneksi
    }

    // Jangan throw error, kembalikan null saja untuk UX yang lebih baik
    console.log("[AUTH DEBUG] No fallback cache found, returning null");
    return null;
  } finally {
    // Reset the flag to allow future calls
    isGettingUser = false;
  }
};

// API helper functions untuk data manipulasi
export const getUserProfile = async (userId) => {
  try {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error fetching user profile:", error);
    throw error;
  }
};

export const updateUserProfile = async (userId, updates) => {
  try {
    const { data, error } = await supabase
      .from("profiles")
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error updating user profile:", error);
    throw error;
  }
};

// Mood Journal functions
export const getMoodEntries = async (userId) => {
  try {
    const { data, error } = await supabase
      .from("mood_entries")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error fetching mood entries:", error);
    throw error;
  }
};

export const createMoodEntry = async (entry) => {
  try {
    const { data, error } = await supabase
      .from("mood_entries")
      .insert([
        {
          ...entry,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error creating mood entry:", error);
    throw error;
  }
};

export const updateMoodEntry = async (entryId, updates) => {
  try {
    const { data, error } = await supabase
      .from("mood_entries")
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq("id", entryId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error updating mood entry:", error);
    throw error;
  }
};

export const deleteMoodEntry = async (entryId) => {
  try {
    const { error } = await supabase
      .from("mood_entries")
      .delete()
      .eq("id", entryId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error("Error deleting mood entry:", error);
    throw error;
  }
};

// Food Journal functions
export const getFoodJournalEntries = async (userId) => {
  try {
    const { data, error } = await supabase
      .from("food_journal")
      .select("*")
      .eq("user_id", userId)
      .order("date", { ascending: false })
      .order("time", { ascending: false });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error fetching food journal entries:", error);
    throw error;
  }
};

export const addFoodJournalEntry = async (entry) => {
  try {
    const { data, error } = await supabase
      .from("food_journal")
      .insert([
        {
          ...entry,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error adding food journal entry:", error);
    throw error;
  }
};

export const updateFoodJournalEntry = async (entryId, updates) => {
  try {
    const { data, error } = await supabase
      .from("food_journal")
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq("id", entryId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error updating food journal entry:", error);
    throw error;
  }
};

export const deleteFoodJournalEntry = async (entryId) => {
  try {
    const { error } = await supabase
      .from("food_journal")
      .delete()
      .eq("id", entryId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error("Error deleting food journal entry:", error);
    throw error;
  }
};

// Food Recommendations functions
export const getRecommendationsByMood = async (mood) => {
  try {
    const { data, error } = await supabase
      .from("food_recommendations")
      .select("*")
      .eq("mood", mood)
      .limit(3);

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error fetching food recommendations:", error);
    throw error;
  }
};

export const saveRecommendationToFavorites = async (
  userId,
  recommendationId
) => {
  try {
    const { data, error } = await supabase
      .from("user_favorites")
      .insert([
        {
          user_id: userId,
          recommendation_id: recommendationId,
          created_at: new Date().toISOString(),
        },
      ])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error saving recommendation to favorites:", error);
    throw error;
  }
};

export const getUserFavorites = async (userId) => {
  try {
    const { data, error } = await supabase
      .from("user_favorites")
      .select(
        `
        *,
        food_recommendations:recommendation_id (*)
      `
      )
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error fetching user favorites:", error);
    throw error;
  }
};

export const removeFromFavorites = async (userId, recommendationId) => {
  try {
    const { error } = await supabase
      .from("user_favorites")
      .delete()
      .eq("user_id", userId)
      .eq("recommendation_id", recommendationId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error("Error removing from favorites:", error);
    throw error;
  }
};

// Community Posts functions
export const getCommunityPosts = async (type = null) => {
  try {
    let query = supabase
      .from("community_posts")
      .select(
        `
        *,
        profiles:user_id (full_name, avatar_url)
      `
      )
      .order("created_at", { ascending: false });

    if (type) {
      query = query.eq("type", type);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error fetching community posts:", error);
    throw error;
  }
};

export const createCommunityPost = async (post) => {
  try {
    const { data, error } = await supabase
      .from("community_posts")
      .insert([
        {
          ...post,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error creating community post:", error);
    throw error;
  }
};

export const updateCommunityPost = async (postId, updates) => {
  try {
    const { data, error } = await supabase
      .from("community_posts")
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq("id", postId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error updating community post:", error);
    throw error;
  }
};

export const deleteCommunityPost = async (postId) => {
  try {
    const { error } = await supabase
      .from("community_posts")
      .delete()
      .eq("id", postId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error("Error deleting community post:", error);
    throw error;
  }
};

// Post Likes functions
export const likePost = async (postId, userId) => {
  try {
    const { data, error } = await supabase
      .from("post_likes")
      .insert([
        {
          post_id: postId,
          user_id: userId,
          created_at: new Date().toISOString(),
        },
      ])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error liking post:", error);
    throw error;
  }
};

export const unlikePost = async (postId, userId) => {
  try {
    const { error } = await supabase
      .from("post_likes")
      .delete()
      .eq("post_id", postId)
      .eq("user_id", userId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error("Error unliking post:", error);
    throw error;
  }
};

export const getPostLikes = async (postId) => {
  try {
    const { data, error } = await supabase
      .from("post_likes")
      .select(
        `
        *,
        profiles:user_id (full_name, avatar_url)
      `
      )
      .eq("post_id", postId);

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error fetching post likes:", error);
    throw error;
  }
};
