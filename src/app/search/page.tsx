'use client';

import { useState, useMemo } from 'react';
import { ArrowLeft, SlidersHorizontal } from 'lucide-react';
import Link from 'next/link';
import { SearchBar } from '@/components/ui/SearchBar';
import { AreaCard } from '@/components/ui/AreaCard';
import { useLanguage } from '@/hooks/useLanguage';
import { areas } from '@/lib/seed-data';

type SortOption = 'score' | 'safety' | 'name';

export default function SearchPage() {
  const { lang, t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('score');
  const [showFilters, setShowFilters] = useState(false);

  const filteredAreas = useMemo(() => {
    let result = [...areas];

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (area) =>
          area.name.toLowerCase().includes(query) ||
          area.name_bn.includes(searchQuery) ||
          area.parent_area.toLowerCase().includes(query) ||
          area.parent_area_bn.includes(searchQuery)
      );
    }

    // Sort
    switch (sortBy) {
      case 'score':
        result.sort((a, b) => b.scores.overall_score - a.scores.overall_score);
        break;
      case 'safety':
        result.sort((a, b) => b.scores.safety_score - a.scores.safety_score);
        break;
      case 'name':
        result.sort((a, b) =>
          lang === 'bn'
            ? a.name_bn.localeCompare(b.name_bn, 'bn')
            : a.name.localeCompare(b.name)
        );
        break;
    }

    return result;
  }, [searchQuery, sortBy, lang]);

  const sortOptions: { value: SortOption; label: string }[] = [
    { value: 'score', label: lang === 'bn' ? 'সেরা স্কোর' : 'Best Score' },
    { value: 'safety', label: lang === 'bn' ? 'সবচেয়ে নিরাপদ' : 'Safest' },
    { value: 'name', label: lang === 'bn' ? 'নাম' : 'Name' },
  ];

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-lg border-b border-slate-800 px-4 py-3">
        <div className="max-w-lg mx-auto flex items-center gap-3">
          <Link href="/" className="p-2 -ml-2 hover:bg-slate-800 rounded-xl">
            <ArrowLeft className="w-5 h-5 text-slate-400" />
          </Link>
          <div className="flex-1">
            <SearchBar
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder={lang === 'bn' ? 'এলাকা খুঁজুন...' : 'Search areas...'}
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="p-2 hover:bg-slate-800 rounded-xl"
          >
            <SlidersHorizontal className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        {/* Sort Options */}
        {showFilters && (
          <div className="max-w-lg mx-auto mt-3 flex gap-2 overflow-x-auto hide-scrollbar pb-1">
            {sortOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => setSortBy(option.value)}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                  sortBy === option.value
                    ? 'bg-emerald-500 text-white'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        )}
      </header>

      <main className="px-4 py-4 max-w-lg mx-auto">
        {/* Results count */}
        <p className="text-sm text-slate-400 mb-4">
          {lang === 'bn'
            ? `${filteredAreas.length}টি এলাকা পাওয়া গেছে`
            : `${filteredAreas.length} areas found`}
        </p>

        {/* Area List */}
        <div className="space-y-3">
          {filteredAreas.map((area) => (
            <AreaCard key={area.id} area={area} />
          ))}
        </div>

        {filteredAreas.length === 0 && (
          <div className="text-center py-12">
            <p className="text-slate-400">
              {lang === 'bn'
                ? 'কোনো এলাকা পাওয়া যায়নি'
                : 'No areas found'}
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
