export interface NavItem {
    title: string;
    href: string;
    disabled?: boolean;
    external?: boolean;
    icon?: string;
    label?: string;
}

export interface NavItemWithChildren extends NavItem {
    items: NavItemWithChildren[];
}

export interface MainNavItem extends NavItem { }

export interface SidebarNavItem extends NavItemWithChildren { }

export const mainNav: NavItem[] = [
    {
        title: 'nav.countries',
        href: '/countries'
    },
    {
        title: 'nav.languages',
        href: '/languages'
    },
    {
        title: 'nav.currencies',
        href: '/currencies'
    },
    {
        title: 'nav.airports',
        href: '/airports'
    },
    {
        title: 'nav.localeCodes',
        href: '/locale-codes'
    },
    {
        title: 'nav.about',
        href: '/about'
    },
    {
        title: 'nav.roadmap',
        href: '/roadmap'
    },
    {
        title: 'nav.contributing',
        href: '/contributing'
    }
];

export const navGroups = {
    data: {
        label: 'nav.data',
        items: [
            {
                title: 'nav.countries',
                href: '/countries'
            },
            {
                title: 'nav.languages',
                href: '/languages'
            },
            {
                title: 'nav.currencies',
                href: '/currencies'
            },
            {
                title: 'nav.airports',
                href: '/airports'
            },
            {
                title: 'nav.localeCodes',
                href: '/locale-codes'
            },
            {
                title: 'nav.phoneNumbers',
                href: '/phone-numbers'
            }
        ]
    },
    project: {
        label: 'nav.project',
        items: [
            {
                title: 'nav.about',
                href: '/about'
            },
            {
                title: 'nav.roadmap',
                href: '/roadmap'
            },
            {
                title: 'nav.contributing',
                href: '/contributing'
            },
            {
                title: 'nav.docs',
                href: '/docs'
            }
        ]
    }
};

export const footerNav: {
    resources: NavItem[];
    community: NavItem[];
    legal: NavItem[];
} = {
    resources: [
        {
            title: 'footer.sections.resources.documentation',
            href: '/docs'
        },
        {
            title: 'footer.sections.resources.apiReference',
            href: '/api',
            disabled: true
        },
        {
            title: 'footer.sections.community.contributing',
            href: '/contributing'
        }
    ],
    community: [
        {
            title: 'footer.sections.community.changelog',
            href: '/updates'
        },
        {
            title: 'footer.sections.resources.github',
            href: 'https://github.com/ozkurkculer/localedb',
            external: true
        }
    ],
    legal: [
        {
            title: 'footer.sections.legal.privacy',
            href: '/privacy',
            disabled: true
        },
        {
            title: 'footer.sections.legal.terms',
            href: '/terms',
            disabled: true
        },
        {
            title: 'footer.sections.legal.license',
            href: 'https://github.com/ozkurkculer/localedb/blob/main/LICENSE',
            external: true
        }
    ]
};
