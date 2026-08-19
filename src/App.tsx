import { Redirect, Route, Switch, useLocation } from 'wouter'
import { AppShell } from './components/AppShell'
import { Onboarding } from './components/Onboarding'
import { useAppState } from './state/AppState'
import { DashboardPage } from './pages/DashboardPage'
import { LearnPage } from './pages/LearnPage'
import { PracticePage } from './pages/PracticePage'
import { EssayPage } from './pages/EssayPage'
import { MocksPage } from './pages/MocksPage'
import { MockRunner } from './pages/MockRunner'
import { InsightsPage } from './pages/InsightsPage'
import { MistakesPage } from './pages/MistakesPage'
import { SettingsPage } from './pages/SettingsPage'

export default function App() {
  const { loading, settings, error } = useAppState()
  const [location] = useLocation()

  if (loading) {
    return (
      <div className="app-loading" role="status" aria-live="polite">
        <div className="brand-mark">L</div>
        <div className="loading-lines"><span /><span /><span /></div>
        <span className="sr-only">Loading your LNAT workspace</span>
      </div>
    )
  }

  if (error) {
    return (
      <main className="server-error">
        <strong>Start the local LNATLAS server.</strong>
        <p>{error}</p>
        <code>npm run build &amp;&amp; npm start</code>
      </main>
    )
  }

  // The mock runner takes the whole viewport: no shell, no navigation, no exit
  // that is not a deliberate one, because that is the condition being practised.
  if (location.startsWith('/mock/run')) {
    return <Switch><Route path="/mock/run" component={MockRunner} /><Route><Redirect to="/" /></Route></Switch>
  }

  return (
    <>
      {!settings.onboardingComplete && <Onboarding />}
      <AppShell>
        <Switch>
          <Route path="/" component={DashboardPage} />
          <Route path="/learn" component={LearnPage} />
          <Route path="/practice" component={PracticePage} />
          <Route path="/essay" component={EssayPage} />
          <Route path="/mocks" component={MocksPage} />
          <Route path="/insights" component={InsightsPage} />
          <Route path="/mistakes" component={MistakesPage} />
          <Route path="/settings" component={SettingsPage} />
          <Route><Redirect to="/" /></Route>
        </Switch>
      </AppShell>
    </>
  )
}
