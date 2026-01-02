
export interface EventDetails {
  names: string;
  date: string;
  time: string;
  venue: string;
  locationUrl: string;
  contact: string;
  dressCode: string;
  eventTitle: string;
  additionalInfo: string;
  hostNames: string;
}

export type TicketType = 'Single' | 'Double' | 'VIP' | 'VVIP';

export interface GuestDetails {
  guestName: string;
  ticketType: TicketType;
  uniqueId: string;
  guestContact: string;
}

export interface QRConfig {
  content: string;
  size: number;
  posX: number;
  posY: number;
  color: string;
  bgColor: string;
  includeMargin: boolean;
  autoFormat: boolean; // If true, builds structured ticket data
}

export type TemplateTheme = 'wedding_floral' | 'classic_gold' | 'birthday_party' | 'modern_minimal' | 'safari_gala' | 'royal_purple' | 'zanzibar_pattern';

export interface CardTemplate {
  id: TemplateTheme;
  name: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  fontFamily: string;
  bgGradient: string;
  hasFlowers: boolean;
  borderStyle: 'ornate' | 'simple' | 'none' | 'pattern';
  previewImage?: string;
}

export interface CardState {
  image: string | null;
  template: TemplateTheme | null;
  config: QRConfig;
  details: EventDetails;
  guest: GuestDetails;
}
