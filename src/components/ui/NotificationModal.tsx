import React, { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface NotificationModalProps {
  isOpen: boolean
  onClose: () => void
  message: string
  type: 'success' | 'warning'
  duration?: number
}

export const NotificationModal: React.FC<NotificationModalProps> = ({ 
  isOpen, 
  onClose, 
  message, 
  type,
  duration = 5000
}) => {
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        onClose()
      }, duration)

      return () => clearTimeout(timer)
    }
  }, [isOpen, onClose, duration])

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            className={`bg-white p-8 rounded-xl shadow-lg max-w-md w-full mx-4 text-center ${
              type === 'success' ? 'border-green-500' : 'border-yellow-500'
            } border-4`}
          >
            <h2 className={`text-3xl font-bold mb-4 ${
              type === 'success' ? 'text-green-600' : 'text-yellow-600'
            }`}>
              {type === 'success' ? '¡FELICIDADES!' : '¡ÁNIMO!'}
            </h2>
            <p className="text-xl mb-6">{message}</p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

