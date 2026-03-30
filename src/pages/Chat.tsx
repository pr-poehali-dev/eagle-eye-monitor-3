import { useState, useEffect, useRef } from "react"
import { useSearchParams } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Icon from "@/components/ui/icon"
import func2url from "../../backend/func2url.json"

interface Message {
  id: string
  sender: "client" | "trainer"
  text: string
  created_at: string
}

export default function Chat() {
  const [params] = useSearchParams()
  const orderId = params.get("order_id") || ""
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [sending, setSending] = useState(false)
  const [status, setStatus] = useState<"loading" | "not_paid" | "ok">("loading")
  const [clientName, setClientName] = useState("")
  const bottomRef = useRef<HTMLDivElement>(null)

  const loadMessages = async () => {
    if (!orderId) { setStatus("not_paid"); return }
    const res = await fetch(`${func2url["chat"]}?order_id=${orderId}`)
    if (res.status === 403 || res.status === 404) { setStatus("not_paid"); return }
    const data = await res.json()
    setMessages(data.messages || [])
    setStatus("ok")
  }

  const loadOrder = async () => {
    if (!orderId) return
    const res = await fetch(`${func2url["get-order"]}?order_id=${orderId}`)
    const data = await res.json()
    if (data.client_name) setClientName(data.client_name)
  }

  useEffect(() => {
    loadMessages()
    loadOrder()
  }, [orderId])

  useEffect(() => {
    if (status === "ok") {
      const interval = setInterval(loadMessages, 5000)
      return () => clearInterval(interval)
    }
  }, [status, orderId])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const sendMessage = async () => {
    if (!input.trim() || sending) return
    setSending(true)
    const text = input.trim()
    setInput("")
    await fetch(func2url["chat"], {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ order_id: orderId, text }),
    })
    await loadMessages()
    setSending(false)
  }

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-gray-400">Загрузка...</div>
      </div>
    )
  }

  if (status === "not_paid") {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center px-4">
        <div className="text-center max-w-sm">
          <div className="w-16 h-16 bg-gray-900 border border-gray-700 rounded-full flex items-center justify-center mx-auto mb-6">
            <Icon name="Lock" size={28} className="text-gray-500" />
          </div>
          <h2 className="text-xl font-bold text-white mb-3">Чат недоступен</h2>
          <p className="text-gray-400 mb-6">Чат откроется после того, как тренер подтвердит твою оплату.</p>
          <a href="/order">
            <Button className="bg-red-500 hover:bg-red-600 text-white">
              Оформить план
            </Button>
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black flex flex-col">
      <div className="border-b border-gray-800 bg-black/90 backdrop-blur px-4 py-3 flex items-center gap-3">
        <div className="w-9 h-9 bg-red-500/20 rounded-full flex items-center justify-center">
          <Icon name="Dumbbell" size={18} className="text-red-400" />
        </div>
        <div>
          <div className="text-white font-semibold text-sm">Тренер Форма Жизни</div>
          <div className="text-gray-500 text-xs">
            {clientName ? `Привет, ${clientName.split(" ")[0]}!` : "Персональный план"}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-3">
        {messages.length === 0 && (
          <div className="text-center text-gray-500 text-sm py-8">
            Тренер скоро напишет тебе. Можешь написать первым!
          </div>
        )}
        {messages.map(msg => (
          <div key={msg.id} className={`flex ${msg.sender === "client" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-xs lg:max-w-md px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
              msg.sender === "client"
                ? "bg-red-500 text-white rounded-br-sm"
                : "bg-gray-800 text-gray-100 rounded-bl-sm"
            }`}>
              {msg.text}
              <div className={`text-xs mt-1 ${msg.sender === "client" ? "text-red-200" : "text-gray-500"}`}>
                {new Date(msg.created_at).toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" })}
              </div>
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      <div className="border-t border-gray-800 bg-black px-4 py-3">
        <div className="flex gap-2 max-w-2xl mx-auto">
          <Input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && !e.shiftKey && sendMessage()}
            placeholder="Написать тренеру..."
            className="bg-gray-900 border-gray-700 text-white placeholder:text-gray-500 focus:border-red-500"
          />
          <Button
            onClick={sendMessage}
            disabled={!input.trim() || sending}
            className="bg-red-500 hover:bg-red-600 text-white px-4"
          >
            <Icon name="Send" size={18} />
          </Button>
        </div>
      </div>
    </div>
  )
}
