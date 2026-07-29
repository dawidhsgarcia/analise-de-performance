import { useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useStore } from '@/store/useStore'
import AppShell from '@/components/Layout/AppShell'
import Header from '@/components/Layout/Header'
import Footer from '@/components/Layout/Footer'
import Controls from '@/components/Controls/Controls'
import Tabs from '@/components/Tabs/Tabs'
import DashboardPage from '@/components/Dashboard/DashboardPage'
import MainTablePage from '@/components/MainTable/MainTablePage'
import ParamsPage from '@/components/Params/ParamsPage'

function App() {
  const loadInitialState = useStore((s) => s.loadInitialState)

  useEffect(() => {
    loadInitialState()
  }, [loadInitialState])

  return (
    <AppShell>
      <Header />
      <div className="page-content">
        <Controls />
        <Tabs />
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/acompanhamento" element={<MainTablePage />} />
          <Route path="/parametros" element={<ParamsPage />} />
        </Routes>
      </div>
      <Footer />
    </AppShell>
  )
}

export default App
