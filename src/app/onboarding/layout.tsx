import { Icons } from '@/components/icons'
import Link from 'next/link'

export default function OnboardingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className='flex min-h-svh flex-col bg-background'>
      <header className='flex h-14 items-center border-b px-6'>
        <Link href='/' className='flex items-center gap-2 font-semibold'>
          <div className='flex size-7 items-center justify-center rounded-lg bg-primary text-primary-foreground'>
            <Icons.link className='size-4' />
          </div>
          <span>LinkOS</span>
        </Link>
      </header>
      <main className='flex flex-1 items-start justify-center p-6 pt-16'>
        <div className='w-full max-w-lg'>{children}</div>
      </main>
    </div>
  )
}
