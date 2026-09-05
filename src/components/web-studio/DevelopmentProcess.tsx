import {
  ArrowDown,
  BarChart3,
  Check,
  CircleDollarSign,
  Clock3,
  Code2,
  FileCode2,
  FileText,
  Globe2,
  ListTree,
  PanelsTopLeft,
  PencilRuler,
  Search,
  ShieldCheck,
  UserRoundCheck,
  Workflow,
} from 'lucide-react';
import { studioIndustries, studioProcess, whyWebsitePoints } from '../../data/webStudio';
import { StudioEyebrow, StudioHeading } from './StudioPrimitives';

export function OwnershipStory() {
  return (
    <section className="studio-ownership">
      <div className="studio-shell studio-ownership__panel" data-studio-reveal>
        <div className="studio-ownership__symbol" aria-hidden="true">
          <FileCode2 />
          <span>ваш проект</span>
        </div>
        <div className="studio-ownership__copy">
          <StudioEyebrow>После передачи</StudioEyebrow>
          <h2>Сайт принадлежит вам</h2>
          <p>
            После передачи проекта клиент не должен платить мне каждый месяц только за возможность поменять текст или цену.
          </p>
          <div className="studio-ownership__facts">
            <span><Check aria-hidden="true" /> Предусмотренный контент можно менять самостоятельно через панель управления.</span>
            <span><CircleDollarSign aria-hidden="true" /> Домен, платный хостинг и сторонние сервисы могут иметь собственную стоимость.</span>
          </div>
        </div>
      </div>
    </section>
  );
}

const whyIcons = [Search, ShieldCheck, Globe2, UserRoundCheck, Workflow, Clock3];

export function WhyWebsiteStory() {
  return (
    <section className="studio-why" id="why-website-2026" data-progress="why-website-2026" aria-labelledby="studio-why-title">
      <div className="studio-shell">
        <StudioHeading
          eyebrow="Зачем сайт в 2026 году"
          title="Одна точка, которая связывает поиск, доверие и работу бизнеса"
          titleId="studio-why-title"
          description="Сайт не обещает заявки сам по себе. Он помогает человеку найти информацию, проверить предложение и сделать следующий шаг без длинной переписки."
        />
        <div className="studio-why__system" data-why-system>
          <div className="studio-why__core" data-why-core>
            <span>SITEVL / SYSTEM</span>
            <strong>ВАШ САЙТ</strong>
            <small>единая цифровая точка</small>
          </div>
          <div className="studio-why__routes" aria-hidden="true">
            {whyWebsitePoints.map((point) => <i key={point.id} />)}
          </div>
          <div className="studio-why__nodes">
            {whyWebsitePoints.map((point, index) => {
              const Icon = whyIcons[index];
              return (
                <article data-why-node key={point.id}>
                  <i><Icon aria-hidden="true" /></i>
                  <div>
                    <h3>{point.title}</h3>
                    <p>{point.text}</p>
                    <span>{point.examples.join(' · ')}</span>
                  </div>
                </article>
              );
            })}
          </div>
          <div className="studio-why__flow" aria-hidden="true">
            <span>поиск</span><ArrowDown /><strong>сайт</strong><ArrowDown /><span>заявка · каталог · контакт</span><ArrowDown /><b>бизнес-процесс</b>
          </div>
        </div>
      </div>
    </section>
  );
}

const processIcons = [FileText, ListTree, PanelsTopLeft, Code2, FileText, ShieldCheck, Globe2];

export function DevelopmentProcess() {
  return (
    <section className="studio-process" aria-labelledby="studio-process-title" data-process-scroll>
      <div className="studio-shell">
        <StudioHeading
          eyebrow="От первого сообщения до публикации"
          title="Спокойный процесс разработки"
          description="Каждый этап отвечает на конкретный вопрос. Так проект не превращается в бесконечный набор правок без общей цели."
        />
        <div className="studio-process__layout">
          <div className="studio-process__timeline">
            <span className="studio-process__track" aria-hidden="true"><i data-process-line /></span>
            {studioProcess.map((step) => (
              <article data-process-step key={step.index}>
                <span>{step.index}</span>
                <div>
                  <h3>{step.title}</h3>
                  <p>{step.text}</p>
                </div>
              </article>
            ))}
          </div>
          <aside className="studio-process__preview" aria-label="Схема постепенной сборки сайта">
            <div className="studio-process__preview-bar"><span /><span /><span /><strong>SITEVL / PROJECT</strong></div>
            <div className="studio-process__preview-canvas">
              {studioProcess.map((step, index) => {
                const Icon = processIcons[index];
                return (
                  <div className={`studio-process__preview-layer studio-process__preview-layer--${index + 1}`} data-process-preview={index} key={step.index}>
                    <Icon aria-hidden="true" /><span>{step.title}</span>
                  </div>
                );
              })}
            </div>
            <div className="studio-process__preview-footer"><BarChart3 aria-hidden="true" /><span>проект готовится к публикации</span></div>
          </aside>
        </div>
      </div>
    </section>
  );
}

export function IndustriesMarquee() {
  return (
    <section className="studio-industries" aria-labelledby="studio-industries-title">
      <div className="studio-shell studio-industries__heading" data-studio-reveal>
        <StudioEyebrow>Для кого</StudioEyebrow>
        <h2 id="studio-industries-title">Сайт начинается с вашей задачи</h2>
        <p>Сфера задаёт содержание и сценарии, а не ограничивает визуальный язык проекта.</p>
      </div>
      <div className="studio-marquee" aria-label={studioIndustries.join(', ')}>
        <div className="studio-marquee__track" aria-hidden="true">
          {[...studioIndustries, ...studioIndustries].map((industry, index) => (
            <span key={`${industry}-${index}`}>
              {industry}
              <i><PencilRuler /></i>
            </span>
          ))}
        </div>
      </div>
      <div className="studio-marquee studio-marquee--reverse" aria-hidden="true">
        <div className="studio-marquee__track">
          {[...studioIndustries.slice().reverse(), ...studioIndustries.slice().reverse()].map((industry, index) => (
            <span key={`${industry}-reverse-${index}`}>
              {industry}
              <i><Globe2 /></i>
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
