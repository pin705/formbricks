import KBar from '@/components/kbar'
import AppSidebar from '@/components/layout/app-sidebar'
import Header from '@/components/layout/header'
import { InfoSidebar } from '@/components/layout/info-sidebar'
import { InfobarProvider } from '@/components/ui/infobar'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { WorkspaceProvider } from '@/contexts/workspace-context'
import { getSupabaseUser } from '@/lib/workspace'
import { db } from '@/lib/db'
import type { Metadata } from 'next'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export const metadata: Metadata = {
  title: 'LinkOS',
  description: 'Modern link management',
  robots: { index: false, follow: false }
}

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await getSupabaseUser()
  if (!user) redirect('/auth/sign-in')

  // Resolve active workspace
  const cookieStore = await cookies()
  const activeWorkspaceId = cookieStore.get('active_workspace_id')?.value

  let activeWorkspace = null

  if (activeWorkspaceId) {
    const m = await db.workspaceMember.findFirst({
      where: { userId: user.id, workspaceId: activeWorkspaceId },
      include: { workspace: { include: { subscription: { include: { plan: true } } } } }
    })
    activeWorkspace = m ? { workspace: m.workspace, role: m.role } : null
  }

  if (!activeWorkspace) {
    const m = await db.workspaceMember.findFirst({
      where: { userId: user.id },
      orderBy: { createdAt: 'asc' },
      include: { workspace: { include: { subscription: { include: { plan: true } } } } }
    })
    activeWorkspace = m ? { workspace: m.workspace, role: m.role } : null
  }

  if (!activeWorkspace) redirect('/onboarding')

  // All workspaces for switcher
  const memberships = await db.workspaceMember.findMany({
    where: { userId: user.id },
    include: { workspace: { select: { id: true, name: true, slug: true } } },
    orderBy: { createdAt: 'asc' }
  })

  // Fetch user record from our DB
  const dbUser = await db.user.findUnique({ where: { id: user.id } })

  const workspaceContextValue = {
    user: {
      id: user.id,
      email: user.email ?? '',
      name: dbUser?.name ?? null,
      avatarUrl: dbUser?.avatarUrl ?? null
    },
    workspace: {
      id: activeWorkspace.workspace.id,
      name: activeWorkspace.workspace.name,
      slug: activeWorkspace.workspace.slug,
      role: activeWorkspace.role
    },
    workspaces: memberships.map((m) => ({
      id: m.workspace.id,
      name: m.workspace.name,
      slug: m.workspace.slug,
      role: m.role
    })),
    plan: activeWorkspace.workspace.subscription?.plan
      ? {
          id: activeWorkspace.workspace.subscription.plan.id,
          name: activeWorkspace.workspace.subscription.plan.name
        }
      : null
  }

  const defaultOpen = cookieStore.get('sidebar_state')?.value === 'true'

  return (
    <WorkspaceProvider value={workspaceContextValue}>
      <KBar>
        <SidebarProvider defaultOpen={defaultOpen}>
          <InfobarProvider defaultOpen={false}>
            <AppSidebar />
            <SidebarInset>
              <Header />
              {children}
            </SidebarInset>
            <InfoSidebar side='right' />
          </InfobarProvider>
        </SidebarProvider>
      </KBar>
    </WorkspaceProvider>
  )
}
