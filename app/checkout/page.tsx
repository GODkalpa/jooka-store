'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { Banknote, Lock, CheckCircle, Info } from 'lucide-react'
import { useAuth } from '@/lib/auth/firebase-auth'
import { useCartStore } from '@/store/cartStore'
import { useCartSyncContext } from '@/lib/context/CartSyncProvider'
import { convertCartItemsForOrder } from '@/lib/utils/cart'
import { formatPriceWithSymbol, calculateNepalTax } from '@/lib/utils/currency'
import { DEFAULT_COUNTRY } from '@/lib/constants'
import { useUserData } from '@/lib/context/UserDataContext'
import { checkoutFormSchema, validateAndFormatErrors, formatPhoneNumber } from '@/lib/validation/schemas'
import SafeImage from '@/components/ui/SafeImage'

export default function CheckoutPage() {
  const { user, firebaseUser, isLoading: authLoading } = useAuth()
  const { items, getTotalPrice, clearCart } = useCartStore()
  const { isCartReady, isInitializing } = useCartSyncContext()
  const { userProfile, addresses, loading } = useUserData()
  const [isProcessing, setIsProcessing] = useState(false)
  const [orderComplete, setOrderComplete] = useState(false)
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null)
  const [showAddressForm, setShowAddressForm] = useState(false)
  const [isHydrated, setIsHydrated] = useState(false)

  // Calculate totals with Nepal tax (only after hydration to prevent SSR mismatch)
  const subtotal = isHydrated ? getTotalPrice() : 0
  const taxCalculation = calculateNepalTax(subtotal)
  const { taxAmount, totalWithTax } = taxCalculation

  const [formData, setFormData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: DEFAULT_COUNTRY
  })

  // Auto-populate form when user data is available
  useEffect(() => {
    if (user && userProfile) {
      // Auto-populate form with user data
      setFormData(prev => ({
        ...prev,
        email: userProfile.email || user.email || '',
        firstName: userProfile.profile?.first_name || '',
        lastName: userProfile.profile?.last_name || '',
        phone: userProfile.profile?.phone || '',
      }))
    }
  }, [user, userProfile])

  // Auto-select default address when addresses are loaded or updated
  useEffect(() => {
    if (addresses.length > 0) {
      const defaultAddress = addresses.find(addr => addr.is_default)

      // If no address is selected, or if the default address changed, update selection
      if (!selectedAddressId || (defaultAddress && selectedAddressId !== defaultAddress.id && defaultAddress.is_default)) {
        if (defaultAddress) {
          setSelectedAddressId(defaultAddress.id)
          populateAddressForm(defaultAddress)
        }
      } else if (selectedAddressId) {
        // Update form data if the selected address was modified
        const selectedAddress = addresses.find(addr => addr.id === selectedAddressId)
        if (selectedAddress) {
          populateAddressForm(selectedAddress)
        }
      }
    }
  }, [addresses])

  // Handle hydration
  useEffect(() => {
    setIsHydrated(true)
  }, [])

  // Redirect to signin if not authenticated
  useEffect(() => {
    if (!authLoading && !user && isHydrated) {
      window.location.href = '/auth/signin?redirect=/checkout'
    }
  }, [user, authLoading, isHydrated])

  // Function to populate address form with selected address
  const populateAddressForm = (address: any) => {
    setFormData(prev => ({
      ...prev,
      address: address.address_line_1 || '',
      city: address.city || '',
      state: address.state || '',
      zipCode: address.postal_code || '',
      country: address.country || DEFAULT_COUNTRY,
    }))
  }

  // Handle address selection
  const handleAddressSelect = (addressId: string) => {
    setSelectedAddressId(addressId)
    const selectedAddress = addresses.find(addr => addr.id === addressId)
    if (selectedAddress) {
      populateAddressForm(selectedAddress)
    }
    setShowAddressForm(false)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target

    // Format phone number input
    if (name === 'phone') {
      const formatted = formatPhoneNumber(value)
      setFormData({
        ...formData,
        [name]: formatted
      })
    } else {
      setFormData({
        ...formData,
        [name]: value
      })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsProcessing(true)

    // Check if user is authenticated
    if (!user && !firebaseUser) {
      alert('Please sign in to place an order')
      setIsProcessing(false)
      return
    }

    // Check if cart has items
    if (items.length === 0) {
      alert('Your cart is empty')
      setIsProcessing(false)
      return
    }

    // Validate form data using centralized schema
    const validation = validateAndFormatErrors(checkoutFormSchema, {
      email: formData.email,
      firstName: formData.firstName,
      lastName: formData.lastName,
      phone: formatPhoneNumber(formData.phone),
      address: formData.address,
      city: formData.city,
      state: formData.state,
      zipCode: formData.zipCode,
      country: formData.country,
    })

    if (!validation.isValid) {
      alert(`Please fix the following errors: ${validation.errors}`)
      setIsProcessing(false)
      return
    }

    try {
      // Convert cart items to order format
      const orderCartItems = convertCartItemsForOrder(items)

      // Prepare order data
      const orderData = {
        email: formData.email,
        phone: formData.phone,
        shippingAddress: {
          firstName: formData.firstName,
          lastName: formData.lastName,
          streetAddress1: formData.address,
          city: formData.city,
          state: formData.state,
          postalCode: formData.zipCode,
          country: formData.country,
          phone: formData.phone,
        },
        billingAddress: {
          firstName: formData.firstName,
          lastName: formData.lastName,
          streetAddress1: formData.address,
          city: formData.city,
          state: formData.state,
          postalCode: formData.zipCode,
          country: formData.country,
          phone: formData.phone,
        },
        paymentMethod: {
          type: 'cod',
          provider: 'cash_on_delivery',
          paymentMethodId: 'cod_default'
        },
        cartItems: orderCartItems
      }

      // Submit order
      console.log('DEBUG: Starting order submission process...')
      console.log('DEBUG: Auth context user:', user)
      console.log('DEBUG: Auth context firebaseUser:', firebaseUser)
      
      // Multiple fallback approaches for getting authenticated user
      let authenticatedUser = firebaseUser
      let token = null
      
      // Approach 1: Use firebaseUser from auth context
      if (authenticatedUser) {
        try {
          token = await authenticatedUser.getIdToken()
          console.log('DEBUG: Got token from auth context firebaseUser')
        } catch (error) {
          console.error('DEBUG: Failed to get token from auth context:', error)
          authenticatedUser = null
        }
      }
      
      // Approach 2: Try direct Firebase access if auth context failed
      if (!authenticatedUser || !token) {
        try {
          const { auth } = await import('@/lib/firebase/config')
          const firebaseAuth = auth()
          const currentUser = firebaseAuth.currentUser
          
          if (currentUser) {
            token = await currentUser.getIdToken()
            authenticatedUser = currentUser
            console.log('DEBUG: Got token from direct Firebase access')
          }
        } catch (error) {
          console.error('DEBUG: Failed to get token from direct Firebase:', error)
        }
      }
      
      // Final check
      if (!authenticatedUser || !token) {
        throw new Error('Authentication failed. Please refresh the page and sign in again.')
      }
      
      console.log('DEBUG: Order submission starting...')
      console.log('DEBUG: User token exists:', !!token)
      console.log('DEBUG: Authenticated user exists:', !!authenticatedUser)
      console.log('DEBUG: Order data:', JSON.stringify(orderData, null, 2))
      
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(orderData),
      })

      console.log('DEBUG: Response status:', response.status)
      console.log('DEBUG: Response ok:', response.ok)

      if (!response.ok) {
        let errorMessage = 'Failed to create order'
        try {
          const error = await response.json()
          console.error('DEBUG: Error response:', error)
          errorMessage = error.error || error.message || errorMessage
          
          // Log additional error details
          if (error.details) {
            console.error('DEBUG: Error details:', error.details)
          }
        } catch (parseError) {
          console.error('DEBUG: Failed to parse error response:', parseError)
          errorMessage = `HTTP ${response.status}: ${response.statusText}`
        }
        
        throw new Error(errorMessage)
      }

      const result = await response.json()
      console.log('Order created:', result)

      setOrderComplete(true)
      clearCart()
    } catch (error) {
      console.error('Order submission failed:', error)
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
      alert(`Failed to process order: ${errorMessage}. Please try again or contact support if the issue persists.`)
    } finally {
      setIsProcessing(false)
    }
  }

  // Show loading state while checking authentication, loading user data, or initializing cart
  if (authLoading || loading || !isHydrated || isInitializing) {
    return (
      <div className="min-h-screen py-16 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold mx-auto mb-4"></div>
          <p className="text-gray-300">
            {authLoading ? 'Checking authentication...' :
             loading ? 'Loading user data...' :
             isInitializing ? 'Loading cart...' : 'Loading...'}
          </p>
        </div>
      </div>
    )
  }

  if (orderComplete) {
    return (
      <div className="min-h-screen py-16">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
          >
            <CheckCircle className="w-24 h-24 text-green-500 mx-auto mb-6" />
            <h1 className="text-4xl font-serif font-bold text-gold mb-4">
              Order Confirmed!
            </h1>
            <p className="text-gray-300 text-lg mb-8">
              Thank you for your purchase. You will receive a confirmation email shortly.
            </p>
            <div className="bg-charcoal/50 rounded-lg p-6 max-w-md mx-auto mb-8">
              <h3 className="text-gold font-semibold mb-2">Order #JK-2024-001</h3>
              <p className="text-gray-300">Estimated delivery: 3-5 business days</p>
            </div>
            <button
              onClick={() => window.location.href = '/shop'}
              className="btn-primary"
            >
              Continue Shopping
            </button>
          </motion.div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-4xl font-serif font-bold text-gold mb-8">
            Checkout
          </h1>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Checkout Form */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* User Status */}
              {user && (
                <div className="bg-gold/10 border border-gold/20 rounded-lg p-4 mb-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gold font-medium">
                        Signed in as {user.email}
                      </p>
                      {loading ? (
                        <p className="text-gray-400 text-sm">Loading your information...</p>
                      ) : (
                        <p className="text-gray-400 text-sm">Your information has been auto-filled</p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Contact Information */}
              <div>
                <h2 className="text-2xl font-serif font-bold text-gold mb-4">
                  Contact Information
                </h2>
                <div className="space-y-4">
                  <input
                    type="email"
                    name="email"
                    placeholder="Email address"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 bg-charcoal border border-gray-600 rounded-md text-white placeholder-gray-400 focus:border-gold focus:outline-none"
                  />
                  <div>
                    <div className="flex">
                      <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-600 bg-charcoal text-gray-300 text-sm">
                        +977
                      </span>
                      <input
                        type="tel"
                        name="phone"
                        placeholder="98XXXXXXXX"
                        value={formData.phone}
                        onChange={handleInputChange}
                        required
                        maxLength={10}
                        pattern="[0-9]{10}"
                        className="flex-1 px-4 py-3 bg-charcoal border border-gray-600 rounded-r-md text-white placeholder-gray-400 focus:border-gold focus:outline-none"
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Enter 10-digit Nepal mobile number
                    </p>
                  </div>
                </div>
              </div>

              {/* Shipping Address */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-serif font-bold text-gold">
                    Shipping Address
                  </h2>
                  {user && addresses.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setShowAddressForm(!showAddressForm)}
                      className="text-gold hover:text-gold/80 text-sm font-medium"
                    >
                      {showAddressForm ? 'Hide' : 'Choose from saved addresses'}
                    </button>
                  )}
                </div>

                {/* Saved Addresses Selection */}
                {user && showAddressForm && (
                  <div className="mb-6 p-4 bg-charcoal/50 rounded-lg border border-gold/20">
                    <h3 className="text-lg font-medium text-white mb-3">
                      Saved Addresses
                      {loading && <span className="text-sm text-gray-400 ml-2">(Updating...)</span>}
                    </h3>
                    {loading ? (
                      <div className="flex items-center space-x-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gold"></div>
                        <p className="text-gray-400">Loading addresses...</p>
                      </div>
                    ) : addresses.length > 0 ? (
                      <div className="space-y-3">
                        {addresses.map((address) => (
                          <div
                            key={address.id}
                            className={`p-3 rounded-md border cursor-pointer transition-colors ${
                              selectedAddressId === address.id
                                ? 'border-gold bg-gold/10'
                                : 'border-gray-600 hover:border-gold/50'
                            }`}
                            onClick={() => handleAddressSelect(address.id)}
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-white font-medium">
                                  {address.first_name} {address.last_name}
                                </p>
                                <p className="text-gray-300 text-sm">
                                  {(address as any).address_line_1}
                                </p>
                                <p className="text-gray-300 text-sm">
                                  {address.city}, {address.state} {address.postal_code}
                                </p>
                              </div>
                              {address.is_default && (
                                <span className="text-gold text-xs font-medium">Default</span>
                              )}
                            </div>
                          </div>
                        ))}
                        <button
                          type="button"
                          onClick={() => {
                            // This would open the address modal - for now, redirect to addresses page
                            window.open('/dashboard/addresses', '_blank');
                          }}
                          className="mt-3 w-full p-3 border border-dashed border-gold/40 rounded-md text-gold hover:border-gold hover:bg-gold/5 transition-colors text-sm"
                        >
                          + Add New Address
                        </button>
                      </div>
                    ) : (
                      <div className="text-center">
                        <p className="text-gray-400 mb-3">No saved addresses found.</p>
                        <button
                          type="button"
                          onClick={() => {
                            window.open('/dashboard/addresses', '_blank');
                          }}
                          className="text-gold hover:text-gold/80 text-sm font-medium"
                        >
                          Add your first address
                        </button>
                      </div>
                    )}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <input
                    type="text"
                    name="firstName"
                    placeholder="First name"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    required
                    className="px-4 py-3 bg-charcoal border border-gray-600 rounded-md text-white placeholder-gray-400 focus:border-gold focus:outline-none"
                  />
                  <input
                    type="text"
                    name="lastName"
                    placeholder="Last name"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    required
                    className="px-4 py-3 bg-charcoal border border-gray-600 rounded-md text-white placeholder-gray-400 focus:border-gold focus:outline-none"
                  />
                  <input
                    type="text"
                    name="address"
                    placeholder="Address"
                    value={formData.address}
                    onChange={handleInputChange}
                    required
                    className="sm:col-span-2 px-4 py-3 bg-charcoal border border-gray-600 rounded-md text-white placeholder-gray-400 focus:border-gold focus:outline-none"
                  />
                  <input
                    type="text"
                    name="city"
                    placeholder="City"
                    value={formData.city}
                    onChange={handleInputChange}
                    required
                    className="px-4 py-3 bg-charcoal border border-gray-600 rounded-md text-white placeholder-gray-400 focus:border-gold focus:outline-none"
                  />
                  <input
                    type="text"
                    name="state"
                    placeholder="State"
                    value={formData.state}
                    onChange={handleInputChange}
                    required
                    className="px-4 py-3 bg-charcoal border border-gray-600 rounded-md text-white placeholder-gray-400 focus:border-gold focus:outline-none"
                  />
                  <input
                    type="text"
                    name="zipCode"
                    placeholder="ZIP code"
                    value={formData.zipCode}
                    onChange={handleInputChange}
                    required
                    className="px-4 py-3 bg-charcoal border border-gray-600 rounded-md text-white placeholder-gray-400 focus:border-gold focus:outline-none"
                  />
                  <select
                    name="country"
                    value={formData.country}
                    onChange={handleInputChange}
                    className="px-4 py-3 bg-charcoal border border-gray-600 rounded-md text-white focus:border-gold focus:outline-none"
                  >
                    <option value="Nepal">Nepal</option>
                    <option value="India">India</option>
                    <option value="China">China</option>
                    <option value="Bangladesh">Bangladesh</option>
                  </select>
                </div>

                {/* Save Address Option */}
                {user && !selectedAddressId && (
                  <div className="mt-4">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        name="saveAddress"
                        className="mr-2 rounded border-gray-600 bg-charcoal text-gold focus:ring-gold"
                      />
                      <span className="text-gray-300 text-sm">
                        Save this address for future orders
                      </span>
                    </label>
                  </div>
                )}
              </div>

              {/* Payment Information */}
              <div>
                <h2 className="text-2xl font-serif font-bold text-gold mb-4 flex items-center">
                  <Banknote className="w-6 h-6 mr-2" />
                  Payment Method
                </h2>
                <div className="bg-charcoal/50 rounded-lg p-6 border border-gold/20">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-12 h-12 bg-gold/20 rounded-full flex items-center justify-center">
                      <Banknote className="w-6 h-6 text-gold" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white">Cash on Delivery (COD)</h3>
                      <p className="text-gray-400 text-sm">Pay when your order is delivered</p>
                    </div>
                  </div>

                  <div className="bg-blue-900/20 border border-blue-500/20 rounded-lg p-4">
                    <div className="flex items-start space-x-3">
                      <Info className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
                      <div className="text-sm text-blue-200">
                        <p className="font-medium mb-1">How Cash on Delivery works:</p>
                        <ul className="space-y-1 text-blue-300">
                          <li>• Your order will be prepared and shipped to your address</li>
                          <li>• Pay the exact amount in cash when the delivery arrives</li>
                          <li>• Please have the exact amount ready for smooth delivery</li>
                          <li>• Our delivery partner will provide you with a receipt</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={isProcessing}
                className="w-full btn-primary text-lg py-4 flex items-center justify-center space-x-2"
              >
                {isProcessing ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-black"></div>
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-5 h-5" />
                    <span>Complete Order</span>
                  </>
                )}
              </button>
            </form>
          </motion.div>

          {/* Order Summary */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <div className="bg-charcoal/50 rounded-lg p-6 sticky top-8">
              <h2 className="text-2xl font-serif font-bold text-gold mb-6">
                Order Summary
              </h2>

              <div className="space-y-4 mb-6">
                {isHydrated ? (
                  items.length > 0 ? (
                    items.map((item) => (
                      <div key={`${item.id}-${item.size}-${item.color}`} className="flex gap-3">
                        {/* Product Image */}
                        <div className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                          <SafeImage
                            src={item.colorImageUrl || item.image || '/placeholder-product.svg'}
                            alt={`${item.name}${item.color ? ` - ${item.color}` : ''}`}
                            fill
                            className="object-cover"
                          />
                        </div>

                        {/* Product Details */}
                        <div className="flex-1 min-w-0">
                          <p className="text-white font-medium truncate">{item.name}</p>
                          <div className="flex flex-wrap gap-2 text-xs text-gray-400 mt-1">
                            {item.size && (
                              <span className="bg-charcoal/50 px-2 py-1 rounded">
                                Size: {item.size}
                              </span>
                            )}
                            {item.color && (
                              <span className="bg-charcoal/50 px-2 py-1 rounded">
                                Color: {item.color}
                              </span>
                            )}
                            <span className="bg-charcoal/50 px-2 py-1 rounded">
                              Qty: {item.quantity}
                            </span>
                          </div>
                        </div>

                        {/* Price */}
                        <div className="text-right flex-shrink-0">
                          <p className="text-gold font-semibold">
                            {formatPriceWithSymbol(item.price * item.quantity)}
                          </p>
                          <p className="text-xs text-gray-400">
                            {formatPriceWithSymbol(item.price)} each
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-gray-400">Your cart is empty</p>
                      <Link href="/shop" className="text-gold hover:underline mt-2 inline-block">
                        Continue Shopping
                      </Link>
                    </div>
                  )
                ) : (
                  <div className="space-y-3">
                    {/* Loading skeleton */}
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="flex gap-3 animate-pulse">
                        <div className="w-16 h-16 bg-gray-600 rounded-lg"></div>
                        <div className="flex-1">
                          <div className="h-4 bg-gray-600 rounded mb-2"></div>
                          <div className="h-3 bg-gray-600 rounded w-1/2"></div>
                        </div>
                        <div className="w-16 h-4 bg-gray-600 rounded"></div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-2 mb-6 border-t border-gray-600 pt-4">
                <div className="flex justify-between">
                  <span className="text-gray-300">Subtotal</span>
                  <span className="text-gold">{formatPriceWithSymbol(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Shipping</span>
                  <span className="text-gold">Free</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">VAT (13%)</span>
                  <span className="text-gold">{formatPriceWithSymbol(taxAmount)}</span>
                </div>
                <div className="flex justify-between text-lg font-semibold border-t border-gray-600 pt-2">
                  <span className="text-gold">Total</span>
                  <span className="text-gold">{formatPriceWithSymbol(totalWithTax)}</span>
                </div>
              </div>

              <div className="text-sm text-gray-400 text-center">
                <p className="flex items-center justify-center mb-2">
                  <Lock className="w-4 h-4 mr-1" />
                  Secure checkout powered by Stripe
                </p>
                <p>Your payment information is encrypted and secure.</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}