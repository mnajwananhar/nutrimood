'use client';

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import Link from 'next/link';
import { useParams } from 'next/navigation';

export default function ArticleDetail() {
    const params = useParams();
    const supabase = createClientComponentClient();
    const [article, setArticle] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchArticle();
    }, [params.id]);

    const fetchArticle = async () => {
        try {
            const { data, error } = await supabase
                .from('education_articles')
                .select('*')
                .eq('id', params.id)
                .single();

            if (error) throw error;
            setArticle(data);
        } catch (error) {
            console.error('Error fetching article:', error);
            setError('Terjadi kesalahan saat mengambil artikel');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-neutral-900 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600 dark:text-gray-400">Memuat artikel...</p>
                </div>
            </div>
        );
    }

    if (error || !article) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-neutral-900 flex items-center justify-center">
                <div className="text-center">
                    <p className="text-red-600 dark:text-red-400">
                        {error || 'Artikel tidak ditemukan'}
                    </p>
                    <Link href="/dashboard/education" className="mt-4 inline-block text-primary-600 hover:text-primary-700">
                        Kembali ke Daftar Artikel
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-neutral-900">
            {/* Header */}
            <header className="bg-white dark:bg-neutral-800 shadow">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex justify-between items-center">
                        <Link
                            href="/dashboard/education"
                            className="text-primary-600 hover:text-primary-700 dark:text-primary-400"
                        >
                            ← Kembali ke Daftar Artikel
                        </Link>
                    </div>
                </div>
            </header>

            <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <article className="bg-white dark:bg-neutral-800 rounded-lg shadow-md overflow-hidden">
                    <div className="p-8">
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                            {article.title}
                        </h1>
                        <div className="flex items-center text-gray-500 dark:text-gray-400 text-sm mb-8">
                            <span>
                                {new Date(article.created_at).toLocaleDateString('id-ID', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                })}
                            </span>
                            {article.author && (
                                <>
                                    <span className="mx-2">•</span>
                                    <span>Ditulis oleh {article.author}</span>
                                </>
                            )}
                        </div>
                        <div className="prose dark:prose-invert max-w-none">
                            {article.content}
                        </div>
                    </div>
                </article>

                {/* Related Articles */}
                {article.related_articles && article.related_articles.length > 0 && (
                    <div className="mt-12">
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                            Artikel Terkait
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {article.related_articles.map((relatedArticle) => (
                                <Link
                                    key={relatedArticle.id}
                                    href={`/dashboard/education/${relatedArticle.id}`}
                                    className="bg-white dark:bg-neutral-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
                                >
                                    <div className="p-6">
                                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                                            {relatedArticle.title}
                                        </h3>
                                        <p className="text-gray-600 dark:text-gray-300 line-clamp-2">
                                            {relatedArticle.summary}
                                        </p>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
} 