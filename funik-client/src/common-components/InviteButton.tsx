import React, { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { IoCopyOutline, IoCheckmark } from 'react-icons/io5'

type InviteButtonProps = {
    gameKey: string
    gameTitle: string
    roomId: string
}

/** Shares a direct join link: the native share sheet on touch devices, the clipboard elsewhere. */
const InviteButton: React.FC<InviteButtonProps> = ({ gameKey, gameTitle, roomId }) => {
    const [copied, setCopied] = useState(false)

    useEffect(() => {
        if (!copied) return
        const timeout = setTimeout(() => setCopied(false), 2000)
        return () => clearTimeout(timeout)
    }, [copied])

    const handleInvite = async () => {
        const url = `${window.location.origin}/join_game?gamekey=${gameKey}&room=${encodeURIComponent(roomId)}`
        const isTouch = window.matchMedia('(pointer: coarse)').matches
        try {
            if (isTouch && navigator.share) {
                await navigator.share({ title: `Play ${gameTitle} on Funik`, text: `Join my room ${roomId}`, url })
            } else {
                await navigator.clipboard.writeText(url)
                setCopied(true)
            }
        } catch {
            // Share sheet dismissed or clipboard unavailable; nothing to do.
        }
    }

    return (
        <Button variant='outline' size='sm' onClick={handleInvite} className='shrink-0'>
            {copied ? <IoCheckmark /> : <IoCopyOutline />}
            {copied ? 'Link copied' : 'Invite'}
        </Button>
    )
}

export default InviteButton
