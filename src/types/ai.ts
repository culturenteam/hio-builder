import type { CalendarEvent, LinkItem, ServiceItem, TestimonialItem } from './module';

/* ── Operation types (must match docs/AI.md exactly) ─────── */

export interface UpdateModuleContentOperation {
  type: 'update_module_content';
  section_id: string;
  updates: Record<string, unknown>;
}

export interface AddEventOperation {
  type: 'add_event';
  section_id: string;
  event: Omit<CalendarEvent, 'id'>;
}

export interface UpdateEventOperation {
  type: 'update_event';
  section_id: string;
  event_id: string;
  updates: Partial<CalendarEvent>;
}

export interface RemoveEventOperation {
  type: 'remove_event';
  section_id: string;
  event_id: string;
}

export interface AddLinkOperation {
  type: 'add_link';
  section_id: string;
  link: Omit<LinkItem, 'id'>;
}

export interface RemoveLinkOperation {
  type: 'remove_link';
  section_id: string;
  link_id: string;
}

export interface AddServiceOperation {
  type: 'add_service';
  section_id: string;
  service: ServiceItem;
}

export interface RemoveServiceOperation {
  type: 'remove_service';
  section_id: string;
  service_index: number;
}

export interface AddTestimonialOperation {
  type: 'add_testimonial';
  section_id: string;
  testimonial: Omit<TestimonialItem, 'id'>;
}

export type AIOperation =
  | UpdateModuleContentOperation
  | AddEventOperation
  | UpdateEventOperation
  | RemoveEventOperation
  | AddLinkOperation
  | RemoveLinkOperation
  | AddServiceOperation
  | RemoveServiceOperation
  | AddTestimonialOperation;

export interface AICommandRequest {
  prompt: string;
  page_id: string;
}

export interface AICommandResponse {
  ok: boolean;
  operation?: AIOperation;
  message: string;
  affected_section_ids?: string[];
}
