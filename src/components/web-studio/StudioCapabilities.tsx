import { Braces, PanelsTopLeft, Rocket } from 'lucide-react';
import { StudioHeading } from './StudioPrimitives';

const capabilities = [
  {
    icon: PanelsTopLeft,
    title: 'Структура и интерфейс',
    text: 'Продумываю путь клиента, страницы и подачу, чтобы сайт объяснял услугу и приводил к понятному действию.',
    detail: 'сценарий · дизайн · адаптивность',
  },
  {
    icon: Braces,
    title: 'Разработка без конструктора',
    text: 'Собираю интерфейс и логику под задачу: от компактной визитки до каталога, системы управления или онлайн-сервиса.',
    detail: 'React · данные · интеграции',
  },
  {
    icon: Rocket,
    title: 'Публикация и развитие',
    text: 'Проверяю мобильную версию, формы, скорость и SEO-основу, публикую проект и объясняю дальнейшую работу.',
    detail: 'запуск · проверка · сопровождение',
  },
];

export function StudioCapabilities() {
  return (
    <section className="studio-capabilities" aria-labelledby="studio-capabilities-title">
      <div className="studio-shell">
        <StudioHeading
          eyebrow="Что я делаю"
          title="Проектирую сайт как рабочий инструмент"
          titleId="studio-capabilities-title"
          description="В проекте соединяются понятная подача, аккуратный интерфейс и техническая часть. Состав зависит от задачи, а не от готового шаблона."
        />
        <div className="studio-capabilities__grid">
          {capabilities.map(({ icon: Icon, title, text, detail }, index) => (
            <article data-studio-reveal key={title}>
              <div className="studio-capabilities__icon"><Icon aria-hidden="true" /></div>
              <span>0{index + 1}</span>
              <h3>{title}</h3>
              <p>{text}</p>
              <small>{detail}</small>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
