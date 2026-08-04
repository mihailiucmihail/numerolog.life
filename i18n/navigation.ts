import { createNavigation } from 'next-intl/navigation'
import { routing } from './routing'

// Wrappere usoare peste API-urile de navigare Next.js
// care tin cont de configuratia de routing (prefix locale)
export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing)
