import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import NightBackground from '../components/NightBackground'

export default function LandingPage() {
  const navigate = useNavigate()
  const isLoggedIn = !!localStorage.getItem('token')

  useEffect(() => {
    document.documentElement.style.overflow = 'hidden'
    document.body.style.overflow = 'hidden'
    return () => {
      document.documentElement.style.overflow = ''
      document.body.style.overflow = ''
    }
  }, [])

  return (
    <div className="text-cream flex flex-col overflow-hidden relative" style={{ background: '#020609', height: '100dvh' }}>
      <NightBackground />

      {/* AI 마케팅 자동화 뱃지 */}
      <div className="absolute top-9 left-5 z-10">
        <span className="text-[1.1rem] px-4 py-1.5 rounded-full bg-white/10 text-cream border-2 border-sand backdrop-blur-sm">
          AI 마케팅 자동화
        </span>
      </div>

      {/* 메인 콘텐츠 */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-start pt-[126px] px-6 gap-4">

        <div className="text-center">
          <h2 className="text-[2.2rem] font-bold leading-tight mb-3 drop-shadow-lg">
            가게 홍보글,<br />
            네이버에서 검색되는<br />
            <span className="text-sand">글로 만드세요.</span>
          </h2>
          <p className="text-[1.25rem] text-cream leading-relaxed drop-shadow">
            블로그 · 리뷰답글 · 쇼츠기획 · 썸네일
          </p>
        </div>

        {/* 아이콘 이미지 */}
        <div className="rounded-xl overflow-hidden">
          <img
            src="/ownerbot/main.png"
            alt="블로그 리뷰답글 쇼츠기획 썸네일"
            className="w-full"
            style={{ display: 'block', height: 'auto' }}
          />
        </div>

        <div className="w-[80%] flex flex-col gap-3 mx-auto">
          {isLoggedIn && (
            <button
              onClick={() => navigate('/generate')}
              className="w-full py-2 rounded-lg bg-[#b89973] text-darkbrown font-bold text-[1.55rem] hover:bg-camel transition-all active:translate-y-[2px]"
              style={{ boxShadow: '0 4px 0 #7a5c35, 0 8px 16px rgba(0,0,0,0.3)' }}
            >
              콘텐츠 생성 →
            </button>
          )}

          {!isLoggedIn && (
            <button
              onClick={() => navigate('/register')}
              className="w-full h-[60px] flex items-center justify-center rounded-xl bg-[#b89973] text-black font-bold text-[1.35rem] hover:bg-camel transition-all active:translate-y-[2px] shadow-lg"
              style={{ borderBottom: '4px solid rgba(255,255,255,0.55)' }}
            >
              회원가입 — 3크레딧 무료 지급
            </button>
          )}
        </div>

        {isLoggedIn ? (
          <button
            onClick={() => navigate('/mypage')}
            className="w-full py-2 transition-colors text-center mt-4"
          >
            <span className="text-[1.1rem] text-cream block">크레딧 · 내 정보</span>
            <span className="text-sand text-[1.65rem] font-bold block">마이페이지 →</span>
          </button>
        ) : (
          <button
            onClick={() => navigate('/login')}
            className="w-full py-2 transition-colors text-center mt-4"
          >
            <span className="text-[1.1rem] text-cream block">이미 계정이 있으신가요?</span>
            <span className="text-sand text-[1.65rem] font-bold block">로그인 →</span>
          </button>
        )}

      </main>
    </div>
  )
}
