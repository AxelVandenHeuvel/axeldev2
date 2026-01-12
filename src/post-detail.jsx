import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import PostDetailPage from './PostDetailPage.jsx'

const params = new URLSearchParams(window.location.search)
const slug = params.get('slug') ?? ''

ReactDOM.createRoot(document.getElementById('project-detail-app')).render(
  <React.StrictMode>
    <PostDetailPage slug={slug} />
  </React.StrictMode>,
)

