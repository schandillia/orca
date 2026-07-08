"use client"

import { createContext, useContext, useState } from "react"
import { LoginForm } from "@/components/auth/login-form"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog"

interface LoginModalContextValue {
  openModal: () => void
  closeModal: () => void
}

const LoginModalContext = createContext<LoginModalContextValue | null>(null)

export function useLoginModal() {
  const ctx = useContext(LoginModalContext)
  if (!ctx)
    throw new Error("useLoginModal must be used within LoginModalProvider")
  return ctx
}

export function LoginModalProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const [open, setOpen] = useState(false)
  const [callbackURL, setCallbackURL] = useState("/dashboard")

  return (
    <LoginModalContext.Provider
      value={{
        openModal: () => {
          setCallbackURL(window.location.pathname)
          setOpen(true)
        },
        closeModal: () => setOpen(false),
      }}
    >
      {children}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="p-0 max-w-3xl">
          <DialogTitle className="sr-only">Sign in</DialogTitle>
          <DialogDescription className="sr-only">
            Enter your email below to receive a secure login link.
          </DialogDescription>
          {open && (
            <LoginForm
              callbackURL={callbackURL}
              onSuccess={() => setOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </LoginModalContext.Provider>
  )
}
