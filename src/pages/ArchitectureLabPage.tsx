import { motion } from 'framer-motion';
import { Check, ChevronDown, Database, HardDrive, PanelTop, ServerCog, ShieldCheck, UserRound } from 'lucide-react';
import { useState } from 'react';
import { HowMade, LabFrame, LabHero, LabSectionHeading } from '../components/lab/LabPrimitives';
import { ProjectRoadmap } from '../components/lab/ProjectRoadmap';
import { PageTransition } from '../components/PageTransition';
import { SeoHead } from '../components/SeoHead';
import { architectureNodes, optionalArchitectureNodes } from '../data/lab';

const nodeIcons = [UserRound, PanelTop, ServerCog, Database, HardDrive, ShieldCheck];

export function ArchitectureLabPage() {
  const [mode, setMode] = useState<'simple' | 'technical'>('simple');
  const [activeNode, setActiveNode] = useState('frontend');
  const [optional, setOptional] = useState<string[]>(['search', 'telegram']);
  const current = architectureNodes.find((item) => item.id === activeNode) ?? architectureNodes[0];

  const toggleOptional = (id: string) => {
    setOptional((items) => items.includes(id) ? items.filter((item) => item !== id) : [...items, id]);
  };

  return (
    <PageTransition>
      <SeoHead title="Architecture Explorer — SITEVL LAB" description="Интерактивное объяснение архитектуры сайта простым и техническим языком." canonicalPath="/lab/architecture" noindex />
      <LabFrame>
        <LabHero title="Как устроен современный сайт" description="Выберите блок схемы и переключите язык объяснения. Архитектура остаётся той же, меняется только глубина разговора." />
        <section className="lab-section">
          <div className="lab-shell">
            <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
              <LabSectionHeading eyebrow="Architecture explorer" title="От пользователя до админки" description="Не каждому проекту нужны все слои. Схема помогает понять, где появляется сложность и зачем она нужна." />
              <div className="lab-tabs" aria-label="Режим объяснения">
                <button className={mode === 'simple' ? 'is-active' : ''} type="button" onClick={() => setMode('simple')}>Просто</button>
                <button className={mode === 'technical' ? 'is-active' : ''} type="button" onClick={() => setMode('technical')}>Технически</button>
              </div>
            </div>

            <div className="lab-architecture">
              <div className="lab-architecture__flow" role="list" aria-label="Основные слои сайта">
                {architectureNodes.map((node, index) => {
                  const Icon = nodeIcons[index];
                  return (
                    <div role="listitem" key={node.id}>
                      <button className={activeNode === node.id ? 'is-active' : ''} type="button" onClick={() => setActiveNode(node.id)}>
                        <Icon aria-hidden="true" /><span>{node.label}</span>
                      </button>
                      {index < architectureNodes.length - 1 ? <ChevronDown aria-hidden="true" /> : null}
                    </div>
                  );
                })}
              </div>

              <motion.aside className="lab-architecture__explanation" key={`${current.id}-${mode}`} initial={{ opacity: 0.3, y: 8 }} animate={{ opacity: 1, y: 0 }}>
                <p className="lab-eyebrow">{mode === 'simple' ? 'Простое объяснение' : 'Технический слой'}</p>
                <h2>{current.label}</h2>
                <p>{mode === 'simple' ? current.simple : current.technical}</p>
                <div className="lab-architecture__path">
                  {architectureNodes.slice(0, architectureNodes.findIndex((item) => item.id === current.id) + 1).map((node) => <span key={node.id}>{node.label}</span>)}
                </div>
              </motion.aside>
            </div>

            <section className="mt-12">
              <LabSectionHeading eyebrow="Опциональные модули" title="Добавьте то, что относится к демонстрации" description="Эти блоки не заявлены как подключённые к SITEVL. Они показывают, как может расширяться архитектура клиентского проекта." />
              <div className="lab-card-grid">
                {optionalArchitectureNodes.map((node) => {
                  const selected = optional.includes(node.id);
                  return (
                    <button className={`lab-card lab-architecture__option ${selected ? 'is-active' : ''}`} type="button" onClick={() => toggleOptional(node.id)} key={node.id}>
                      <span>{selected ? <Check /> : null}</span>
                      <h3>{node.label}</h3>
                      <p>{node.description}</p>
                    </button>
                  );
                })}
              </div>
            </section>

            <section className="mt-16">
              <LabSectionHeading eyebrow="Client-facing roadmap" title="Как архитектура превращается в проект" description="Это демонстрация процесса, не кабинет клиента и не автоматический трекер." />
              <div className="mt-6"><ProjectRoadmap activeStep={2} /></div>
            </section>

            <HowMade items={[{ label: 'Схема', value: 'React state' }, { label: 'Язык', value: 'две curated-версии' }, { label: 'Backend', value: 'не требуется' }, { label: 'Секреты', value: 'не отображаются' }]} />
          </div>
        </section>
      </LabFrame>
    </PageTransition>
  );
}
