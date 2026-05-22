/**
 * PageHeader — shared header used on list pages (Logos, Signatures, Templates, Events, …).
 *
 * Renders:   [Title]  ──────  [Search]  [View toggle?]  [Actions]
 */

import { LayoutGrid, LayoutList, Search, X } from 'lucide-react';
import type { ReactNode } from 'react';

import { Input } from '@/components/ui/input';

type View = 'grid' | 'list';

type Props = {
    title: string;
    search: string;
    onSearchChange: (value: string) => void;
    searchPlaceholder?: string;
    view?: View;
    onViewChange?: (view: View) => void;
    actions?: ReactNode;
};

export function PageHeader({
    title,
    search,
    onSearchChange,
    searchPlaceholder = 'Search…',
    view,
    onViewChange,
    actions,
}: Props) {
    return (
        <div className="mb-6 flex flex-wrap items-center gap-3">
            {/* Title — pushes everything else to the right */}
            <h1 className="text-2xl font-semibold">{title}</h1>

            {/* Right-side controls */}
            <div className="ml-auto flex flex-wrap items-center gap-2">

                {/* Search */}
                <div className="relative">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        placeholder={searchPlaceholder}
                        value={search}
                        onChange={(e) => onSearchChange(e.target.value)}
                        className="w-72 pl-9 pr-8"
                    />
                    {search && (
                        <button
                            type="button"
                            onClick={() => onSearchChange('')}
                            className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                            aria-label="Clear search"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    )}
                </div>

                {/* View toggle */}
                {view && onViewChange && (
                    <div className="flex overflow-hidden rounded-md border">
                        <button
                            type="button"
                            onClick={() => onViewChange('grid')}
                            aria-label="Grid view"
                            className={`flex items-center px-3 py-1.5 transition-colors ${
                                view === 'grid'
                                    ? 'bg-primary text-primary-foreground'
                                    : 'text-muted-foreground hover:bg-muted'
                            }`}
                        >
                            <LayoutGrid className="h-4 w-4" />
                        </button>
                        <button
                            type="button"
                            onClick={() => onViewChange('list')}
                            aria-label="List view"
                            className={`flex items-center px-3 py-1.5 transition-colors ${
                                view === 'list'
                                    ? 'bg-primary text-primary-foreground'
                                    : 'text-muted-foreground hover:bg-muted'
                            }`}
                        >
                            <LayoutList className="h-4 w-4" />
                        </button>
                    </div>
                )}

                {/* Action buttons */}
                {actions}
            </div>
        </div>
    );
}
