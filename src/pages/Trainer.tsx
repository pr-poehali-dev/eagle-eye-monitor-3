import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Icon from "@/components/ui/icon"
import func2url from "../../backend/func2url.json"

const TRAINER_SECRET = "forma_zhizni_trainer_2026"

interface Order {
  id: string
  client_name: string
  client_phone: string
  goal: string
  status: string
  created_at: string
}

interface Message {
  id: string
  sender: "client" | "trainer"
  text: string
  created_at: string
}

interface OrderDetail {
  id: string
  client_name: string
  client_phone: string
  age: number | null
  weight: string | null
  height: string | null
  gender: string | null
  activity_level: string | null
  goal: string | null
  health_notes: string | null
  status: string
}

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  pending_payment: { label: "Не оплачено", color: "text-gray-400" },
  awaiting_verification: { label: "Ожидает проверки", color: "text-yellow-400" },
  paid: { label: "Оплачено", color: "text-green-400" },
}

const ACTIVITY_LABELS: Record<string, string> = {
  low: "Малоподвижный", medium: "Умеренный", high: "Активный", very_high: "Очень активный"
}
const GENDER_LABELS: Record<string, string> = { male: "Мужской", female: "Женский" }

export default function Trainer() {
  const [auth, setAuth] = useState(false)
  const [password, setPassword] = useState("")
  const [orders, setOrders] = useState<Order[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [orderDetail, setOrderDetail] = useState<OrderDetail | null>(null)
  const [input, setInput] = useState("")
  const [sending, setSending] = useState(false)
  const [approving, setApproving] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  const loadOrders = async () => {
    const res = await fetch(`${func2url["get-order"]}?secret=${TRAINER_SECRET}`)
    const data = await res.json()
    setOrders(data.orders || [])
  }

  const loadChat = async (id: string) => {
    const res = await fetch(`${func2url["chat"]}?order_id=${id}&secret=${TRAINER_SECRET}`)
    const data = await res.json()
    setMessages(data.messages || [])
    if (data.order) setOrderDetail(data.order)
  }

  useEffect(() => {
    if (auth) {
      loadOrders()
      const interval = setInterval(loadOrders, 10000)
      return () => clearInterval(interval)
    }
  }, [auth])

  useEffect(() => {
    if (auth && selectedId) {
      loadChat(selectedId)
      const interval = setInterval(() => loadChat(selectedId), 5000)
      return () => clearInterval(interval)
    }
  }, [auth, selectedId])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const sendMessage = async () => {
    if (!input.trim() || !selectedId || sending) return
    setSending(true)
    const text = input.trim()
    setInput("")
    await fetch(func2url["chat"], {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ order_id: selectedId, text, secret: TRAINER_SECRET }),
    })
    await loadChat(selectedId)
    setSending(false)
  }

  const approvePayment = async () => {
    if (!selectedId) return
    setApproving(true)
    await fetch(func2url["confirm-payment"], {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ order_id: selectedId, action: "approve", secret: TRAINER_SECRET }),
    })
    await loadOrders()
    if (selectedId) await loadChat(selectedId)
    setApproving(false)
  }

  if (!auth) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center px-4">
        <div className="w-full max-w-sm">
          <h1 className="font-orbitron text-2xl font-bold text-white mb-2 text-center">
            Форма <span className="text-red-500">Жизни</span>
          </h1>
          <p className="text-gray-400 text-center mb-8 text-sm">Панель тренера</p>
          <div className="space-y-4">
            <Input
              type="password"
              placeholder="Пароль тренера"
              value={password}
              onChange={e => setPassword(e.target.value)}
              onKeyDown={e => e.key === "Enter" && password === TRAINER_SECRET && setAuth(true)}
              className="bg-gray-900 border-gray-700 text-white placeholder:text-gray-500"
            />
            <Button
              onClick={() => password === TRAINER_SECRET && setAuth(true)}
              className="w-full bg-red-500 hover:bg-red-600 text-white"
            >
              Войти
            </Button>
            {password && password !== TRAINER_SECRET && (
              <p className="text-red-400 text-sm text-center">Неверный пароль</p>
            )}
          </div>
        </div>
      </div>
    )
  }

  const awaiting = orders.filter(o => o.status === "awaiting_verification").length

  return (
    <div className="min-h-screen bg-black flex">
      <div className="w-80 border-r border-gray-800 flex flex-col">
        <div className="p-4 border-b border-gray-800">
          <h1 className="font-orbitron text-lg font-bold text-white">
            Форма <span className="text-red-500">Жизни</span>
          </h1>
          <p className="text-gray-500 text-xs mt-1">Панель тренера</p>
          {awaiting > 0 && (
            <div className="mt-2 bg-yellow-500/10 border border-yellow-500/30 rounded-lg px-3 py-2 text-yellow-400 text-xs flex items-center gap-2">
              <Icon name="Bell" size={14} />
              {awaiting} заявок ожидают проверки оплаты
            </div>
          )}
        </div>
        <div className="flex-1 overflow-y-auto">
          {orders.length === 0 && (
            <div className="text-gray-500 text-sm text-center p-6">Заявок пока нет</div>
          )}
          {orders.map(o => {
            const st = STATUS_LABELS[o.status] || { label: o.status, color: "text-gray-400" }
            return (
              <button
                key={o.id}
                onClick={() => setSelectedId(o.id)}
                className={`w-full text-left px-4 py-3 border-b border-gray-800 hover:bg-gray-900 transition-colors ${selectedId === o.id ? "bg-gray-900 border-l-2 border-l-red-500" : ""}`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="font-medium text-white text-sm truncate">{o.client_name}</div>
                  {o.status === "awaiting_verification" && (
                    <div className="w-2 h-2 bg-yellow-400 rounded-full shrink-0 mt-1" />
                  )}
                </div>
                <div className="text-gray-500 text-xs mt-0.5">{o.goal}</div>
                <div className={`text-xs mt-1 ${st.color}`}>{st.label}</div>
              </button>
            )
          })}
        </div>
      </div>

      <div className="flex-1 flex flex-col">
        {!selectedId ? (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            <div className="text-center">
              <Icon name="MessageSquare" size={40} className="mx-auto mb-3 opacity-30" />
              <p>Выбери клиента слева</p>
            </div>
          </div>
        ) : (
          <>
            {orderDetail && (
              <div className="border-b border-gray-800 px-4 py-3 bg-gray-950">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="text-white font-semibold">{orderDetail.client_name}</div>
                    <div className="text-gray-400 text-xs mt-0.5">{orderDetail.client_phone}</div>
                    <div className="flex flex-wrap gap-3 mt-2 text-xs text-gray-400">
                      {orderDetail.age && <span>Возраст: {orderDetail.age}</span>}
                      {orderDetail.weight && <span>Вес: {orderDetail.weight} кг</span>}
                      {orderDetail.height && <span>Рост: {orderDetail.height} см</span>}
                      {orderDetail.gender && <span>{GENDER_LABELS[orderDetail.gender] || orderDetail.gender}</span>}
                      {orderDetail.activity_level && <span>{ACTIVITY_LABELS[orderDetail.activity_level] || orderDetail.activity_level}</span>}
                    </div>
                    {orderDetail.health_notes && (
                      <div className="text-xs text-yellow-400 mt-1">⚠️ {orderDetail.health_notes}</div>
                    )}
                  </div>
                  {orderDetail.status === "awaiting_verification" && (
                    <Button
                      onClick={approvePayment}
                      disabled={approving}
                      size="sm"
                      className="bg-green-600 hover:bg-green-700 text-white text-xs"
                    >
                      {approving ? "..." : "✓ Подтвердить оплату"}
                    </Button>
                  )}
                  {orderDetail.status === "paid" && (
                    <span className="text-green-400 text-xs flex items-center gap-1">
                      <Icon name="CheckCircle" size={14} /> Оплачено
                    </span>
                  )}
                </div>
              </div>
            )}

            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
              {messages.length === 0 && (
                <div className="text-center text-gray-500 text-sm py-8">Сообщений пока нет</div>
              )}
              {messages.map(msg => (
                <div key={msg.id} className={`flex ${msg.sender === "trainer" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-xs lg:max-w-md px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                    msg.sender === "trainer"
                      ? "bg-red-500 text-white rounded-br-sm"
                      : "bg-gray-800 text-gray-100 rounded-bl-sm"
                  }`}>
                    {msg.text}
                    <div className={`text-xs mt-1 ${msg.sender === "trainer" ? "text-red-200" : "text-gray-500"}`}>
                      {new Date(msg.created_at).toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" })}
                    </div>
                  </div>
                </div>
              ))}
              <div ref={bottomRef} />
            </div>

            <div className="border-t border-gray-800 bg-black px-4 py-3">
              <div className="flex gap-2">
                <Input
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && !e.shiftKey && sendMessage()}
                  placeholder="Написать клиенту..."
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
          </>
        )}
      </div>
    </div>
  )
}
