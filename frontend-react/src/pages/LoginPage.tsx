import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import NightBackground from '../components/NightBackground'
import { apiFetch } from '../lib/api'

export default function LoginPage() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ username: '', password: '' })

  useEffect(() => {
    document.documentElement.style.overflow = 'hidden'
    document.body.style.overflow = 'hidden'
    return () => {
      document.documentElement.style.overflow = ''
      document.body.style.overflow = ''
    }
  }, [])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await apiFetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ username: form.username, password: form.password }),
      })
      if (!res.ok) {
        setError('이메일 또는 비밀번호를 확인해주세요.')
        return
      }
      const data = await res.json()
      localStorage.setItem('token', data.access_token)
      navigate('/generate')
    } catch {
      setError('서버 연결에 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="text-cream flex flex-col relative overflow-hidden" style={{ background: '#020609', height: '100dvh' }}>
      <NightBackground />

      {/* 뒤로가기 */}
      <button
        onClick={() => navigate('/')}
        className="absolute top-16 right-6 z-20 w-11 h-11 rounded-full flex items-center justify-center text-2xl font-bold text-sand hover:text-cream transition-colors"
        style={{ background: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(4px)', border: '1.5px solid rgba(205,170,128,0.45)' }}
      >
        ←
      </button>

      {/* 폼 */}
      <main className="relative z-10 flex-1 flex flex-col px-6 gap-6 pt-[65px] overflow-hidden">

        <div className="text-center mb-2">
          <h2 className="text-[2.2rem] font-bold text-cream mb-1">어서오세요, 사장님!</h2>
          <p className="text-lg text-sand">로그인하고 1분 만에 홍보글을 만들어보세요.</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">

          <div className="flex flex-col gap-2">
            <label className="text-lg font-medium text-cream">이메일</label>
            <input
              type="email"
              value={form.username}
              onChange={e => setForm({ ...form, username: e.target.value })}
              placeholder="example@email.com"
              autoComplete="email"
              className="w-full px-4 py-[9px] rounded-xl text-2xl text-cream placeholder-muted border border-border focus:border-sand focus:outline-none transition-colors"
              style={{ background: 'rgba(33,58,86,0.75)', backdropFilter: 'blur(8px)' }}
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-lg font-medium text-cream">비밀번호</label>
            <input
              type="password"
              value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })}
              placeholder="비밀번호를 입력하세요"
              autoComplete="current-password"
              className="w-full px-4 py-[9px] rounded-xl text-2xl text-cream placeholder-muted border border-border focus:border-sand focus:outline-none transition-colors"
              style={{ background: 'rgba(33,58,86,0.75)', backdropFilter: 'blur(8px)' }}
            />
          </div>

          {error && (
            <p className="text-base text-red-400 text-center">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 rounded-xl bg-[#b89973] text-darkbrown font-bold text-[1.4rem] hover:bg-camel transition-all active:translate-y-[2px] disabled:opacity-60 mt-2 shadow-lg"
            style={{ borderBottom: '4px solid rgba(255,255,255,0.55)' }}
          >
            {loading ? '로그인 중...' : '로그인'}
          </button>

        </form>

        <button
          onClick={() => navigate('/register')}
          className="w-full py-2 transition-colors text-center mt-2"
        >
          <span className="text-[1.1rem] text-cream block">계정이 없으신가요?</span>
          <span className="text-sand text-[1.65rem] font-bold block">회원가입 →</span>
        </button>

      </main>
    </div>
  )
}
