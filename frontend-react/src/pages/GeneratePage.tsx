import { useState, useEffect, type ChangeEvent } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import NightBackground from '../components/NightBackground'
import { apiFetch } from '../lib/api'
import { useTTS } from '../hooks/useTTS'
import { useVoiceInput } from '../hooks/useVoiceInput'

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

const BUSINESS_TYPES = [
  '음식점/식당', '카페/베이커리', '피부관리/에스테틱', '헤어샵/미용실',
  '네일아트/속눈썹', '학원/교육', '헬스/필라테스', '인테리어/리모델링',
  '반려동물/펫샵', '공방/클래스', 'PC방/게임방', '쥬얼리/액세서리샵',
  '직접 입력',
]

const PACKAGES = [
  { id: 'light',  credits: 3,  price: '3,900원',  label: '라이트',  badge: '' },
  { id: 'basic',  credits: 10, price: '9,900원',  label: '베이직',  badge: '인기' },
  { id: 'pro',    credits: 25, price: '19,900원', label: '프로',    badge: '베스트' },
]

interface ShortsTimeline {
  time: string
  scene: string
  caption: string
  thumbnail_text: string
}

interface ResultOutput {
  blog: { title: string; body: string; hashtags: string }
  review: { customer_review: string; owner_reply_1: string; owner_reply_2: string }
  shorts: {
    concept: string
    timeline: ShortsTimeline[]
    filming_tips: { overall: string; must_shots: string[]; caption_style: string; bgm: string; cut_transition: string }
    instagram_body: string
  }
  thumbnail: {
    copies: { number_type: string; question_type: string; emotion_type: string }
    main_image_guide: { best_shot: string; alternatives: string[]; avoid: string }
    design_guide: { background: string; font_style: string; point_color: string }
    cta: string[]
  }
}

function authHeader(): Record<string, string> {
  const token = localStorage.getItem('token')
  return token ? { Authorization: `Bearer ${token}` } : {}
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  const handleCopy = async () => {
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }
  return (
    <button
      onClick={handleCopy}
      className="text-sm text-muted hover:text-sand transition-colors px-2 py-1 rounded-lg border border-border"
      style={{ background: 'rgba(33,58,86,0.5)' }}
    >
      {copied ? '복사됨 ✓' : '복사'}
    </button>
  )
}

