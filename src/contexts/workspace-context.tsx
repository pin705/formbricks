'use client'

import { createContext, useContext } from 'react'

export interface WorkspaceUser {
  id: string
  email: string
  name: string | null
  avatarUrl: string | null
}

export interface WorkspaceItem {
  id: string
  name: string
  slug: string
  role: string
}

export interface WorkspacePlan {
  id: string
  name: string
}

export interface WorkspaceContextValue {
  user: WorkspaceUser
  workspace: WorkspaceItem
  workspaces: WorkspaceItem[]
  plan: WorkspacePlan | null
}

const WorkspaceContext = createContext<WorkspaceContextValue | null>(null)

export function WorkspaceProvider({
  value,
  children
}: {
  value: WorkspaceContextValue
  children: React.ReactNode
}) {
  return <WorkspaceContext.Provider value={value}>{children}</WorkspaceContext.Provider>
}

export function useWorkspace(): WorkspaceContextValue {
  const ctx = useContext(WorkspaceContext)
  if (!ctx) throw new Error('useWorkspace must be used inside WorkspaceProvider')
  return ctx
}
