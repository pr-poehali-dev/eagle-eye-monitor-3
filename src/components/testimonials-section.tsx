import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

const testimonials = [
  {
    name: "Дарья, 22 года",
    role: "Студентка, Москва",
    avatar: "/professional-woman-scientist.png",
    content:
      "За 2 месяца минус 8 кг! Никогда не думала, что питание может быть таким вкусным и при этом реально работать. AI подобрал всё идеально под мой ритм жизни.",
  },
  {
    name: "Артём, 19 лет",
    role: "Первокурсник, Санкт-Петербург",
    avatar: "/cybersecurity-expert-man.jpg",
    content:
      "Пришёл в зал нулём, через 3 месяца уже жму 80 кг. План тренировок от AI — просто огонь, каждая неделя сложнее предыдущей, прогресс виден невооружённым глазом.",
  },
  {
    name: "Алина, 25 лет",
    role: "Менеджер, Екатеринбург",
    avatar: "/asian-woman-tech-developer.jpg",
    content:
      "Наконец-то сервис, который понимает, что у меня нет времени на 2-часовые тренировки. AI составил эффективные 45-минутные сессии и план питания под мой график.",
  },
]

export function TestimonialsSection() {
  return (
    <section className="py-24 px-6 bg-card">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-card-foreground mb-4 font-sans">Реальные результаты</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Молодёжь по всей стране уже меняет тело и жизнь с помощью FitAI Pro
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="glow-border slide-up" style={{ animationDelay: `${index * 0.15}s` }}>
              <CardContent className="p-6">
                <p className="text-card-foreground mb-6 leading-relaxed italic">"{testimonial.content}"</p>
                <div className="flex items-center gap-4">
                  <Avatar>
                    <AvatarImage src={testimonial.avatar || "/placeholder.svg"} alt={testimonial.name} />
                    <AvatarFallback>
                      {testimonial.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold text-primary">{testimonial.name}</p>
                    <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}