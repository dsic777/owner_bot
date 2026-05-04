import { useState, useRef, useEffect } from 'react'

const MAX_SILENT = 2

export function useVoiceInput() {
  const [isListening, setIsListening] = useState(false)
  const [activeField, setActiveField] = useState<string | null>(null)
  const [voiceStatus, setVoiceStatus] = useState('')

  const recognitionRef = useRef<any>(null)
  const keepListeningRef = useRef(false)
  const silentRestartRef = useRef(0)
  const onResultRef = useRef<((text: string) => void) | null>(null)

  useEffect(() => {
    return () => {
      keepListeningRef.current = false
      try { recognitionRef.current?.abort() } catch (_) {}
    }
  }, [])

  const stopVoice = () => {
    keepListeningRef.current = false
    try { recognitionRef.current?.stop() } catch (_) {}
    setIsListening(false)
    setActiveField(null)
    setVoiceStatus('')
  }

  const startVoice = (field: string, onResult: (text: string) => void) => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SR) { setVoiceStatus('크롬 브라우저를 사용해주세요.'); return }

    keepListeningRef.current = false
    try { recognitionRef.current?.abort() } catch (_) {}
    recognitionRef.current = null

    onResultRef.current = onResult
    setActiveField(field)
    keepListeningRef.current = true
    silentRestartRef.current = 0

    const recognition = new SR()
    recognition.lang = 'ko-KR'
    recognition.continuous = false
    recognition.interimResults = true
    recognitionRef.current = recognition

    recognition.onstart = () => { setIsListening(true); setVoiceStatus('듣고 있어요... 🎤') }

    recognition.onresult = (event: any) => {
      let finalText = '', interim = ''
      for (let i = 0; i < event.results.length; i++) {
        if (event.results[i].isFinal) finalText += event.results[i][0].transcript
        else interim += event.results[i][0].transcript
      }
      if (interim) setVoiceStatus(`인식 중: ${interim}`)
      if (finalText) {
        silentRestartRef.current = 0
        onResultRef.current?.(finalText.trim())
      }
    }

    recognition.onerror = (e: any) => {
      if (e.error === 'no-speech') return
      keepListeningRef.current = false
      setIsListening(false)
      setActiveField(null)
      setVoiceStatus('다시 시도해주세요.')
    }

    recognition.onend = () => {
      if (!keepListeningRef.current) { setIsListening(false); setActiveField(null); return }
      silentRestartRef.current += 1
      if (silentRestartRef.current > MAX_SILENT) {
        keepListeningRef.current = false
        recognitionRef.current = null
        setIsListening(false)
        setActiveField(null)
        setVoiceStatus('⏱ 무응답으로 종료됐어요.')
      } else {
        try { recognition.start() } catch (_) {
          keepListeningRef.current = false
          setIsListening(false)
          setActiveField(null)
        }
      }
    }

    recognition.start()
  }

  return { isListening, activeField, voiceStatus, startVoice, stopVoice }
}
