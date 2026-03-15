import { INavData } from '@coreui/angular';

export const navItems: INavData[] = [
  {
    name: 'Dashboard',
    url: '/dashboard',
    icon: 'icon-speedometer',
    // badge: {
    // variant: 'info',
    //  text: 'NEW'
    // }
  },
  {
    name: 'Artikel',
    url: '/article',
    icon: 'icon-drop'
  },
  {
    title: true,
    name: 'Mobile'
  },
  {
    name: 'Shop',
    url: '/mobile/tracking',
    icon: 'icon-pencil'
  },
  {
    name: 'Inventur',
    url: '/mobile/inventory',
    icon: 'icon-pencil'
  },
  {
    title: true,
    name: 'Admin'
  },
  {
    name: 'Kunden',
    url: '/admin/customer',
    icon: 'icon-pencil'
  },
  {
    name: 'Rechnungen',
    url: '/admin/bills',
    icon: 'icon-pencil'
  },
  
];
