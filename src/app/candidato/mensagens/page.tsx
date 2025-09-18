'use client'

import { useSession } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState, Suspense } from 'react'
import { Send, ArrowLeft, Building, Search, MessageCircle, Clock, Loader2 } from 'lucide-react'

interface Message {
  id: string
  content: string
  createdAt: string
  sender: {
    id: string
    name: string
    role: 'COMPANY' | 'CANDIDATE'
  }
  recipient: {
    id: string
    name: string
    role: 'COMPANY' | 'CANDIDATE'
  }
}

interface Conversation {
  companyId: string
  companyName: string
  companyEmail: string
  companyLogo?: string
  lastMessage?: Message
  unreadCount: number
  messages: Message[]
}

function CandidateMessagesContent() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const searchParams = useSearchParams()
  const empresaId = searchParams.get('empresa')
  
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedConversation, setSelectedConversation] = useState<string | null>(empresaId)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    if (status === 'loading') return
    
    if (!session || session.user.role !== 'CANDIDATE') {
      router.push('/login')
      return
    }

    fetchConversations()
  }, [session, status, router])

  useEffect(() => {
    if (selectedConversation) {
      fetchMessages(selectedConversation)
    }
  }, [selectedConversation])

  const fetchConversations = async () => {
    try {
      const response = await fetch('/api/candidate/messages/conversations')
      if (response.ok) {
        const data = await response.json()
        setConversations(data)
        
        // Se há uma empresa específica na URL, selecione automaticamente
        if (empresaId && data.find((conv: Conversation) => conv.companyId === empresaId)) {
          setSelectedConversation(empresaId)
        }
      }
    } catch (error) {
      console.error('Erro ao carregar conversas:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchMessages = async (companyId: string) => {
    try {
      const response = await fetch(`/api/candidate/messages?companyId=${companyId}`)
      if (response.ok) {
        const data = await response.json()
        setMessages(data)
        
        // Marcar mensagens como lidas
        await markAsRead(companyId)
      }
    } catch (error) {
      console.error('Erro ao carregar mensagens:', error)
    }
  }

  const markAsRead = async (companyId: string) => {
    try {
      await fetch('/api/candidate/messages/mark-read', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ companyId })
      })
      
      // Atualizar contador de não lidas
      setConversations(prev => 
        prev.map(conv => 
          conv.companyId === companyId 
            ? { ...conv, unreadCount: 0 }
            : conv
        )
      )
    } catch (error) {
      console.error('Erro ao marcar como lida:', error)
    }
  }

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation || sending) return

    setSending(true)
    try {
      const response = await fetch('/api/candidate/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          companyId: selectedConversation,
          content: newMessage.trim()
        })
      })

      if (response.ok) {
        const sentMessage = await response.json()
        setMessages(prev => [...prev, sentMessage])
        setNewMessage('')
        
        // Atualizar a última mensagem na conversa
        setConversations(prev => 
          prev.map(conv => 
            conv.companyId === selectedConversation
              ? { ...conv, lastMessage: sentMessage }
              : conv
          )
        )
      } else {
        const error = await response.json()
        alert(error.error || 'Erro ao enviar mensagem')
      }
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error)
      alert('Erro ao enviar mensagem')
    } finally {
      setSending(false)
    }
  }

  const filteredConversations = conversations.filter(conv =>
    conv.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    conv.companyEmail.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const selectedConversationData = conversations.find(conv => conv.companyId === selectedConversation)

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando mensagens...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <button
                onClick={() => router.push('/candidato')}
                className="mr-4 p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label="Voltar ao dashboard"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Mensagens</h1>
                <p className="text-gray-600 mt-1">Converse com empresas interessadas</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow h-[calc(100vh-200px)] flex">
          {/* Conversations List */}
          <div className="w-1/3 border-r border-gray-200 flex flex-col">
            {/* Search */}
            <div className="p-4 border-b border-gray-200">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Buscar empresas..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Conversations */}
            <div className="flex-1 overflow-y-auto">
              {filteredConversations.length === 0 ? (
                <div className="text-center py-12">
                  <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma conversa</h3>
                  <p className="text-gray-600">Você ainda não tem conversas com empresas.</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {filteredConversations.map((conversation) => (
                    <button
                      key={conversation.companyId}
                      onClick={() => setSelectedConversation(conversation.companyId)}
                      className={`w-full p-4 text-left hover:bg-gray-50 transition-colors ${
                        selectedConversation === conversation.companyId ? 'bg-blue-50 border-r-2 border-blue-500' : ''
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center">
                          {conversation.companyLogo ? (
                            <img
                              src={conversation.companyLogo}
                              alt={conversation.companyName}
                              className="w-8 h-8 rounded-full mr-3 object-cover"
                            />
                          ) : (
                            <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center mr-3">
                              <Building className="h-4 w-4" />
                            </div>
                          )}
                          <h3 className="font-medium text-gray-900 truncate">
                            {conversation.companyName}
                          </h3>
                        </div>
                        {conversation.unreadCount > 0 && (
                          <span className="bg-blue-600 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
                            {conversation.unreadCount}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 truncate mb-1 ml-11">
                        {conversation.companyEmail}
                      </p>
                      {conversation.lastMessage && (
                        <div className="flex items-center justify-between ml-11">
                          <p className="text-sm text-gray-500 truncate flex-1 mr-2">
                            {conversation.lastMessage.content}
                          </p>
                          <span className="text-xs text-gray-400 flex items-center">
                            <Clock className="h-3 w-3 mr-1" />
                            {new Date(conversation.lastMessage.createdAt).toLocaleDateString('pt-BR')}
                          </span>
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 flex flex-col">
            {selectedConversation ? (
              <>
                {/* Chat Header */}
                <div className="p-4 border-b border-gray-200 bg-gray-50">
                  <div className="flex items-center">
                    {selectedConversationData?.companyLogo ? (
                      <img
                        src={selectedConversationData.companyLogo}
                        alt={selectedConversationData.companyName}
                        className="w-10 h-10 rounded-full mr-3 object-cover"
                      />
                    ) : (
                      <div className="bg-blue-600 text-white rounded-full w-10 h-10 flex items-center justify-center mr-3">
                        <Building className="h-5 w-5" />
                      </div>
                    )}
                    <div>
                      <h2 className="font-medium text-gray-900">
                        {selectedConversationData?.companyName}
                      </h2>
                      <p className="text-sm text-gray-600">
                        {selectedConversationData?.companyEmail}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages.length === 0 ? (
                    <div className="text-center py-12">
                      <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma mensagem ainda</h3>
                      <p className="text-gray-600">Aguarde uma mensagem da empresa ou responda quando receber uma.</p>
                    </div>
                  ) : (
                    messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${
                          message.sender.role === 'CANDIDATE' ? 'justify-end' : 'justify-start'
                        }`}
                      >
                        <div
                          className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                            message.sender.role === 'CANDIDATE'
                              ? 'bg-blue-600 text-white'
                              : 'bg-gray-200 text-gray-900'
                          }`}
                        >
                          <p className="text-sm">{message.content}</p>
                          <p
                            className={`text-xs mt-1 ${
                              message.sender.role === 'CANDIDATE' ? 'text-blue-100' : 'text-gray-500'
                            }`}
                          >
                            {new Date(message.createdAt).toLocaleString('pt-BR')}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Message Input */}
                <div className="p-4 border-t border-gray-200">
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                      placeholder="Digite sua resposta..."
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      disabled={sending}
                    />
                    <button
                      onClick={sendMessage}
                      disabled={!newMessage.trim() || sending}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {sending ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      ) : (
                        <Send className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <MessageCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-medium text-gray-900 mb-2">Selecione uma conversa</h3>
                  <p className="text-gray-600">Escolha uma empresa para ver suas mensagens.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}

export default function CandidateMessages() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    }>
      <CandidateMessagesContent />
    </Suspense>
  )
}