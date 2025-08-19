import { useEffect, useRef } from 'react'
import { type Message } from '../App'
import { LoaderCircle } from 'lucide-react'

interface ChatWindowProps {
  messages: Message[]
}

function ChatWindow({ messages }: ChatWindowProps) {
  const endOfMessagesRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  return (
    <div className="flex-1 overflow-y-auto p-4 bg-gray-700/50 rounded-lg my-4">
      <div className="space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${
              msg.sender === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            <div
              className={`max-w-lg lg:max-w-2xl px-4 py-2 rounded-xl ${
                msg.sender === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-600 text-gray-200'
              }`}
            >
              {msg.text}
              {msg.sender === 'bot' && !msg.text && (
                <LoaderCircle className="animate-spin h-5 w-5" />
              )}
            </div>
          </div>
        ))}
        <div ref={endOfMessagesRef} />
      </div>
    </div>
  )
}

export default ChatWindow
