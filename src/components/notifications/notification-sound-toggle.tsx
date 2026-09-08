/**
 * @file notification-sound-toggle.tsx
 * @description Header / settings control for enabling, disabling, and testing audio notification chimes.
 */

"use client"

import * as React from "react"
import { Volume2, VolumeX, Play } from "lucide-react"
import { Button } from "@/components/ui/button"
import { notificationAudio } from "@/lib/notification-sound"

export function NotificationSoundToggle({ className }: { className?: string }) {
  const [isMuted, setIsMuted] = React.useState(false)

  React.useEffect(() => {
    setIsMuted(notificationAudio.getIsMuted())
  }, [])

  const handleToggle = () => {
    const next = !isMuted
    setIsMuted(next)
    notificationAudio.setMuted(next)
    if (!next) {
      notificationAudio.playChime()
    }
  }

  const handleTestChime = () => {
    if (isMuted) {
      setIsMuted(false)
      notificationAudio.setMuted(false)
    }
    notificationAudio.playChime()
  }

  return (
    <div className={`flex items-center gap-1.5 ${className ?? ""}`}>
      <Button
        variant="outline"
        size="sm"
        onClick={handleToggle}
        className={`h-8 gap-1.5 text-xs font-medium border-border/80 ${
          isMuted ? "text-muted-foreground" : "text-indigo-600 dark:text-indigo-400"
        }`}
        title={isMuted ? "Unmute Notification Sounds" : "Mute Notification Sounds"}
      >
        {isMuted ? (
          <>
            <VolumeX className="size-3.5" />
            <span>Muted</span>
          </>
        ) : (
          <>
            <Volume2 className="size-3.5" />
            <span>Sound On</span>
          </>
        )}
      </Button>

      <Button
        variant="ghost"
        size="sm"
        onClick={handleTestChime}
        className="h-8 px-2 text-xs text-muted-foreground hover:text-foreground"
        title="Test Incoming Notification Chime"
      >
        <Play className="size-3" />
        <span className="ml-1 text-[11px]">Test Chime</span>
      </Button>
    </div>
  )
}
