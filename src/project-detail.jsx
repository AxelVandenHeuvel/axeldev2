import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import ProjectDetailPage from './ProjectDetailPage.jsx'

const params = new URLSearchParams(window.location.search)
const slug = params.get('slug') ?? ''

ReactDOM.createRoot(document.getElementById('project-detail-app')).render(
  <React.StrictMode>
    <ProjectDetailPage slug={slug} />
  </React.StrictMode>,
)
