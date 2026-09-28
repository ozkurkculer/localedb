import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { LegalDocument } from '@/components/legal/legal-document';
import { localeAlternates } from "@/lib/seo";

const SECTIONS = ['analytics', 'hosting', 'storage', 'export', 'choices', 'changes', 'contact'];

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: 'legal.privacy.meta' });

    return {
        title: t('title'),
        description: t('description'),
        alternates: await localeAlternates('/privacy'),
    };
}

export default function PrivacyPage() {
    return <LegalDocument namespace="legal.privacy" sections={SECTIONS} />;
}
