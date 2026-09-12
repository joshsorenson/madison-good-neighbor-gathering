import { next, rewrite } from '@vercel/functions';

/**
 * On the day of the Gathering, the homepage becomes the day-of page.
 *
 * The normal homepage is built to persuade someone to come. On the day
 * itself people are asking where to park, what's on stage right now, and
 * whether it's still happening, so /today answers that instead.
 *
 * Madison runs on CDT (UTC-5) through all of September, so the window is
 * a pair of fixed instants. No timezone database needed at the edge.
 */
const WINDOW_OPENS  = Date.UTC(2026, 8, 13, 5, 0, 0); // Sun Sep 13, 00:00 Madison
const WINDOW_CLOSES = Date.UTC(2026, 8, 14, 5, 0, 0); // Mon Sep 14, 00:00 Madison

export default function middleware(request) {
  try {
    const url = new URL(request.url);

    // Rehearsal hatch: /?preview=today forces the swap on any date, so the
    // switch can be checked ahead of time without touching the live window.
    const forced = url.searchParams.get('preview') === 'today';

    const now = Date.now();
    const during = now >= WINDOW_OPENS && now < WINDOW_CLOSES;

    if (forced || during) {
      url.pathname = '/today.html';
      // Query string survives, so ?at= and ?status= previews still work.
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
 * which is what keeps the day-of page's "Full event info" link working.
 */
export const config = {
  matcher: '/',
};
