export type ModuleType =
  | 'hero'
  | 'bio'
  | 'services'
  | 'calendar'
  | 'links'
  | 'contact'
  | 'gallery'
  | 'testimonial'
  | 'custom';

export type StyleVariant = 'minimal' | 'bold' | 'outlined' | 'filled';

/* ── Per-module content interfaces ───────────────────────── */

export interface HeroContent {
  headline: string;
  subheadline?: string;
  cta_label?: string;
  cta_url?: string;
  eyebrow?: string;
}

export interface BioContent {
  title: string;
  body: string;
  photo_url?: string;
  photo_alt?: string;
}

export interface ServiceItem {
  title: string;
  description: string;
  price?: string;
  cta_label?: string;
  cta_url?: string;
}

export interface ServicesContent {
  title: string;
  items: ServiceItem[];
  columns: 2 | 3;
}

export interface CalendarEvent {
  id: string;
  date: string;
  time?: string;
  title: string;
  description?: string;
  location?: string;
  url?: string;
}

export interface CalendarContent {
  title: string;
  events: CalendarEvent[];
  show_past: boolean;
}

export interface LinkItem {
  id: string;
  title: string;
  url: string;
  description?: string;
  icon?: string;
}

export interface LinksContent {
  title: string;
  items: LinkItem[];
  columns: 2 | 3 | 4;
}

export interface SocialHandle {
  platform: 'twitter' | 'linkedin' | 'instagram' | 'behance' | 'github';
  url: string;
  label?: string;
}

export interface ContactContent {
  title: string;
  email?: string;
  phone?: string;
  location?: string;
  socials?: SocialHandle[];
  show_form: boolean;
}

export interface GalleryImage {
  id: string;
  url: string;
  alt: string;
  caption?: string;
}

export interface GalleryContent {
  title?: string;
  images: GalleryImage[];
  columns: 2 | 3 | 4;
}

export interface TestimonialItem {
  id: string;
  quote: string;
  author: string;
  role?: string;
  company?: string;
  avatar_url?: string;
}

export interface TestimonialContent {
  title?: string;
  items: TestimonialItem[];
  layout: 'single' | 'grid';
}

export interface CustomContent {
  html: string;
  height: number;
}

export type ModuleContent =
  | HeroContent
  | BioContent
  | ServicesContent
  | CalendarContent
  | LinksContent
  | ContactContent
  | GalleryContent
  | TestimonialContent
  | CustomContent;
