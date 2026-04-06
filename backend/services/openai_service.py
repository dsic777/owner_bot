import os
import json
from typing import AsyncGenerator, Tuple
from openai import AsyncOpenAI
from dotenv import load_dotenv

load_dotenv()


def _get_client() -> AsyncOpenAI:
    """API 키가 설정된 시점에 클라이언트 생성 (앱 시작 시 오류 방지)"""
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key or api_key.startswith("여기에"):
        raise ValueError("OPENAI_API_KEY가 .env에 설정되지 않았습니다.")
    return AsyncOpenAI(api_key=api_key)


def _build_prompt(data: dict) -> str:
    tone_map = {
        "friendly":      "친근하고 따뜻한 말투",
        "professional":  "전문적이고 신뢰감 있는 말투",
        "emotional":     "감성적이고 공감되는 말투",
    }
    tone_str = tone_map.get(data.get("tone", "friendly"), "친근하고 따뜻한 말투")

    return f"""당신은 소상공인을 위한 AI 마케팅 콘텐츠 전문가입니다.
아래 가게 정보를 바탕으로 네이버 상위노출에 최적화된 콘텐츠 4종을 생성해 주세요.

[가게 정보]
- 가게명: {data.get('shop_name')}
- 업종: {data.get('business_type')}
- 지역: {data.get('region')}
- 메인 키워드: {data.get('keyword')}
- 가게 특징: {data.get('feature') or '없음'}
- 톤: {tone_str}

다음 형식을 정확히 지켜서 출력해 주세요.

[BLOG]
(네이버 블로그용 글 — 500자 내외, SEO 키워드 자연스럽게 포함)

[REVIEW]
(네이버 플레이스 리뷰용 — 150자 내외, 실제 방문 후기 느낌)

[SHORTS]
(유튜브/릴스 쇼츠 대본 — 3컷 구조: 훅/본론/CTA, 각 컷 1~2문장)

[THUMBNAIL]
(썸네일 문구 3개 — 각 15자 이내, 임팩트 있게)
"""


async def stream_content(
    data: dict,
) -> AsyncGenerator[Tuple[str, str], None]:
    """
    OpenAI 스트리밍으로 콘텐츠 생성.
    yield: (콘텐츠_타입, 텍스트_청크)
    타입: blog / review / shorts / thumbnail
    """
    prompt = _build_prompt(data)

    client = _get_client()
    stream = await client.chat.completions.create(
        model="gpt-4o",
        messages=[{"role": "user", "content": prompt}],
        stream=True,
        temperature=0.8,
        max_tokens=1500,
    )

    current_type = "blog"
    type_map = {
        "[BLOG]":      "blog",
        "[REVIEW]":    "review",
        "[SHORTS]":    "shorts",
        "[THUMBNAIL]": "thumbnail",
    }
    buffer = ""

    async for chunk in stream:
        delta = chunk.choices[0].delta.content or ""
        buffer += delta

        # 섹션 구분자 감지
        for marker, ctype in type_map.items():
            if marker in buffer:
                parts = buffer.split(marker)
                if parts[0]:
                    yield current_type, parts[0]
                current_type = ctype
                buffer = parts[-1]
                break
        else:
            # 구분자 없으면 바로 전송
            if len(buffer) > 20:
                yield current_type, buffer
                buffer = ""

    if buffer:
        yield current_type, buffer
