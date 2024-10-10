'use client'
import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
//import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
//import { Input } from '@/components/ui/input'
import { Image as ImageIcon, KeyRound, Volume } from 'lucide-react'

const loginMethods = [
  { id: 'images', name: 'Imágenes', icon: ImageIcon },
  { id: 'pin', name: 'PIN', icon: KeyRound },
]

const imageOptions = [
  { id: 1, emoji: '🐶', alt: 'Perro' },
  { id: 2, emoji: '🐱', alt: 'Gato' },
  { id: 3, emoji: '🐦', alt: 'Pájaro' },
  { id: 4, emoji: '🐠', alt: 'Pez' },
]

export default function LoginScreen() {
  const router = useRouter()
  const [loginMethod, setLoginMethod] = useState('images')
  const [selectedImages, setSelectedImages] = useState<number[]>([])
  const [pin, setPin] = useState('')
  const [error, setError] = useState('')

  const handleImageSelect = (id: number) => {
    setSelectedImages(prev => {
      if (prev.includes(id)) {
        return prev.filter(imgId => imgId !== id)
      } else if (prev.length < 3) {
        return [...prev, id]
      }
      return prev
    })
  }

  const handlePinInput = (digit: string) => {
    if (pin.length < 4) {
      setPin(prev => prev + digit)
    }
  }

  const handleLogin = async () => {
    const username = loginMethod === 'images' 
      ? selectedImages.map(id => imageOptions.find(img => img.id === id)?.alt).join('')
      : pin;

    const response = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password: username }), // En este caso, usamos el mismo valor como contraseña
    });

    const data = await response.json();

    if (data.success) {
      router.push('/');
    } else {
      setError('Login incorrecto. Por favor, inténtalo de nuevo.');
    }
  }

  const handleReset = () => {
    setSelectedImages([])
    setPin('')
    setError('')
  }

  const playInstructions = () => {
    // Aquí iría la lógica para reproducir instrucciones de voz
    console.log("Reproduciendo instrucciones de voz")
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-yellow-200 to-green-200 p-4 flex flex-col items-center justify-center">
      <Card className="w-full max-w-md bg-white rounded-3xl shadow-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-blue-600">¡Hola! Inicia sesión</h1>
          <Button onClick={playInstructions} className="bg-purple-500 hover:bg-purple-600 rounded-full p-2">
            <Volume className="h-6 w-6 text-white" />
          </Button>
        </div>
        
        <div className="flex justify-center space-x-4 mb-6">
          {loginMethods.map(method => (
            <Button
              key={method.id}
              onClick={() => {
                setLoginMethod(method.id)
                handleReset()
              }}
              className={`flex flex-col items-center p-4 ${loginMethod === method.id ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-800'}`}
            >
              <method.icon className="h-8 w-8 mb-2" />
              <span className="text-lg">{method.name}</span>
            </Button>
          ))}
        </div>

        {loginMethod === 'images' ? (
          <div className="grid grid-cols-2 gap-4 mb-6">
            {imageOptions.map(img => (
              <Button
                key={img.id}
                onClick={() => handleImageSelect(img.id)}
                className={`p-4 text-5xl ${selectedImages.includes(img.id) ? 'bg-green-300' : 'bg-gray-100'}`}
              >
                {img.emoji}
              </Button>
            ))}
          </div>
        ) : (
          <div className="mb-6">
            <div className="bg-gray-100 p-4 rounded-lg text-center text-3xl font-bold mb-4">
              {pin.replace(/./g, '●')}
            </div>
            <div className="grid grid-cols-3 gap-2">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 0].map(num => (
                <Button
                  key={num}
                  onClick={() => handlePinInput(num.toString())}
                  className="p-4 text-2xl font-bold bg-blue-100 hover:bg-blue-200"
                >
                  {num}
                </Button>
              ))}
            </div>
          </div>
        )}

        {error && <p className="text-red-500 text-center mb-4">{error}</p>}

        <div className="flex justify-between">
          <Button 
            onClick={handleReset} 
            className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-full text-xl"
          >
            Borrar
          </Button>
          <Button 
            onClick={handleLogin} 
            className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-full text-xl"
            disabled={loginMethod === 'images' ? selectedImages.length === 0 : pin.length < 4}
          >
            Entrar
          </Button>
        </div>
      </Card>
    </div>
  )
}