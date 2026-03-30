import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

export function FAQSection() {
  const faqs = [
    {
      question: "Подходит ли FitAI Pro для новичков?",
      answer:
        "Да! Платформа создана именно для тех, кто только начинает. AI учитывает твой начальный уровень и строит план с нуля — без перегрузок и травм.",
    },
    {
      question: "Что если у меня нет абонемента в зал?",
      answer:
        "AI составит план тренировок дома с минимальным инвентарём или вообще без него. Укажи это при заполнении анкеты — и получишь программу под твои условия.",
    },
    {
      question: "Как быстро я увижу результат?",
      answer:
        "Первые изменения в самочувствии и энергии — уже через 1-2 недели. Видимые изменения в теле — в среднем через 4-6 недель при соблюдении плана.",
    },
    {
      question: "Можно ли изменить план после его получения?",
      answer:
        "Конечно. Ты можешь обновить свои параметры или цели в любой момент, и AI перестроит план под новые данные. Планы также автоматически обновляются каждую неделю.",
    },
    {
      question: "Что входит в план питания?",
      answer:
        "Готовое меню на каждый день с рецептами, списком продуктов и расчётом КБЖУ. AI учитывает твои вкусовые предпочтения и бюджет.",
    },
    {
      question: "Нужно ли покупать рекомендованные добавки?",
      answer:
        "Нет, добавки — это рекомендация, а не обязательное условие. Планы тренировок и питания полностью работают и без них.",
    },
  ]

  return (
    <section className="py-24 bg-black">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 font-orbitron">Частые вопросы</h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto font-space-mono">
            Всё, что ты хотел узнать о FitAI Pro перед стартом
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`} className="border-red-500/20 mb-4">
                <AccordionTrigger className="text-left text-lg font-semibold text-white hover:text-red-400 font-orbitron px-6 py-4">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-gray-300 leading-relaxed px-6 pb-4 font-space-mono">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  )
}