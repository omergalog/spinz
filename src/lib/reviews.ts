import { supabase } from './supabase';

/**
 * Reviews are written straight from the browser, so anything displayed must be
 * moderated first — otherwise a stranger can POST to the API and have the text
 * appear on the site.
 *
 * The `approved` column is created by the migration in docs/security.sql. Until
 * that runs Postgres answers 42703 ("column does not exist"); we fall back to
 * the unfiltered query so a deploy that lands before the migration does not
 * blank out the reviews. Once the column exists this fallback never triggers.
 */
export async function fetchApprovedReviews<T>(
  columns: string,
  opts: { newestFirst?: boolean } = {},
): Promise<T[]> {
  const run = (filterApproved: boolean) => {
    let q = supabase.from('reviews').select(columns);
    if (filterApproved) q = q.eq('approved', true);
    if (opts.newestFirst) q = q.order('created_at', { ascending: false });
    return q;
  };

  const { data, error } = await run(true);
  if (!error) return (data ?? []) as T[];

  if (error.code === '42703') {
    const { data: legacy } = await run(false);
    return (legacy ?? []) as T[];
  }
  return [];
}
