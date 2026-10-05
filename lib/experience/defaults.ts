import type {ExperienceInput} from './types';

export const experienceDefaults: Record<'en' | 'es', ExperienceInput> = {
 en: {question:'Support center?',corpus:'Support is available in the help center. Billing changes need approval.',strict:true},
 es: {question:'¿Centro de soporte?',corpus:'El soporte está disponible en el centro de ayuda. Los cambios de facturación requieren aprobación.',strict:true},
};
