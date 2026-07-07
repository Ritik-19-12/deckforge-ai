import { Switch } from '#/components/ui/switch'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/')({ component: App })

function App() {
  return (
    <div>
      <Switch/>
    </div>
  )
}
