'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import Link from 'next/link';

export default function ArticleDetail() {
    const params = useParams();
    const supabase = createClientComponentClient();
    const [article, setArticle] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchArticle = async () => {
            try {
                const { data, error } = await supabase
                    .from('education_articles')
                    .select('*')
                    .eq('slug', params.slug)
                    .single();

                if (error) throw error;
                setArticle(data);
            } catch (error) {
                console.error('Error fetching article:', error);
                setError('Artikel tidak ditemukan');
            } finally {
                setLoading(false);
            }
        };

        fetchArticle();
    }, [params.slug, supabase]);

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-neutral-900 py-12">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="animate-pulse">
                        <div className="h-8 bg-gray-200 dark:bg-neutral-800 rounded w-3/4 mb-4"></div>
                        <div className="h-4 bg-gray-200 dark:bg-neutral-800 rounded w-1/4 mb-8"></div>
                        <div className="space-y-4">
                            <div className="h-4 bg-gray-200 dark:bg-neutral-800 rounded"></div>
                            <div className="h-4 bg-gray-200 dark:bg-neutral-800 rounded"></div>
                            <div className="h-4 bg-gray-200 dark:bg-neutral-800 rounded w-5/6"></div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (error || !article) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-neutral-900 py-12">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center">
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                            {error || 'Artikel tidak ditemukan'}
                        </h1>
                        <Link
                            href="/education"
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
                        >
                            Kembali ke Edukasi
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-neutral-900 py-12">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-lg overflow-hidden">
                    {/* Header */}
                    <div className="relative h-64 sm:h-96">
                        <img
                            src={article.image_url}
                            alt={article.title}
                            className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                        <div className="absolute bottom-0 left-0 right-0 p-6">
                            <div className="flex items-center space-x-2 text-sm text-white mb-2">
                                <span className="px-2 py-1 bg-primary-600 rounded-full">
                                    {article.category}
                                </span>
                                <span>{article.read_time} menit baca</span>
                            </div>
                            <h1 className="text-3xl sm:text-4xl font-bold text-white">
                                {article.title}
                            </h1>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="p-6 sm:p-8">
                        <div className="prose dark:prose-invert max-w-none">
                            <div dangerouslySetInnerHTML={{ __html: article.content }} />
                        </div>

                        {/* Tags */}
                        {article.tags && article.tags.length > 0 && (
                            <div className="mt-8 pt-6 border-t border-gray-200 dark:border-neutral-700">
                                <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
                                    Tag:
                                </h3>
                                <div className="flex flex-wrap gap-2">
                                    {article.tags.map((tag) => (
                                        <span
                                            key={tag}
                                            className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 dark:bg-neutral-700 text-gray-800 dark:text-gray-200"
                                        >
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Related Articles */}
                        {article.related_articles && article.related_articles.length > 0 && (
                            <div className="mt-8 pt-6 border-t border-gray-200 dark:border-neutral-700">
                                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                                    Artikel Terkait
                                </h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {article.related_articles.map((relatedArticle) => (
                                        <Link
                                            key={relatedArticle.id}
                                            href={`/education/${relatedArticle.slug}`}
                                            className="block group"
                                        >
                                            <div className="bg-gray-50 dark:bg-neutral-700 rounded-lg overflow-hidden">
                                                <div className="aspect-w-16 aspect-h-9">
                                                    <img
                                                        src={relatedArticle.image_url}
                                                        alt={relatedArticle.title}
                                                        className="w-full h-full object-cover"
                                                    />
                                                </div>
                                                <div className="p-4">
                                                    <h4 className="text-sm font-medium text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400">
                                                        {relatedArticle.title}
                                                    </h4>
                                                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                                        {relatedArticle.excerpt}
                                                    </p>
                                                </div>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Back Button */}
                <div className="mt-8 text-center">
                    <Link
                        href="/education"
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
                    >
                        Kembali ke Edukasi
                    </Link>
                </div>
            </div>
        </div>
    );
} 