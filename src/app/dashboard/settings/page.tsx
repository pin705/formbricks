import PageContainer from '@/components/layout/page-container'
import { WorkspaceGeneralSettings } from '@/features/settings/components/workspace-general-settings'
import { WorkspaceMembers } from '@/features/settings/components/workspace-members'
import { getWorkspace } from '@/lib/workspace'
import { db } from '@/lib/db'
import { getSupabaseUser } from '@/lib/workspace'

export const metadata = { title: 'Settings' }

export default async function SettingsPage() {
  const [user, workspace] = await Promise.all([getSupabaseUser(), getWorkspace()])
  if (!user) return null

  const members = await db.workspaceMember.findMany({
    where: { workspaceId: workspace.id },
    include: { user: { select: { id: true, name: true, email: true, avatarUrl: true } } },
    orderBy: { createdAt: 'asc' }
  })

  const currentMember = members.find((m) => m.userId === user.id)
  const canEdit = currentMember?.role === 'owner' || currentMember?.role === 'admin'

  return (
    <PageContainer scrollable pageTitle='Settings' pageDescription='Manage your workspace.'>
      <div className='space-y-8 max-w-2xl'>
        <WorkspaceGeneralSettings
          workspace={{ id: workspace.id, name: workspace.name, slug: workspace.slug }}
          canEdit={canEdit}
        />
        <WorkspaceMembers
          members={members.map((m) => ({
            userId: m.userId,
            role: m.role,
            name: m.user.name,
            email: m.user.email,
            avatarUrl: m.user.avatarUrl
          }))}
          currentUserId={user.id}
          canManage={canEdit}
        />
      </div>
    </PageContainer>
  )
}
