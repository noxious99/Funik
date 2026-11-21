import { useEffect, useRef, useState } from 'react'
import { BOARD_SIZE } from './fleet'

/** Measures a board container and returns the size of one cell, tracking resizes. */
export const useCellSize = <T extends HTMLElement>() => {
    const ref = useRef<T>(null)
    const [cellSize, setCellSize] = useState(32)

    useEffect(() => {
        const element = ref.current
        if (!element) return
        const update = () => setCellSize(element.getBoundingClientRect().width / BOARD_SIZE)
        update()
        const observer = new ResizeObserver(update)
        observer.observe(element)
        return () => observer.disconnect()
    }, [])

    return { ref, cellSize }
}
