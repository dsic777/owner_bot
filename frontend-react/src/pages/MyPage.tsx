import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import NightBackground from '../components/NightBackground'
import { apiFetch } from '../lib/api'

interface UserInfo {
  id: number
  email: string
  nickname: string | null
  credits: number
  plan: string
}

interface Transaction {
  id: number
  amount: number
  type: string
  note: string
  created_at: string
}

interface HistoryItem {
  id: number
  shop_name: string
  business_type: string
  region: string
  keyword: string
  tone: string
  output_payload: string
  created_at: string
}

const PACKAGES = [
  { id: 'light',  credits: 3,  price: '3,900원',  label: '라이트',  badge: '' },
  { id: 'basic',  credits: 10, price: '9,900원',  label: '베이직',  badge: '인기' },
  { id: 'pro',    credits: 25, price: '19,900원', label: '프로',    badge: '베스트' },
]

const PLAN_LABEL: Record<string, string> = {
  free: '무료',
  per_use: '건당',
  monthly: '월정액',
}

function authHeader(): Record<string, string> {
  const token = localStorage.getItem('token')
  return token ? { Authorization: `Bearer ${token}` } : {}
}

export default function MyPage() {
  const navigate = useNavigate()
  const [user, setUser] = useState<UserInfo | null>(null)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [histories, setHistories] = useState<HistoryItem[]>([])
  const [chargeMsg, setChargeMsg] = useState('')
  const [charging, setCharging] = useState('')

  // 비밀번호 변경
  const [pwForm, setPwForm] = useState({ current: '', next: '', confirm: '' })
  const [pwMsg, setPwMsg] = useState('')
  const [pwLoading, setPwLoading] = useState(false)
  const [showPw, setShowPw] = useState(false)

  // 재생성
  const [regenerating, setRegenerating] = useState<number | null>(null)

  const loadUser = () =>
    apiFetch('/api/mypage/me', { headers: authHeader() })
      .then(r => r.json())
      .then(setUser)
      .catch(() => {})

  const loadTransactions = () =>
    apiFetch('/api/mypage/credits', { headers: authHeader() })
      .then(r => r.json())
      .then(data => setTransactions(data.transactions || []))
      .catch(() => {})

  const loadHistories = () =>
    apiFetch('/api/history', { headers: authHeader() })
      .then(r => r.json())
      .then(data => setHistories(Array.isArray(data) ? data : []))
      .catch(() => {})

  useEffect(() => {
    loadUser()
    loadTransactions()
    loadHistories()
  }, [])

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
      await loadUser()
      await loadTransactions()
    } catch {
      setChargeMsg('서버 연결에 실패했습니다.')
    } finally {
      setCharging('')
    }
  }

  const handleDeleteHistory = async (id: number) => {
    if (!window.confirm('이 이력을 삭제하시겠습니까?')) return
    try {
      await apiFetch(`/api/history/${id}`, { method: 'DELETE', headers: authHeader() })
      setHistories(prev => prev.filter(h => h.id !== id))
    } catch {}
  }

  const handleViewHistory = (h: HistoryItem) => {
    try {
      const output = JSON.parse(h.output_payload)
      navigate('/generate', { state: { historyOutput: output, historyInfo: h } })
    } catch {
      alert('이력 데이터를 불러올 수 없습니다.')
    }
  }

  const handleRegenerate = async (h: HistoryItem) => {
    setRegenerating(h.id)
    try {
      const res = await apiFetch(`/api/history/${h.id}/regenerate`, {
        method: 'POST',
        headers: authHeader(),
      })
      const data = await res.json()
      if (!res.ok) {
        alert(data.detail || '재생성 실패')
        return
      }
      await loadUser()
      await loadHistories()
      navigate('/generate', { state: { historyOutput: data.output, historyInfo: h } })
    } catch {
      alert('서버 연결에 실패했습니다.')
    } finally {
      setRegenerating(null)
    }
  }

  const handlePasswordChange = async (e: { preventDefault: () => void }) => {
    e.preventDefault()
    setPwMsg('')
    if (pwForm.next !== pwForm.confirm) { setPwMsg('새 비밀번호가 일치하지 않습니다.'); return }
    if (pwForm.next.length < 6) { setPwMsg('새 비밀번호는 6자 이상이어야 합니다.'); return }
    setPwLoading(true)
    try {
      const res = await apiFetch('/api/auth/password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...authHeader() },
        body: JSON.stringify({ current_password: pwForm.current, new_password: pwForm.next }),
      })
      const data = await res.json()
      if (!res.ok) { setPwMsg(data.detail || '변경 실패'); return }
      setPwMsg('비밀번호가 변경되었습니다.')
      setPwForm({ current: '', next: '', confirm: '' })
    } catch {
      setPwMsg('서버 연결에 실패했습니다.')
    } finally {
      setPwLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    navigate('/login')
  }

  const inputClass = "flex-1 px-3 py-[6px] rounded-xl text-base text-cream placeholder-muted border border-border focus:border-sand focus:outline-none transition-colors"
  const inputStyle = { background: 'rgba(33,58,86,0.75)', backdropFilter: 'blur(8px)' }

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

      <main className="relative z-10 flex-1 flex flex-col px-6 pt-[20px] pb-10 gap-6">

        {/* 헤더 */}
        <div>
          <h2 className="text-3xl font-bold text-cream mb-1">마이페이지</h2>
          <p className="text-base text-muted">내 계정과 크레딧을 확인하세요</p>
        </div>

        {/* 내 정보 */}
        {user && (
          <div className="flex flex-col gap-[10px]">
            <div className="flex items-center gap-[14px]">
              <span className="text-base text-muted w-[60px] shrink-0 text-right">이메일</span>
              <span className="text-base text-cream flex-1">{user.email}</span>
            </div>
            {user.nickname && (
              <div className="flex items-center gap-[14px]">
                <span className="text-base text-muted w-[60px] shrink-0 text-right">이름</span>
                <span className="text-base text-cream flex-1">{user.nickname}</span>
              </div>
            )}
            <div className="flex items-center gap-[14px]">
              <span className="text-base text-muted w-[60px] shrink-0 text-right">크레딧</span>
              <span className="text-xl font-bold text-sand flex-1">{user.credits}개</span>
            </div>
            <div className="flex items-center gap-[14px]">
              <span className="text-base text-muted w-[60px] shrink-0 text-right">플랜</span>
              <span className="text-base text-cream flex-1">{PLAN_LABEL[user.plan] ?? user.plan}</span>
            </div>
          </div>
        )}

        <div className="border-t border-border" />

        {/* 크레딧 충전 */}
        <div className="flex flex-col gap-3">
          <p className="text-lg font-bold text-cream">크레딧 충전</p>
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
                <span className="text-lg font-bold">{pkg.credits}회</span>
                <span className="text-sm text-sand">{pkg.label}</span>
                <span className="text-sm mt-1">{pkg.price}</span>
              </button>
            ))}
          </div>
          {chargeMsg && (
            <p className={`text-base text-center ${chargeMsg.includes('실패') || chargeMsg.includes('오류') ? 'text-red-400' : 'text-sand'}`}>
              {chargeMsg}
            </p>
          )}
        </div>

        <div className="border-t border-border" />

        {/* 생성 이력 */}
        <div className="flex flex-col gap-3">
          <p className="text-lg font-bold text-cream">생성 이력</p>
          {histories.length === 0 ? (
            <p className="text-base text-muted">생성 이력이 없습니다.</p>
          ) : (
            <div className="flex flex-col gap-[10px]">
              {histories.map(h => (
                <div key={h.id} className="flex items-center justify-between py-2">
                  <button onClick={() => handleViewHistory(h)} className="flex-1 text-left">
                    <p className="text-base text-cream font-bold">{h.shop_name}</p>
                    <p className="text-sm text-muted">{h.keyword} · {h.region} · {h.created_at?.slice(0, 10)}</p>
                  </button>
                  <div className="flex items-center gap-3 shrink-0 ml-3">
                    <span onClick={() => handleViewHistory(h)} className="text-sand text-base font-bold cursor-pointer">보기</span>
                    <span
                      onClick={() => handleRegenerate(h)}
                      className={`text-base font-bold cursor-pointer transition-colors ${regenerating === h.id ? 'text-muted' : 'text-sand hover:text-cream'}`}
                    >
                      {regenerating === h.id ? '생성중...' : '재생성'}
                    </span>
                    <span onClick={() => handleDeleteHistory(h.id)} className="text-muted text-base cursor-pointer hover:text-red-400 transition-colors">삭제</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="border-t border-border" />

        {/* 이용 내역 */}
        <div className="flex flex-col gap-3">
          <p className="text-lg font-bold text-cream">이용 내역</p>
          {transactions.length === 0 ? (
            <p className="text-base text-muted">내역이 없습니다.</p>
          ) : (
            <div className="flex flex-col gap-[10px]">
              {transactions.map(t => (
                <div key={t.id} className="flex items-center justify-between">
                  <div>
                    <p className="text-base text-cream">{t.note}</p>
                    <p className="text-sm text-muted">{t.created_at?.slice(0, 10)}</p>
                  </div>
                  <span className={`text-lg font-bold ${t.amount > 0 ? 'text-sand' : 'text-muted'}`}>
                    {t.amount > 0 ? `+${t.amount}` : t.amount}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="border-t border-border" />

        {/* 비밀번호 변경 */}
        <div className="flex flex-col gap-3">
          <button
            onClick={() => { setShowPw(v => !v); setPwMsg('') }}
            className="flex items-center gap-2 text-lg font-bold text-cream text-left"
          >
            비밀번호 변경
            <span className="text-muted text-base">{showPw ? '▲' : '▼'}</span>
          </button>
          {showPw && (
            <form onSubmit={handlePasswordChange} className="flex flex-col gap-[10px]">
              <div className="flex items-center gap-[14px]">
                <span className="text-base text-muted w-[80px] shrink-0 text-right">현재</span>
                <input
                  type="password"
                  value={pwForm.current}
                  onChange={e => setPwForm(f => ({ ...f, current: e.target.value }))}
                  placeholder="현재 비밀번호"
                  className={inputClass}
                  style={inputStyle}
                />
              </div>
              <div className="flex items-center gap-[14px]">
                <span className="text-base text-muted w-[80px] shrink-0 text-right">새 비밀번호</span>
                <input
                  type="password"
                  value={pwForm.next}
                  onChange={e => setPwForm(f => ({ ...f, next: e.target.value }))}
                  placeholder="6자 이상"
                  className={inputClass}
                  style={inputStyle}
                />
              </div>
              <div className="flex items-center gap-[14px]">
                <span className="text-base text-muted w-[80px] shrink-0 text-right">확인</span>
                <input
                  type="password"
                  value={pwForm.confirm}
                  onChange={e => setPwForm(f => ({ ...f, confirm: e.target.value }))}
                  placeholder="새 비밀번호 재입력"
                  className={inputClass}
                  style={inputStyle}
                />
              </div>
              {pwMsg && (
                <p className={`text-base text-center ${pwMsg.includes('변경되었') ? 'text-sand' : 'text-red-400'}`}>
                  {pwMsg}
                </p>
              )}
              <button
                type="submit"
                disabled={pwLoading}
                className="w-full py-2 rounded-xl bg-[#b89973] text-darkbrown font-bold text-base hover:bg-camel transition-all active:translate-y-[2px] disabled:opacity-60 shadow-lg"
                style={{ borderBottom: '4px solid rgba(255,255,255,0.55)' }}
              >
                {pwLoading ? '변경 중...' : '비밀번호 변경 →'}
              </button>
            </form>
          )}
        </div>

        {/* 로그아웃 */}
        <div className="w-full flex justify-center mt-2">
          <button onClick={handleLogout}
            className="px-8 py-2 rounded-xl bg-[#b89973] text-darkbrown font-bold text-lg hover:bg-camel transition-all active:translate-y-[2px] shadow-lg"
            style={{ borderBottom: '4px solid rgba(255,255,255,0.55)' }}>
            로그아웃 →
          </button>
        </div>

      </main>
    </div>
  )
}
