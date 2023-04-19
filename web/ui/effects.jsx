import { useState } from 'react'

export const useTimed = (initial, active) => {
  const [current, setCurrent] = useState(initial)
  const [timer, setTimer] = useState(null)

  const runEffect = async (durationSec, delaySec) => {
    if (!delaySec) { delaySec = 0 }

    if (timer) {
      clearTimeout(timer)
      setCurrent(initial)
      setTimer(null)
    }

    await new Promise((resolve) => {
      const timer = setTimeout(resolve, delaySec * 1000)
      setTimer(timer)
    })

    setCurrent(active)

    await new Promise((resolve) => {
      const timer = setTimeout(resolve, durationSec * 1000)
      setTimer(timer)
    })

    setCurrent(initial)
    setTimer(null)
  }
  
  return [current, (durationSec, delaySec) => { runEffect(durationSec, delaySec) }]
}
