import { next, rewrite } from '@vercel/functions';

/**
 * The homepage has three lives across the year.
 *
 *   before the day   index.html   persuade someone to come
 *   on the day       today.html   parking, what's on stage, is it still on
 *   after the day    recap.html   thank you, sponsors, how to help next year
 *
 * Madison runs on CDT (UTC-5) through all of September, so the boundaries are
 * fixed instants. No timezone database needed at the edge.
 */
const DAY_OPENS  = Date.UTC(2026, 8, 13, 5, 0, 0); // Sun Sep 13, 00:00 Madison
const DAY_CLOSES = Date.UTC(2026, 8, 14, 5, 0, 0); // Mon Sep 14, 00:00 Madison

/**
 * The post-event page stays up until next year's homepage replaces it, which
 * is a deliberate edit rather than a date. Set this to false to hand the
 * homepage straight back to index.html.
 */
const RECAP_AFTER = true;

export default function middleware(request) {
  try {
    const url = new URL(request.url);

    // Rehearsal hatches: /?preview=today and /?preview=recap force either page
    // on any date, so both can be checked without touching the live window.
    const preview = url.searchParams.get('preview');
    if (preview === 'today' || preview === 'recap') {
      url.pathname = preview === 'today' ? '/today.html' : '/recap.html';
      return rewrite(url);
    }

    const now = Date.now();

    if (now >= DAY_OPENS && now < DAY_CLOSES) {
      url.pathname = '/today.html';
      // Query string survives, so ?at= and ?status= previews still work.
      return rewrite(url);
    }

    if (RECAP_AFTER && now >= DAY_CLOSES) {
      url.pathname = '/recap.html';
      return rewrite(url);
    }
  } catch (err) {
    // This sits in front of the homepage on the busiest day of the year.
    // If anything at all goes wrong, fall through and serve it normally.
  }
  return next();
}

/**
 * Only the bare root. Everything else, /index.html included, is untouched,
 * which is what keeps both pages' "Event info" links working.
 */
export const config = {
  matcher: '/',
};
