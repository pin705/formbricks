import { createServerClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import { db } from '@/lib/db'

export interface ApiContext {
  userId: string
  workspaceId: string
}

/**
 * Resolves the authenticated user and their active workspace for API routes.
 * Returns null if unauthenticated or if the user has no workspace.
 */
export async function getApiContext(): Promise<ApiContext | null> {
  const supabase = await createServerClient()
  const {
    data: { user }
  } = await supabase.auth.getUser()

  if (!user) return null

  const cookieStore = await cookies()
  const activeWorkspaceId = cookieStore.get('active_workspace_id')?.value

  if (activeWorkspaceId) {
    const member = await db.workspaceMember.findFirst({
      where: { userId: user.id, workspaceId: activeWorkspaceId }
    })
    if (member) return { userId: user.id, workspaceId: activeWorkspaceId }
  }

  // Fall back to first workspace
  const membership = await db.workspaceMember.findFirst({
    where: { userId: user.id },
    orderBy: { createdAt: 'asc' }
  })

  if (!membership) return null
  return { userId: user.id, workspaceId: membership.workspaceId }
}
