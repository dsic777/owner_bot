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
    <div className="text-cream flex flex-col relative overflow-hidden" style={{ background: '#020609', height: '100dvh' }}>
      <NightBackground noBuilding />

      {/* AI 마케팅 자동화 뱃지 */}
      <div className="absolute top-9 left-5 z-10">
        <span className="text-[1.05rem] px-4 py-1.5 rounded-full bg-white/10 text-cream border border-sand/60 backdrop-blur-sm">
          AI 마케팅 자동화
        </span>
      </div>

      <main className="relative z-10 flex-1 flex flex-col justify-between px-6 pt-[88px] pb-10">

        {/* 상단: 타이틀 + 이미지 + CTA */}
        <div className="flex flex-col gap-5">

          <div className="text-center">
            <h2 className="text-[2.4rem] font-bold leading-snug drop-shadow-lg mb-2">
              가게 홍보글,<br />
              네이버에서 검색되는<br />
              <span className="text-sand">글로 만드세요.</span>
            </h2>
            <p className="text-[1.05rem] text-cream/70 tracking-wide">
              블로그 · 리뷰답글 · 쇼츠기획 · 썸네일
            </p>
          </div>

          {/* 아이콘 이미지 */}
          <div className="w-full overflow-hidden rounded-2xl" style={{ height: '118px' }}>
            <img
              src={`${import.meta.env.BASE_URL}main.png`}
              alt="블로그 리뷰답글 쇼츠기획 썸네일"
              className="w-full h-full object-cover"
              style={{ objectPosition: 'center 30%' }}
            />
          </div>

          {/* CTA 버튼 */}
          {isLoggedIn ? (
            <button
              onClick={() => navigate('/generate')}
              className="w-full py-3 rounded-xl bg-[#b89973] text-black font-bold text-[1.5rem] hover:bg-camel transition-all active:translate-y-[2px]"
              style={{ boxShadow: '0 4px 0 #7a5c35, 0 8px 16px rgba(0,0,0,0.35)' }}
            >
              콘텐츠 생성 →
            </button>
          ) : (
            <button
              onClick={() => navigate('/register')}
              className="w-full py-3 rounded-xl bg-[#b89973] text-black font-bold text-[1.35rem] hover:bg-camel transition-all active:translate-y-[2px]"
              style={{ boxShadow: '0 4px 0 #7a5c35, 0 8px 16px rgba(0,0,0,0.35)' }}
            >
              회원가입 → 3크레딧 무료지급
            </button>
          )}

        </div>

        {/* 하단: 로그인 / 마이페이지 */}
        <div className="flex flex-col items-center gap-3">
          {isLoggedIn ? (
            <button onClick={() => navigate('/mypage')} className="text-center">
              <span className="text-[1.0rem] text-cream/60 block mb-1">크레딧 · 내 정보</span>
              <span className="text-sand text-[1.5rem] font-bold block">마이페이지 →</span>
            </button>
          ) : (
            <>
              <span className="text-[1.1rem] text-cream/80">이미 계정이 있으신가요?</span>
              <button
                onClick={() => navigate('/login')}
                className="px-12 py-[10px] rounded-xl bg-[#b89973] text-black font-bold text-[1.35rem] hover:bg-camel transition-all active:translate-y-[2px]"
                style={{ boxShadow: '0 4px 0 #7a5c35, 0 8px 16px rgba(0,0,0,0.35)' }}
              >
                로그인 →
              </button>
            </>
          )}
        </div>

      </main>
    </div>
  )
}
