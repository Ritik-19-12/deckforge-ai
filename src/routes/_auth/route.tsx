// we use this file for keep same layout for all auth routes, like login, register, forgot password etc.


import { createFileRoute, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute('/_auth')({
  component: AuthLayout,
})

function AuthLayout() {
  return (
    <div className="min-h-screen w-full">
      <Outlet />
    </div>
  )
}