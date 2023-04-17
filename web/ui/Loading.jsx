import '../css/Loading.css'

import { useState, useEffect } from 'react'

const Loading = () => {
  const [show, setShow] = useState(false)
  useEffect(() => {
    const timer = setTimeout(() => { setShow(true) }, 150)
    return () => { clearTimeout(timer) }
  }, [])

  if (show) {
    return (
      <div className='loading'>
        <i className='fa fa-pulse fa-spinner fa-3x' />
      </div>
    )
  }
  else {
    return null
  }
}

export default Loading
