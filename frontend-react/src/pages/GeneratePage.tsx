import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import NightBackground from '../components/NightBackground'
import { apiFetch } from '../lib/api'

const inputClass = "w-[150px] flex-1 px-3 py-[5px] rounded-xl text-base text-cream placeholder-muted border border-border focus:border-sand focus:outline-none transition-colors"
const inputStyle = { background: 'rgba(33,58,86,0.75)', backdropFilter: 'blur(8px)' }
const labelClass = "text-base font-medium text-cream w-[45px] shrink-0 text-right"

type Tone = 'friendly' | 'professional' | 'emotional'
type TabKey = 'blog' | 'review' | 'shorts' | 'thumbnail'

const TONE_LABELS: Record<Tone, string> = {
  friendly: '친근하게',
  professional: '전문적으로',
  emotional: '감성적으로',
}

const TAB_LABELS: Record<TabKey, string> = {
  blog: '블로그',
  review: '리뷰',
  shorts: '쇼츠',
  thumbnail: '썸네일',
}

interface ShortsTimeline {
  time: string
  scene: string
  caption: string
  thumbnail_text: string
}

interface ResultOutput {
  blog: {
    title: string
    body: string
    hashtags: string
  }
  review: {
    customer_review: string
    owner_reply_1: string
    owner_reply_2: string
  }
  shorts: {
    concept: string
    timeline: ShortsTimeline[]
    filming_tips: {
      overall: string
      must_shots: string[]
      caption_style: string
      bgm: string
      cut_transition: string
    }
    instagram_body: string
  }
  thumbnail: {
    copies: {
      number_type: string
      question_type: string
      emotion_type: string
    }
    main_image_guide: {
      best_shot: string
      alternatives: string[]
      avoid: string
    }
    design_guide: {
      background: string
      font_style: string
      point_color: string
    }
    cta: string[]
  }
}

