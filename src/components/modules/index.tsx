import type { Section } from '../../types/page';
import type { StyleVariant } from '../../types/module';
import { HeroModule } from './HeroModule';
import { BioModule } from './BioModule';
import { ServicesModule } from './ServicesModule';
import { CalendarModule } from './CalendarModule';
import { LinksModule } from './LinksModule';
import { ContactModule } from './ContactModule';
import { GalleryModule } from './GalleryModule';
import { TestimonialModule } from './TestimonialModule';
import { CustomModule } from './CustomModule';

export { HeroModule, BioModule, ServicesModule, CalendarModule, LinksModule, ContactModule, GalleryModule, TestimonialModule, CustomModule };

interface RendererProps {
  section: Section;
}

export function ModuleRenderer({ section }: RendererProps) {
  const variant = section.style_variant as StyleVariant;
  const c = section.content as any;

  switch (section.type) {
    case 'hero':        return <HeroModule content={c} variant={variant} />;
    case 'bio':         return <BioModule content={c} variant={variant} />;
    case 'services':    return <ServicesModule content={c} variant={variant} />;
    case 'calendar':    return <CalendarModule content={c} variant={variant} />;
    case 'links':       return <LinksModule content={c} variant={variant} />;
    case 'contact':     return <ContactModule content={c} variant={variant} />;
    case 'gallery':     return <GalleryModule content={c} variant={variant} />;
    case 'testimonial': return <TestimonialModule content={c} variant={variant} />;
    case 'custom':      return <CustomModule content={c} variant={variant} />;
    default:            return <div>Unknown module type</div>;
  }
}
