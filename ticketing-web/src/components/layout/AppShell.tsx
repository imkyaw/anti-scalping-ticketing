import { Outlet } from 'react-router'
import { AppFooter } from './AppFooter'
import { PageContainer } from './PageContainer'
import { TopNav } from './TopNav'

export function AppShell() {
  return (
    <div className="flex min-h-screen flex-col">
      <TopNav />
      <main className="flex-1 py-8 lg:py-10">
        <PageContainer>
          <Outlet />
        </PageContainer>
      </main>
      <AppFooter />
    </div>
  )
}
