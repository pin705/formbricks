import { Dub } from 'dub'

const globalForDub = globalThis as unknown as { dub: Dub }

export const dub =
  globalForDub.dub ??
  new Dub({
    token: process.env.DUB_API_KEY!
  })

if (process.env.NODE_ENV !== 'production') globalForDub.dub = dub
