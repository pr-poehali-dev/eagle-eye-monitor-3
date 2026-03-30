import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

const features = [
  {
    title: "AI-анализ параметров тела",
    description: "Вводишь вес, рост, возраст и образ жизни — AI строит полностью персональный план под твои цели за секунды.",
    icon: "brain",
    badge: "ИИ",
  },
  {
    title: "Умный план питания",
    description: "Рацион с расчётом КБЖУ, подобранный под твой метаболизм, цели и вкусовые предпочтения.",
    icon: "lock",
    badge: "Питание",
  },
  {
    title: "Тренировки под тебя",
    description: "Программы для зала или дома, которые адаптируются по мере твоего прогресса и не дают остановиться.",
    icon: "globe",
    badge: "Тренинг",
  },
  {
    title: "Подбор добавок",
    description: "AI рекомендует спортивное питание и добавки именно под твой организм, цели и бюджет.",
    icon: "zap",
    badge: "Добавки",
  },
  {
    title: "Отслеживание прогресса",
    description: "Умные метрики роста: вес, объёмы, силовые показатели — всё в одном месте с наглядными графиками.",
    icon: "link",
    badge: "Прогресс",
  },
  {
    title: "Планы обновляются",
    description: "Каждую неделю AI пересматривает твой план на основе результатов и корректирует нагрузку и питание.",
    icon: "target",
    badge: "Динамика",
  },
]

export function FeaturesSection() {
  return (
    <section id="features" className="py-24 px-6 bg-background">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-foreground mb-4 font-sans">Всё для твоего результата</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Никаких шаблонных программ — только персональный подход, заточенный под твоё тело и цели
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card
              key={index}
              className="glow-border hover:shadow-lg transition-all duration-300 slide-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <CardHeader>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-3xl">
                    {feature.icon === "brain" && "&#129504;"}
                    {feature.icon === "lock" && "&#128274;"}
                    {feature.icon === "globe" && "&#127760;"}
                    {feature.icon === "zap" && "&#9889;"}
                    {feature.icon === "link" && "&#128279;"}
                    {feature.icon === "target" && "&#127919;"}
                  </span>
                  <Badge variant="secondary" className="bg-accent text-accent-foreground">
                    {feature.badge}
                  </Badge>
                </div>
                <CardTitle className="text-xl font-bold text-card-foreground">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-muted-foreground leading-relaxed">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}