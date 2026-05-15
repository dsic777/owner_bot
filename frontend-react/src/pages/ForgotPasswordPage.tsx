import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import NightBackground from '../components/NightBackground'
import { apiFetch } from '../lib/api'

export default function ForgotPasswordPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setMessage('')
    setLoading(true)
    try {
      const res = await apiFetch(`/api/auth/password-reset/request?email=${encodeURIComponent(email)}`, {
        method: 'POST',
      })
      const data = await res.json()
      setMessage(data.message || '재설정 링크를 발송했습니다.')
    } catch {
      setError('서버 연결에 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="text-cream flex flex-col relative overflow-hidden" style={{ background: '#020609', height: '100dvh' }}>
      <NightBackground />

      <button
        onClick={() => navigate('/login')}
        className="absolute top-16 right-6 z-20 w-11 h-11 rounded-full flex items-center justify-center text-2xl font-bold text-sand hover:text-cream transition-colors"
        style={{ background: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(4px)', border: '1.5px solid rgba(205,170,128,0.45)' }}
      >
        ←
      </button>

      <main className="relative z-10 flex-1 flex flex-col px-6 gap-6 pt-[65px]">

        <div className="text-center mb-2">
          <h2 className="text-[2.2rem] font-bold text-cream mb-1">비밀번호 찾기</h2>
          <p className="text-lg text-sand">가입하신 이메일로 재설정 링크를 보내드립니다.</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <label className="text-lg font-medium text-cream">이메일</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="example@email.com"
              required
              className="w-full px-4 py-[9px] rounded-xl text-2xl text-cream placeholder-muted border border-border focus:border-sand focus:outline-none transition-colors"
              style={{ background: 'rgba(33,58,86,0.75)', backdropFilter: 'blur(8px)' }}
            />
          </div>

          {error && <p className="text-base text-red-400 text-center">{error}</p>}
          {message && <p className="text-base text-sand text-center">{message}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 rounded-xl bg-[#b89973] text-darkbrown font-bold text-[1.4rem] hover:bg-camel transition-all active:translate-y-[2px] disabled:opacity-60 mt-2 shadow-lg"
            style={{ borderBottom: '4px solid rgba(255,255,255,0.55)' }}
          >
            {loading ? '발송 중...' : '재설정 링크 받기'}
          </button>
        </form>

      </main>
    </div>
  )
}
