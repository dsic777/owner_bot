import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import NightBackground from '../components/NightBackground'
import { apiFetch } from '../lib/api'

const inputClass = "w-[150px] flex-1 px-3 py-[4px] rounded-xl text-base text-cream placeholder-muted border border-border focus:border-sand focus:outline-none transition-colors"
const inputStyle = { background: 'rgba(33,58,86,0.75)', backdropFilter: 'blur(8px)' }
const labelClass = "text-base font-medium text-cream w-[60px] shrink-0 text-right"

export default function RegisterPage() {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    nickname: '', business_name: '', business_type: '',
    username: '', password: '', passwordConfirm: '',
    phone: '', user_email: '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const set = (key: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(f => ({ ...f, [key]: e.target.value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!form.nickname || !form.username || !form.password || !form.passwordConfirm) {
      setError('이름, 아이디, 비밀번호는 필수입니다.')
      return
    }
    if (form.password !== form.passwordConfirm) {
      setError('비밀번호가 일치하지 않습니다.')
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
          business_name: form.business_name,
          business_type: form.business_type,
          phone: form.phone,
          user_email: form.user_email,
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

      <main className="relative z-10 flex-1 flex flex-col px-6 gap-4 pt-[70px] overflow-y-auto">

        <div>
          <h2 className="text-3xl font-bold text-cream mb-1">회원가입</h2>
          <p className="text-base text-muted">3크레딧을 무료로 받으세요</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-[8px]">

          <div className="flex items-center gap-[14px]">
            <label className={labelClass}>아이디</label>
            <input type="text" value={form.username} onChange={set('username')}
              placeholder="로그인 아이디" autoComplete="username"
              className={inputClass} style={inputStyle} />
          </div>

          <div className="flex items-center gap-[14px]">
            <label className={labelClass}>비밀번호</label>
            <input type="password" value={form.password} onChange={set('password')}
              placeholder="6자 이상" autoComplete="new-password"
              className={inputClass} style={inputStyle} />
          </div>

          <div className="flex items-center gap-[14px]">
            <label className={labelClass}>비번확인</label>
            <input type="password" value={form.passwordConfirm} onChange={set('passwordConfirm')}
              placeholder="비밀번호 재입력" autoComplete="new-password"
              className={inputClass} style={inputStyle} />
          </div>

          <div className="flex items-center gap-[14px]">
            <label className={labelClass}>이름</label>
            <input type="text" value={form.nickname} onChange={set('nickname')}
              placeholder="사장님 이름" autoComplete="name"
              className={inputClass} style={inputStyle} />
          </div>

          <div className="flex items-center gap-[14px]">
            <label className={labelClass}>전화번호</label>
            <input type="tel" value={form.phone} onChange={set('phone')}
              placeholder="010-0000-0000"
              className={inputClass} style={inputStyle} />
          </div>

          <div className="flex items-center gap-[14px]">
            <label className={labelClass}>이메일</label>
            <input type="email" value={form.user_email} onChange={set('user_email')}
              placeholder="example@email.com" autoComplete="email"
              className={inputClass} style={inputStyle} />
          </div>

          <div className="flex items-center gap-[14px]">
            <label className={labelClass}>상호명</label>
            <input type="text" value={form.business_name} onChange={set('business_name')}
              placeholder="가게 이름"
              className={inputClass} style={inputStyle} />
          </div>

          <div className="flex items-center gap-[14px]">
            <label className={labelClass}>업종</label>
            <input type="text" value={form.business_type} onChange={set('business_type')}
              placeholder="카페, 미용실, 식당 등"
              className={inputClass} style={inputStyle} />
          </div>

          {error && (
            <p className="text-base text-red-400 text-center">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 rounded-xl bg-[#b89973] text-navy font-bold text-[1.4rem] hover:bg-camel transition-colors shadow-lg disabled:opacity-60 mt-1"
          >
            {loading ? '가입 중...' : (
              <>회원가입 <span style={{ fontSize: 'calc(1.4rem - 2px)' }}>→ 3크레딧 무료지급</span></>
            )}
          </button>

        </form>

        <button
          onClick={() => navigate('/login')}
          className="w-full py-1 transition-colors text-center mt-auto mb-[140px]"
        >
          <span className="text-cream text-lg block">이미 계정이 있으신가요?</span>
          <span className="text-sand text-2xl font-bold block">로그인 →</span>
        </button>

      </main>
    </div>
  )
}
