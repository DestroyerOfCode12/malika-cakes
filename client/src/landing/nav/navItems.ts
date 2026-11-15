export type NavItem =
  | { kind: 'section'; label: string; target: string }
  | { kind: 'route'; label: string; to: string };

export const navItems: NavItem[] = [
  { kind: 'section', label: 'Creations', target: '#creations' },
  { kind: 'section', label: 'Build your cake', target: '#build' },
  { kind: 'section', label: 'How it works', target: '#how' },
  { kind: 'route', label: 'Track an order', to: '/order-status' },
  { kind: 'route', label: 'FAQ', to: '/faq' },
];

/** Fixed header height, so anchor scrolling doesn't tuck headings under it */
export const HEADER_OFFSET = -80;
