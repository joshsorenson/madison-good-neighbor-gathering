import { next, rewrite } from '@vercel/functions';

/**
 * The homepage has two lives across the year.
 *
 *   before and after   index.html   the 2027 page, with last year built in
 *   on the day         today.html   parking, what's on stage, is it still on
 *
 * There used to be a third, recap.html, which took the homepage from the day
 * after the event until next year's page was ready. The 2027 rebuild folded
 * that content into index.html as its own section, so the page and both of its
 * flags (RECAP_AFTER, RECAP_NOW) are gone.
 *
 * Madison runs on CDT (UTC-5) through all of September, so the boundaries are
 * fixed instants. No timezone database needed at the edge.
 */
/**
 * STALE ON PURPOSE. These are the 2026 dates and the 2027 date is not set yet.
 * A window in the past simply never matches, so `/` keeps serving index.html,
 * which is the right behaviour until there is a real date. Guessing one would
 * hand the homepage to today.html on a day nothing is happening.
 *
 * When the 2027 date is announced, set both of these AND `EVENT_Y/M/D` plus the
 * `SCHEDULE` array in today.html. Nothing rolls forward on its own.
 */
const DAY_OPENS  = Date.UTC(2026, 8, 13, 5, 0, 0); // Sun Sep 13, 00:00 Madison
const DAY_CLOSES = Date.UTC(2026, 8, 14, 5, 0, 0); // Mon Sep 14, 00:00 Madison

export default function middleware(request) {
  try {
    const url = new URL(request.url);

    // Rehearsal hatch: /?preview=today forces the day-of page on any date, so
    // it can be checked without touching the live window.
    if (url.searchParams.get('preview') === 'today') {
      url.pathname = '/today.html';
      return rewrite(url);
    }

    const now = Date.now();

    if (now >= DAY_OPENS && now < DAY_CLOSES) {
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
 * Only the bare root. Everything else, /index.html included, is untouched.
 */
export const config = {
  matcher: '/',
};
