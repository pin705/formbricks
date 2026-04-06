import { NavGroup } from '@/types'

export const navGroups: NavGroup[] = [
  {
    label: '',
    items: [
      {
        title: 'Links',
        url: '/dashboard/links',
        icon: 'links',
        isActive: false,
        shortcut: ['l', 'l'],
        items: []
      },
      {
        title: 'Campaigns',
        url: '/dashboard/campaigns',
        icon: 'campaigns',
        isActive: false,
        shortcut: ['c', 'c'],
        items: []
      },
      {
        title: 'Analytics',
        url: '/dashboard/analytics',
        icon: 'trendingUp',
        isActive: false,
        shortcut: ['a', 'a'],
        items: []
      },
      {
        title: 'Domains',
        url: '/dashboard/domains',
        icon: 'domains',
        isActive: false,
        items: []
      }
    ]
  },
  {
    label: 'Account',
    items: [
      {
        title: 'Billing',
        url: '/dashboard/billing',
        icon: 'billing',
        isActive: false,
        shortcut: ['b', 'b'],
        items: []
      },
      {
        title: 'Settings',
        url: '/dashboard/settings',
        icon: 'settings',
        isActive: false,
        items: []
      }
    ]
  }
]
