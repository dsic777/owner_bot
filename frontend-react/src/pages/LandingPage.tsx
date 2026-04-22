import { useNavigate } from 'react-router-dom'
import NightBackground from '../components/NightBackground'

const CONTENT_TYPES = [
  { icon: '📝', title: '블로그' },
  { icon: '⭐', title: '리뷰답글' },
  { icon: '🎬', title: '쇼츠기획' },
  { icon: '🖼️', title: '썸네일' },
]

export default function LandingPage() {
  const navigate = useNavigate()
  const isLoggedIn = !!localStorage.getItem('token')

  return (
    <div className="h-screen text-cream flex flex-col overflow-hidden relative" style={{ background: '#020609' }}>
      <NightBackground />

      {/* AI 마케팅 자동화 뱃지 */}
      <div className="absolute top-9 left-5 z-10">
        <span className="text-base px-4 py-1.5 rounded-full bg-white/10 text-cream border-2 border-sand backdrop-blur-sm">
          AI 마케팅 자동화
        </span>
      </div>

      {/* 메인 콘텐츠 */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 gap-4">

        <div className="text-center">
          <h2 className="text-[2rem] font-bold leading-tight mb-3 drop-shadow-lg">
            사장님의 마케팅<br />
            <span className="text-sand">AI가 대신합니다</span>
          </h2>
          <p className="text-base text-cream leading-relaxed drop-shadow">
            블로그 · 리뷰답글 · 쇼츠기획 · 썸네일
          </p>
        </div>

        <div className="flex gap-6 justify-center">
          {CONTENT_TYPES.map((item) => (
            <div key={item.title} className="flex flex-col items-center gap-1">
              <span className="text-3xl drop-shadow-lg">{item.icon}</span>
              <span className="text-xs text-cream">{item.title}</span>
            </div>
          ))}
        </div>

        <div className="w-[80%] flex flex-col gap-3 mx-auto">
          <button
            onClick={() => navigate('/generate')}
            className="w-full py-2 rounded-lg bg-[#b89973] text-navy font-bold text-[1.4rem] hover:bg-camel transition-colors shadow-lg"
          >
            {isLoggedIn ? '콘텐츠 생성 →' : '무료 체험하기'}
          </button>

          {!isLoggedIn && (
            <button
              onClick={() => navigate('/register')}
              className="w-full py-2 rounded-lg border border-white/30 text-cream text-[0.875rem] hover:border-sand hover:text-sand transition-colors backdrop-blur-sm"
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
            <span className="text-cream text-lg block">크레딧 · 내 정보</span>
            <span className="text-sand text-2xl font-bold block">마이페이지 →</span>
          </button>
        ) : (
          <button
            onClick={() => navigate('/login')}
            className="w-full py-2 transition-colors text-center mt-4"
          >
            <span className="text-cream text-lg block">이미 계정이 있으신가요?</span>
            <span className="text-sand text-2xl font-bold block">로그인 →</span>
          </button>
        )}

      </main>
    </div>
  )
}
