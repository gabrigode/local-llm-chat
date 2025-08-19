import { useState, type KeyboardEvent } from 'react'
import { Send } from 'lucide-react'

interface MessageInputProps {
  onSendMessage: (text: string) => void
}

function MessageInput({ onSendMessage }: MessageInputProps) {
  const [text, setText] = useState('')

  const handleSubmit = () => {
    if (text.trim()) {
      onSendMessage(text)
      setText('')
    }
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSubmit()
    }
  }

  return (
    <div className="flex items-center p-2 bg-gray-900 rounded-lg gap-2">
      <input
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Digite sua mensagem..."
        className="flex-1 bg-transparent border-none focus:ring-0 text-gray-200 placeholder-gray-500"
      />
      <button
        onClick={handleSubmit}
        className="p-2 bg-blue-600 rounded-full text-white hover:bg-blue-700 transition-colors disabled:bg-gray-500"
        disabled={!text.trim()}
      >
        <Send className="h-5 w-5" />
      </button>
    </div>
  )
}

export default MessageInput
