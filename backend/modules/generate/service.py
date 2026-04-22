import json
import re
import logging
from anthropic import AsyncAnthropic, RateLimitError, AuthenticationError, APIError
from config import settings
from modules.generate.prompt_builder import build_prompt

logger = logging.getLogger(__name__)
client = AsyncAnthropic(api_key=settings.ANTHROPIC_API_KEY)


def extract_json(raw: str) -> dict | None:
    cleaned = re.sub(r"```(?:json)?\s*", "", raw).strip().rstrip("`").strip()
    try:
        return json.loads(cleaned)
    except json.JSONDecodeError:
        pass
    match = re.search(r"\{[\s\S]*\}", cleaned)
    if match:
        try:
            return json.loads(match.group())
        except json.JSONDecodeError:
            pass
    return None


async def generate_content(data: dict) -> dict:
    prompt = build_prompt(
        shop_name=data.get("shop_name", ""),
        business_type=data.get("business_type", ""),
        region=data.get("region", ""),
        keyword=data.get("keyword", ""),
        feature=data.get("feature") or "",
        tone=data.get("tone", "friendly")
    )

    try:
        response = await client.messages.create(
            model="claude-haiku-4-5-20251001",
            max_tokens=8000,
            temperature=0.8,
            messages=[{"role": "user", "content": prompt}],
        )
    except RateLimitError as e:
        logger.error(f"RateLimitError: {e}")
        return {"error": "API 요청 한도 초과. 잠시 후 다시 시도해 주세요."}
    except AuthenticationError as e:
        logger.error(f"AuthenticationError: {e}")
        return {"error": "Claude API 키가 유효하지 않습니다."}
    except APIError as e:
        logger.error(f"APIError: {e}")
        return {"error": f"Claude API 오류: {str(e)}"}
    except Exception as e:
        logger.error(f"Unexpected error in Claude API call: {e}")
        return {"error": f"예상치 못한 오류: {str(e)}"}

    raw = response.content[0].text
    logger.info(f"Claude response length: {len(raw)}, stop_reason: {response.stop_reason}")

    result = extract_json(raw)
    if result:
        logger.info(f"JSON parsed OK, keys: {list(result.keys())}")
        return result

    logger.warning(f"JSON parse failed on first try. Raw tail: {raw[-200:]}")

    # 2차 시도 — JSON만 달라고 재요청
    try:
        retry = await client.messages.create(
            model="claude-haiku-4-5-20251001",
            max_tokens=8000,
            temperature=0.3,
            messages=[
                {"role": "user", "content": prompt},
                {"role": "assistant", "content": raw},
                {"role": "user", "content": "위 내용을 반드시 JSON 형식으로만 다시 출력해주세요. 다른 텍스트 없이 JSON만 출력하세요."},
            ],
        )
    except Exception as e:
        logger.error(f"Retry API error: {e}")
        return {"error": "JSON 파싱 실패"}

    result = extract_json(retry.content[0].text)
    if result:
        return result

    logger.error("JSON parse failed on retry too")
    return {"error": "JSON 파싱 실패"}
