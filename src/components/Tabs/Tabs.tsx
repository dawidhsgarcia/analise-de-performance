import { NavLink } from 'react-router-dom'
import styles from './Tabs.module.css'

const tabs = [
  { path: '/dashboard', label: 'Dashboard' },
  { path: '/acompanhamento', label: 'Acompanhamento' },
  { path: '/parametros', label: 'Parâmetros' },
]

export default function Tabs() {
  return (
    <div className={styles.tabs} role="tablist">
      {tabs.map((tab) => (
        <NavLink
          key={tab.path}
          to={tab.path}
          className={({ isActive }) =>
            `${styles.tabBtn} ${isActive ? styles.active : ''}`
          }
          role="tab"
        >
          {tab.label}
        </NavLink>
      ))}
    </div>
  )
}
