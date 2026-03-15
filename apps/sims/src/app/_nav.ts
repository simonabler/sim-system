export interface NavItem {
  name: string;
  url?: string;
  icon?: string;
  title?: boolean;
}

export const navItems: NavItem[] = [
  { name: 'Dashboard', url: '/dashboard' },
  { name: 'Artikel', url: '/article' },
  { title: true, name: 'Mobile' },
  { name: 'Shop', url: '/mobile/tracking' },
  { name: 'Inventur', url: '/mobile/inventory' },
  { title: true, name: 'Admin' },
  { name: 'Kunden', url: '/admin/customer' },
  { name: 'Rechnungen', url: '/admin/bills' },
];
