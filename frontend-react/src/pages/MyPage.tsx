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
  { id: 'light',  credits: 3,  price: '3,900원',  label: '라이트' },
  { id: 'basic',  credits: 10, price: '9,900원',  label: '베이직' },
  { id: 'pro',    credits: 25, price: '19,900원', label: '프로' },
]

const PLAN_LABEL: Record<string, string> = {
  free: '무료',
  per_use: '건당',
  monthly: '월정액',
}

function authHeader() {
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

  const handleLogout = () => {
    localStorage.removeItem('token')
    navigate('/login')
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
              <span className="text-base text-muted w-[60px] shrink-0 text-right">아이디</span>
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
                className={`flex-1 flex flex-col items-center py-3 rounded-xl transition-colors disabled:opacity-60 ${
                  charging === pkg.id ? 'bg-[#b89973] text-navy' : 'text-cream border border-border'
                }`}
                style={charging !== pkg.id ? { background: 'rgba(33,58,86,0.75)' } : {}}
              >
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
                    <span onClick={() => handleViewHistory(h)} className="text-sand text-lg font-bold cursor-pointer">보기 →</span>
                    <span onClick={() => handleDeleteHistory(h.id)} className="text-muted text-lg cursor-pointer hover:text-red-400 transition-colors">삭제</span>
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

        {/* 로그아웃 */}
        <button onClick={handleLogout} className="w-full py-2 transition-colors text-center mt-2">
          <span className="text-muted text-lg">로그아웃 →</span>
        </button>

      </main>
    </div>
  )
}
