import type { ReactNode } from 'react'
import styles from './AppShell.module.css'

interface Props {
  children: ReactNode
}

export default function AppShell({ children }: Props) {
  return (
    <div className={styles.shell} id="appShell">
      <div className={styles.main}>{children}</div>
    </div>
  )
}
