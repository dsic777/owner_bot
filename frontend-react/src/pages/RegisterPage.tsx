import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import NightBackground from '../components/NightBackground'
import { apiFetch } from '../lib/api'

const inputClass = "w-[150px] flex-1 px-3 py-[4px] rounded-xl text-base text-cream placeholder-muted border border-border focus:border-sand focus:outline-none transition-colors"
const inputStyle = { background: 'rgba(33,58,86,0.75)', backdropFilter: 'blur(8px)' }
const labelClass = "text-base font-medium text-cream w-[60px] shrink-0 text-right"

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

        <div>
          <h2 className="text-3xl font-bold text-cream mb-1">회원가입</h2>
          <p className="text-base text-muted">3크레딧을 무료로 받으세요</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-[12px]">

          <div className="flex items-center gap-[14px]">
            <label className={labelClass}>이메일</label>
            <input type="email" value={form.username} onChange={set('username')}
              placeholder="로그인에 사용할 이메일" autoComplete="email"
              className={inputClass} style={inputStyle} />
          </div>

          <div className="flex items-center gap-[14px]">
            <label className={labelClass}>이름</label>
            <input type="text" value={form.nickname} onChange={set('nickname')}
              placeholder="사장님 이름" autoComplete="name"
              className={inputClass} style={inputStyle} />
          </div>

          <div className="flex items-center gap-[14px]">
            <label className={labelClass}>비밀번호</label>
            <input type="password" value={form.password} onChange={set('password')}
              placeholder="6자 이상" autoComplete="new-password"
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

        <div className="w-full text-center">
          <p className="text-cream text-lg mb-2">이미 계정이 있으신가요?</p>
          <button
            onClick={() => navigate('/login')}
            className="px-8 py-2 rounded-xl bg-[#b89973] text-darkbrown font-bold text-lg hover:bg-camel transition-all active:translate-y-[2px] shadow-lg"
            style={{ borderBottom: '4px solid rgba(255,255,255,0.55)' }}
          >
            로그인 →
          </button>
        </div>

      </main>
    </div>
  )
}
