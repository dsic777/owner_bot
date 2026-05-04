import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import NightBackground from '../components/NightBackground'
import { apiFetch } from '../lib/api'

const inputClass = "w-full px-4 py-[9px] rounded-xl text-lg text-cream placeholder-muted border border-border focus:border-sand focus:outline-none transition-colors"
const inputStyle = { background: 'rgba(33,58,86,0.75)', backdropFilter: 'blur(8px)' }

export default function RegisterPage() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ username: '', nickname: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const set = (key: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(f => ({ ...f, [key]: e.target.value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!form.username || !form.nickname || !form.password) {
      setError('이메일, 이름, 비밀번호는 필수입니다.')
      return
    }
    if (form.password.length < 6) {
      setError('비밀번호는 최소 6자 이상이어야 합니다.')
      return
    }
    setLoading(true)
    try {
      const res = await apiFetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: form.username,
          password: form.password,
          nickname: form.nickname,
        }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        setError(data.detail || `오류 ${res.status}`)
        return
      }
      navigate('/login')
    } catch {
      setError('서버 연결에 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="h-screen text-cream flex flex-col relative overflow-hidden" style={{ background: '#020609' }}>
      <NightBackground />

      {/* 뒤로가기 */}
      <button
        onClick={() => navigate('/login')}
        className="absolute top-[44px] right-6 z-20 w-11 h-11 rounded-full flex items-center justify-center text-2xl font-bold text-sand hover:text-cream transition-colors"
        style={{ background: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(4px)', border: '1.5px solid rgba(205,170,128,0.45)' }}
      >
        ←
      </button>

      <main className="relative z-10 flex-1 flex flex-col px-6 gap-4 pt-[80px] overflow-y-auto">

        <div className="text-center mb-2">
          <h2 className="text-[2.2rem] font-bold text-cream mb-1">사장봇 시작하기</h2>
          <p className="text-base text-sand">단 10초면 마케팅 준비가 끝납니다.</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">

          <div className="flex flex-col gap-2">
            <label className="text-base font-medium text-cream">이메일</label>
            <input type="email" value={form.username} onChange={set('username')}
              placeholder="example@email.com" autoComplete="email"
              className={inputClass} style={inputStyle} />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-base font-medium text-cream">사장님 성함 (또는 닉네임)</label>
            <input type="text" value={form.nickname} onChange={set('nickname')}
              placeholder="홍길동" autoComplete="name"
              className={inputClass} style={inputStyle} />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-base font-medium text-cream">비밀번호</label>
            <input type="password" value={form.password} onChange={set('password')}
              placeholder="비밀번호를 입력해주세요" autoComplete="new-password"
              className={inputClass} style={inputStyle} />
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
            {loading ? '가입 중...' : (
              <>회원가입 <span style={{ fontSize: 'calc(1.4rem - 2px)' }}>→ 3크레딧 무료지급</span></>
            )}
          </button>

        </form>

        <button
          onClick={() => navigate('/login')}
          className="w-full py-2 transition-colors text-center mt-2"
        >
          <span className="text-[1.1rem] text-cream block">이미 계정이 있으신가요?</span>
          <span className="text-sand text-[1.65rem] font-bold block">로그인 →</span>
        </button>

      </main>
    </div>
  )
}
