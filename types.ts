
export type AppLanguage = 'es' | 'en';

export interface QuantumAuditResult {
  entropyScore: number;
  encryptionStrength: string;
  detectedAnomalies: { type: string; risk: 'low' | 'medium' | 'high'; description: string }[];
  quantumResilience: number;
  lastHardening: string;
}

export interface ExecutiveReport {
  id: string;
  timestamp: string;
  author: string;
  nodeStats: {
    totalLeads: number;
    conversionRate: number;
    peakHour: string;
  };
  aiExecutiveSummary: string;
  securityStatus: string;
}

export interface PredictiveInsights {
  peakEngagementHours: { hour: number; confidence: number }[];
  conversionProbability: number;
  prizePopularityForecast: { prizeName: string; projectedDemand: number }[];
  inventoryAlerts: string[];
  userSentiment: 'positive' | 'neutral' | 'negative';
  growthStrategy: string[];
}

export interface AnalysisResult {
  summary: string;
  complexityScore: number;
  securityConcerns: string[];
  explanations: { section: string; content: string; }[];
  suggestions: string[];
}

export interface UserPermissions {
  canExport: boolean;
  canCustom: boolean;
  canAutoRemove: boolean;
  showAds: boolean;
  hasAdvancedInventory?: boolean;
  hasAI?: boolean;
  hasSecurity?: boolean;
  maxPrizes?: number;
  [key: string]: any;
}

export interface TierDefinition {
  id: 'free' | 'pro' | 'ppe';
  label: string;
  permissions: UserPermissions;
}

export interface LeadField {
  id: string;
  label: string;
  placeholder: string;
  type: string;
  required: boolean;
}

export interface PrizeItem {
  id: string;
  name: string;
  stock: number;
  weight: number;
}

export type LuxuryTheme = 'gold' | 'neon' | 'blue' | 'minimal' | 'custom';

export interface UserProfile {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
}

export interface GlobalMessage {
  id: string;
  title: string;
  subtitle: string;
  type: 'text_only' | 'text_image' | 'image_only';
  imageUrl?: string;
  createdAt: string;
  target: {
    type: 'all' | 'level' | 'uid';
    levels?: ('free' | 'pro' | 'ppe')[];
    uids?: string[];
  };
}

export interface LuxuryConfig {
  title: string;
  subtitle?: string;
  prizes: string[];
  advancedPrizes?: PrizeItem[];
  colorA: string;
  colorB: string;
  theme: LuxuryTheme;
  level: 'free' | 'pro' | 'ppe';
  customLogoURL?: string;
  backgroundImageURL?: string;
  permissions?: UserPermissions;
  requireRegistration?: boolean;
  leadFields?: LeadField[];
  titleFontSize?: number;
  subtitleFontSize?: number;
  fontFamily?: 'luxury' | 'modern' | 'classic';
  licenseKey?: string;
  activationDate?: string;
  supportAccessCode?: string; 
  lang?: AppLanguage;
}

export interface UserPresence {
  status: 'online' | 'offline';
  lastActive: string;
  userAgent?: string;
  email?: string;
}

export interface WinnerEntry {
  id?: string;
  nombre: string;
  fecha: string;
  leadData?: Record<string, string>;
  usuarioNombre?: string;
  usuarioContacto?: string;
  usuarioEmail?: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  event: string;
  type: 'info' | 'warning' | 'success' | 'security';
  user?: string;
}

export interface LuxuryUserRecord {
  uid: string;
  config: LuxuryConfig;
  profile?: UserProfile;
  history?: Record<string, WinnerEntry>;
  presence?: UserPresence;
  audit_logs?: Record<string, AuditLog>;
}

export interface GlobalStats {
  totalUsers: number;
  activeNow: number;
  byLevel: { free: number; pro: number; ppe: number };
  expiringSoon: number;
  prizesDelivered: number;
}
