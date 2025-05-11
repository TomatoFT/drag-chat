"use client"
import React, { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import ReactMarkdown from "react-markdown"

import { Upload, MoreVertical, Send, MessageSquare, Plus } from "lucide-react"
import { Avatar } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { 
  uploadDocument, 
  getChats, 
  createChat, 
  deleteChat, 
  askQuestion,
  getChat
} from "../services/api"
import { Chat, Message } from "../types"

export default function ChatPage() {
  const [mounted, setMounted] = useState(false)
  const [activeChat, setActiveChat] = useState<string | null>(null)
  const [message, setMessage] = useState("")
  const [isUploading, setIsUploading] = useState(false)
  const [chats, setChats] = useState<Chat[]>([])
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [showIntro, setShowIntro] = useState<{[key:number]: boolean}>({})
  const [modalContent, setModalContent] = useState<string | null>(null)
  const [modalHighlight, setModalHighlight] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [claimModal, setClaimModal] = useState<null | {claim: string, verification: string, source: string}>(null)
  const modalRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    loadChats()
  }, [])

  useEffect(() => {
    if (activeChat) {
      loadChatMessages(activeChat)
    }
  }, [activeChat])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    if (messages.length > 0) {
      const lastIdx = messages.length - 1
      const msg = messages[lastIdx]
      if (msg.answer && msg.answer.includes('Answer:') && msg.answer.includes('Context:')) {
        setShowIntro(prev => ({...prev, [lastIdx]: true}))
        setTimeout(() => {
          setShowIntro(prev => ({...prev, [lastIdx]: false}))
        }, 2000)
      }
    }
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const loadChats = async () => {
    try {
      const chatList = await getChats()
      setChats(chatList)
    } catch (error) {
      console.error('Failed to load chats:', error)
    }
  }

  const loadChatMessages = async (chatId: string) => {
    try {
      const chat = await getChat(chatId)
      setMessages(chat.messages || [])
    } catch (error) {
      console.error('Failed to load chat messages:', error)
    }
  }

  const handleFileUpload = () => {
    console.log('handleFileUpload called, ref:', fileInputRef.current);
    fileInputRef.current?.click()
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log('File input event:', e);
    const files = e.target.files
    if (files && files.length > 0) {
      setIsUploading(true)
      try {
        const document = await uploadDocument(files[0])
        const newChat = await createChat(files[0].name, document._id)
        setChats(prev => [...prev, newChat])
        setActiveChat(newChat.id)
        setMessages([]) // Reset messages khi tạo chat mới
        await loadChatMessages(newChat.id) // Đảm bảo chuyển sang trang chat mới
      } catch (error) {
        console.error('Failed to upload document:', error)
      } finally {
        setIsUploading(false)
        if (fileInputRef.current) fileInputRef.current.value = "";
      }
    } else {
      console.log('No file selected or event not fired correctly');
    }
  }

  const handleSendMessage = async () => {
    if (!message.trim() || !activeChat || isLoading) return

    setIsLoading(true)
    setIsSending(true)
    const tempMessage = message
    setMessage("")

    // Chỉ thêm message loading
    setMessages(prev => ([
      ...prev,
      { question: tempMessage, answer: "__TYPING__", timestamp: new Date().toISOString() }
    ]))

    try {
      // Giả lập delay như ChatGPT
      await new Promise(res => setTimeout(res, 700))
      const response = await askQuestion(activeChat, tempMessage)
      setMessages(prev => {
        // Thay thế message loading cuối cùng bằng response
        const newMsgs = [...prev]
        if (newMsgs.length > 0 && newMsgs[newMsgs.length-1].answer === "__TYPING__") {
          newMsgs[newMsgs.length-1] = response
        }
        return newMsgs
      })
    } catch (error) {
      console.error('Failed to send message:', error)
      setMessage(tempMessage)
      setMessages(prev => prev.filter(m => m.answer !== "__TYPING__"))
    } finally {
      setIsLoading(false)
      setIsSending(false)
    }
  }

  const handleDeleteChat = async (chatId: string) => {
    try {
      await deleteChat(chatId)
      setChats(chats.filter(chat => chat.id !== chatId))
      if (activeChat === chatId) {
        setActiveChat(null)
      }
    } catch (error) {
      console.error('Failed to delete chat:', error)
    }
  }

  const splitAnswer = (answer: string) => {
    if (!answer.includes('Answer:') || !answer.includes('Context:')) return { intro: '', rest: answer }
    const answerIdx = answer.indexOf('Answer:')
    const contextIdx = answer.indexOf('Context:')
    const contextEndIdx = answer.indexOf('---', contextIdx)
    let intro = ''
    let rest = ''
    if (contextEndIdx !== -1) {
      intro = answer.substring(answerIdx, contextEndIdx).trim()
      rest = answer.substring(contextEndIdx).trim()
    } else {
      intro = answer.substring(answerIdx, contextIdx) + answer.substring(contextIdx)
      rest = ''
    }
    return { intro, rest }
  }

  const splitRetrievedContent = (answer: string) => {
    // Tìm cả trường hợp có hoặc không có dấu cách ở đầu
    const match = answer.match(/\s?Retrieved_content:/);
    const retrievedIdx = typeof match?.index === 'number' ? match.index : -1;
    if (retrievedIdx === -1) return { before: answer, retrieved: '', after: '' }
    const before = answer.substring(0, retrievedIdx)
    const after = answer.substring(retrievedIdx)
    const endIdx = after.indexOf('---')
    let retrieved = ''
    let rest = ''
    if (endIdx !== -1) {
      retrieved = after.substring(0, endIdx)
      rest = after.substring(endIdx)
    } else {
      retrieved = after
      rest = ''
    }
    return { before, retrieved, after: rest }
  }

  // Hàm tách fact checking từ answer nếu không có trường factChecking
  function extractFactChecking(answer: string): string | null {
    const factIdx = answer.indexOf('Fact Checking:');
    if (factIdx === -1) return null;
    // Lấy phần sau 'Fact Checking:'
    let factPart = answer.substring(factIdx + 'Fact Checking:'.length).trim();
    // Nếu có Retrieved_content hoặc --- thì cắt đến đó
    const retrievedIdx = factPart.indexOf('Retrieved_content:');
    const dashIdx = factPart.indexOf('---');
    let endIdx = -1;
    if (retrievedIdx !== -1) endIdx = retrievedIdx;
    else if (dashIdx !== -1) endIdx = dashIdx;
    if (endIdx !== -1) factPart = factPart.substring(0, endIdx).trim();
    return factPart;
  }

  // Hàm parse claims và verifications từ answer và factChecking
  function parseClaimsAndVerifications(answer: string, factChecking: string) {
    // Tách các claim
    const claimRegex = /Claim: ([\s\S]*?)\nVerification: "([\s\S]*?)" \(Source: ([\s\S]*?)\)/g;
    const claims = [];
    let match;
    while ((match = claimRegex.exec(factChecking)) !== null) {
      claims.push({
        claim: match[1].trim(),
        verification: match[2].trim(),
        source: match[3].trim(),
      });
    }
    return claims;
  }

  // Hàm escapeHTML để tránh XSS
  function escapeHTML(str: string) {
    return str.replace(/[&<>'"]/g, tag => (
      ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        "'": '&#39;',
        '"': '&quot;'
      } as any)[tag]
    ));
  }

  // Thêm component TypingIndicator
  const TypingIndicator = () => (
    <div className="flex items-center gap-2 mt-2">
      <span className="block w-2 h-2 bg-cyan-500 rounded-full animate-bounce [animation-delay:-0.32s]"></span>
      <span className="block w-2 h-2 bg-cyan-500 rounded-full animate-bounce [animation-delay:-0.16s]"></span>
      <span className="block w-2 h-2 bg-cyan-500 rounded-full animate-bounce"></span>
      <span className="ml-2 text-gray-500 text-xs">Rag is typing...</span>
    </div>
  )

  if (!mounted) return null

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
          onClick={handleFileUpload}
          disabled={isUploading}
        >
          <Plus size={16} />
          New Chat
        </Button>

        <div className="flex-1 overflow-y-auto">
          <AnimatePresence>
            {chats.map((chat) => (
              <motion.div
                key={chat.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className={cn(
                  "flex items-center justify-between py-3 px-2 rounded-md cursor-pointer hover:bg-gray-800",
                  activeChat === chat.id && "bg-gray-800",
                )}
                onClick={() => setActiveChat(chat.id)}
              >
                <div className="flex items-center gap-2">
                  <MessageSquare size={16} className="text-gray-400" />
                  <span className="text-sm truncate max-w-[160px]">{chat.name}</span>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    handleDeleteChat(chat.id)
                  }}
                  className="text-gray-500 hover:text-red-500"
                >
                  <MoreVertical size={16} />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        <div className="p-4 border-t border-gray-800 flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <img src="/placeholder.svg?height=32&width=32" alt="User" />
          </Avatar>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col bg-white text-black">
        {/* Header */}

        {/* Chat Area */}
        {activeChat ? (
          <div className="flex-1 overflow-y-auto p-6">
            <AnimatePresence>
              {messages.map((msg, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="mb-4"
                >
                  <div className="bg-gray-100 p-3 rounded-lg mb-2">
                    <p className="font-medium">Q: {msg.question}</p>
                  </div>
                  <div className="bg-cyan-50 p-3 rounded-lg min-h-[32px] flex items-center">
                    {msg.answer === "__TYPING__" ? <TypingIndicator /> : (
                      <div className="prose prose-sm max-w-none">
                        <ReactMarkdown>
                          {(() => {
                            const factIdx = msg.answer.indexOf('Fact Checking:');
                            return factIdx !== -1 ? msg.answer.substring(0, factIdx).trim() : msg.answer;
                          })()}
                        </ReactMarkdown>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            <div ref={messagesEndRef} />
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto p-6 flex flex-col items-center justify-center">
            <h1 className="text-4xl font-bold text-center mb-4">Please Upload the Documents</h1>
            <h2 className="text-4xl font-bold text-center mb-12">Before you ask Rag</h2>

            <div className="border-2 border-dashed border-cyan-300 rounded-lg p-12 w-full max-w-2xl flex flex-col items-center">
              <div className="bg-cyan-500 text-white p-4 rounded-full mb-4">
                <Upload size={24} />
              </div>
              <p className="text-center mb-2">Drag and Drop Or</p>
              <button onClick={handleFileUpload} className="text-cyan-500 font-medium">
                Browse File
              </button>
            </div>
          </div>
        )}

        {/* Input Area */}
        {activeChat && (
          <div className="p-4 border-t">
            <div className="flex items-center gap-2 bg-gray-100 rounded-full px-4 py-2">
              <MessageSquare size={20} className="text-gray-400" />
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Type a message to Rag..."
                className="flex-1 bg-transparent border-none outline-none text-sm"
              />
              <Button 
                size="icon" 
                className={cn(
                  "rounded-full h-8 w-8 p-0",
                  isSending ? "bg-gray-400" : "bg-cyan-500 hover:bg-cyan-600"
                )}
                onClick={handleSendMessage}
              >
                {isSending ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  >
                    <Send size={16} className="text-white" />
                  </motion.div>
                ) : (
                  <Send size={16} className="text-white" />
                )}
              </Button>
            </div>
          </div>
        )}
      </div>

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept=".pdf,.doc,.docx,.txt"
      />
    </div>
  )
}
