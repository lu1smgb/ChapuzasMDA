'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from "@/components/ui/card"
import { PartyPopper } from "lucide-react"

// Function to get the teacher's name
const getTeacherName = () => {
  // In a real application, this would likely come from an authentication context or API call
  return localStorage.getItem('profName') || 'Profesor';
};

export default function TeacherDashboard() {
  const [teacherName, setTeacherName] = useState<string>('');

  useEffect(() => {
    // Get the teacher's name when the component mounts
    const name = getTeacherName();
    setTeacherName(name);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 flex flex-col p-4">
      <main className="flex-grow flex flex-col items-center justify-center">
        <Card className="bg-white/80 backdrop-blur-md rounded-lg shadow-lg p-6 w-full max-w-2xl">
          <CardContent className="flex items-center justify-center space-x-2">
            <h1 className="text-3xl font-bold text-gray-900">¡Bienvenido/a, {teacherName}!</h1>
            <PartyPopper className="h-6 w-6 text-yellow-500" />
          </CardContent>
        </Card>
      </main>
    </div>
  )
}