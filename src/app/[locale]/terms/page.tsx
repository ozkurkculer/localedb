import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { LegalDocument } from '@/components/legal/legal-document';
import { localeAlternates } from "@/lib/seo";

const SECTIONS = ['license', 'data', 'warranty', 'fairUse', 'contributions', 'changes', 'contact'];

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: 'legal.terms.meta' });

    return {
        title: t('title'),
        description: t('description'),
        alternates: localeAlternates(locale, '/terms'),
    };
}

export default async function TermsPage({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    setRequestLocale(locale);

    return <LegalDocument namespace="legal.terms" sections={SECTIONS} />;
}
