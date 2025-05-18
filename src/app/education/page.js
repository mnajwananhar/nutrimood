'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export default function Education() {
    const [activeTab, setActiveTab] = useState('articles');
    const [articles, setArticles] = useState([]);
    const [tips, setTips] = useState([]);
    const [loading, setLoading] = useState(true);
    const supabase = createClientComponentClient();

    useEffect(() => {
        const fetchContent = async () => {
            try {
                if (activeTab === 'articles') {
                    const { data, error } = await supabase
                        .from('education_articles')
                        .select('*')
                        .order('created_at', { ascending: false });

                    if (error) throw error;
                    setArticles(data);
                } else {
                    const { data, error } = await supabase
                        .from('tips')
                        .select('*')
                        .order('created_at', { ascending: false });

                    if (error) throw error;
                    setTips(data);
                }
            } catch (error) {
                console.error('Error fetching content:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchContent();
    }, [activeTab, supabase]);

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-neutral-900">
            <header className="bg-white dark:bg-neutral-800 shadow">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Edukasi Nutrisi</h1>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Tab Navigation */}
                <div className="border-b border-gray-200 dark:border-neutral-700 mb-8">
                    <nav className="-mb-px flex space-x-8">
                        <button
                            onClick={() => setActiveTab('articles')}
                            className={`${activeTab === 'articles'
                                ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                        >
                            Artikel
                        </button>
                        <button
                            onClick={() => setActiveTab('tips')}
                            className={`${activeTab === 'tips'
                                ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                        >
                            Tips & Trik
                        </button>
                    </nav>
                </div>

                {/* Content */}
                {loading ? (
                    <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
                        {[...Array(3)].map((_, i) => (
                            <div key={i} className="animate-pulse">
                                <div className="bg-gray-200 dark:bg-neutral-800 rounded-lg h-48 mb-4"></div>
                                <div className="h-4 bg-gray-200 dark:bg-neutral-800 rounded w-3/4 mb-2"></div>
                                <div className="h-4 bg-gray-200 dark:bg-neutral-800 rounded w-1/2"></div>
                            </div>
                        ))}
                    </div>
                ) : activeTab === 'articles' ? (
                    <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
                        {articles.map((article) => (
                            <Link
                                key={article.id}
                                href={`/education/${article.slug}`}
                                className="group"
                            >
                                <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-lg overflow-hidden">
                                    <div className="aspect-w-16 aspect-h-9">
                                        <img
                                            src={article.image_url}
                                            alt={article.title}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                        />
                                    </div>
                                    <div className="p-6">
                                        <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400 mb-2">
                                            <span className="px-2 py-1 bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 rounded-full">
                                                {article.category}
                                            </span>
                                            <span>{article.read_time} menit baca</span>
                                        </div>
                                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-primary-600 dark:group-hover:text-primary-400">
                                            {article.title}
                                        </h3>
                                        <p className="text-gray-600 dark:text-gray-400">
                                            {article.excerpt}
                                        </p>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {tips.map((tip) => (
                            <div key={tip.id} className="bg-white dark:bg-neutral-800 rounded-lg shadow p-6">
                                <div className="text-4xl mb-4">{tip.icon}</div>
                                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                                    {tip.title}
                                </h3>
                                <p className="text-gray-600 dark:text-gray-300">
                                    {tip.description}
                                </p>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
} 