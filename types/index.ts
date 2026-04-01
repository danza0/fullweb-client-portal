import {
  User as PrismaUser,
  Client as PrismaClient,
  Project as PrismaProject,
  Invoice as PrismaInvoice,
  Agreement as PrismaAgreement,
  WelcomeDocument as PrismaWelcomeDocument,
  OnboardingTask as PrismaOnboardingTask,
  Milestone as PrismaMilestone,
  ProjectUpdate as PrismaProjectUpdate,
  Deliverable as PrismaDeliverable,
  TutorialArticle as PrismaTutorialArticle,
  ActivityLog as PrismaActivityLog,
  Role,
  ProjectStatus,
  InvoiceStatus,
  AgreementStatus,
  ClientStatus,
} from '@/app/generated/prisma'

export type {
  Role,
  ProjectStatus,
  InvoiceStatus,
  AgreementStatus,
  ClientStatus,
}

export type User = PrismaUser
export type Client = PrismaClient
export type Project = PrismaProject
export type Invoice = PrismaInvoice
export type Agreement = PrismaAgreement
export type WelcomeDocument = PrismaWelcomeDocument
export type OnboardingTask = PrismaOnboardingTask
export type Milestone = PrismaMilestone
export type ProjectUpdate = PrismaProjectUpdate
export type Deliverable = PrismaDeliverable
export type TutorialArticle = PrismaTutorialArticle
export type ActivityLog = PrismaActivityLog

export interface DashboardStats {
  totalClients: number
  activeProjects: number
  unpaidInvoices: number
  completedProjects: number
  totalRevenue: number
}

export interface ClientWithProject extends PrismaClient {
  projects: PrismaProject[]
  user: PrismaUser
}

export interface ProjectWithDetails extends PrismaProject {
  client: PrismaClient
  milestones: PrismaMilestone[]
  updates: PrismaProjectUpdate[]
  deliverables: PrismaDeliverable[]
  onboardingTasks: PrismaOnboardingTask[]
  invoices: PrismaInvoice[]
  agreements: PrismaAgreement[]
}

export interface PortalData {
  client: PrismaClient & { user: PrismaUser }
  project: ProjectWithDetails | null
  invoices: PrismaInvoice[]
  agreements: PrismaAgreement[]
  welcomeDocuments: PrismaWelcomeDocument[]
  onboardingTasks: PrismaOnboardingTask[]
  tutorials: PrismaTutorialArticle[]
}

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      email: string
      name: string
      role: string
      image?: string | null
    }
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string
    role: string
  }
}
