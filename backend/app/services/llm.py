import json

from openai import OpenAI

from app.config import LLM_API_KEY, LLM_PROVIDER


def build_prompt(weather_json, news_json, preferences):
    main = weather_json.get("weather", [{}])[0].get("main", "Unknown")
    temp = weather_json.get("main", {}).get("temp", "Unknown")
    pop = weather_json.get("rain", {}).get("1h", 0)
    weather_summary = f"{main}, {temp}°C, precipitation_prob={pop}"

    headlines = []
    for article in news_json.get("articles", [])[:5]:
        title = article.get("title")
        if title:
            headlines.append(title)
    news_block = "\n".join([f"- {h}" for h in headlines]) or "No major headlines."

    prompt = f"""
You are DayMate, an AI assistant that creates a daily plan for the user.
Use the following weather and news information to produce a **valid JSON object only**. Do not add any extra text outside the JSON.

Weather summary: {weather_summary}
Top news:
{news_block}
User preferences: {preferences}

Return JSON with exactly the following keys:
{{
  "priority_actions": ["example action 1", "example action 2"],
  "suggestions": ["example suggestion 1", "example suggestion 2"],
  "rationale": "short reason for the plan",
  "quick_tips": ["example tip 1", "example tip 2"],
  "summary": "one-sentence summary"
}}

Make sure the JSON is valid and parsable. Do not include any commentary outside the JSON.
"""
    return prompt


async def call_llm(prompt: str):
    if LLM_PROVIDER == "huggingface":
        if not LLM_API_KEY:
            raise RuntimeError("LLM_API_KEY not set")
        client = OpenAI(base_url="https://router.huggingface.co/v1", api_key=LLM_API_KEY)
        completion = client.chat.completions.create(
            model="deepseek-ai/DeepSeek-V3.2-Exp:novita",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.4,
            max_tokens=500,
        )
        data = completion.choices[0].message.content
        try:
            return json.loads(data)
        except json.JSONDecodeError:
            return {"raw": data}
    else:
        raise RuntimeError("Unsupported LLM_PROVIDER")

