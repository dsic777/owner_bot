import { useState, useEffect, useRef, type ChangeEvent } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import NightBackground from '../components/NightBackground'
import { apiFetch } from '../lib/api'
import { useTTS } from '../hooks/useTTS'
import { useVoiceInput } from '../hooks/useVoiceInput'

const inputClass = "w-full px-4 py-3 pr-12 rounded-xl text-xl text-cream placeholder-muted border border-border focus:border-sand focus:outline-none transition-colors"
const inputStyle = { background: 'rgba(33,58,86,0.75)', backdropFilter: 'blur(8px)' }
const labelClass = "text-lg font-medium text-cream"

type Tone = 'friendly' | 'professional' | 'emotional'
type TabKey = 'blog' | 'review' | 'shorts' | 'thumbnail'

const TAB_LABELS: Record<TabKey, string> = {
  blog: '블로그',
  review: '리뷰',
  shorts: '쇼츠',
  thumbnail: '썸네일',
}

interface BusinessTypeItem {
  name: string
  competitor_keyword?: string | null
  secondary_keyword?: string | null
  competitor_radius?: number | null
  kakao_group_code?: string | null
  kakao_category_filter?: string | null
  aliases?: string | null
}

const KAKAO_PICKER_GROUPS = [
  { code: 'FD6', label: '음식점' },
  { code: 'CE7', label: '카페' },
  { code: 'AC5', label: '학원' },
  { code: 'CS2', label: '편의점' },
  { code: 'HP8', label: '병원' },
]
const KAKAO_PICKER_CHILDREN: Record<string, { filter: string | null; label: string }[]> = {
  FD6: [
    { filter: '한식', label: '한식' }, { filter: '중식', label: '중식' },
    { filter: '일식', label: '일식' }, { filter: '양식', label: '양식' },
    { filter: '치킨', label: '치킨' }, { filter: '피자', label: '피자' },
    { filter: '분식', label: '분식' }, { filter: null, label: '기타 음식점' },
  ],
  CE7: [
    { filter: null, label: '카페' }, { filter: '베이커리', label: '베이커리' },
    { filter: '아이스크림', label: '아이스크림/빙수' },
  ],
  AC5: [
    { filter: '입시', label: '입시/수능' }, { filter: '어학', label: '어학원' },
    { filter: '예능', label: '예능학원' }, { filter: '체육', label: '체육학원' },
    { filter: null, label: '기타 학원' },
  ],
}

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
      className="text-sm text-muted hover:text-sand transition-colors px-2 py-1 rounded-xl border border-border"
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
  const [businessTypes, setBusinessTypes] = useState<BusinessTypeItem[]>([])
  const [showBusinessDropdown, setShowBusinessDropdown] = useState(false)
  const [showKakaoPicker, setShowKakaoPicker] = useState(false)
  const [pickerGroup, setPickerGroup] = useState<string | null>(null)
  const [tone, setTone] = useState<Tone>('friendly')
  const [credits, setCredits] = useState<number | null>(null)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState<ResultOutput | null>(
    location.state?.historyOutput ?? null
  )
  const [activeTab, setActiveTab] = useState<TabKey>('blog')

  const [typeDetected, setTypeDetected] = useState(false)
  const [typeDetecting, setTypeDetecting] = useState(false)
  const detectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const [showCreditModal, setShowCreditModal] = useState(false)
  const [charging, setCharging] = useState('')
  const [chargeMsg, setChargeMsg] = useState('')

  const set = (key: string) => (e: ChangeEvent<HTMLInputElement>) =>
    setForm(f => ({ ...f, [key]: e.target.value }))

  const setField = (key: string, value: string) =>
    setForm(f => ({ ...f, [key]: value }))

  function handleShopNameChange(value: string) {
    setField('shop_name', value)
    setTypeDetected(false)
    if (detectTimerRef.current) clearTimeout(detectTimerRef.current)
    if (value.trim() && businessTypes.length > 0) {
      setTypeDetecting(true)
      detectTimerRef.current = setTimeout(async () => {
        try {
          const res = await apiFetch('/api/business-types/detect', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              business_name: value,
              available_types: businessTypes.map(t => t.name),
            }),
          })
          const data = await res.json()
          if (data.type_name) {
            setField('business_type', data.type_name)
            setBusinessTypeMode('select')
            setTypeDetected(true)
          }
        } catch {}
        setTypeDetecting(false)
      }, 900)
    } else {
      setTypeDetecting(false)
    }
  }

  function handleKakaoPick(groupCode: string | null, filter: string | null) {
    const match =
      businessTypes.find(bt => bt.kakao_group_code === groupCode && bt.kakao_category_filter === filter) ||
      businessTypes.find(bt => bt.kakao_group_code === groupCode && !bt.kakao_category_filter)
    setField('business_type', match?.name || '')
    setTypeDetected(false)
    setShowKakaoPicker(false)
    setPickerGroup(null)
  }

  useEffect(() => {
    apiFetch('/api/business-types')
      .then(r => r.ok ? r.json() : [])
      .then(data => { if (Array.isArray(data) && data.length > 0) setBusinessTypes(data) })
      .catch(() => {})
  }, [])

  useEffect(() => {
    const token = localStorage.getItem('token')
    setIsLoggedIn(!!token)
    if (!token) return
    apiFetch('/api/auth/me', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(data => { setCredits(data.credits ?? null) })
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
      if (res.status === 402) { setShowCreditModal(true); return }
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
      onMouseDown={e => e.preventDefault()}
      onClick={() => activeField === field ? stopVoice() : startVoice(field, onResult)}
      className={`absolute right-2 top-1/2 -translate-y-1/2 p-2 transition-colors ${
        activeField === field && isListening ? 'opacity-100' : 'opacity-50 hover:opacity-100'
      }`}
      title="음성 입력"
    >
      <img
        src={`${import.meta.env.BASE_URL}mic.png`}
        className="w-5 h-5 object-contain"
        alt="음성입력"
        style={{ filter: activeField === field && isListening ? 'brightness(0) saturate(100%) invert(30%) sepia(90%) saturate(700%) hue-rotate(330deg)' : undefined }}
      />
    </button>
  )

  const voiceHint = (field: string) =>
    voiceStatus && activeField === field ? (
      <p className="text-sm text-sand mt-1">• {voiceStatus}</p>
    ) : null

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
                className={`text-xs px-2 py-1 rounded-xl border transition-colors ${ttsEnabled ? 'border-sand text-sand' : 'border-border text-muted'}`}
                style={{ background: 'rgba(33,58,86,0.5)' }}
              >
                {ttsEnabled ? '🔊 ON' : '🔇 OFF'}
              </button>
            </div>
          </div>
          <p className="text-base text-muted">가게 정보만 입력하면 인공지능이 알아서 글을 써줍니다.</p>
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

        {!result ? (
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">

            {/* 1. 가게 이름 */}
            <div className="flex flex-col gap-1.5">
              <label className={labelClass}>1. 가게 이름 <span className="text-red-400">*</span></label>
              <div className="relative">
                <input
                  type="text"
                  value={form.shop_name}
                  onChange={e => handleShopNameChange(e.target.value)}
                  placeholder="예) 강남 김밥천국, 홍대 네일아트"
                  className={inputClass}
                  style={inputStyle}
                />
                {micBtn('shop_name', t => handleShopNameChange(t))}
              </div>
              {voiceHint('shop_name')}
            </div>

            {/* 2. 업종 */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center gap-2">
                <label className={labelClass}>2. 업종 <span className="text-red-400">*</span></label>
                {typeDetecting && <span className="text-sand text-sm animate-pulse">AI 분석 중...</span>}
                {!typeDetecting && typeDetected && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-sand/20 text-sand border border-sand/30">AI 감지</span>
                )}
              </div>
              {businessTypeMode === 'select' ? (
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowBusinessDropdown(v => !v)}
                    className="w-full px-4 py-3 rounded-xl text-xl text-left flex items-center justify-between border border-border focus:border-sand transition-colors"
                    style={inputStyle}
                  >
                    <span className={form.business_type ? 'text-cream' : 'text-muted'}>
                      {form.business_type || '업종 선택'}
                    </span>
                    <span className="text-muted text-base ml-2">{showBusinessDropdown ? '▲' : '▼'}</span>
                  </button>
                  {showBusinessDropdown && (
                    <div
                      className="absolute top-full left-0 right-0 z-30 mt-1 rounded-xl border border-border overflow-y-auto"
                      style={{ background: '#0d1929', maxHeight: '220px' }}
                    >
                      <button
                        type="button"
                        onClick={() => {
                          setBusinessTypeMode('input')
                          setField('business_type', '')
                          setTypeDetected(false)
                          setShowBusinessDropdown(false)
                        }}
                        className="w-full px-4 py-2.5 text-left text-lg text-sand font-bold hover:bg-sand/10 border-b border-border/30 transition-colors"
                      >
                        ✏️ 직접 입력
                      </button>
                      {[...businessTypes]
                        .sort((a, b) => a.name.localeCompare(b.name, 'ko'))
                        .map(bt => (
                          <button
                            key={bt.name}
                            type="button"
                            onClick={() => {
                              setField('business_type', bt.name)
                              setTypeDetected(false)
                              setShowBusinessDropdown(false)
                            }}
                            className={`w-full px-4 py-2.5 text-left text-lg transition-colors hover:bg-sand/10 ${
                              form.business_type === bt.name ? 'text-sand font-bold' : 'text-cream'
                            }`}
                          >
                            {bt.name}
                          </button>
                        ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={form.business_type}
                    onChange={set('business_type')}
                    placeholder="업종 직접 입력"
                    className={inputClass}
                    style={inputStyle}
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => { setBusinessTypeMode('select'); setShowBusinessDropdown(false) }}
                    className="text-sm text-muted hover:text-sand shrink-0 px-2"
                  >
                    목록
                  </button>
                </div>
              )}
              <button
                type="button"
                onClick={() => { setShowKakaoPicker(v => !v); setPickerGroup(null) }}
                className="mt-0.5 text-sand text-sm underline hover:text-camel transition-colors text-left"
              >
                {showKakaoPicker ? '▲ 카카오 분류 닫기' : '▼ 카카오 분류로 찾기'}
              </button>
              {showKakaoPicker && (
                <div className="rounded-xl border border-border p-3 flex flex-col gap-2" style={{ background: '#0d1929' }}>
                  <div className="flex flex-wrap gap-1.5">
                    {KAKAO_PICKER_GROUPS.map(g => (
                      <button
                        key={g.code}
                        type="button"
                        onClick={() => setPickerGroup(pickerGroup === g.code ? null : g.code)}
                        className={`px-3 py-1.5 rounded-lg text-sm border transition-colors ${
                          pickerGroup === g.code ? 'bg-sand/20 border-sand text-cream font-bold' : 'border-border text-muted hover:border-sand/50 hover:text-cream'
                        }`}
                      >
                        {g.label}
                      </button>
                    ))}
                  </div>
                  {pickerGroup && KAKAO_PICKER_CHILDREN[pickerGroup] && (
                    <div className="flex flex-wrap gap-1.5 pt-2 border-t border-border/40">
                      {KAKAO_PICKER_CHILDREN[pickerGroup].map(c => (
                        <button
                          key={String(c.filter)}
                          type="button"
                          onClick={() => handleKakaoPick(pickerGroup, c.filter)}
                          className="px-3 py-1.5 rounded-lg text-sm border border-border text-muted hover:border-sand hover:text-cream transition-colors"
                        >
                          {c.label}
                        </button>
                      ))}
                    </div>
                  )}
                  {pickerGroup && !KAKAO_PICKER_CHILDREN[pickerGroup] && (
                    <button
                      type="button"
                      onClick={() => handleKakaoPick(pickerGroup, null)}
                      className="mt-1 w-full py-1.5 rounded-lg bg-sand text-navy font-bold text-sm"
                    >
                      {KAKAO_PICKER_GROUPS.find(g => g.code === pickerGroup)?.label} 선택
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* 3. 지역 */}
            <div className="flex flex-col gap-1.5">
              <label className={labelClass}>3. 지역 <span className="text-red-400">*</span></label>
              <div className="relative">
                <input
                  type="text"
                  value={form.region}
                  onChange={set('region')}
                  placeholder="예) 서울 강남구, 김포 장기동"
                  className={inputClass}
                  style={inputStyle}
                />
                {micBtn('region', t => setField('region', t))}
              </div>
              {voiceHint('region')}
            </div>

            {/* 4. 노출하고 싶은 키워드 */}
            <div className="flex flex-col gap-1.5">
              <label className={labelClass}>4. 노출하고 싶은 키워드 <span className="text-red-400">*</span></label>
              <div className="relative">
                <input
                  type="text"
                  value={form.keyword}
                  onChange={set('keyword')}
                  placeholder="예) 장기동 피부관리, 강남역 맛집"
                  className={inputClass}
                  style={inputStyle}
                />
                {micBtn('keyword', t => setField('keyword', t))}
              </div>
              {voiceHint('keyword')}
            </div>

            {/* 5. 우리 가게만의 특징 */}
            <div className="flex flex-col gap-1.5">
              <label className={`${labelClass} flex items-center gap-2`}>
                5. 우리 가게만의 특징
                <span className="text-xs px-2 py-0.5 rounded bg-sand/20 text-sand font-normal">선택</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={form.feature}
                  onChange={set('feature')}
                  placeholder="입력하면 홍보 효과가 훨씬 좋아져요! (예: 20년 경력)"
                  className={inputClass}
                  style={inputStyle}
                />
                {micBtn('feature', t => setField('feature', t))}
              </div>
              {voiceHint('feature')}
            </div>

            {/* 6. 글의 분위기 (톤) */}
            <div className="flex flex-col gap-1.5">
              <label className={labelClass}>6. 글의 분위기 (톤)</label>
              <div className="flex gap-2">
                {(['friendly', 'professional', 'emotional'] as Tone[]).map((t, i) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTone(t)}
                    className={`flex-1 py-3 rounded-xl text-base font-bold transition-colors ${
                      tone === t ? 'bg-[#b89973] text-navy' : 'text-muted border border-border'
                    }`}
                    style={tone !== t ? { background: 'rgba(33,58,86,0.55)' } : {}}
                  >
                    {['친근하게', '전문적으로', '감성적으로'][i]}
                  </button>
                ))}
              </div>
            </div>

            {error && <p className="text-base text-red-400 text-center">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-xl bg-[#b89973] text-darkbrown font-bold text-[1.4rem] hover:bg-camel transition-all active:translate-y-[2px] disabled:opacity-60 mt-2 shadow-lg"
              style={{ borderBottom: '4px solid rgba(255,255,255,0.55)' }}
            >
              {loading ? 'AI 생성 중...' : '마케팅 콘텐츠 생성하기'}
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
                  className={`flex-1 py-2 text-lg font-bold transition-colors ${
                    activeTab === tab ? 'text-sand border-b-2 border-sand' : 'text-muted'
                  }`}
                >
                  {TAB_LABELS[tab]}
                </button>
              ))}
            </div>

            <div className="flex flex-col gap-5">

              {activeTab === 'blog' && (
                <>
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-muted">블로그 포스팅</p>
                    <div className="flex gap-2">
                      <button type="button" onClick={() => speaking ? stop() : speak(`${result.blog.title}\n${result.blog.body}`)} className="text-sm text-muted hover:text-sand transition-colors px-2 py-1 rounded-xl border border-border" style={{ background: 'rgba(33,58,86,0.5)' }}>{speaking ? '정지 ■' : '듣기 ▶'}</button>
                      <CopyButton text={`${result.blog.title}\n\n${result.blog.body}\n\n${result.blog.hashtags}`} />
                    </div>
                  </div>
                  <p className="text-2xl font-bold text-cream">{result.blog.title}</p>
                  <p className="text-lg text-cream leading-relaxed whitespace-pre-wrap">{result.blog.body}</p>
                  <p className="text-lg text-sand">{result.blog.hashtags}</p>
                </>
              )}

              {activeTab === 'review' && (
                <>
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-muted">리뷰 & 답글</p>
                    <div className="flex gap-2">
                      <button type="button" onClick={() => speaking ? stop() : speak(result.review.customer_review)} className="text-sm text-muted hover:text-sand transition-colors px-2 py-1 rounded-xl border border-border" style={{ background: 'rgba(33,58,86,0.5)' }}>{speaking ? '정지 ■' : '듣기 ▶'}</button>
                      <CopyButton text={`[고객 리뷰]\n${result.review.customer_review}\n\n[답글 1]\n${result.review.owner_reply_1}\n\n[답글 2]\n${result.review.owner_reply_2}`} />
                    </div>
                  </div>
                  <div><p className="text-sm text-muted mb-2">고객 리뷰</p><p className="text-base text-cream leading-relaxed whitespace-pre-wrap">{result.review.customer_review}</p></div>
                  <div><p className="text-sm text-muted mb-2">사장님 답글 1</p><p className="text-base text-cream leading-relaxed whitespace-pre-wrap">{result.review.owner_reply_1}</p></div>
                  <div><p className="text-sm text-muted mb-2">사장님 답글 2</p><p className="text-base text-cream leading-relaxed whitespace-pre-wrap">{result.review.owner_reply_2}</p></div>
                </>
              )}

              {activeTab === 'shorts' && (
                <>
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-muted">쇼츠/릴스 대본</p>
                    <div className="flex gap-2">
                      <button type="button" onClick={() => speaking ? stop() : speak(result.shorts.concept)} className="text-sm text-muted hover:text-sand transition-colors px-2 py-1 rounded-xl border border-border" style={{ background: 'rgba(33,58,86,0.5)' }}>{speaking ? '정지 ■' : '듣기 ▶'}</button>
                      <CopyButton text={`[컨셉]\n${result.shorts.concept}\n\n[인스타 본문]\n${result.shorts.instagram_body}`} />
                    </div>
                  </div>
                  <div><p className="text-sm text-muted mb-1">컨셉</p><p className="text-base text-cream">{result.shorts.concept}</p></div>
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
                  <div><p className="text-sm text-muted mb-2">촬영 팁</p><p className="text-base text-cream">{result.shorts.filming_tips?.overall}</p><p className="text-sm text-muted mt-2">BGM: {result.shorts.filming_tips?.bgm}</p></div>
                  <div><p className="text-sm text-muted mb-1">인스타 본문</p><p className="text-base text-cream leading-relaxed whitespace-pre-wrap">{result.shorts.instagram_body}</p></div>
                </>
              )}

              {activeTab === 'thumbnail' && (
                <>
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-muted">썸네일 기획</p>
                    <CopyButton text={`[카피]\n숫자형: ${result.thumbnail.copies?.number_type}\n질문형: ${result.thumbnail.copies?.question_type}\n감성형: ${result.thumbnail.copies?.emotion_type}`} />
                  </div>
                  <div><p className="text-sm text-muted mb-2">카피</p><p className="text-base text-cream">숫자형: {result.thumbnail.copies?.number_type}</p><p className="text-base text-cream">질문형: {result.thumbnail.copies?.question_type}</p><p className="text-base text-cream">감성형: {result.thumbnail.copies?.emotion_type}</p></div>
                  <div><p className="text-sm text-muted mb-2">메인 이미지 가이드</p><p className="text-base text-cream">베스트: {result.thumbnail.main_image_guide?.best_shot}</p><p className="text-sm text-muted mt-1">피할 것: {result.thumbnail.main_image_guide?.avoid}</p></div>
                  <div><p className="text-sm text-muted mb-2">디자인 가이드</p><p className="text-base text-cream">배경: {result.thumbnail.design_guide?.background}</p><p className="text-base text-cream">폰트: {result.thumbnail.design_guide?.font_style}</p><p className="text-base text-cream">포인트색: {result.thumbnail.design_guide?.point_color}</p></div>
                  <div><p className="text-sm text-muted mb-2">CTA</p>{result.thumbnail.cta?.map((c, i) => (<p key={i} className="text-base text-cream">{c}</p>))}</div>
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
