import { createBrowserRouter } from 'react-router-dom'
import App from './App'
import { ProjectsPage } from './pages/ProjectsPage'
import { ProjectView } from './pages/ProjectView'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      {
        path: 'projects',
        element: <ProjectsPage />,
      },
      {
        path: 'p/:projectId',
        element: <ProjectView />,
        children: [
          {
            path: ':canvasId',
            element: null, // Canvas is rendered by ProjectView
          },
        ],
      },
    ],
  },
])
