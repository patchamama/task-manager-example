import { BrowserRouter } from 'react-router-dom'
import { TaskManagementPage } from './features/task-management/pages/TaskManagementPage'
import { ThemeProvider } from './shared/theme'

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
          <TaskManagementPage />
        </div>
      </BrowserRouter>
    </ThemeProvider>
  )
}

export default App
