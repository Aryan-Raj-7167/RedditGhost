export async function onRequest({ request, params }) {
    const path = '/' + (params.path || []).join('/');
    const url = new URL(request.url);

    // Only allow Reddit API paths we actually use
    const allowed = ['/user/', '/search'];
    if (!allowed.some(p => path.startsWith(p))) {
        return new Response('Not allowed', { status: 403 });
    }

    const redditUrl = 'https://api.reddit.com' + path + url.search;

    const response = await fetch(redditUrl, {
        headers: {
            'Accept': 'application/json',
            'User-Agent': 'RedditGhost/1.0 (by u/Aryan_Raj_7167)',
        },
    });

    const data = await response.text();

    return new Response(data, {
        status: response.status,
        headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
        },
    });
}
