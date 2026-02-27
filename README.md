# RedditGhost 👻

Find posts from Reddit accounts that have hidden their profile.

**Live site:** [aryan-raj-7167.github.io/RedditGhost/](https://aryan-raj-7167.github.io/RedditGhost/)

---

## What is this?

When a Reddit user hides their profile, their posts disappear from their profile page — but they can still be found through Reddit's search index. RedditGhost uses that to surface posts from hidden accounts.

Just enter a username and it will tell you if the profile is hidden, and show all the posts it can find from them.

---

## Features

- Detects if a Reddit profile is hidden or public
- Shows account info — karma, age, avatar, bio
- Displays posts with images, videos, and galleries
- Sort by New, Top, Hot, Relevance, or Most Comments
- Load more posts with pagination
- Dark / Light / System theme
- Works on mobile

---

## How it works

1. Fetches the user's submitted posts via Reddit's public API (`/user/{username}/submitted`)
2. If all returned posts belong only to the user's own profile subreddit (`subreddit_type === 'user'`), the account is flagged as hidden
3. Hidden profile posts are then retrieved through Reddit's global search index using `author:"username"`

No login required. Uses Reddit's public API only.

---

## Usage

Just open the site, type in a Reddit username and hit **Search**.

- **Hidden Profile** — posts are shown below
- **Public Profile** — profile is not hidden, link to their Reddit page is shown

---

## For Developers

### API endpoints used

| Endpoint | Purpose |
|---|---|
| `GET /user/{username}/about` | Fetch account info (karma, avatar, bio, account age) |
| `GET /user/{username}/submitted` | Check if profile is hidden by inspecting post subreddit types |
| `GET /search/?q=author:"username"` | Fetch posts from hidden profiles via Reddit's search index |

All requests go to `https://api.reddit.com` with no authentication. Requests are made with `credentials: 'omit'` to avoid sending any browser cookies.

### Hidden profile detection logic

Reddit doesn't expose a direct "is hidden" flag in its public API. The detection works like this:

```js
const children = submittedFeed.data.children;

// No posts at all → hidden
if (children.length === 0) return true;

// Filter out posts in u/username (user's own profile subreddit)
const nonProfilePosts = children.filter(c => c.data.subreddit_type !== 'user');

// All posts are profile-only → hidden
return nonProfilePosts.length === 0;
```

The key insight: when a profile is public, Reddit's `/submitted` feed returns posts from real subreddits. When hidden, it either returns nothing or only returns posts from the user's own profile subreddit (`subreddit_type === 'user'`).

### Pagination

Reddit's search API returns an `after` cursor token for pagination. The app stores this in `afterToken` and appends `&after={token}` to the next request. A `seenIds` Set prevents duplicate posts from appearing across pages.

### Contributing

PRs are welcome. Since it's a single-file app, all changes go in `index.html`.

---

## Author

Made by [u/Aryan_Raj_7167](https://reddit.com/u/Aryan_Raj_7167)