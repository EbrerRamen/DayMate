import httpx

from app.config import NEWSAPI_KEY


async def fetch_news(location: str, page_size: int = 5):
    if not NEWSAPI_KEY:
        raise RuntimeError("NEWSAPI_KEY not set")
    url = "https://newsapi.org/v2/everything"
    params = {
        "q": location,
        "pageSize": page_size,
        "apiKey": NEWSAPI_KEY,
        "language": "en",
        "sortBy": "publishedAt",
    }
    async with httpx.AsyncClient(timeout=10) as client:
        r = await client.get(url, params=params)
    r.raise_for_status()
    return r.json()