export default function GeneratePage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { speak, stop, speaking, enabled: ttsEnabled, toggle: toggleTTS } = useTTS()
  const { isListening, activeField, voiceStatus, startVoice, stopVoice } = useVoiceInput()

  const [form, setForm] = useState({
    shop_name: '', business_type: '', region: '', keyword: '', feature: '',
  })
  const [businessTypeMode, setBusinessTypeMode] = useState<'select' | 'input'>('select')
  const [tone, setTone] = useState<Tone>('friendly')
  const [credits, setCredits] = useState<number | null>(null)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState<ResultOutput | null>(
    location.state?.historyOutput ?? null
  )
  const [activeTab, setActiveTab] = useState<TabKey>('blog')

  // 크레딧 소진 모달
  const [showCreditModal, setShowCreditModal] = useState(false)
  const [charging, setCharging] = useState('')
  const [chargeMsg, setChargeMsg] = useState('')

  const set = (key: string) => (e: ChangeEvent<HTMLInputElement>) =>
    setForm(f => ({ ...f, [key]: e.target.value }))

  const setField = (key: string, value: string) =>
    setForm(f => ({ ...f, [key]: value }))

  useEffect(() => {
    const token = localStorage.getItem('token')
    setIsLoggedIn(!!token)
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

  const handleSubmit = async (e: { preventDefault: () => void }) => {
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
      if (res.status === 402) {
        setShowCreditModal(true)
        return
      }
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

  const handleCharge = async (pkgId: string) => {
    setChargeMsg('')
    setCharging(pkgId)
    try {
      const res = await apiFetch('/api/mypage/charge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeader() },
        body: JSON.stringify({ package: pkgId }),
      })
      const data = await res.json()
      if (!res.ok) { setChargeMsg(data.detail || '충전 실패'); return }
      setChargeMsg(data.message)
      setCredits(prev => prev !== null ? prev + (pkgId === 'light' ? 3 : pkgId === 'basic' ? 10 : 25) : null)
    } catch {
      setChargeMsg('서버 연결에 실패했습니다.')
    } finally {
      setCharging('')
    }
  }

  const micBtn = (field: string, onResult: (t: string) => void) => (
    <button
      type="button"
      onClick={() => activeField === field ? stopVoice() : startVoice(field, onResult)}
      className={`w-9 h-9 rounded-full flex items-center justify-center text-base transition-colors shrink-0 ${
        activeField === field && isListening ? 'bg-red-500 text-white' : 'text-muted border border-border'
      }`}
      style={!(activeField === field && isListening) ? { background: 'rgba(33,58,86,0.55)' } : {}}
      title="음성 입력"
    >
      🎤
    </button>
  )

  const ttsBtn = (text: string) => (
    <button
      type="button"
      onClick={() => speaking ? stop() : speak(text)}
      className="text-sm text-muted hover:text-sand transition-colors px-2 py-1 rounded-lg border border-border"
      style={{ background: 'rgba(33,58,86,0.5)' }}
    >
      {speaking ? '정지 ■' : '듣기 ▶'}
    </button>
  )

  return (
    <div className="min-h-screen text-cream flex flex-col relative overflow-hidden" style={{ background: '#020609' }}>
      <NightBackground />

      {/* 크레딧 소진 모달 */}
      {showCreditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-6" style={{ background: 'rgba(0,0,0,0.7)' }}>
          <div className="w-full max-w-sm rounded-2xl p-6 flex flex-col gap-4" style={{ background: '#0f1e3f', border: '1.5px solid rgba(205,170,128,0.3)' }}>
            <p className="text-xl font-bold text-cream text-center">크레딧이 부족합니다</p>
            <p className="text-base text-muted text-center">충전 후 콘텐츠를 생성해 주세요</p>
            <div className="flex gap-3">
              {PACKAGES.map(pkg => (
                <button
                  key={pkg.id}
                  onClick={() => handleCharge(pkg.id)}
                  disabled={!!charging}
                  className={`flex-1 flex flex-col items-center py-3 rounded-xl transition-colors disabled:opacity-60 relative ${
                    charging === pkg.id ? 'bg-[#b89973] text-navy' : 'text-cream border border-border'
                  }`}
                  style={charging !== pkg.id ? { background: 'rgba(33,58,86,0.75)' } : {}}
                >
                  {pkg.badge && (
                    <span className="absolute -top-2 left-1/2 -translate-x-1/2 text-[10px] font-bold px-2 py-[1px] rounded-full bg-sand text-navy">
                      {pkg.badge}
                    </span>
                  )}
                  <span className="text-base font-bold">{pkg.credits}회</span>
                  <span className="text-xs text-sand">{pkg.label}</span>
                  <span className="text-xs mt-1">{pkg.price}</span>
                </button>
              ))}
            </div>
            {chargeMsg && (
              <p className={`text-base text-center ${chargeMsg.includes('실패') ? 'text-red-400' : 'text-sand'}`}>
                {chargeMsg}
              </p>
            )}
            <button
              onClick={() => { setShowCreditModal(false); setChargeMsg('') }}
              className="text-muted text-base text-center hover:text-cream transition-colors"
            >
              닫기
            </button>
          </div>
        </div>
      )}

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
            <div className="flex items-center gap-2">
              {credits !== null && (
                <span className="text-sand text-lg font-bold">크레딧 {credits}</span>
              )}
              <button
                type="button"
                onClick={toggleTTS}
                className={`text-xs px-2 py-1 rounded-lg border transition-colors ${ttsEnabled ? 'border-sand text-sand' : 'border-border text-muted'}`}
                style={{ background: 'rgba(33,58,86,0.5)' }}
              >
                {ttsEnabled ? '🔊 ON' : '🔇 OFF'}
              </button>
            </div>
          </div>
          <p className="text-base text-muted">AI가 마케팅 콘텐츠를 만들어드립니다</p>
        </div>

        {/* 비로그인 배너 */}
        {!isLoggedIn && (
          <div className="flex items-center justify-between px-4 py-3 rounded-xl" style={{ background: 'rgba(205,170,128,0.1)', border: '1px solid rgba(205,170,128,0.3)' }}>
            <p className="text-sm text-sand">비회원 1회 무료 체험 가능</p>
            <button onClick={() => navigate('/register')} className="text-sm font-bold text-sand underline">
              회원가입 →
            </button>
          </div>
        )}

        {/* 음성 상태 */}
        {voiceStatus && (
          <p className="text-sm text-sand text-center">{voiceStatus}</p>
        )}

        {!result ? (
          <form onSubmit={handleSubmit} className="flex flex-col gap-[10px]">

            <div className="flex items-center gap-[14px]">
              <label className={labelClass}>상호명</label>
              <input type="text" value={form.shop_name} onChange={set('shop_name')}
                placeholder="가게 이름" className={inputClass} style={inputStyle} />
              {micBtn('shop_name', t => setField('shop_name', t))}
            </div>

            {/* 업종 선택 */}
            <div className="flex items-start gap-[14px]">
              <label className={`${labelClass} pt-[6px]`}>업종</label>
              <div className="flex-1 flex flex-col gap-2">
                {businessTypeMode === 'select' ? (
                  <select
                    value={form.business_type}
                    onChange={e => {
                      const v = e.target.value
                      if (v === '직접 입력') {
                        setBusinessTypeMode('input')
                        setForm(f => ({ ...f, business_type: '' }))
                      } else {
                        setForm(f => ({ ...f, business_type: v }))
                      }
                    }}
                    className={`${inputClass} w-full`}
                    style={inputStyle}
                  >
                    <option value="">업종 선택</option>
                    {BUSINESS_TYPES.map(bt => (
                      <option key={bt} value={bt}>{bt}</option>
                    ))}
                  </select>
                ) : (
                  <div className="flex gap-2">
                    <input type="text" value={form.business_type} onChange={set('business_type')}
                      placeholder="업종 직접 입력" className={inputClass} style={inputStyle} autoFocus />
                    <button type="button" onClick={() => setBusinessTypeMode('select')}
                      className="text-sm text-muted hover:text-sand shrink-0">목록</button>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-[14px]">
              <label className={labelClass}>지역</label>
              <input type="text" value={form.region} onChange={set('region')}
                placeholder="강남, 홍대, 부산 등" className={inputClass} style={inputStyle} />
              {micBtn('region', t => setField('region', t))}
            </div>

            <div className="flex items-center gap-[14px]">
              <label className={labelClass}>키워드</label>
              <input type="text" value={form.keyword} onChange={set('keyword')}
                placeholder="핵심 키워드 1개" className={inputClass} style={inputStyle} />
              {micBtn('keyword', t => setField('keyword', t))}
            </div>

            <div className="flex items-center gap-[14px]">
              <label className={labelClass}>특징</label>
              <input type="text" value={form.feature} onChange={set('feature')}
                placeholder="특별한 점 (선택)" className={inputClass} style={inputStyle} />
              {micBtn('feature', t => setField('feature', t))}
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
              className="w-full py-2 rounded-xl bg-[#b89973] text-darkbrown font-bold text-[1.4rem] hover:bg-camel transition-all active:translate-y-[2px] disabled:opacity-60 mt-2 shadow-lg"
              style={{ borderBottom: '4px solid rgba(255,255,255,0.55)' }}
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
                  onClick={() => { setActiveTab(tab); stop() }}
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
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-muted">블로그 포스팅</p>
                    <div className="flex gap-2">
                      {ttsBtn(`${result.blog.title}\n${result.blog.body}`)}
                      <CopyButton text={`${result.blog.title}\n\n${result.blog.body}\n\n${result.blog.hashtags}`} />
                    </div>
                  </div>
                  <p className="text-xl font-bold text-cream">{result.blog.title}</p>
                  <p className="text-base text-cream leading-relaxed whitespace-pre-wrap">{result.blog.body}</p>
                  <p className="text-base text-sand">{result.blog.hashtags}</p>
                </>
              )}

              {activeTab === 'review' && (
                <>
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-muted">리뷰 & 답글</p>
                    <div className="flex gap-2">
                      {ttsBtn(result.review.customer_review)}
                      <CopyButton text={`[고객 리뷰]\n${result.review.customer_review}\n\n[답글 1]\n${result.review.owner_reply_1}\n\n[답글 2]\n${result.review.owner_reply_2}`} />
                    </div>
                  </div>
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
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-muted">쇼츠/릴스 대본</p>
                    <div className="flex gap-2">
                      {ttsBtn(result.shorts.concept)}
                      <CopyButton text={`[컨셉]\n${result.shorts.concept}\n\n[인스타 본문]\n${result.shorts.instagram_body}`} />
                    </div>
                  </div>
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
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-muted">썸네일 기획</p>
                    <CopyButton text={`[카피]\n숫자형: ${result.thumbnail.copies?.number_type}\n질문형: ${result.thumbnail.copies?.question_type}\n감성형: ${result.thumbnail.copies?.emotion_type}`} />
                  </div>
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
                onClick={() => { setResult(null); stop() }}
                className="px-6 py-2 rounded-xl bg-[#b89973] text-darkbrown font-bold text-[1.4rem] hover:bg-camel transition-all active:translate-y-[2px] shadow-lg"
                style={{ borderBottom: '4px solid rgba(255,255,255,0.55)' }}
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
