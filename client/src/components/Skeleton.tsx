import React from 'react';

/**
 * Placeholder grid that mirrors the shape of the catalog selection cards
 * (Step1-4) so the layout doesn't jump/reflow the instant real data arrives.
 */
export const CardGridSkeleton: React.FC<{ count?: number; cols?: string }> = ({
  count = 6,
  cols = 'grid-cols-2 sm:grid-cols-3',
}) => (
  <div className={`grid ${cols} gap-4`} role="status" aria-label="Loading options">
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="skeleton h-24" />
    ))}
    <span className="sr-only">Loading...</span>
  </div>
);

/** Placeholder rows for the admin order queue / customer table. */
export const TableRowsSkeleton: React.FC<{ rows?: number }> = ({ rows = 5 }) => (
  <div className="space-y-3" role="status" aria-label="Loading">
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className="skeleton h-12 w-full" />
    ))}
    <span className="sr-only">Loading...</span>
  </div>
);
