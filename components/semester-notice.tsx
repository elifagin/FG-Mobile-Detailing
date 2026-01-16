"use client"

import { useState, useEffect, createContext, useContext, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { X, AlertTriangle, MessageCircle } from 'lucide-react'
import { contact } from '@/data/services'

// Configuration
const NOTICE_VERSION = 'v1'
const STORAGE_KEY = `semester-notice-${NOTICE_VERSION}`
const DISMISSAL_DURATION_DAYS = 7
const AUTO_DISABLE_DATE = new Date('2026-06-01T00:00:00')

interface NoticeState {
  acknowledged: boolean
  dismissedAt: number | null
}

interface SemesterNoticeContextType {
  isAcknowledged: boolean
  openModal: () => void
  isBannerVisible: boolean
}

const SemesterNoticeContext = createContext<SemesterNoticeContextType>({
  isAcknowledged: false,
  openModal: () => {},
  isBannerVisible: false,
})

export function useSemesterNotice() {
  return useContext(SemesterNoticeContext)
}

function getStoredState(): NoticeState | null {
  if (typeof window === 'undefined') return null
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) return null
    return JSON.parse(stored)
  } catch {
    return null
  }
}

function setStoredState(state: NoticeState) {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {
    // Ignore storage errors
  }
}

function shouldShowNotice(): boolean {
  // Auto-disable after June 1, 2026
  if (new Date() >= AUTO_DISABLE_DATE) return false

  const stored = getStoredState()
  if (!stored) return true

  // Check if dismissal has expired (7 days)
  if (stored.dismissedAt) {
    const daysSinceDismissal = (Date.now() - stored.dismissedAt) / (1000 * 60 * 60 * 24)
    if (daysSinceDismissal >= DISMISSAL_DURATION_DAYS) {
      return true
    }
  }

  return false
}

function isAcknowledgedFromStorage(): boolean {
  // After auto-disable date, treat as acknowledged
  if (new Date() >= AUTO_DISABLE_DATE) return true

  const stored = getStoredState()
  if (!stored) return false

  // Check if within valid dismissal window
  if (stored.dismissedAt) {
    const daysSinceDismissal = (Date.now() - stored.dismissedAt) / (1000 * 60 * 60 * 24)
    return daysSinceDismissal < DISMISSAL_DURATION_DAYS && stored.acknowledged
  }

  return stored.acknowledged
}

function isAfterDisableDate(): boolean {
  return new Date() >= AUTO_DISABLE_DATE
}

export default function SemesterNotice({ children }: { children: React.ReactNode }) {
  const [showModal, setShowModal] = useState(false)
  const [showBanner, setShowBanner] = useState(false)
  const [isAcknowledged, setIsAcknowledged] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)

    // Don't show anything after auto-disable date
    if (isAfterDisableDate()) {
      setIsAcknowledged(true)
      return
    }

    // Check stored acknowledgment
    setIsAcknowledged(isAcknowledgedFromStorage())

    // Show modal on first visit or after expiry
    if (shouldShowNotice()) {
      setShowModal(true)
    }

    // Always show banner during active period
    setShowBanner(true)
  }, [])

  const handleDismiss = useCallback(() => {
    setShowModal(false)
    setIsAcknowledged(true)
    setStoredState({
      acknowledged: true,
      dismissedAt: Date.now(),
    })
  }, [])

  const openModal = useCallback(() => {
    if (!isAfterDisableDate()) {
      setShowModal(true)
    }
  }, [])

  const phoneNumber = contact.phone.replace(/\D/g, '')

  // Don't render anything server-side to avoid hydration mismatch
  if (!mounted) {
    return (
      <SemesterNoticeContext.Provider value={{ isAcknowledged: false, openModal: () => {}, isBannerVisible: false }}>
        {children}
      </SemesterNoticeContext.Provider>
    )
  }

  // After disable date, just render children
  if (isAfterDisableDate()) {
    return (
      <SemesterNoticeContext.Provider value={{ isAcknowledged: true, openModal: () => {}, isBannerVisible: false }}>
        {children}
      </SemesterNoticeContext.Provider>
    )
  }

  return (
    <SemesterNoticeContext.Provider value={{ isAcknowledged, openModal, isBannerVisible: showBanner }}>
      {/* Persistent Banner */}
      {showBanner && (
        <div className="fixed top-0 left-0 right-0 z-[60] bg-amber-500/95 text-black py-2 px-4 text-center text-sm font-medium backdrop-blur-sm">
          <div className="max-w-4xl mx-auto flex items-center justify-center gap-2">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            <span>
              Heads up: Our team is away at college this semester. Services resume May 2026.
            </span>
          </div>
        </div>
      )}

      {/* Spacer for fixed banner */}
      {showBanner && <div className="h-10" />}

      {/* Modal Overlay */}
      {showModal && (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              // Don't close on backdrop click - require explicit action
            }
          }}
        >
          <div className="bg-card border border-border rounded-xl shadow-2xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h2 className="text-xl font-heading font-semibold text-foreground">
                We're Away During the Semester
              </h2>
              <button
                onClick={handleDismiss}
                className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded-md hover:bg-muted"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="p-5 space-y-4 text-muted-foreground">
              <p>
                Our team is currently away at college and won't be able to perform detailing services during the semester.
              </p>
              <p>
                We plan to resume full service availability in <strong className="text-foreground">May 2026</strong> once the semester concludes.
              </p>
              <p>
                You're still welcome to submit a message, but please note that responses may be delayed during this time.
              </p>
              <p className="text-foreground font-medium">
                Thanks for your patience — we look forward to working with you soon.
              </p>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-border flex flex-col sm:flex-row gap-3">
              <Button
                onClick={handleDismiss}
                className="flex-1"
              >
                I understand
              </Button>
              <Button
                variant="outline"
                asChild
                className="flex-1"
              >
                <a href={`sms:+1${phoneNumber}`} className="flex items-center justify-center gap-2">
                  <MessageCircle className="w-4 h-4" />
                  Text us instead
                </a>
              </Button>
            </div>
          </div>
        </div>
      )}

      {children}
    </SemesterNoticeContext.Provider>
  )
}

// Form warning component to be used in forms
export function SemesterFormWarning() {
  const { isAcknowledged, openModal } = useSemesterNotice()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Don't render server-side or after disable date
  if (!mounted || isAfterDisableDate()) {
    return null
  }

  return (
    <div className="mb-4 p-4 bg-amber-500/10 border border-amber-500/30 rounded-lg">
      <div className="flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
        <div className="space-y-2 text-sm">
          <p className="text-amber-200">
            <strong>Please note:</strong> Our team is away at college this semester.
            Responses may be delayed, and services resume in May 2026.
          </p>
          {!isAcknowledged && (
            <button
              type="button"
              onClick={openModal}
              className="text-amber-400 hover:text-amber-300 underline underline-offset-2 font-medium"
            >
              View full notice
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
