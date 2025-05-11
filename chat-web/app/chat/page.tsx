"use client"
import { useState, useRef, useEffect } from "react"
import type React from "react"

import { MessageSquare, MoreVertical, Send, Plus } from "lucide-react"
import { Avatar } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { ChatMessage } from "@/components/chat-message"
import { cn } from "@/lib/utils"

type Conversation = {
  id: string
  title: string
  preview: string
}

type Message = {
  id: string
  content: string
  isUser: boolean
  timestamp: string
}

export default function ChatPage() {
  const [activeConversation, setActiveConversation] = useState<string | null>("1")
  const [message, setMessage] = useState("")
  const [messages, setMessages] = useState<Message[]>([])
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const todayConversations: Conversation[] = [
    { id: "1", title: "Chatbot Defination...", preview: "Chatbot definition and capabilities" },
    { id: "2", title: "UI/UX Design Service...", preview: "UI/UX design service details" },
    { id: "3", title: "How yo use chatgp...", preview: "How to use chatgpt effectively" },
    { id: "4", title: "If we have a lot of m...", preview: "Handling large amounts of data" },
  ]

  const yesterdayConversations: Conversation[] = [
    { id: "5", title: "Chatbot Defination...", preview: "More about chatbot definitions" },
    { id: "6", title: "Chatbot Defination...", preview: "Advanced chatbot features" },
    { id: "7", title: "Chatbot Defination...", preview: "Chatbot integration options" },
    { id: "8", title: "Chatbot Defination...", preview: "Chatbot performance metrics" },
  ]

  useEffect(() => {
    // Scroll to bottom whenever messages change
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    if (!message.trim()) return

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      content: message,
      isUser: true,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    }

    setMessages((prev) => [...prev, userMessage])
    setMessage("")

    // Simulate bot response
    setTimeout(() => {
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: "This is a placeholder response. The actual API implementation will be done later.",
        isUser: false,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      }
      setMessages((prev) => [...prev, botMessage])
    }, 1000)
  }

  return (
    <div className="flex h-screen bg-[#121212] text-white">
      {/* Sidebar */}
      <div className="w-72 border-r border-gray-800 flex flex-col">
        <div className="p-4 flex items-center gap-2">
          <div className="w-8 h-8 rounded-md bg-cyan-600 flex items-center justify-center">
            <MessageSquare size={18} />
          </div>
          <h1 className="text-xl font-bold">Rag chatbot</h1>
        </div>

        <Button
          variant="outline"
          className="mx-4 my-4 bg-cyan-500 hover:bg-cyan-600 text-white border-none flex items-center gap-2"
        >
          <Plus size={16} />
          New Chat
        </Button>

        <div className="flex-1 overflow-y-auto">
          <div className="px-4 py-2">
            <div className="text-xs text-gray-500 font-medium py-2 border-b border-gray-800">TODAY</div>
            {todayConversations.map((convo) => (
              <div
                key={convo.id}
                className={cn(
                  "flex items-center justify-between py-3 px-2 rounded-md cursor-pointer hover:bg-gray-800",
                  activeConversation === convo.id && "bg-gray-800",
                )}
                onClick={() => setActiveConversation(convo.id)}
              >
                <div className="flex items-center gap-2">
                  <MessageSquare size={16} className="text-gray-400" />
                  <span className="text-sm truncate max-w-[160px]">{convo.title}</span>
                </div>
                <MoreVertical size={16} className="text-gray-500" />
              </div>
            ))}
          </div>

          <div className="px-4 py-2">
            <div className="text-xs text-gray-500 font-medium py-2 border-b border-gray-800">YESTERDAY</div>
            {yesterdayConversations.map((convo) => (
              <div
                key={convo.id}
                className={cn(
                  "flex items-center justify-between py-3 px-2 rounded-md cursor-pointer hover:bg-gray-800",
                  activeConversation === convo.id && "bg-gray-800",
                )}
                onClick={() => setActiveConversation(convo.id)}
              >
                <div className="flex items-center gap-2">
                  <MessageSquare size={16} className="text-gray-400" />
                  <span className="text-sm truncate max-w-[160px]">{convo.title}</span>
                </div>
                <MoreVertical size={16} className="text-gray-500" />
              </div>
            ))}
          </div>
        </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col bg-white text-black">

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto p-6">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center">
              <h1 className="text-3xl font-bold text-center mb-2">Welcome to RAG Chatbot</h1>
              <p className="text-gray-500 text-center mb-6">Ask questions about your documents</p>
            </div>
          ) : (
            <div className="max-w-3xl mx-auto">
              {messages.map((msg) => (
                <ChatMessage key={msg.id} content={msg.content} isUser={msg.isUser} timestamp={msg.timestamp} />
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="p-4 border-t">
          <form onSubmit={handleSendMessage} className="flex items-center gap-2 bg-gray-100 rounded-full px-4 py-2">
            <MessageSquare size={20} className="text-gray-400" />
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type a message to Rag..."
              className="flex-1 bg-transparent border-none outline-none text-sm"
            />
            <Button
              type="submit"
              size="icon"
              className="rounded-full bg-cyan-500 hover:bg-cyan-600 h-8 w-8 p-0"
              disabled={!message.trim()}
            >
              <Send size={16} className="text-white" />
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
