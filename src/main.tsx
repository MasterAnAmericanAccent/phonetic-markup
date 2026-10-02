import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from './app/App'
import { brandShellCss } from './branding/brand'
import { annotationCss, tokensCss } from './styles/sharedCss'
import './styles/editor.css'

const sharedStyle = document.createElement('style')
sharedStyle.textContent = `${tokensCss}\n${annotationCss}\n${brandShellCss()}`
document.head.appendChild(sharedStyle)

const root = document.getElementById('root')
if (!root) throw new Error('Root element not found')

createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
