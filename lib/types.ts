// Enum-like constants for type safety (SQLite compatible)

export const UserRole = {
  ADMIN: 'ADMIN',
  AGENT: 'AGENT',
} as const;

export const RoomType = {
  SINGLE: 'SINGLE',
  DOUBLE: 'DOUBLE',
  TWIN: 'TWIN',
  TRIPLE: 'TRIPLE',
  FAMILY: 'FAMILY',
} as const;

export const ServiceType = {
  ACCOMMODATION: 'ACCOMMODATION',
  TRANSFER: 'TRANSFER',
  TOUR: 'TOUR',
  MISCELLANEOUS: 'MISCELLANEOUS',
} as const;

export const PricingType = {
  PER_PERSON: 'PER_PERSON',
  PER_ROOM: 'PER_ROOM',
  PER_GROUP: 'PER_GROUP',
} as const;

export type UserRole = typeof UserRole[keyof typeof UserRole];
export type RoomType = typeof RoomType[keyof typeof RoomType];
export type ServiceType = typeof ServiceType[keyof typeof ServiceType];
export type PricingType = typeof PricingType[keyof typeof PricingType];
