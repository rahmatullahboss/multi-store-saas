'use client';
import { jsx as _jsx } from "react/jsx-runtime";
export function OptimizedImage({ src, alt, className = '', ...props }) {
    return (_jsx("img", { src: src, alt: alt, className: className, loading: "lazy", placeholder: "blur", blurDataURL: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNzAwIiBoZWlnaHQ9IjQ3NSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB2ZXJzaW9uPSIxLjEiLz4=", ...props }));
}
