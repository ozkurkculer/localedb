import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { LegalDocument } from '@/components/legal/legal-document';

const SECTIONS = ['license', 'data', 'warranty', 'fairUse', 'contributions', 'changes', 'contact'];

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: 'legal.terms.meta' });

    return {
        title: t('title'),
        description: t('description'),
        alternates: {
            canonical: '/terms',
        },
    };
}

export default function TermsPage() {
    return <LegalDocument namespace="legal.terms" sections={SECTIONS} />;
}
