import { Check, ChevronDown, Search, X } from 'lucide-react';
import { useRef, useState } from 'react';

import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

export type SearchableSelectOption = { value: string; label: string };

interface SearchableSelectProps {
    options: SearchableSelectOption[];
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    searchPlaceholder?: string;
    emptyMessage?: string;
    /** Tailwind width class applied to the trigger button, e.g. "w-64". Defaults to "w-full". */
    triggerClassName?: string;
}

export function SearchableSelect({
    options,
    value,
    onChange,
    placeholder       = 'Select…',
    searchPlaceholder = 'Search…',
    emptyMessage      = 'No results found',
    triggerClassName  = 'w-full',
}: SearchableSelectProps) {
    const [open, setOpen]     = useState(false);
    const [search, setSearch] = useState('');
    const inputRef            = useRef<HTMLInputElement>(null);

    const selected = options.find((o) => o.value === value);
    const filtered = search.trim()
        ? options.filter((o) => o.label.toLowerCase().includes(search.toLowerCase()))
        : [];

    function pick(v: string) { onChange(v); setOpen(false); setSearch(''); }
    function clear(e: React.MouseEvent) { e.stopPropagation(); onChange(''); setSearch(''); }

    return (
        <Popover open={open} onOpenChange={(o) => { setOpen(o); if (o) setTimeout(() => inputRef.current?.focus(), 0); }}>
            <PopoverTrigger asChild>
                <button
                    type="button"
                    className={`flex h-9 items-center justify-between rounded-md border bg-background px-3 py-2 text-sm shadow-xs transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${triggerClassName}`}
                >
                    <span className={selected ? 'text-foreground' : 'text-muted-foreground'}>
                        {selected ? selected.label : placeholder}
                    </span>
                    <span className="flex shrink-0 items-center gap-1 text-muted-foreground">
                        {selected && (
                            <span
                                role="button"
                                tabIndex={0}
                                onClick={clear}
                                onKeyDown={(e) => e.key === 'Enter' && clear(e as unknown as React.MouseEvent)}
                                className="rounded p-0.5 hover:text-foreground"
                            >
                                <X className="h-3.5 w-3.5" />
                            </span>
                        )}
                        <ChevronDown className="h-4 w-4" />
                    </span>
                </button>
            </PopoverTrigger>

            <PopoverContent
                className="w-[var(--radix-popover-trigger-width)] min-w-48 p-0"
                align="start"
                sideOffset={4}
            >
                {/* Search input */}
                <div className="border-b p-2">
                    <div className="relative">
                        <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                        <input
                            ref={inputRef}
                            className="w-full rounded-sm bg-transparent py-1 pl-8 pr-2 text-sm outline-none placeholder:text-muted-foreground"
                            placeholder={searchPlaceholder}
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                </div>

                {/* List */}
                <div className="max-h-56 overflow-y-auto p-1">
                    {!search.trim() ? (
                        <p className="px-2 py-3 text-center text-xs text-muted-foreground">Start typing to search…</p>
                    ) : filtered.length === 0 ? (
                        <p className="px-2 py-3 text-center text-xs text-muted-foreground">{emptyMessage}</p>
                    ) : (
                        filtered.map((o) => (
                            <button
                                key={o.value}
                                type="button"
                                onClick={() => pick(o.value)}
                                className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm hover:bg-accent"
                            >
                                <Check className={`h-3.5 w-3.5 shrink-0 ${o.value === value ? 'opacity-100' : 'opacity-0'}`} />
                                {o.label}
                            </button>
                        ))
                    )}
                </div>
            </PopoverContent>
        </Popover>
    );
}
