"use client";

import { useState, useEffect } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useRouter } from "next/navigation";
import { sendCommunityNotification } from "@/lib/notifications";

export default function Community() {
  const supabase = createClientComponentClient();
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState("experiences");
  const [posts, setPosts] = useState([]);
  const [newPost, setNewPost] = useState({
    title: "",
    content: "",
    type: "experiences",
    image_url: null,
  });
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    // Fetch user first, then fetch posts only if user is valid
    const init = async () => {
      await fetchUser();
    };
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  // Only fetch posts after user is set
  useEffect(() => {
    if (user) {
      fetchPosts();
    }
  }, [user, activeTab]);

  const fetchUser = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }
      setUser(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      alert("Terjadi kesalahan saat mengambil data pengguna");
    }
  };

  const fetchPosts = async () => {
    try {
      const { data, error } = await supabase
        .from("community_posts")
        .select(
          `
                    *,
                    profiles:user_id (
                        full_name,
                        avatar_url
                    ),
                    likes:post_likes (
                        user_id
                    )
                `
        )
        .eq("type", activeTab) // pastikan filter tab benar
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Transform data to include like count and user like status
      const transformedPosts = data.map((post) => ({
        ...post,
        like_count: post.likes?.length || 0,
        user_liked: user
          ? post.likes?.some((like) => like.user_id === user.id)
          : false,
      }));

      setPosts(transformedPosts);
    } catch (error) {
      console.error("Error fetching posts:", error);
      alert(
        error && error.message
          ? error.message
          : JSON.stringify(error) ||
              "Terjadi kesalahan saat mengambil data post"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewPost((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageUpload = async (e) => {
    if (!user) {
      alert("Silakan login terlebih dahulu");
      router.push("/login");
      return;
    }

    try {
      setUploading(true);
      const file = e.target.files[0];
      if (!file) return;

      // Upload image to Supabase Storage
      const fileExt = file.name.split(".").pop();
      const fileName = `${user.id}-${Math.random()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage
        .from("post-images")
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const {
        data: { publicUrl },
      } = supabase.storage.from("post-images").getPublicUrl(fileName);

      setNewPost((prev) => ({
        ...prev,
        image_url: publicUrl,
      }));
    } catch (error) {
      console.error("Error uploading image:", error);
      alert(
        "Terjadi kesalahan saat mengunggah gambar.\n" +
          (error &&
            (error.message ||
              error.error_description ||
              error.statusText ||
              JSON.stringify(error)))
      );
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      alert("Silakan login terlebih dahulu");
      router.push("/login");
      return;
    }

    try {
      const { data: post, error } = await supabase
        .from("community_posts")
        .insert([
          {
            user_id: user.id,
            title: newPost.title,
            content: newPost.content,
            type: newPost.type,
            image_url: newPost.image_url,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        ])
        .select()
        .single();

      if (error) throw error;

      // Send notification to all users except the post creator
      const { data: users, error: usersError } = await supabase
        .from("profiles")
        .select("id")
        .neq("id", user.id);

      if (usersError) throw usersError;

      if (users) {
        for (const user of users) {
          await sendCommunityNotification(
            user.id,
            post.title,
            `${post.title} telah ditambahkan ke komunitas`
          );
        }
      }

      // Reset form dan refresh posts sesuai tab aktif
      setNewPost({
        title: "",
        content: "",
        type: activeTab, // pastikan newPost.type ikut tab aktif
        image_url: null,
      });
      await fetchPosts();
      alert("Post berhasil ditambahkan!");
    } catch (error) {
      console.error("Error creating post:", error);
      alert(
        "Terjadi kesalahan saat membuat post.\n" +
          (error &&
            (error.message ||
              error.error_description ||
              error.statusText ||
              JSON.stringify(error)))
      );
    }
  };

  const handleLike = async (postId) => {
    if (!user) {
      alert("Silakan login terlebih dahulu");
      router.push("/login");
      return;
    }

    try {
      const { data: existingLike, error: likeError } = await supabase
        .from("post_likes")
        .select("*")
        .eq("post_id", postId)
        .eq("user_id", user.id)
        .single();

      if (likeError && likeError.code !== "PGRST116") throw likeError;

      if (existingLike) {
        // Unlike
        const { error: deleteError } = await supabase
          .from("post_likes")
          .delete()
          .eq("post_id", postId)
          .eq("user_id", user.id);

        if (deleteError) throw deleteError;
      } else {
        // Like
        const { error: insertError } = await supabase
          .from("post_likes")
          .insert([
            {
              post_id: postId,
              user_id: user.id,
              created_at: new Date().toISOString(),
            },
          ]);

        if (insertError) throw insertError;
      }

      // Refresh posts to update like count
      await fetchPosts();
    } catch (error) {
      console.error("Error toggling like:", error);
      alert("Terjadi kesalahan saat menyukai/membatalkan suka post");
    }
  };

  const handleDelete = async (postId) => {
    if (!user) {
      alert("Silakan login terlebih dahulu");
      router.push("/login");
      return;
    }

    if (!confirm("Apakah Anda yakin ingin menghapus post ini?")) return;

    try {
      const { error } = await supabase
        .from("community_posts")
        .delete()
        .eq("id", postId)
        .eq("user_id", user.id);

      if (error) throw error;

      await fetchPosts();
      alert("Post berhasil dihapus!");
    } catch (error) {
      console.error("Error deleting post:", error);
      alert("Terjadi kesalahan saat menghapus post");
    }
  };

  const handleUpdate = async (postId, updates) => {
    if (!user) {
      alert("Silakan login terlebih dahulu");
      router.push("/login");
      return;
    }

    try {
      const { error } = await supabase
        .from("community_posts")
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq("id", postId)
        .eq("user_id", user.id);

      if (error) throw error;

      await fetchPosts();
      alert("Post berhasil diperbarui!");
    } catch (error) {
      console.error("Error updating post:", error);
      alert("Terjadi kesalahan saat memperbarui post");
    }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setNewPost((prev) => ({ ...prev, type: tab }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-neutral-900 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse space-y-8">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="bg-white dark:bg-neutral-800 rounded-lg shadow p-6"
              >
                <div className="h-4 bg-gray-200 dark:bg-neutral-700 rounded w-3/4 mb-4"></div>
                <div className="h-4 bg-gray-200 dark:bg-neutral-700 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-neutral-900 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Tab Navigation */}
        <div className="border-b border-gray-200 dark:border-neutral-700 mb-8">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => handleTabChange("experiences")}
              className={`${
                activeTab === "experiences"
                  ? "border-primary-500 text-primary-600 dark:text-primary-400"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              Pengalaman
            </button>
            <button
              onClick={() => handleTabChange("recipes")}
              className={`${
                activeTab === "recipes"
                  ? "border-primary-500 text-primary-600 dark:text-primary-400"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              Resep
            </button>
          </nav>
        </div>

        {/* Create Post Form */}
        <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Buat Post Baru
          </h2>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="title"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Judul
                </label>
                <input
                  type="text"
                  name="title"
                  id="title"
                  value={newPost.title}
                  onChange={handleInputChange}
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-neutral-700 dark:border-neutral-600 dark:text-white sm:text-sm"
                />
              </div>
              <div>
                <label
                  htmlFor="content"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Konten
                </label>
                <textarea
                  name="content"
                  id="content"
                  rows={4}
                  value={newPost.content}
                  onChange={handleInputChange}
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-neutral-700 dark:border-neutral-600 dark:text-white sm:text-sm"
                />
              </div>
              <div>
                <label
                  htmlFor="image"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Gambar (Opsional)
                </label>
                <input
                  type="file"
                  name="image"
                  id="image"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="mt-1 block w-full text-sm text-gray-500 dark:text-gray-400
                                        file:mr-4 file:py-2 file:px-4
                                        file:rounded-md file:border-0
                                        file:text-sm file:font-semibold
                                        file:bg-primary-50 file:text-primary-700
                                        dark:file:bg-primary-900 dark:file:text-primary-300
                                        hover:file:bg-primary-100 dark:hover:file:bg-primary-800"
                />
              </div>
              <div>
                <button
                  type="submit"
                  disabled={uploading}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
                >
                  {uploading ? "Mengunggah..." : "Buat Post"}
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* Posts List */}
        <div className="space-y-6">
          {posts.map((post) => (
            <div
              key={post.id}
              className="bg-white dark:bg-neutral-800 rounded-lg shadow-lg p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <img
                    src={post.profiles?.avatar_url || "/default-avatar.png"}
                    alt={post.profiles?.full_name}
                    className="h-10 w-10 rounded-full"
                  />
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                      {post.profiles?.full_name}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {new Date(post.created_at).toLocaleDateString("id-ID")}
                    </p>
                  </div>
                </div>
                {user && post.user_id === user.id && (
                  <div className="flex space-x-2">
                    <button
                      onClick={() =>
                        handleUpdate(post.id, {
                          title: post.title,
                          content: post.content,
                        })
                      }
                      className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(post.id)}
                      className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                    >
                      Hapus
                    </button>
                  </div>
                )}
              </div>
              <h4 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                {post.title}
              </h4>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                {post.content}
              </p>
              {post.image_url && (
                <img
                  src={post.image_url}
                  alt={post.title}
                  className="rounded-lg mb-4 max-h-96 w-full object-cover"
                />
              )}
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => handleLike(post.id)}
                  className={`flex items-center space-x-1 ${
                    post.user_liked
                      ? "text-primary-600 dark:text-primary-400"
                      : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                  }`}
                >
                  <svg
                    className="h-5 w-5"
                    fill={post.user_liked ? "currentColor" : "none"}
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                    />
                  </svg>
                  <span>{post.like_count}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
