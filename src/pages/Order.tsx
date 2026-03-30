import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Icon from "@/components/ui/icon"
import func2url from "../../backend/func2url.json"

type Step = "form" | "payment" | "waiting"

const GOALS = [
  { value: "lose_weight", label: "Похудеть" },
  { value: "gain_muscle", label: "Набрать мышцы" },
  { value: "keep_fit", label: "Поддержать форму" },
  { value: "improve_health", label: "Улучшить здоровье" },
]

const ACTIVITY = [
  { value: "low", label: "Малоподвижный (работа сидя, почти нет спорта)" },
  { value: "medium", label: "Умеренный (тренировки 1–3 раза в неделю)" },
  { value: "high", label: "Активный (тренировки 4–5 раз в неделю)" },
  { value: "very_high", label: "Очень активный (каждый день)" },
]

export default function Order() {
  const navigate = useNavigate()
  const [step, setStep] = useState<Step>("form")
  const [loading, setLoading] = useState(false)
  const [orderId, setOrderId] = useState("")
  const [paymentChecking, setPaymentChecking] = useState(false)
  const [paymentError, setPaymentError] = useState("")

  const [form, setForm] = useState({
    client_name: "",
    client_phone: "",
    age: "",
    weight: "",
    height: "",
    gender: "male",
    activity_level: "medium",
    goal: "lose_weight",
    health_notes: "",
  })

  const set = (field: string, value: string) => setForm(f => ({ ...f, [field]: value }))

  const handleSubmit = async () => {
    if (!form.client_name.trim() || !form.client_phone.trim()) return
    setLoading(true)
    const res = await fetch(func2url["create-order"], {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        age: form.age ? parseInt(form.age) : null,
        weight: form.weight ? parseFloat(form.weight) : null,
        height: form.height ? parseFloat(form.height) : null,
      }),
    })
    const data = await res.json()
    setLoading(false)
    if (data.order_id) {
      setOrderId(data.order_id)
      setStep("payment")
    }
  }

  const handlePaid = async () => {
    setPaymentError("")
    setPaymentChecking(true)
    const res = await fetch(func2url["confirm-payment"], {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ order_id: orderId, action: "confirm" }),
    })
    const data = await res.json()
    setPaymentChecking(false)
    if (data.ok) {
      setStep("waiting")
    } else {
      setPaymentError("Что-то пошло не так. Попробуй ещё раз.")
    }
  }

  const checkStatus = async () => {
    const res = await fetch(`${func2url["get-order"]}?order_id=${orderId}`)
    const data = await res.json()
    if (data.status === "paid") {
      navigate(`/chat?order_id=${orderId}`)
    }
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-2xl mx-auto px-4 py-12">
        <div className="mb-8">
          <a href="/" className="text-red-400 hover:text-red-300 flex items-center gap-2 mb-6 text-sm">
            <Icon name="ArrowLeft" size={16} />
            На главную
          </a>
          <h1 className="font-orbitron text-3xl font-bold text-white mb-2">
            Форма <span className="text-red-500">Жизни</span>
          </h1>
          <p className="text-gray-400">Персональный план за 300 ₽</p>
        </div>

        <div className="flex items-center gap-3 mb-10">
          {["form", "payment", "waiting"].map((s, i) => (
            <div key={s} className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
                step === s ? "bg-red-500 text-white" :
                ["form", "payment", "waiting"].indexOf(step) > i ? "bg-red-900 text-red-300" : "bg-gray-800 text-gray-500"
              }`}>{i + 1}</div>
              {i < 2 && <div className={`h-px w-8 ${["form", "payment", "waiting"].indexOf(step) > i ? "bg-red-500" : "bg-gray-700"}`} />}
            </div>
          ))}
          <div className="ml-2 text-sm text-gray-400">
            {step === "form" && "Анкета"}
            {step === "payment" && "Оплата"}
            {step === "waiting" && "Ожидание"}
          </div>
        </div>

        {step === "form" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-6">
              <div>
                <Label className="text-gray-300 mb-2 block">Как тебя зовут? *</Label>
                <Input
                  placeholder="Имя и фамилия"
                  value={form.client_name}
                  onChange={e => set("client_name", e.target.value)}
                  className="bg-gray-900 border-gray-700 text-white placeholder:text-gray-500 focus:border-red-500"
                />
              </div>
              <div>
                <Label className="text-gray-300 mb-2 block">Номер телефона *</Label>
                <Input
                  placeholder="+7 900 000 00 00"
                  value={form.client_phone}
                  onChange={e => set("client_phone", e.target.value)}
                  className="bg-gray-900 border-gray-700 text-white placeholder:text-gray-500 focus:border-red-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label className="text-gray-300 mb-2 block">Возраст</Label>
                <Input
                  type="number"
                  placeholder="22"
                  value={form.age}
                  onChange={e => set("age", e.target.value)}
                  className="bg-gray-900 border-gray-700 text-white placeholder:text-gray-500 focus:border-red-500"
                />
              </div>
              <div>
                <Label className="text-gray-300 mb-2 block">Вес (кг)</Label>
                <Input
                  type="number"
                  placeholder="70"
                  value={form.weight}
                  onChange={e => set("weight", e.target.value)}
                  className="bg-gray-900 border-gray-700 text-white placeholder:text-gray-500 focus:border-red-500"
                />
              </div>
              <div>
                <Label className="text-gray-300 mb-2 block">Рост (см)</Label>
                <Input
                  type="number"
                  placeholder="175"
                  value={form.height}
                  onChange={e => set("height", e.target.value)}
                  className="bg-gray-900 border-gray-700 text-white placeholder:text-gray-500 focus:border-red-500"
                />
              </div>
            </div>

            <div>
              <Label className="text-gray-300 mb-3 block">Пол</Label>
              <div className="grid grid-cols-2 gap-3">
                {[{value: "male", label: "Мужской"}, {value: "female", label: "Женский"}].map(g => (
                  <button
                    key={g.value}
                    onClick={() => set("gender", g.value)}
                    className={`py-3 px-4 rounded-lg border text-sm font-medium transition-colors ${
                      form.gender === g.value ? "border-red-500 bg-red-500/10 text-red-400" : "border-gray-700 bg-gray-900 text-gray-400 hover:border-gray-500"
                    }`}
                  >{g.label}</button>
                ))}
              </div>
            </div>

            <div>
              <Label className="text-gray-300 mb-3 block">Твоя цель</Label>
              <div className="grid grid-cols-2 gap-3">
                {GOALS.map(g => (
                  <button
                    key={g.value}
                    onClick={() => set("goal", g.value)}
                    className={`py-3 px-4 rounded-lg border text-sm font-medium transition-colors ${
                      form.goal === g.value ? "border-red-500 bg-red-500/10 text-red-400" : "border-gray-700 bg-gray-900 text-gray-400 hover:border-gray-500"
                    }`}
                  >{g.label}</button>
                ))}
              </div>
            </div>

            <div>
              <Label className="text-gray-300 mb-3 block">Уровень активности</Label>
              <div className="space-y-2">
                {ACTIVITY.map(a => (
                  <button
                    key={a.value}
                    onClick={() => set("activity_level", a.value)}
                    className={`w-full py-3 px-4 rounded-lg border text-left text-sm transition-colors ${
                      form.activity_level === a.value ? "border-red-500 bg-red-500/10 text-red-400" : "border-gray-700 bg-gray-900 text-gray-400 hover:border-gray-500"
                    }`}
                  >{a.label}</button>
                ))}
              </div>
            </div>

            <div>
              <Label className="text-gray-300 mb-2 block">Особенности здоровья / противопоказания</Label>
              <textarea
                placeholder="Травмы, заболевания, аллергии на продукты... (необязательно)"
                value={form.health_notes}
                onChange={e => set("health_notes", e.target.value)}
                rows={3}
                className="w-full bg-gray-900 border border-gray-700 text-white placeholder:text-gray-500 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-red-500 resize-none"
              />
            </div>

            <Button
              onClick={handleSubmit}
              disabled={!form.client_name.trim() || !form.client_phone.trim() || loading}
              className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-4 text-lg"
            >
              {loading ? "Сохраняю..." : "Далее → Оплата"}
            </Button>
          </div>
        )}

        {step === "payment" && (
          <div className="space-y-8">
            <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 text-center">
              <div className="text-5xl font-bold text-white mb-2">300 ₽</div>
              <div className="text-gray-400">Персональный план тренировок, питания и добавок</div>
            </div>

            <div className="bg-gray-900 border border-red-500/30 rounded-xl p-6">
              <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                <Icon name="CreditCard" size={20} className="text-red-400" />
                Оплата через Т-Банк
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Номер телефона:</span>
                  <span className="text-white font-bold text-base">+7 923 441-73-95</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Банк:</span>
                  <span className="text-white">Т-Банк (Тинькофф)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Сумма:</span>
                  <span className="text-white font-bold">300 ₽</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">В комментарии напиши:</span>
                  <span className="text-red-400 font-mono text-xs">ФЖ-{orderId.slice(0, 8)}</span>
                </div>
              </div>
            </div>

            <div className="bg-gray-900 border border-gray-700 rounded-xl p-4 text-sm text-gray-400">
              <p className="flex items-start gap-2">
                <Icon name="Info" size={16} className="text-blue-400 shrink-0 mt-0.5" />
                После оплаты нажми кнопку «Я оплатил» — тренер проверит платёж и откроет чат.
                Обычно это занимает до 30 минут в рабочее время.
              </p>
            </div>

            {paymentError && (
              <div className="text-red-400 text-sm text-center">{paymentError}</div>
            )}

            <Button
              onClick={handlePaid}
              disabled={paymentChecking}
              className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-4 text-lg"
            >
              {paymentChecking ? "Отправляю уведомление..." : "✓ Я оплатил — жду тренера"}
            </Button>
          </div>
        )}

        {step === "waiting" && (
          <div className="text-center space-y-8 py-8">
            <div className="w-20 h-20 bg-red-500/10 border border-red-500/30 rounded-full flex items-center justify-center mx-auto">
              <Icon name="Clock" size={36} className="text-red-400" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white mb-3">Ожидаем подтверждения!</h2>
              <p className="text-gray-400 leading-relaxed max-w-md mx-auto">
                Тренер получил уведомление и проверяет оплату.<br />
                Как только платёж будет подтверждён — тебе откроется чат с тренером.
              </p>
            </div>
            <div className="bg-gray-900 border border-gray-700 rounded-xl p-4 text-sm text-gray-400">
              <p>Обычно это занимает до 30 минут в рабочее время (с 9:00 до 21:00).</p>
            </div>
            <Button
              onClick={checkStatus}
              variant="outline"
              className="border-red-500 text-red-400 hover:bg-red-500 hover:text-white bg-transparent"
            >
              Проверить статус
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
