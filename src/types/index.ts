export interface Elder {
  id: string
  name: string
  age: number
  admission_date: string
  health_status: 'excellent' | 'good' | 'fair' | 'poor'
  social_worker_id: string
  created_at: string
  updated_at: string
}

export interface ADLAssessment {
  id: string
  elder_id: string
  bathing: number
  dressing: number
  toileting: number
  transferring: number
  continence: number
  feeding: number
  grooming: number
  mobility: number
  communication: number
  cognition: number
  total_score: number
  grade: string
  created_at: string
}

export interface ServiceRecord {
  id: string
  elder_id: string
  social_worker_id: string
  visit_time: string
  content: string
  next_visit_reminder: string | null
  created_at: string
}

export interface SocialWorker {
  id: string
  name: string
  email: string
  created_at: string
}

export const ADL_QUESTIONS = [
  { id: 'bathing', label: '洗澡' },
  { id: 'dressing', label: '穿衣' },
  { id: 'toileting', label: '如厕' },
  { id: 'transferring', label: '转移' },
  { id: 'continence', label: '大小便控制' },
  { id: 'feeding', label: '进食' },
  { id: 'grooming', label: '个人卫生' },
  { id: 'mobility', label: '行走能力' },
  { id: 'communication', label: '沟通能力' },
  { id: 'cognition', label: '认知能力' },
]

export const HEALTH_STATUS_MAP: Record<string, string> = {
  excellent: '优秀',
  good: '良好',
  fair: '一般',
  poor: '较差',
}

export const ADL_GRADE_MAP: Record<number, { grade: string; description: string }> = {
  10: { grade: '完全自理', description: '生活完全自理，无需他人帮助' },
  14: { grade: '轻度依赖', description: '生活基本自理，部分活动需他人协助' },
  19: { grade: '中度依赖', description: '生活需要他人较多帮助' },
  29: { grade: '重度依赖', description: '生活大部分需他人照料' },
  40: { grade: '完全依赖', description: '生活完全依赖他人照料' },
}

export const ADL_SCORE_DESCRIPTIONS: Record<number, string> = {
  1: '完全独立完成',
  2: '需要部分帮助',
  3: '需要大量帮助',
  4: '完全依赖他人',
}
