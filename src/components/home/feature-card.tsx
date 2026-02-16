'use client';

import { Link } from '@/i18n/routing';
import { motion } from 'framer-motion';

interface FeatureCardProps {
    icon?: React.ReactNode;
    title: string;
    description: string;
    href?: string;
    disabled?: boolean;
    variant?: 'default' | 'gold' | 'green' | 'blue' | 'red';
    animationDelay?: string;
}

const variantStyles = {
    default: {
        icon: 'text-primary',
        iconBg: 'bg-primary/10',
        title: 'text-foreground',
        glowColor: 'rgba(120, 120, 120, 0.07)',
        borderGlow: 'rgba(120, 120, 120, 0.35)',
        hoverShadow: '0 20px 40px -12px rgba(120, 120, 120, 0.15)'
    },
    gold: {
        icon: 'text-amber-500',
        iconBg: 'bg-amber-500/10',
        title: 'bg-gradient-to-br from-amber-400 to-amber-600 bg-clip-text text-transparent',
        glowColor: 'rgba(245, 158, 11, 0.08)',
        borderGlow: 'rgba(245, 158, 11, 0.4)',
        hoverShadow: '0 20px 40px -12px rgba(245, 158, 11, 0.2)'
    },
    green: {
        icon: 'text-emerald-500',
        iconBg: 'bg-emerald-500/10',
        title: 'bg-gradient-to-br from-emerald-400 to-green-600 bg-clip-text text-transparent',
        glowColor: 'rgba(16, 185, 129, 0.08)',
        borderGlow: 'rgba(16, 185, 129, 0.4)',
        hoverShadow: '0 20px 40px -12px rgba(16, 185, 129, 0.2)'
    },
    blue: {
        icon: 'text-blue-500',
        iconBg: 'bg-blue-500/10',
        title: 'bg-gradient-to-br from-blue-400 to-indigo-600 bg-clip-text text-transparent',
        glowColor: 'rgba(59, 130, 246, 0.08)',
        borderGlow: 'rgba(59, 130, 246, 0.4)',
        hoverShadow: '0 20px 40px -12px rgba(59, 130, 246, 0.2)'
    },
    red: {
        icon: 'text-red-500',
        iconBg: 'bg-red-500/10',
        title: 'bg-gradient-to-br from-red-500 to-rose-600 bg-clip-text text-transparent',
        glowColor: 'rgba(239, 68, 68, 0.08)',
        borderGlow: 'rgba(239, 68, 68, 0.4)',
        hoverShadow: '0 20px 40px -12px rgba(239, 68, 68, 0.2)'
    }
};

export function FeatureCard({
    icon,
    title,
    description,
    href,
    disabled,
    variant = 'default',
    animationDelay = ''
}: FeatureCardProps) {
    const styles = variantStyles[variant];

    const card = (
        <motion.div
            className={`group relative h-full overflow-hidden rounded-lg border border-border/40 bg-background p-6 ${
                disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
            }`}
            whileHover={
                disabled
                    ? undefined
                    : {
                          y: -6,
                          boxShadow: styles.hoverShadow
                      }
            }
            transition={{ type: 'spring', stiffness: 300, damping: 22 }}
        >
            {/* Variant-colored radial gradient glow */}
            <div
                className="pointer-events-none absolute inset-0 rounded-lg opacity-0 transition-opacity duration-300 ease-out group-hover:opacity-100"
                style={{
                    background: `radial-gradient(600px circle at 50% 0%, ${styles.glowColor}, transparent 70%)`
                }}
            />

            {/* Colored border overlay on hover */}
            <div
                className="pointer-events-none absolute inset-0 rounded-lg opacity-0 transition-opacity duration-300 ease-out group-hover:opacity-100"
                style={{
                    boxShadow: `inset 0 0 0 1px ${styles.borderGlow}`
                }}
            />

            {icon && (
                <div
                    className={`relative mb-4 inline-flex rounded-lg p-3 ${styles.icon} ${styles.iconBg} transition-transform duration-300 ease-out group-hover:scale-110`}
                >
                    {icon}
                </div>
            )}
            <h2 className={`relative mb-2 text-xl font-bold ${styles.title}`}>{title}</h2>
            <p className="relative text-sm text-muted-foreground">{description}</p>
        </motion.div>
    );

    if (href && !disabled) {
        return (
            <Link href={href}>
                <div className={`h-full ${animationDelay}`}>{card}</div>
            </Link>
        );
    }

    return <div className={`h-full ${animationDelay}`}>{card}</div>;
}
