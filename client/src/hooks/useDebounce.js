import { useEffect, useRef, useState } from 'react';

/**
 * Returns a debounced version of value.
 * The returned value only updates after delay ms have passed
 * without value changing.
 *
 * @template T
 * @param {T} value - The input value to debounce.
 * @param {number} [delay=300] - Delay in milliseconds.
 * @returns {T} The debounced value.
 */
export default function useDebounce(value, delay = 300) {

    const [debounced, setDebounced] = useState(value);
    const timeoutRef = useRef(null);

    useEffect(() => {
        // Reset any existing timer
        if (timeoutRef.current) clearTimeout(timeoutRef.current);

        // Schedule an update
        timeoutRef.current = setTimeout(() => {
        setDebounced(value);
        }, delay);

        // Cleanup on next change/unmount
        return () => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        };
    }, [value, delay]);

    return debounced;
}
