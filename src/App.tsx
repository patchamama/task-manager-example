import { BrowserRouter } from 'react-router-dom'
import { TaskManagementPage } from './features/task-management/pages/TaskManagementPage'

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50">
        <TaskManagementPage />
      </div>
    </BrowserRouter>
  )
}

export default App
