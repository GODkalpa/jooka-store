// Configuration Types
export interface AuthConfig {
  providers: ('email' | 'google' | 'facebook')[]
  emailVerification: boolean
  passwordReset: boolean
  mfa?: boolean
}

export interface CloudinaryConfig {
  cloudName: string
  apiKey: string
  apiSecret: string
  uploadPreset: string
}

export interface ImageUploadResponse {
  public_id: string
  secure_url: string
  width: number
  height: number
  format: string
}

// Dashboard UI Types
export interface DashboardCard {
  title: string
  value: string | number
  trend?: 'up' | 'down' | 'neutral'
  icon: React.ComponentType
}

export interface TableColumn {
  key: string
  label: string
  sortable?: boolean
  render?: (value: any, row: any) => React.ReactNode
}

export interface DataTable {
  columns: TableColumn[]
  data: any[]
  pagination: boolean
  sorting: boolean
  filtering: boolean
}