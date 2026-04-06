'use client'

import { useState } from 'react'
import { HydrationBoundary, DehydratedState, dehydrate } from '@tanstack/react-query'
import { getQueryClient } from '@/lib/query-client'
import { CreateLinkSheet } from './create-link-sheet'
import { LinksTable } from './link-table'

export function LinkListingClient() {
  const [sheetOpen, setSheetOpen] = useState(false)

  return (
    <>
      <LinksTable />
      <CreateLinkSheet open={sheetOpen} onOpenChange={setSheetOpen} />
    </>
  )
}
