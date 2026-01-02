"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("")
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // TODO: Implement forgot password logic
    setIsSubmitted(true)
  }

  if (isSubmitted) {
    return (
      <Card className="backdrop-blur-sm bg-card/80 border-border/50 shadow-xl">
        <CardHeader className="text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-primary/10 rounded-full mb-4 mx-auto">
            <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <CardTitle className="text-xl font-bold">Check Your Email</CardTitle>
          <CardDescription>We've sent password reset instructions to {email}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center space-y-4">
            <p className="text-sm text-muted-foreground">
              Didn't receive the email? Check your spam folder or try again.
            </p>
            <Button variant="outline" onClick={() => setIsSubmitted(false)} className="w-full">
              Try Again
            </Button>
            <Link href="/login" className="block">
              <Button variant="ghost" className="w-full">
                Back to Sign In
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="backdrop-blur-sm bg-card/80 border-border/50 shadow-xl">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold">Forgot Password?</CardTitle>
        <CardDescription>Enter your email address and we'll send you a link to reset your password</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              placeholder="doctor@hospital.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="bg-input/50 backdrop-blur-sm"
            />
          </div>

          <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
            Reset Password
          </Button>

          <div className="text-center">
            <Link href="/login" className="text-sm text-primary hover:text-primary/80 transition-colors">
              Back to Sign In
            </Link>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
