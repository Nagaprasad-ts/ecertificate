import { Check, ChevronDown, X } from 'lucide-react';
import { useRef, useState } from 'react';

import { cn } from '@/lib/utils';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

export type SelectOption = {
    value: number;
    label: string;
};

type Props = {
    options: SelectOption[];
    selected: number[];
    onChange: (selected: number[]) => void;
    placeholder?: string;
    className?: string;
};

export function MultiSelect({
    options,
    selected,
    onChange,
    placeholder = 'Select…',
    className,
}: Props) {
    const [open, setOpen]       = useState(false);
    const [search, setSearch]   = useState('');
    const inputRef              = useRef<HTMLInputElement>(null);

    const filtered = options.filter((o) =>
        o.label.toLowerCase().includes(search.toLowerCase()),
    );

    function toggle(value: number) {
        onChange(
            selected.includes(value)
                ? selected.filter((v) => v !== value)
                : [...selected, value],
        );
    }

    function remove(value: number, e: React.MouseEvent) {
        e.stopPropagation();
        onChange(selected.filter((v) => v !== value));
    }

    const selectedLabels = options.filter((o) => selected.includes(o.value));

    return (
        <Popover open={open} onOpenChange={(v) => { setOpen(v); if (v) setTimeout(() => inputRef.current?.focus(), 50); }}>
            <PopoverTrigger asChild>
                <button
                    type="button"
                    className={cn(
                        'flex min-h-9 w-full flex-wrap items-center gap-1.5 rounded-md border border-input bg-background px-3 py-1.5 text-sm ring-offset-background',
                        'hover:bg-accent/30 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
                        'disabled:cursor-not-allowed disabled:opacity-50',
                        className,
                    )}
                >
                    {selectedLabels.length === 0 ? (
                        <span className="text-muted-foreground">{placeholder}</span>
                    ) : (
                        selectedLabels.map((o) => (
                            <span
                                key={o.value}
                                className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary"
                            >
                                {o.label}
                                <span
                                    role="button"
                                    tabIndex={0}
                                    onClick={(e) => remove(o.value, e)}
                                    onKeyDown={(e) => e.key === 'Enter' && remove(o.value, e as unknown as React.MouseEvent)}
                                    className="cursor-pointer rounded-full hover:text-destructive"
                                >
                                    <X className="h-3 w-3" />
                                </span>
                            </span>
                        ))
                    )}
                    <ChevronDown className="ml-auto h-4 w-4 shrink-0 text-muted-foreground" />
                </button>
            </PopoverTrigger>

            <PopoverContent
                className="w-[var(--radix-popover-trigger-width)] p-0"
                align="start"
                sideOffset={4}
            >
                {/* Search */}
                <div className="border-b px-3 py-2">
                    <input
                        ref={inputRef}
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search templates…"
                        className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                    />
                </div>

                {/* Options */}
                <div className="max-h-56 overflow-y-auto py-1">
                    {filtered.length === 0 ? (
                        <p className="px-3 py-4 text-center text-sm text-muted-foreground">No templates found.</p>
                    ) : (
                        filtered.map((o) => {
                            const isSelected = selected.includes(o.value);
                            return (
                                <button
                                    key={o.value}
                                    type="button"
                                    onClick={() => toggle(o.value)}
                                    className="flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-accent"
                                >
                                    <div className={cn(
                                        'flex h-4 w-4 shrink-0 items-center justify-center rounded border',
                                        isSelected ? 'border-primary bg-primary text-primary-foreground' : 'border-input',
                                    )}>
                                        {isSelected && <Check className="h-3 w-3" />}
                                    </div>
                                    <span className="truncate">{o.label}</span>
                                </button>
                            );
                        })
                    )}
                </div>

                {/* Footer */}
                {selected.length > 0 && (
                    <div className="border-t px-3 py-2">
                        <button
                            type="button"
                            onClick={() => onChange([])}
                            className="text-xs text-muted-foreground hover:text-destructive"
                        >
                            Clear all ({selected.length} selected)
                        </button>
                    </div>
                )}
            </PopoverContent>
        </Popover>
    );
}