export default function GeneratePage() {
  const navigate = useNavigate()
  const location = useLocation()
  const [form, setForm] = useState({
    shop_name: '', business_type: '', region: '', keyword: '', feature: '',
  })
  const [tone, setTone] = useState<Tone>('friendly')
  const [credits, setCredits] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState<ResultOutput | null>(
    location.state?.historyOutput ?? null
  )
  const [activeTab, setActiveTab] = useState<TabKey>('blog')

  const set = (key: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(f => ({ ...f, [key]: e.target.value }))

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) return
    apiFetch('/api/auth/me', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(data => {
        setCredits(data.credits ?? null)
        setForm(f => ({
          ...f,
          shop_name: data.business_name || f.shop_name,
          business_type: data.business_type || f.business_type,
        }))
      })
      .catch(() => {})
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.shop_name || !form.business_type || !form.region || !form.keyword) {
      setError('상호명, 업종, 지역, 키워드는 필수입니다.')
      return
    }
    setError('')
    setLoading(true)
    try {
      const token = localStorage.getItem('token')
      const res = await apiFetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          shop_name: form.shop_name,
          business_type: form.business_type,
          region: form.region,
          keyword: form.keyword,
          feature: form.feature || undefined,
          tone,
        }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        setError(data.detail || `오류 ${res.status}`)
        return
      }
      const data = await res.json()
      setResult(data.output)
      if (data.credits_remaining != null) setCredits(data.credits_remaining)
      setActiveTab('blog')
    } catch {
      setError('서버 연결에 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen text-cream flex flex-col relative overflow-hidden" style={{ background: '#020609' }}>
      <NightBackground />

      {/* 뒤로가기 */}
      <button
        onClick={() => navigate('/')}
        className="absolute top-[44px] right-6 z-20 w-11 h-11 rounded-full flex items-center justify-center text-2xl font-bold text-sand hover:text-cream transition-colors"
        style={{ background: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(4px)', border: '1.5px solid rgba(205,170,128,0.45)' }}
      >
        ←
      </button>

      <main className="relative z-10 flex-1 flex flex-col px-6 pt-[20px] pb-10 gap-4">

        {/* 헤더 */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <h2 className="text-3xl font-bold text-cream">콘텐츠 생성</h2>
            {credits !== null && (
              <span className="text-sand text-lg font-bold">크레딧 {credits}</span>
            )}
          </div>
          <p className="text-base text-muted">AI가 마케팅 콘텐츠를 만들어드립니다</p>
        </div>

        {!result ? (
          <form onSubmit={handleSubmit} className="flex flex-col gap-[10px]">

            {/* 가입 정보 — 입력 필드와 동일한 스타일로 표시 */}
            {form.shop_name && (
              <div className="flex items-center gap-[14px]">
                <span className={labelClass}>상호명</span>
                <div className={`${inputClass} text-cream`} style={inputStyle}>{form.shop_name}</div>
              </div>
            )}
            {form.business_type && (
              <div className="flex items-center gap-[14px]">
                <span className={labelClass}>업종</span>
                <div className={`${inputClass} text-cream`} style={inputStyle}>{form.business_type}</div>
              </div>
            )}

            {/* 가입 정보 없을 때만 직접 입력 */}
            {!form.shop_name && (
              <div className="flex items-center gap-[14px]">
                <label className={labelClass}>상호명</label>
                <input type="text" value={form.shop_name} onChange={set('shop_name')}
                  placeholder="가게 이름" className={inputClass} style={inputStyle} />
              </div>
            )}
            {!form.business_type && (
              <div className="flex items-center gap-[14px]">
                <label className={labelClass}>업종</label>
                <input type="text" value={form.business_type} onChange={set('business_type')}
                  placeholder="카페, 미용실, 식당 등" className={inputClass} style={inputStyle} />
              </div>
            )}

            <div className="flex items-center gap-[14px]">
              <label className={labelClass}>지역</label>
              <input type="text" value={form.region} onChange={set('region')}
                placeholder="강남, 홍대, 부산 등" className={inputClass} style={inputStyle} />
            </div>

            <div className="flex items-center gap-[14px]">
              <label className={labelClass}>키워드</label>
              <input type="text" value={form.keyword} onChange={set('keyword')}
                placeholder="핵심 키워드 1개" className={inputClass} style={inputStyle} />
            </div>

            <div className="flex items-center gap-[14px]">
              <label className={labelClass}>특징</label>
              <input type="text" value={form.feature} onChange={set('feature')}
                placeholder="특별한 점 (선택)" className={inputClass} style={inputStyle} />
            </div>

            <div className="flex items-center gap-[14px] mt-1">
              <span className={labelClass}>톤</span>
              <div className="flex-1 flex gap-2">
                {(Object.keys(TONE_LABELS) as Tone[]).map(t => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTone(t)}
                    className={`flex-1 py-[6px] rounded-xl text-sm font-bold transition-colors ${
                      tone === t ? 'bg-[#b89973] text-navy' : 'text-muted border border-border'
                    }`}
                    style={tone !== t ? { background: 'rgba(33,58,86,0.55)' } : {}}
                  >
                    {TONE_LABELS[t]}
                  </button>
                ))}
              </div>
            </div>

            {error && <p className="text-base text-red-400 text-center">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 rounded-xl bg-[#b89973] text-navy font-bold text-[1.4rem] hover:bg-camel transition-colors shadow-lg disabled:opacity-60 mt-2"
            >
              {loading ? 'AI 생성 중...' : '콘텐츠 생성 →'}
            </button>

          </form>
        ) : (
          <div className="flex flex-col gap-4">

            {/* 탭 */}
            <div className="flex border-b border-border">
              {(Object.keys(TAB_LABELS) as TabKey[]).map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex-1 py-2 text-base font-bold transition-colors ${
                    activeTab === tab ? 'text-sand border-b-2 border-sand' : 'text-muted'
                  }`}
                >
                  {TAB_LABELS[tab]}
                </button>
              ))}
            </div>

            {/* 탭 내용 */}
            <div className="flex flex-col gap-5">

              {activeTab === 'blog' && (
                <>
                  <p className="text-xl font-bold text-cream">{result.blog.title}</p>
                  <p className="text-base text-cream leading-relaxed whitespace-pre-wrap">{result.blog.body}</p>
                  <p className="text-base text-sand">{result.blog.hashtags}</p>
                </>
              )}

              {activeTab === 'review' && (
                <>
                  <div>
                    <p className="text-sm text-muted mb-2">고객 리뷰</p>
                    <p className="text-base text-cream leading-relaxed whitespace-pre-wrap">{result.review.customer_review}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted mb-2">사장님 답글 1</p>
                    <p className="text-base text-cream leading-relaxed whitespace-pre-wrap">{result.review.owner_reply_1}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted mb-2">사장님 답글 2</p>
                    <p className="text-base text-cream leading-relaxed whitespace-pre-wrap">{result.review.owner_reply_2}</p>
                  </div>
                </>
              )}

              {activeTab === 'shorts' && (
                <>
                  <div>
                    <p className="text-sm text-muted mb-1">컨셉</p>
                    <p className="text-base text-cream">{result.shorts.concept}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted mb-2">타임라인</p>
                    <div className="flex flex-col gap-3">
                      {result.shorts.timeline?.map((t, i) => (
                        <div key={i}>
                          <p className="text-sm text-sand font-bold">{t.time}</p>
                          <p className="text-base text-cream">{t.scene}</p>
                          <p className="text-sm text-muted">"{t.caption}"</p>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-muted mb-2">촬영 팁</p>
                    <p className="text-base text-cream">{result.shorts.filming_tips?.overall}</p>
                    <p className="text-sm text-muted mt-2">BGM: {result.shorts.filming_tips?.bgm}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted mb-1">인스타 본문</p>
                    <p className="text-base text-cream leading-relaxed whitespace-pre-wrap">{result.shorts.instagram_body}</p>
                  </div>
                </>
              )}

              {activeTab === 'thumbnail' && (
                <>
                  <div>
                    <p className="text-sm text-muted mb-2">카피</p>
                    <p className="text-base text-cream">숫자형: {result.thumbnail.copies?.number_type}</p>
                    <p className="text-base text-cream">질문형: {result.thumbnail.copies?.question_type}</p>
                    <p className="text-base text-cream">감성형: {result.thumbnail.copies?.emotion_type}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted mb-2">메인 이미지 가이드</p>
                    <p className="text-base text-cream">베스트: {result.thumbnail.main_image_guide?.best_shot}</p>
                    <p className="text-sm text-muted mt-1">피할 것: {result.thumbnail.main_image_guide?.avoid}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted mb-2">디자인 가이드</p>
                    <p className="text-base text-cream">배경: {result.thumbnail.design_guide?.background}</p>
                    <p className="text-base text-cream">폰트: {result.thumbnail.design_guide?.font_style}</p>
                    <p className="text-base text-cream">포인트색: {result.thumbnail.design_guide?.point_color}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted mb-2">CTA</p>
                    {result.thumbnail.cta?.map((c, i) => (
                      <p key={i} className="text-base text-cream">{c}</p>
                    ))}
                  </div>
                </>
              )}

            </div>

            <div className="flex justify-center mt-2">
              <button
                onClick={() => setResult(null)}
                className="px-6 py-2 rounded-xl bg-[#b89973] text-navy font-bold text-[1.4rem] hover:bg-camel transition-colors shadow-lg"
              >
                다시 생성 →
              </button>
            </div>

          </div>
        )}

      </main>
    </div>
  )
}
