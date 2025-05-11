import { cn } from "@/lib/utils"
import { Avatar } from "@/components/ui/avatar"

type ChatMessageProps = {
  content: string
  isUser: boolean
  timestamp?: string
}

export function ChatMessage({ content, isUser, timestamp }: ChatMessageProps) {
  return (
    <div className={cn("flex w-full gap-3 mb-4", isUser ? "justify-end" : "justify-start")}>
      {!isUser && (
        <Avatar className="h-8 w-8 mt-1">
          <img src="/placeholder.svg?height=32&width=32" alt="Bot" />
        </Avatar>
      )}

      <div
        className={cn("max-w-[80%] rounded-lg p-3", isUser ? "bg-cyan-500 text-white" : "bg-gray-100 text-gray-900")}
      >
        <p className="text-sm">{content}</p>
        {timestamp && <div className={cn("text-xs mt-1", isUser ? "text-cyan-100" : "text-gray-500")}>{timestamp}</div>}
      </div>

      {isUser && (
        <Avatar className="h-8 w-8 mt-1">
          <img src="/placeholder.svg?height=32&width=32" alt="User" />
        </Avatar>
      )}
    </div>
  )
}
