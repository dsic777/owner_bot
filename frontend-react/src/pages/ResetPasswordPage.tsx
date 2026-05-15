import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import NightBackground from '../components/NightBackground'
import { apiFetch } from '../lib/api'

export default function ResetPasswordPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token') || ''

  const [form, setForm] = useState({ password: '', confirm: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)

  useEffect(() => {
    if (!token) {
      setError('유효하지 않은 링크입니다.')
    }
  }, [token])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (form.password !== form.confirm) {
      setError('비밀번호가 일치하지 않습니다.')
      return
    }
    if (form.password.length < 6) {
      setError('비밀번호는 6자 이상이어야 합니다.')
      return
    }
    setError('')
    setLoading(true)
    try {
      const res = await apiFetch(
        `/api/auth/password-reset/confirm?token=${encodeURIComponent(token)}&new_password=${encodeURIComponent(form.password)}`,
        { method: 'POST' }
      )
      const data = await res.json()
      if (!res.ok) {
        setError(data.detail || '오류가 발생했습니다.')
        return
      }
      setDone(true)
    } catch {
      setError('서버 연결에 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="text-cream flex flex-col relative overflow-hidden" style={{ background: '#020609', height: '100dvh' }}>
      <NightBackground />

      <main className="relative z-10 flex-1 flex flex-col px-6 gap-6 pt-[65px]">

        <div className="text-center mb-2">
          <h2 className="text-[2.2rem] font-bold text-cream mb-1">비밀번호 재설정</h2>
          <p className="text-lg text-sand">새 비밀번호를 입력해주세요.</p>
        </div>

        {done ? (
          <div className="flex flex-col gap-4 items-center">
            <p className="text-lg text-sand text-center">비밀번호가 성공적으로 변경됐습니다.</p>
            <button
              onClick={() => navigate('/login')}
              className="w-full py-2 rounded-xl bg-[#b89973] text-darkbrown font-bold text-[1.4rem] hover:bg-camel transition-all active:translate-y-[2px] shadow-lg"
              style={{ borderBottom: '4px solid rgba(255,255,255,0.55)' }}
            >
              로그인하러 가기
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-lg font-medium text-cream">새 비밀번호</label>
              <input
                type="password"
                value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                placeholder="6자 이상 입력하세요"
                required
                className="w-full px-4 py-[9px] rounded-xl text-2xl text-cream placeholder-muted border border-border focus:border-sand focus:outline-none transition-colors"
                style={{ background: 'rgba(33,58,86,0.75)', backdropFilter: 'blur(8px)' }}
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-lg font-medium text-cream">비밀번호 확인</label>
              <input
                type="password"
                value={form.confirm}
                onChange={e => setForm(f => ({ ...f, confirm: e.target.value }))}
                placeholder="비밀번호를 다시 입력하세요"
                required
                className="w-full px-4 py-[9px] rounded-xl text-2xl text-cream placeholder-muted border border-border focus:border-sand focus:outline-none transition-colors"
                style={{ background: 'rgba(33,58,86,0.75)', backdropFilter: 'blur(8px)' }}
              />
            </div>

            {error && <p className="text-base text-red-400 text-center">{error}</p>}

            <button
              type="submit"
              disabled={loading || !token}
              className="w-full py-2 rounded-xl bg-[#b89973] text-darkbrown font-bold text-[1.4rem] hover:bg-camel transition-all active:translate-y-[2px] disabled:opacity-60 mt-2 shadow-lg"
              style={{ borderBottom: '4px solid rgba(255,255,255,0.55)' }}
            >
              {loading ? '변경 중...' : '비밀번호 변경'}
            </button>
          </form>
        )}

      </main>
    </div>
  )
}
