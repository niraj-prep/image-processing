import { useState } from 'react';
import type { VivaQuestion } from '../../data/experiments';

interface EducationalAccordionProps {
  aim: string;
  theory: string;
  algorithm: string[];
  parameters: string;
  result: string;
  conclusion: string;
  vivaQuestions: VivaQuestion[];
}

function AccordionSection({
  title,
  icon,
  children,
  defaultOpen = false,
}: {
  title: string;
  icon: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="border border-border-subtle rounded-lg overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-3 bg-white hover:bg-neutral-50:bg-dark-surface-raised transition-colors text-left"
      >
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-[18px] text-primary">{icon}</span>
          <span className="font-geist text-headline-sm font-semibold text-text-primary">
            {title}
          </span>
        </div>
        <span
          className={`material-symbols-outlined text-[20px] text-text-muted transition-transform motion-fast ${
            open ? 'rotate-180' : ''
          }`}
        >
          expand_more
        </span>
      </button>
      {open && (
        <div className="px-4 py-3 bg-canvas-base border-t border-border-subtle animate-fade-in">
          {children}
        </div>
      )}
    </div>
  );
}

export default function EducationalAccordion({
  aim,
  theory,
  algorithm,
  parameters,
  result,
  conclusion,
  vivaQuestions,
}: EducationalAccordionProps) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2 mb-1">
        <span className="material-symbols-outlined text-[20px] text-primary">school</span>
        <h3 className="font-geist text-headline-md text-text-primary">
          Laboratory Theory & Pedagogical Specifications
        </h3>
      </div>

      <AccordionSection title="1. Experimental Aim & Domain Definition" icon="flag" defaultOpen>
        <p className="text-body-md text-text-secondary leading-relaxed">{aim}</p>
      </AccordionSection>

      <AccordionSection title="2. Theoretical Foundation & Mathematical Formulation" icon="functions">
        <p className="text-body-md text-text-secondary leading-relaxed whitespace-pre-line">{theory}</p>
      </AccordionSection>

      <AccordionSection title="3. Procedural Algorithmic Pipeline" icon="account_tree">
        <ol className="list-decimal list-inside space-y-2">
          {algorithm.map((step, i) => (
            <li key={i} className="text-body-md text-text-secondary">
              {step}
            </li>
          ))}
        </ol>
      </AccordionSection>

      <AccordionSection title="4. Parameter Analysis" icon="tune">
        <p className="text-body-md text-text-secondary leading-relaxed">{parameters}</p>
      </AccordionSection>

      <AccordionSection title="5. Observations & Empirical Comparisons" icon="analytics">
        <p className="text-body-md text-text-secondary leading-relaxed">{result}</p>
      </AccordionSection>

      <AccordionSection title="6. Conclusion" icon="check_circle">
        <p className="text-body-md text-text-secondary leading-relaxed">{conclusion}</p>
      </AccordionSection>

      <AccordionSection title="7. Oral Examination (Viva Voce) Questions & Answers" icon="quiz">
        <div className="space-y-4">
          {vivaQuestions.map((q, i) => (
            <div key={i} className="space-y-1">
              <p className="text-body-md text-text-primary font-semibold">
                Q{i + 1}: {q.question}
              </p>
              <p className="text-body-md text-text-secondary pl-4 border-l-2 border-primary/30">
                {q.answer}
              </p>
            </div>
          ))}
        </div>
      </AccordionSection>
    </div>
  );
}
