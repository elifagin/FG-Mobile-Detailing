"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { CheckCircle, AlertCircle } from 'lucide-react'
import { contact } from '@/data/services'

// Connecticut towns for autocomplete
const ctTowns = [
  // Hartford County
  'Avon', 'Berlin', 'Bloomfield', 'Bristol', 'Burlington', 'Canton', 'East Granby', 
  'East Hartford', 'East Windsor', 'Ellington', 'Enfield', 'Farmington', 'Glastonbury', 
  'Granby', 'Hartford', 'Hartland', 'Manchester', 'Marlborough', 'New Britain', 
  'Newington', 'Plainville', 'Rocky Hill', 'Simsbury', 'South Windsor', 'Suffield', 
  'West Hartford', 'Wethersfield', 'Windsor', 'Windsor Locks',
  
  // Fairfield County
  'Bethel', 'Bridgeport', 'Brookfield', 'Danbury', 'Darien', 'Easton', 'Fairfield', 
  'Greenwich', 'Monroe', 'New Canaan', 'New Fairfield', 'Newtown', 'Norwalk', 
  'Redding', 'Ridgefield', 'Shelton', 'Sherman', 'Stamford', 'Stratford', 'Trumbull', 
  'Weston', 'Westport', 'Wilton',
  
  // Other nearby towns
  'Cromwell', 'Durham', 'Haddam', 'Higganum', 'Middletown', 'Portland', 'Wallingford', 
  'Meriden', 'North Haven', 'Hamden', 'New Haven', 'West Haven', 'Milford', 'Orange', 
  'Woodbridge', 'Bethany', 'Waterbury', 'Naugatuck', 'Prospect', 'Cheshire', 'Wolcott'
]

interface FormData {
  name: string
  email: string
  phone: string
  town: string
  message: string
}

export default function ContactForm() {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    phone: '',
    town: '',
    message: ''
  })
  const [filteredTowns, setFilteredTowns] = useState<string[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [errors, setErrors] = useState<Partial<FormData>>({})

  const validateForm = (): boolean => {
    const newErrors: Partial<FormData> = {}

    if (!formData.name.trim()) newErrors.name = 'Name is required'
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email'
    }
    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required'
    if (!formData.town.trim()) newErrors.town = 'Town is required'

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))

    // Clear error when user starts typing
    if (errors[name as keyof FormData]) {
      setErrors(prev => ({ ...prev, [name]: undefined }))
    }

    // Handle town autocomplete
    if (name === 'town') {
      if (value.length > 0) {
        const filtered = ctTowns
          .filter(town => town.toLowerCase().includes(value.toLowerCase()))
          .map(town => `${town}, CT`)
          .slice(0, 8)
        setFilteredTowns(filtered)
        setShowSuggestions(filtered.length > 0)
      } else {
        setFilteredTowns([])
        setShowSuggestions(false)
      }
    }
  }

  const handleTownSelect = (town: string) => {
    setFormData(prev => ({ ...prev, town }))
    setShowSuggestions(false)
    if (errors.town) {
      setErrors(prev => ({ ...prev, town: undefined }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    setIsSubmitting(true)
    setSubmitStatus('idle')

    try {
      const formDataToSend = new FormData()
      formDataToSend.append('name', formData.name)
      formDataToSend.append('email', formData.email)
      formDataToSend.append('phone', formData.phone)
      formDataToSend.append('town', formData.town)
      formDataToSend.append('message', formData.message)
      formDataToSend.append('_subject', `Contact from ${formData.town} - Detail Lab`)
      formDataToSend.append('_cc', 'efagin19@gmail.com')
      formDataToSend.append('_captcha', 'false')

      const response = await fetch('https://formsubmit.co/akibhabad7@gmail.com', {
        method: 'POST',
        body: formDataToSend,
      })

      if (response.ok) {
        setSubmitStatus('success')
        setFormData({ name: '', email: '', phone: '', town: '', message: '' })
      } else {
        setSubmitStatus('error')
      }
    } catch (error) {
      setSubmitStatus('error')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Get a Quote</CardTitle>
      </CardHeader>
      <CardContent>
        {submitStatus === 'success' && (
          <div className="mb-6 p-4 bg-green-500/10 border border-green-500/20 rounded-lg flex items-center space-x-2">
            <CheckCircle className="w-5 h-5 text-green-500" />
            <p className="text-green-700 dark:text-green-400">
              Message sent successfully! We'll respond within {contact.responseTime}.
            </p>
          </div>
        )}

        {submitStatus === 'error' && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center space-x-2">
            <AlertCircle className="w-5 h-5 text-red-500" />
            <p className="text-red-700 dark:text-red-400">
              There was an error sending your message. Please try again or contact us directly.
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium mb-2">
              Name *
            </label>
            <Input
              id="name"
              name="name"
              type="text"
              value={formData.name}
              onChange={handleInputChange}
              className={errors.name ? 'border-red-500' : ''}
              placeholder="Your full name"
            />
            {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-2">
              Email *
            </label>
            <Input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleInputChange}
              className={errors.email ? 'border-red-500' : ''}
              placeholder="your.email@example.com"
            />
            {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
          </div>

          <div>
            <label htmlFor="phone" className="block text-sm font-medium mb-2">
              Phone Number *
            </label>
            <Input
              id="phone"
              name="phone"
              type="tel"
              value={formData.phone}
              onChange={handleInputChange}
              className={errors.phone ? 'border-red-500' : ''}
              placeholder="(860) 555-0123"
            />
            {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
          </div>

          <div className="relative">
            <label htmlFor="town" className="block text-sm font-medium mb-2">
              Town in Connecticut *
            </label>
            <Input
              id="town"
              name="town"
              type="text"
              value={formData.town}
              onChange={handleInputChange}
              onFocus={() => formData.town && setShowSuggestions(filteredTowns.length > 0)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
              className={errors.town ? 'border-red-500' : ''}
              placeholder="Enter your town"
            />
            {errors.town && <p className="text-red-500 text-sm mt-1">{errors.town}</p>}
            
            {showSuggestions && (
              <div className="absolute top-full left-0 right-0 bg-card border rounded-md mt-1 max-h-48 overflow-y-auto z-10 shadow-lg">
                {filteredTowns.map((town, index) => (
                  <div
                    key={index}
                    className="px-3 py-2 cursor-pointer hover:bg-muted text-sm"
                    onMouseDown={() => handleTownSelect(town)}
                  >
                    📍 {town}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <label htmlFor="message" className="block text-sm font-medium mb-2">
              Message (Optional)
            </label>
            <Textarea
              id="message"
              name="message"
              value={formData.message}
              onChange={handleInputChange}
              rows={4}
              placeholder="Tell us about your vehicle and what services you're interested in..."
            />
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Sending...' : 'Send Message'}
          </Button>

          <p className="text-sm text-muted-foreground text-center">
            We'll respond in {contact.responseTime}
          </p>
        </form>
      </CardContent>
    </Card>
  )
}