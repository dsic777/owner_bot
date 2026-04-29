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
        setError('아이디 또는 비밀번호를 확인해주세요.')
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

        <div>
          <h2 className="text-3xl font-bold text-cream mb-1">로그인</h2>
          <p className="text-base text-muted">계정에 로그인하세요</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">

          <div className="flex flex-col gap-2">
            <label className="text-base font-medium text-cream">아이디</label>
            <input
              type="text"
              value={form.username}
              onChange={e => setForm({ ...form, username: e.target.value })}
              placeholder="아이디를 입력하세요"
              autoComplete="username"
              className="w-full px-4 py-[9px] rounded-xl text-lg text-cream placeholder-muted border border-border focus:border-sand focus:outline-none transition-colors"
              style={{ background: 'rgba(33,58,86,0.75)', backdropFilter: 'blur(8px)' }}
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-base font-medium text-cream">비밀번호</label>
            <input
              type="password"
              value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })}
              placeholder="비밀번호를 입력하세요"
              autoComplete="current-password"
              className="w-full px-4 py-[9px] rounded-xl text-lg text-cream placeholder-muted border border-border focus:border-sand focus:outline-none transition-colors"
              style={{ background: 'rgba(33,58,86,0.75)', backdropFilter: 'blur(8px)' }}
            />
          </div>

          {error && (
            <p className="text-base text-red-400 text-center">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 rounded-xl bg-[#b89973] text-darkbrown font-bold text-[1.4rem] hover:bg-camel transition-all active:translate-y-[2px] disabled:opacity-60 mt-2"
            style={{ boxShadow: '0 4px 0 #7a5c35, 0 8px 16px rgba(0,0,0,0.3)' }}
          >
            {loading ? '로그인 중...' : '로그인'}
          </button>

        </form>

        <div className="w-full text-center mt-4">
          <p className="text-cream text-lg mb-2">계정이 없으신가요?</p>
          <button
            onClick={() => navigate('/register')}
            className="px-8 py-2 rounded-xl bg-[#b89973] text-darkbrown font-bold text-lg hover:bg-camel transition-all active:translate-y-[2px]"
            style={{ boxShadow: '0 4px 0 #7a5c35, 0 8px 16px rgba(0,0,0,0.3)' }}
          >
            회원가입 →
          </button>
        </div>

      </main>
    </div>
  )
}
