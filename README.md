# RedditGhost 👻

Find posts from Reddit accounts that have hidden their profile.

**Live site:** [redditghost.pages.dev](https://redditghost.pages.dev)

---

## What is this?

When a Reddit user hides their profile, their posts disappear from their profile page — but they can still be found through Reddit's search index. RedditGhost uses that to surface posts from hidden accounts.

Enter a username and it will show account info, detect if the profile is hidden, and fetch all posts it can find from them — with no login required.

---

## Features

- Detects if a Reddit profile is hidden or public
- Shows account info — karma, age, avatar, bio
- Auto-fetches all posts across all pages (no manual pagination)
- Displays posts with images, videos, and galleries
- **Post type badges** — Text, Image, Video, Gallery, Link
- **Comment count** shown on every post
- **Pinned posts** — detects and surfaces profile-pinned posts with a toggle to show/hide them
- **Sort** — Relevance, New, Old, Top, Hot, Most Commented (all client-side, instant)
- **Subreddit filter** — clickable tag chips to filter by one or multiple subreddits at once
- Dark / Light / System theme
- Works on mobile

---

## How it works

1. Fetches account info via `/user/{username}/about`
2. Fetches up to 100 submitted posts via `/user/{username}/submitted` to check if the profile is hidden and detect pinned posts
3. All posts are fetched via Reddit's global search index using `author:"username"` with full auto-pagination
4. Sorting and subreddit filtering happen entirely client-side — no extra API calls
5. All Reddit API requests are routed through a Cloudflare Pages Function proxy to avoid browser-level blocking

No login required. Uses Reddit's public API only.

---

## Usage

Open the site, type in a Reddit username and hit **Search**.

- Posts load automatically across all pages
- Use the sort chips to reorder posts instantly
- Use the subreddit tag chips to filter by one or multiple subreddits
- If the user has pinned posts on their profile, a **📌 Pinned** toggle appears to show/hide them

---

## Deployment

This project is deployed on **Cloudflare Pages** (not GitHub Pages) due to Reddit's API blocking browser requests that include a `Referer` header pointing to known scraper sites.

### Folder structure

```
RedditGhost/
├── index.html
└── functions/
    └── api/
        └── reddit/
            └── [[path]].js
```

### How the proxy works

All API calls in `index.html` go to `/api/reddit/...` (a relative path on the same domain). The Cloudflare Pages Function at `functions/api/reddit/[[path]].js` catches these requests and forwards them to `https://api.reddit.com` server-side — with a clean User-Agent and no Referer header. Reddit never sees the browser's headers.

```js
// functions/api/reddit/[[path]].js
const redditUrl = 'https://api.reddit.com' + path + url.search;

const response = await fetch(redditUrl, {
    headers: {
        'Accept': 'application/json',
        'User-Agent': 'RedditGhost/1.0 (by u/Aryan_Raj_7167)',
    },
});
```

---

## For Developers

### API endpoints used

| Endpoint | Purpose |
|---|---|
| `GET /user/{username}/about` | Fetch account info (karma, avatar, bio, account age) |
| `GET /user/{username}/submitted?limit=100` | Check if profile is hidden, detect pinned posts |
| `GET /search/?q=author:"username"&sort=relevance` | Fetch all posts via Reddit's search index |

All requests are proxied through `/api/reddit/...` on the same Cloudflare Pages domain.

### Hidden profile detection logic

Reddit doesn't expose a direct "is hidden" flag in its public API. The detection works like this:

```js
const children = submittedFeed.data.children;

// No posts at all → hidden
if (children.length === 0) return { hidden: true, pinned: [] };

// Filter out posts in u/username (user's own profile subreddit)
const nonProfilePosts = children.filter(c => c.data.subreddit_type !== 'user');

// All posts are profile-only → hidden
return { hidden: nonProfilePosts.length === 0, pinned };
```

The same API call also extracts pinned posts — posts where `pinned === true` and `subreddit_type === 'user'`.

### Pinned post detection

```js
const pinned = children.filter(c =>
    c.data.subreddit_type === 'user' && c.data.pinned === true
);
```

### Sorting

All sorting is done client-side on the full `allPosts` array — no re-fetching on sort change:

| Sort | Logic |
|---|---|
| Relevance | Original fetch order |
| New | `created_utc` descending |
| Old | `created_utc` ascending |
| Top | `score` descending |
| Hot | `upvote_ratio` then `score` descending |
| Most Commented | `num_comments` descending |

### Subreddit filter

Subreddit tags are built from the fetched posts and update as new pages load. Filtering is client-side:

```js
let posts = selectedSubreddits.size > 0
    ? allPosts.filter(p => selectedSubreddits.has(p.data.subreddit.toLowerCase()))
    : allPosts.slice();
```

The user's own profile subreddit (`u/username`) is listed first, followed by all others alphabetically.

### Pagination

Reddit's search API returns an `after` cursor token per page. The app auto-paginates with a 600ms delay between requests to avoid rate limiting. A `seenIds` Set prevents duplicate posts across pages.

```js
while (afterToken) {
    await new Promise(r => setTimeout(r, 600));
    const more = await fetchPosts(username, 'relevance', afterToken);
    if (!more.length) break;
    allPosts = allPosts.concat(more);
}
```

> ⚠️ Reddit's search index may not return every post — some older or less indexed posts might be missing.

### Contributing

PRs are welcome. The site is a single `index.html` file. The proxy lives in `functions/api/reddit/[[path]].js`.

---

## Author

Made by [u/Aryan_Raj_7167](https://reddit.com/u/Aryan_Raj_7167)
