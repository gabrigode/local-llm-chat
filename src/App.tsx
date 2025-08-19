import { useState } from 'react'
import { useLlm } from './hooks/useLlm'
import ChatWindow from './components/ChatWindow'
import MessageInput from './components/MessageInput'
import FileUploader from './components/FileUploader'
import { LoaderCircle, AlertTriangle } from 'lucide-react'

export interface Message {
  id: number
  text: string
  sender: 'user' | 'bot'
}

export interface ContextFile {
  name: string
  content: string
}

function App() {
  const [messages, setMessages] = useState<Message[]>([])
  const [contextFile, setContextFile] = useState<ContextFile | null>(null)
  const { llm, status, error } = useLlm()

  const handleSendMessage = async (text: string) => {
    if (!llm || !text.trim()) return

    const userMessage: Message = {
      id: Date.now(),
      text,
      sender: 'user',
    }
    setMessages((prev) => [...prev, userMessage])

    const botMessage: Message = {
      id: Date.now() + 1,
      text: '',
      sender: 'bot',
    }
    setMessages((prev) => [...prev, botMessage])

    try {
      const prompt = contextFile
        ? `Contexto (arquivo ${contextFile.name}): ${contextFile.content} \n\nPergunta: ${text} \n\nResposta:`
        : text

      const stream = await llm.generateResponse(prompt)

      for await (const partialResponse of stream) {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === botMessage.id
              ? { ...msg, text: msg.text + partialResponse }
              : msg
          )
        )
      }
    } catch (e) {
      console.error(e)
      const errorMessage =
        e instanceof Error ? e.message : 'Ocorreu um erro desconhecido.'
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === botMessage.id
            ? { ...msg, text: `Erro: ${errorMessage}` }
            : msg
        )
      )
    }
  }

  const handleFileLoaded = (fileName: string, fileContent: string) => {
    setContextFile({ name: fileName, content: fileContent })
    setMessages([
      {
        id: Date.now(),
        text: 'Arquivo de contexto carregado. Agora você pode fazer perguntas sobre ele.',
        sender: 'bot',
      },
    ])
  }

  const handleRemoveFile = () => {
    setContextFile(null)
  }

  return (
    <div className="flex flex-col h-screen bg-gray-800 text-gray-100">
      <header className="bg-gray-900 p-4 shadow-md text-center">
        <h1 className="text-2xl font-bold">Local LLM Chat</h1>
        <p className="text-sm text-gray-400">
          Faça upload de um .txt para dar contexto ao bot
        </p>
      </header>

      <main className="flex-1 flex flex-col p-4 overflow-hidden">
        {status === 'loading' && (
          <div className="flex flex-col items-center justify-center h-full">
            <LoaderCircle className="animate-spin h-12 w-12 mb-4" />
            <p className="text-lg">Carregando o modelo de linguagem...</p>
            <p className="text-sm text-gray-400">
              Isso pode levar alguns instantes.
            </p>
          </div>
        )}

        {status === 'error' && (
          <div className="flex flex-col items-center justify-center h-full text-red-400">
            <AlertTriangle className="h-12 w-12 mb-4" />
            <p className="text-lg font-semibold">Falha ao carregar o modelo</p>
            <p className="text-sm text-center max-w-md">{error}</p>
          </div>
        )}

        {status === 'ready' && (
          <div className="flex flex-col flex-1 h-full">
            <FileUploader
              fileName={contextFile?.name}
              onFileLoaded={handleFileLoaded}
              onRemoveFile={handleRemoveFile}
            />
            <ChatWindow messages={messages} />
            <MessageInput onSendMessage={handleSendMessage} />
          </div>
        )}
      </main>
    </div>
  )
}

export default App
