'use client'

import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft } from 'lucide-react'

export default function OrderConfirmation() {
  const router = useRouter()

  return (
    <div className="h-screen bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 flex flex-col items-center justify-center p-4">
      <Card className="w-full max-w-2xl bg-white/80 backdrop-blur-md shadow-lg">
        <CardHeader>
          <CardTitle className="text-4xl font-bold text-center text-gray-900">Order Confirmed</CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-2xl mb-8">Thank you for your order!</p>
          <p className="text-xl mb-4">Your food will be delivered to the selected classroom.</p>
          <Button 
            onClick={() => router.push('/home')}
            className="bg-yellow-400 hover:bg-yellow-500 text-gray-800 text-2xl py-3 px-6"
          >
            <ArrowLeft className="mr-2 h-6 w-6" />
            Back to Home
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

