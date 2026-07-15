import {
  HeadContent,
  Scripts,
  Outlet,
  createRootRoute,
} from '@tanstack/react-router'
import { useState } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import Navbar from '../components/navbar'

import appCss from '../styles.css?url'
import { Toaster } from '#/components/ui/sonner'

const THEME_INIT_SCRIPT = `(function(){try{var stored=window.localStorage.getItem('theme');var mode=(stored==='light'||stored==='dark'||stored==='auto')?stored:'auto';var prefersDark=window.matchMedia('(prefers-color-scheme: dark)').matches;var resolved=mode==='auto'?(prefersDark?'dark':'light'):mode;var root=document.documentElement;root.classList.remove('light','dark');root.classList.add(resolved);if(mode==='auto'){root.removeAttribute('data-theme')}else{root.setAttribute('data-theme',mode)}root.style.colorScheme=resolved;}catch(e){}})();`

export const Route = createRootRoute({
  head: () => ({
    meta: [
      {
        charSet: 'utf-8',
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1',
      },
      {
        title: 'TanStack Start Starter',
      },
    ],
    links: [
      {
        rel: 'stylesheet',
        href: appCss,
      },
    ],
  }),
  component: RootLayout,
  shellComponent: RootDocument,
  notFoundComponent: NotFound,
})
function RootLayout() {
  const [queryClient] = useState(() => new QueryClient())

  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-svh">
        <Navbar />
        <Outlet />
      </div>
    </QueryClientProvider>
  )
}

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
        <HeadContent />
      </head>
      <body className="font-sans antialiased bg-background text-foreground selection:bg-primary/20">
        {children}

        <Toaster />
        <Scripts />
      </body>
    </html>
  )
}

function NotFound() {
  return (
    <main className="min-h-[60vh] flex items-center justify-center p-8">
      <div className="text-center">
        <h1 className="text-2xl font-bold">404 — Not Found</h1>
        <p className="mt-2 text-muted-foreground">The page you&apos;re looking for doesn&apos;t exist.</p>
      </div>
    </main>
  )
}
