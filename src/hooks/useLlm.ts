import { useState, useEffect, useRef } from 'react'
import { LlmInference, FilesetResolver } from '@mediapipe/tasks-genai'

type LlmStatus = 'idle' | 'loading' | 'ready' | 'error'

const MODEL_URL = '/models/gemma2-2b-it-gpu-int8.bin'

export function useLlm() {
  const [status, setStatus] = useState<LlmStatus>('idle')
  const [error, setError] = useState<string | null>(null)
  const llmInference = useRef<LlmInference | null>(null)

  useEffect(() => {
    const initializeLlm = async () => {
      setStatus('loading')
      setError(null)
      try {
        const genaiFileset = await FilesetResolver.forGenAiTasks(
          'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-genai@latest/wasm'
        )

        const llm = await LlmInference.createFromOptions(genaiFileset, {
          baseOptions: {
            modelAssetPath: MODEL_URL,
          },
          maxTokens: 1024,
          randomSeed: Date.now(),
        })

        llmInference.current = llm
        setStatus('ready')
      } catch (e) {
        const errorMessage =
          e instanceof Error
            ? e.message
            : 'Ocorreu um erro desconhecido ao carregar o modelo.'
        console.error('Erro ao inicializar o LLM:', e)
        setError(errorMessage)
        setStatus('error')
      }
    }

    initializeLlm()

    return () => {
      llmInference.current?.close()
      llmInference.current = null
    }
  }, [])

  return { llm: llmInference.current, status, error }
}
