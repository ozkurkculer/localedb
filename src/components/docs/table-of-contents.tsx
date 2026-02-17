'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';

interface TOCSection {
    id: string;
    labelKey: string;
}

const sections: TOCSection[] = [
    { id: 'overview', labelKey: 'docs.toc.overview' },
    { id: 'getting-started', labelKey: 'docs.toc.gettingStarted' },
    { id: 'data-pipeline', labelKey: 'docs.toc.dataPipeline' },
    { id: 'data-schemas', labelKey: 'docs.toc.dataSchemas' },
    { id: 'project-structure', labelKey: 'docs.toc.projectStructure' },
    { id: 'scripts', labelKey: 'docs.toc.scripts' },
    { id: 'contributing', labelKey: 'docs.toc.contributing' },
    { id: 'i18n', labelKey: 'docs.toc.i18n' }
];

export function TableOfContents() {
    const t = useTranslations();
    const [activeId, setActiveId] = useState('overview');

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setActiveId(entry.target.id);
                    }
                });
            },
            {
                rootMargin: '-100px 0px -80% 0px'
            }
        );

        sections.forEach(({ id }) => {
            const element = document.getElementById(id);
            if (element) {
                observer.observe(element);
            }
        });

        return () => {
            sections.forEach(({ id }) => {
                const element = document.getElementById(id);
                if (element) {
                    observer.unobserve(element);
                }
            });
        };
    }, []);

    const scrollToSection = (id: string) => {
        const element = document.getElementById(id);
        if (element) {
            const top = element.getBoundingClientRect().top + window.pageYOffset - 100;
            window.scrollTo({ top, behavior: 'smooth' });
        }
    };

    return (
        <nav className="sticky top-20 hidden w-56 shrink-0 lg:block">
            <div className="space-y-1">
                <p className="mb-4 font-semibold">On this page</p>
                {sections.map(({ id, labelKey }) => (
                    <button
                        key={id}
                        onClick={() => scrollToSection(id)}
                        className={`block w-full text-left text-sm transition-colors hover:text-foreground ${
                            activeId === id
                                ? 'font-medium text-primary'
                                : 'text-muted-foreground'
                        }`}
                    >
                        {t(labelKey as any)}
                    </button>
                ))}
            </div>
        </nav>
    );
}
