import '../css/MobileScrollContainer.css'

import { useEffect, useState } from 'react'

const MobileScrollContainer = ({ children }) => {
  const [windowWidth, setWindowWidth] = useState(window.innerWidth)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const mobileLayout = windowWidth < 700;

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth)
    }

    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
    }
  })

  const handleClick = () => {
    console.log('click')
    setSidebarOpen(!sidebarOpen)
  }

  const sidebarClass = sidebarOpen ? 'sidebar-open' : ''
  const iconClass = sidebarOpen ? 'fa-chevron-left' : 'fa-chevron-right'

  return (
    <div className={`mobile-scroll-container ${sidebarClass}`}>
      {children}
      <div onClick={handleClick} className={`mobile-sidebar-tab ${sidebarClass}`}>
        <i className={`fa ${iconClass} fa-2x main-sidebar-tab-icon`}/>
      </div>
    </div>
  )
}

export default MobileScrollContainer
