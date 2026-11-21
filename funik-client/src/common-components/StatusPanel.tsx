import React from 'react'
import { Button } from '@/components/ui/button'

/** Shared loading / error placeholder for data-backed pages. */
const StatusPanel: React.FC<{ message: string, onRetry?: () => void }> = ({ message, onRetry }) => (
    <div className='flex flex-col items-center gap-4 rounded-2xl border bg-card/60 p-8 text-center text-sm text-muted-foreground'>
        <p role='status'>{message}</p>
        {onRetry && <Button variant='outline' size='sm' onClick={onRetry}>Try again</Button>}
    </div>
)

export default StatusPanel
