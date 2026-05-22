import { useState } from 'react';

export function useBulkSelect<T extends { id: number }>(items: T[]) {
    const [selected, setSelected] = useState<Set<number>>(new Set());

    const isAllSelected = items.length > 0 && items.every((item) => selected.has(item.id));
    const isIndeterminate = !isAllSelected && items.some((item) => selected.has(item.id));
    const count = selected.size;

    function toggleAll() {
        setSelected(isAllSelected ? new Set() : new Set(items.map((item) => item.id)));
    }

    function toggle(id: number) {
        setSelected((prev) => {
            const next = new Set(prev);
            next.has(id) ? next.delete(id) : next.add(id);
            return next;
        });
    }

    function clear() {
        setSelected(new Set());
    }

    return { selected, count, isAllSelected, isIndeterminate, toggleAll, toggle, clear };
}
