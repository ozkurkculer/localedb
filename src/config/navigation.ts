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

export interface MainNavItem extends NavItem {}

export interface SidebarNavItem extends NavItemWithChildren {}

export const mainNav: NavItem[] = [
  {
    title: "Countries",
    href: "/countries",
  },
  {
    title: "Languages",
    href: "/languages",
  },
  {
    title: "Currencies",
    href: "/currencies",
  },
  {
    title: "Airports",
    href: "/airports",
  },
  {
    title: "Locale Codes",
    href: "/locale-codes",
  },
  {
    title: "About",
    href: "/about",
  },
  {
    title: "Contributing",
    href: "/contributing",
  },
];

export const footerNav = {
  resources: [
    {
      title: "Documentation",
      href: "/docs",
    },
    {
      title: "API Reference",
      href: "/api",
      disabled: true,
    },
    {
      title: "Contributing",
      href: "/contributing",
    },
  ],
  community: [
    {
      title: "GitHub",
      href: "https://github.com/yourusername/localedb",
      external: true,
    },
    {
      title: "Twitter",
      href: "https://twitter.com/localedb",
      external: true,
    },
    {
      title: "Discord",
      href: "#",
      disabled: true,
    },
  ],
  legal: [
    {
      title: "Privacy",
      href: "/privacy",
      disabled: true,
    },
    {
      title: "Terms",
      href: "/terms",
      disabled: true,
    },
    {
      title: "License",
      href: "https://github.com/yourusername/localedb/blob/main/LICENSE",
      external: true,
    },
  ],
};
