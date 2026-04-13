import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ROUTES } from '../constants/appConstants'
import { AuthProvider } from './AuthContext'
import Layout from '../components/Layout'
import PurchasesPage from '../features/purchases/PurchasesPage'
import AccountsPage from '../features/accounts/AccountsPage'
import AnalyticsPage from '../features/analytics/AnalyticsPage'

export default function AppRouter() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route element={<Layout />}>
            <Route path={ROUTES.PURCHASES} element={<PurchasesPage />} />
            <Route path={ROUTES.AUDIT} element={<AccountsPage />} />
            <Route path={ROUTES.ANALYTICS} element={<AnalyticsPage />} />
            <Route path="*" element={<Navigate to={ROUTES.PURCHASES} replace />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
