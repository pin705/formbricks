'use client'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar
} from '@/components/ui/sidebar'
import { useWorkspace, type WorkspaceItem } from '@/contexts/workspace-context'
import { Icons } from '@/components/icons'
import { useRouter } from 'next/navigation'
import { useTransition } from 'react'

async function switchWorkspace(workspaceId: string) {
  await fetch('/api/workspaces/switch', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ workspaceId })
  })
}

function WorkspaceAvatar({ name }: { name: string }) {
  return (
    <div className='bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 shrink-0 items-center justify-center rounded-lg font-semibold text-sm'>
      {name.slice(0, 2).toUpperCase()}
    </div>
  )
}

export function WorkspaceSwitcher() {
  const { isMobile, state } = useSidebar()
  const { workspace, workspaces } = useWorkspace()
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const handleSwitch = (ws: WorkspaceItem) => {
    if (ws.id === workspace.id) return
    startTransition(async () => {
      await switchWorkspace(ws.id)
      router.refresh()
    })
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size='lg'
              className='data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground'
              disabled={isPending}
            >
              <WorkspaceAvatar name={workspace.name} />
              <div
                className={`grid flex-1 text-left text-sm leading-tight transition-all duration-200 ease-in-out ${
                  state === 'collapsed'
                    ? 'invisible max-w-0 overflow-hidden opacity-0'
                    : 'visible max-w-full opacity-100'
                }`}
              >
                <span className='truncate font-medium'>{workspace.name}</span>
                <span className='text-muted-foreground truncate text-xs capitalize'>
                  {workspace.role}
                </span>
              </div>
              <Icons.chevronsUpDown
                className={`ml-auto size-4 transition-all duration-200 ease-in-out ${
                  state === 'collapsed' ? 'invisible opacity-0' : 'visible opacity-100'
                }`}
              />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className='w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg'
            align='start'
            side={isMobile ? 'bottom' : 'right'}
            sideOffset={4}
          >
            <DropdownMenuLabel className='text-muted-foreground text-xs'>
              Workspaces
            </DropdownMenuLabel>
            {workspaces.map((ws, index) => (
              <DropdownMenuItem
                key={ws.id}
                onClick={() => handleSwitch(ws)}
                className='gap-2 p-2'
              >
                <div className='flex size-6 items-center justify-center rounded-md border font-semibold text-xs'>
                  {ws.name.slice(0, 2).toUpperCase()}
                </div>
                {ws.name}
                {ws.id === workspace.id && <Icons.check className='ml-auto size-4' />}
                {ws.id !== workspace.id && (
                  <DropdownMenuShortcut>⌘{index + 1}</DropdownMenuShortcut>
                )}
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className='gap-2 p-2'
              onClick={() => router.push('/onboarding/workspace?new=1')}
            >
              <div className='flex size-6 items-center justify-center rounded-md border bg-transparent'>
                <Icons.add className='size-4' />
              </div>
              <div className='text-muted-foreground font-medium'>New workspace</div>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
