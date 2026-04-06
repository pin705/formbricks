'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Icons } from '@/components/icons'
import { CreateLinkSheet } from './create-link-sheet'

export function CreateLinkTrigger() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <Button onClick={() => setOpen(true)} size='sm'>
        <Icons.add className='mr-2 h-4 w-4' />
        Create Link
      </Button>
      <CreateLinkSheet open={open} onOpenChange={setOpen} />
    </>
  )
}
