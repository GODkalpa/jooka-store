'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { Banknote, Lock, CheckCircle, Info, ShieldCheck, MapPin, ChevronRight, Truck, Sparkles, ArrowLeft, Check, Navigation } from 'lucide-react'
import { useAuth } from '@/lib/auth/firebase-auth'
import { useCartStore } from '@/store/cartStore'
import { useCartSyncContext } from '@/lib/context/CartSyncProvider'
import { convertCartItemsForOrder } from '@/lib/utils/cart'
import { formatPriceWithSymbol, calculateNepalTax } from '@/lib/utils/currency'
import { DEFAULT_COUNTRY } from '@/lib/constants'
import { 
  NEPAL_PROVINCES, 
  NEPAL_DISTRICTS, 
  NEPAL_SHIPPING_ZONES, 
  getDistrictsByProvince, 
  getShippingZoneByDistrict, 
  calculateShippingFee,
  ShippingZoneId 
} from '@/lib/constants/nepal'
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
  const [completedOrderNumber, setCompletedOrderNumber] = useState<string>('JK-2026-001')
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null)
  const [showAddressForm, setShowAddressForm] = useState(false)
  const [isHydrated, setIsHydrated] = useState(false)

  // Location and Shipping State
  const [selectedProvince, setSelectedProvince] = useState<string>('P3') // Default Bagmati
  const [selectedDistrict, setSelectedDistrict] = useState<string>('Kathmandu') // Default Kathmandu
  const [selectedShippingZone, setSelectedShippingZone] = useState<ShippingZoneId>('inside_valley')

  // Calculate totals with Nepal tax and shipping fees
  const subtotal = isHydrated ? getTotalPrice() : 0
  const shippingFee = isHydrated ? calculateShippingFee(selectedShippingZone, subtotal) : 0
  const taxCalculation = calculateNepalTax(subtotal)
  const { taxAmount } = taxCalculation
  const totalWithTax = subtotal + taxAmount + shippingFee

  const [formData, setFormData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    phone: '',
    address: '',
    city: 'Kathmandu',
    state: 'Bagmati Province',
    province: 'P3',
    district: 'Kathmandu',
    wardNumber: '',
    landmark: '',
    zipCode: '44600',
    country: DEFAULT_COUNTRY
  })

  // Auto-populate form when user data is available
  useEffect(() => {
    if (user && userProfile) {
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

      if (!selectedAddressId || (defaultAddress && selectedAddressId !== defaultAddress.id && defaultAddress.is_default)) {
        if (defaultAddress) {
          setSelectedAddressId(defaultAddress.id)
          populateAddressForm(defaultAddress)
        }
      } else if (selectedAddressId) {
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

  // Handle Province change
  const handleProvinceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const provCode = e.target.value
    setSelectedProvince(provCode)
    const provObj = NEPAL_PROVINCES.find(p => p.code === provCode)
    const availableDistricts = getDistrictsByProvince(provCode)
    const defaultDist = availableDistricts[0]?.name || ''
    setSelectedDistrict(defaultDist)

    const zone = getShippingZoneByDistrict(defaultDist)
    setSelectedShippingZone(zone)

    setFormData(prev => ({
      ...prev,
      province: provCode,
      state: provObj?.name || prev.state,
      district: defaultDist,
      city: defaultDist
    }))
  }

  // Handle District change
  const handleDistrictChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const distName = e.target.value
    setSelectedDistrict(distName)

    const zone = getShippingZoneByDistrict(distName)
    setSelectedShippingZone(zone)

    setFormData(prev => ({
      ...prev,
      district: distName,
      city: distName
    }))
  }

  // Function to populate address form with selected address
  const populateAddressForm = (address: any) => {
    const provinceCode = address.province || 'P3'
    const districtName = address.district || address.city || 'Kathmandu'
    const zone = getShippingZoneByDistrict(districtName)

    setSelectedProvince(provinceCode)
    setSelectedDistrict(districtName)
    setSelectedShippingZone(zone)

    setFormData(prev => ({
      ...prev,
      address: address.address_line_1 || address.streetAddress1 || '',
      city: address.city || districtName,
      state: address.state || 'Bagmati Province',
      province: provinceCode,
      district: districtName,
      wardNumber: address.wardNumber || '',
      landmark: address.landmark || '',
      zipCode: address.postal_code || address.postalCode || '44600',
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

    if (name === 'phone') {
      const formatted = formatPhoneNumber(value)
      setFormData(prev => ({
        ...prev,
        [name]: formatted
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsProcessing(true)

    if (!user && !firebaseUser) {
      alert('Please sign in to place an order')
      setIsProcessing(false)
      return
    }

    if (items.length === 0) {
      alert('Your cart is empty')
      setIsProcessing(false)
      return
    }

    const validation = validateAndFormatErrors(checkoutFormSchema, {
      email: formData.email,
      firstName: formData.firstName,
      lastName: formData.lastName,
      phone: formatPhoneNumber(formData.phone),
      address: formData.address,
      city: formData.city,
      state: formData.state,
      province: formData.province,
      district: formData.district,
      wardNumber: formData.wardNumber,
      landmark: formData.landmark,
      shippingZone: selectedShippingZone,
      zipCode: formData.zipCode,
      country: formData.country,
    })

    if (!validation.isValid) {
      alert(`Please fix the following errors: ${validation.errors}`)
      setIsProcessing(false)
      return
    }

    try {
      const orderCartItems = convertCartItemsForOrder(items)

      const orderData = {
        userId: user?.id || 'guest',
        userEmail: user?.email || formData.email,
        email: formData.email,
        phone: formData.phone,
        shippingAddress: {
          firstName: formData.firstName,
          lastName: formData.lastName,
          streetAddress1: formData.address,
          city: formData.city,
          state: formData.state,
          province: formData.province,
          district: formData.district,
          wardNumber: formData.wardNumber,
          landmark: formData.landmark,
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
          province: formData.province,
          district: formData.district,
          wardNumber: formData.wardNumber,
          landmark: formData.landmark,
          postalCode: formData.zipCode,
          country: formData.country,
          phone: formData.phone,
        },
        shippingMethod: {
          zoneId: selectedShippingZone,
          fee: shippingFee,
          name: selectedShippingZone === 'inside_valley' ? 'Inside Kathmandu Valley Express' : 'Outside Valley Courier'
        },
        paymentMethod: {
          type: 'cod',
          provider: 'cash_on_delivery',
          paymentMethodId: 'cod_default'
        },
        subtotal,
        shippingFee,
        taxAmount,
        totalAmount: totalWithTax,
        cartItems: orderCartItems
      }

      console.log('DEBUG: Starting order submission process...')

      if (!user) {
        throw new Error('Authentication required. Please sign in to place an order.');
      }
      
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      })

      if (!response.ok) {
        let errorMessage = 'Failed to create order'
        try {
          const error = await response.json()
          errorMessage = error.error || error.message || errorMessage
        } catch (parseError) {
          errorMessage = `HTTP ${response.status}: ${response.statusText}`
        }
        
        throw new Error(errorMessage)
      }

      const result = await response.json()
      if (result?.order?.orderNumber || result?.id) {
        setCompletedOrderNumber(result.order?.orderNumber || `JK-${result.id.slice(0, 8).toUpperCase()}`)
      }

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

  // Show loading state while checking authentication, user data, or initializing cart
  if (authLoading || loading || !isHydrated || isInitializing) {
    return (
      <div className="min-h-screen bg-canvas pt-20 md:pt-24 pb-16 flex items-center justify-center font-sans">
        <div className="text-center space-y-4">
          <div className="w-10 h-10 border-2 border-black border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs font-semibold uppercase tracking-widest text-neutral-600">
            {authLoading ? 'Verifying authentication...' :
             loading ? 'Retrieving account information...' :
             isInitializing ? 'Preparing items in bag...' : 'Loading checkout...'}
          </p>
        </div>
      </div>
    )
  }

  // Order Success Screen
  if (orderComplete) {
    return (
      <div className="min-h-screen bg-canvas pt-12 pb-24 font-sans text-black">
        <div className="max-w-2xl mx-auto px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white border border-border-muted rounded-xl p-8 sm:p-10 text-center shadow-sm"
          >
            <div className="w-20 h-20 bg-emerald-50 border border-emerald-200 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 stroke-[1.5]" />
            </div>

            <span className="inline-block bg-black text-white text-[10px] font-bold uppercase px-3 py-1 rounded-full mb-3 tracking-widest">
              Order Confirmed
            </span>

            <h1 className="text-3xl font-bold tracking-tight text-black mb-3">
              Thank You for Your Order!
            </h1>
            <p className="text-sm text-neutral-600 max-w-md mx-auto mb-8 leading-relaxed">
              We've received your order details and sent a confirmation email to <strong className="text-black">{formData.email}</strong>.
            </p>

            <div className="bg-surface-muted border border-border-muted rounded-lg p-6 max-w-md mx-auto mb-8 text-left space-y-3">
              <div className="flex justify-between items-center pb-3 border-b border-border-muted">
                <span className="text-xs font-medium text-neutral-500 uppercase tracking-wider">Order ID</span>
                <span className="text-sm font-bold text-black font-mono">{completedOrderNumber}</span>
              </div>
              <div className="flex justify-between items-center pb-3 border-b border-border-muted">
                <span className="text-xs font-medium text-neutral-500 uppercase tracking-wider">Payment Method</span>
                <span className="text-xs font-semibold text-black flex items-center gap-1.5">
                  <Banknote className="w-3.5 h-3.5 text-emerald-600" /> Cash on Delivery (COD)
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs font-medium text-neutral-500 uppercase tracking-wider">Est. Delivery</span>
                <span className="text-xs font-semibold text-black flex items-center gap-1.5">
                  <Truck className="w-3.5 h-3.5 text-neutral-700" /> 2 - 4 Business Days (Nepal)
                </span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center max-w-md mx-auto">
              <Link
                href="/shop"
                className="flex-1 px-6 py-3.5 bg-black text-white text-xs font-medium uppercase tracking-widest hover:bg-neutral-800 transition-colors shadow-sm text-center"
              >
                Continue Shopping
              </Link>
              <Link
                href="/dashboard"
                className="flex-1 px-6 py-3.5 bg-white text-black border border-border-muted text-xs font-medium uppercase tracking-widest hover:bg-neutral-50 transition-colors text-center"
              >
                View Account Dashboard
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-canvas pt-6 pb-24 font-sans text-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Step Progress Breadcrumb */}
        <div className="mb-8 border-b border-border-muted pb-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center space-x-2 text-xs">
              <Link href="/cart" className="text-neutral-500 hover:text-black flex items-center transition-colors">
                <ArrowLeft className="w-3.5 h-3.5 mr-1" /> Return to Bag
              </Link>
            </div>

            <div className="flex items-center space-x-2 text-xs font-medium">
              <span className="text-neutral-400 flex items-center gap-1">
                <Check className="w-3.5 h-3.5 text-emerald-600" /> 1. Bag
              </span>
              <ChevronRight className="w-3 h-3 text-neutral-300" />
              <span className="text-black font-semibold uppercase tracking-wider flex items-center gap-1">
                <span className="w-4 h-4 bg-black text-white rounded-full text-[10px] flex items-center justify-center font-bold">2</span>
                Shipping & Delivery
              </span>
              <ChevronRight className="w-3 h-3 text-neutral-300" />
              <span className="text-neutral-400">3. Payment</span>
            </div>
          </div>
        </div>

        {/* Page Title */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-black">
            Checkout
          </h1>
          <p className="text-xs text-neutral-500 mt-1">
            Complete your order with secure Nepal Cash on Delivery.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          
          {/* Main Checkout Form Column */}
          <div className="lg:col-span-7 space-y-8">
            <form onSubmit={handleSubmit} className="space-y-8">
              
              {/* Authenticated User Status Notification */}
              {user && (
                <div className="bg-surface-muted border border-border-muted rounded-lg p-4 flex items-center justify-between gap-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-black text-white rounded-full flex items-center justify-center text-xs font-bold uppercase">
                      {user.email ? user.email.charAt(0) : 'U'}
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-black">
                        Signed in as <span className="text-neutral-700 font-mono">{user.email}</span>
                      </p>
                      <p className="text-[11px] text-neutral-500">
                        {loading ? 'Updating your details...' : 'Your contact & shipping info has been auto-filled.'}
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold uppercase bg-emerald-50 text-emerald-700 px-2 py-0.5 border border-emerald-200 rounded">
                    Verified User
                  </span>
                </div>
              )}

              {/* 1. Contact Information */}
              <div className="bg-white border border-border-muted rounded-xl p-6 shadow-sm space-y-4">
                <div className="flex items-center space-x-2 border-b border-border-muted pb-3 mb-4">
                  <span className="w-5 h-5 bg-black text-white rounded-full text-[10px] font-bold flex items-center justify-center">1</span>
                  <h2 className="text-base font-bold text-black uppercase tracking-wider">
                    Contact Information
                  </h2>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 mb-1">
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      name="email"
                      placeholder="name@example.com"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3.5 py-2.5 bg-white border border-neutral-300 rounded-md text-xs text-black placeholder-neutral-400 focus:border-black focus:ring-1 focus:ring-black outline-none transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 mb-1">
                      Mobile Phone Number (Nepal) <span className="text-red-500">*</span>
                    </label>
                    <div className="flex">
                      <span className="inline-flex items-center px-3.5 rounded-l-md border border-r-0 border-neutral-300 bg-neutral-100 text-neutral-600 text-xs font-medium">
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
                        className="flex-1 px-3.5 py-2.5 bg-white border border-neutral-300 rounded-r-md text-xs text-black placeholder-neutral-400 focus:border-black focus:ring-1 focus:ring-black outline-none transition-all font-mono"
                      />
                    </div>
                    <p className="text-[11px] text-neutral-500 mt-1">
                      Required for SMS delivery notifications & order verification.
                    </p>
                  </div>
                </div>
              </div>

              {/* 2. Shipping Address */}
              <div className="bg-white border border-border-muted rounded-xl p-6 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-border-muted pb-3 mb-4">
                  <div className="flex items-center space-x-2">
                    <span className="w-5 h-5 bg-black text-white rounded-full text-[10px] font-bold flex items-center justify-center">2</span>
                    <h2 className="text-base font-bold text-black uppercase tracking-wider">
                      Shipping Address
                    </h2>
                  </div>
                  {user && addresses.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setShowAddressForm(!showAddressForm)}
                      className="text-xs font-semibold text-neutral-700 hover:text-black underline transition-colors"
                    >
                      {showAddressForm ? 'Close Address Picker' : 'Choose Saved Address'}
                    </button>
                  )}
                </div>

                {/* Saved Address Selection Drawer/List */}
                {user && showAddressForm && (
                  <div className="mb-6 p-4 bg-surface-muted rounded-lg border border-border-muted space-y-3">
                    <h3 className="text-xs font-bold text-black uppercase tracking-wider flex items-center justify-between">
                      <span>Select Saved Address</span>
                      {loading && <span className="text-[11px] font-normal text-neutral-500">Loading...</span>}
                    </h3>
                    
                    {addresses.length > 0 ? (
                      <div className="space-y-2">
                        {addresses.map((address) => {
                          const isSelected = selectedAddressId === address.id
                          return (
                            <div
                              key={address.id}
                              className={`p-3.5 rounded-md border cursor-pointer transition-all ${
                                isSelected
                                  ? 'border-black bg-white shadow-sm ring-1 ring-black'
                                  : 'border-neutral-200 bg-white hover:border-neutral-400'
                              }`}
                              onClick={() => handleAddressSelect(address.id)}
                            >
                              <div className="flex items-start justify-between">
                                <div className="space-y-0.5">
                                  <div className="flex items-center gap-2">
                                    <p className="text-xs font-bold text-black">
                                      {address.first_name} {address.last_name}
                                    </p>
                                    {address.is_default && (
                                      <span className="bg-black text-white text-[9px] font-bold uppercase px-1.5 py-0.5 rounded">
                                        Default
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-xs text-neutral-600">
                                    {(address as any).address_line_1}
                                  </p>
                                  <p className="text-xs text-neutral-500">
                                    {address.city}, {address.state} {address.postal_code}
                                  </p>
                                </div>
                                <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${isSelected ? 'border-black bg-black text-white' : 'border-neutral-300'}`}>
                                  {isSelected && <Check className="w-2.5 h-2.5" />}
                                </div>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    ) : (
                      <p className="text-xs text-neutral-500">No saved addresses found.</p>
                    )}
                  </div>
                )}

                {/* Form Input Fields */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 mb-1">
                      First Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="firstName"
                      placeholder="First name"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3.5 py-2.5 bg-white border border-neutral-300 rounded-md text-xs text-black placeholder-neutral-400 focus:border-black focus:ring-1 focus:ring-black outline-none transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 mb-1">
                      Last Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="lastName"
                      placeholder="Last name"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3.5 py-2.5 bg-white border border-neutral-300 rounded-md text-xs text-black placeholder-neutral-400 focus:border-black focus:ring-1 focus:ring-black outline-none transition-all"
                    />
                  </div>

                  {/* Province Selector (Nepal 7 Provinces) */}
                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 mb-1">
                      Province (नेपाल) <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="province"
                      value={selectedProvince}
                      onChange={handleProvinceChange}
                      required
                      className="w-full px-3.5 py-2.5 bg-white border border-neutral-300 rounded-md text-xs text-black focus:border-black focus:ring-1 focus:ring-black outline-none transition-all"
                    >
                      {NEPAL_PROVINCES.map((prov) => (
                        <option key={prov.code} value={prov.code}>
                          {prov.name} ({prov.nepali})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* District Selector (Filtered by Province) */}
                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 mb-1">
                      District (जिल्ला) <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="district"
                      value={selectedDistrict}
                      onChange={handleDistrictChange}
                      required
                      className="w-full px-3.5 py-2.5 bg-white border border-neutral-300 rounded-md text-xs text-black focus:border-black focus:ring-1 focus:ring-black outline-none transition-all"
                    >
                      {getDistrictsByProvince(selectedProvince).map((dist) => (
                        <option key={dist.name} value={dist.name}>
                          {dist.name} ({dist.nepali})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* City / Municipality */}
                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 mb-1">
                      City / Municipality / VDC <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="city"
                      placeholder="e.g. Kathmandu Metropolitan / Pokhara"
                      value={formData.city}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3.5 py-2.5 bg-white border border-neutral-300 rounded-md text-xs text-black placeholder-neutral-400 focus:border-black focus:ring-1 focus:ring-black outline-none transition-all"
                    />
                  </div>

                  {/* Ward Number & Landmark */}
                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 mb-1">
                      Ward No. & Nearby Landmark (वडा नं. / स्थान)
                    </label>
                    <input
                      type="text"
                      name="landmark"
                      placeholder="e.g. Ward 3, Near Bishal Bazar / Labim Mall"
                      value={formData.landmark}
                      onChange={handleInputChange}
                      className="w-full px-3.5 py-2.5 bg-white border border-neutral-300 rounded-md text-xs text-black placeholder-neutral-400 focus:border-black focus:ring-1 focus:ring-black outline-none transition-all"
                    />
                  </div>

                  {/* Detailed Street Address / Tole */}
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-neutral-700 mb-1">
                      Tole / Street Address <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="address"
                      placeholder="e.g. Jhamsikhel Marg, House #42, Tole Name"
                      value={formData.address}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3.5 py-2.5 bg-white border border-neutral-300 rounded-md text-xs text-black placeholder-neutral-400 focus:border-black focus:ring-1 focus:ring-black outline-none transition-all"
                    />
                  </div>

                  {/* Country (Default Nepal) */}
                  <div className="sm:col-span-2 flex items-center justify-between text-xs text-neutral-500 bg-neutral-50 p-2.5 rounded border border-neutral-200">
                    <span className="font-medium text-neutral-700 flex items-center gap-1.5">
                      <Navigation className="w-3.5 h-3.5 text-black" /> Delivery Country: <strong>Nepal (नेपाल)</strong>
                    </span>
                    <span className="text-[10px] font-bold uppercase bg-neutral-200 px-2 py-0.5 rounded text-neutral-700">
                      Standard
                    </span>
                  </div>
                </div>
              </div>

              {/* 3. Delivery Method & Shipping Zone Selector */}
              <div className="bg-white border border-border-muted rounded-xl p-6 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-border-muted pb-3 mb-4">
                  <div className="flex items-center space-x-2">
                    <span className="w-5 h-5 bg-black text-white rounded-full text-[10px] font-bold flex items-center justify-center">3</span>
                    <h2 className="text-base font-bold text-black uppercase tracking-wider">
                      Shipping Zone & Delivery Method
                    </h2>
                  </div>
                  <span className="text-[11px] font-semibold text-neutral-500">
                    Auto-detected for <strong className="text-black">{selectedDistrict}</strong>
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {NEPAL_SHIPPING_ZONES.map((zone) => {
                    const isSelected = selectedShippingZone === zone.id
                    const calculatedCost = subtotal >= zone.freeThreshold ? 0 : zone.baseCost
                    const isFree = calculatedCost === 0

                    return (
                      <div
                        key={zone.id}
                        onClick={() => setSelectedShippingZone(zone.id as ShippingZoneId)}
                        className={`p-4 rounded-lg border cursor-pointer transition-all ${
                          isSelected
                            ? 'border-black bg-surface-muted ring-1 ring-black shadow-sm'
                            : 'border-neutral-200 bg-white hover:border-neutral-400'
                        }`}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Truck className={`w-4 h-4 ${isSelected ? 'text-black' : 'text-neutral-500'}`} />
                            <span className="text-xs font-bold text-black uppercase tracking-wide">
                              {zone.name}
                            </span>
                          </div>
                          <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${isSelected ? 'border-black bg-black text-white' : 'border-neutral-300'}`}>
                            {isSelected && <Check className="w-2.5 h-2.5" />}
                          </div>
                        </div>

                        <p className="text-[11px] text-neutral-500 mb-3">
                          {zone.subtext}
                        </p>

                        <div className="pt-2 border-t border-neutral-200 flex items-center justify-between text-xs">
                          <span className="text-neutral-600 font-medium">
                            {zone.estimatedDays}
                          </span>
                          <span className="font-bold text-black">
                            {isFree ? (
                              <span className="text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded text-[10px] uppercase font-bold">
                                FREE Shipping
                              </span>
                            ) : (
                              formatPriceWithSymbol(zone.baseCost)
                            )}
                          </span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* 4. Payment Method Section */}
              <div className="bg-white border border-border-muted rounded-xl p-6 shadow-sm space-y-4">
                <div className="flex items-center space-x-2 border-b border-border-muted pb-3 mb-4">
                  <span className="w-5 h-5 bg-black text-white rounded-full text-[10px] font-bold flex items-center justify-center">4</span>
                  <h2 className="text-base font-bold text-black uppercase tracking-wider">
                    Payment Method
                  </h2>
                </div>

                <div className="border border-black bg-surface-muted rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-9 h-9 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center">
                        <Banknote className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-xs font-bold text-black uppercase tracking-wider">
                          Cash on Delivery (COD)
                        </h3>
                        <p className="text-[11px] text-neutral-500">
                          Pay with cash upon arrival at your doorstep
                        </p>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold uppercase bg-emerald-600 text-white px-2 py-0.5 rounded">
                      Available
                    </span>
                  </div>

                  <div className="bg-white border border-border-muted rounded-md p-3.5 text-xs text-neutral-600 space-y-2">
                    <div className="flex items-start space-x-2">
                      <Info className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                      <div className="space-y-1 text-[11px] leading-relaxed">
                        <p className="font-semibold text-black">Order Delivery & Cash Payment Terms:</p>
                        <ul className="list-disc list-inside space-y-0.5 text-neutral-600">
                          <li>Please prepare exact cash amount (<strong className="text-black">{formatPriceWithSymbol(totalWithTax)}</strong>) for the courier handler.</li>
                          <li>Free size exchanges within 7 days of delivery.</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Submit CTA Button */}
              <button
                type="submit"
                disabled={isProcessing}
                className="w-full py-4 bg-black text-white text-xs font-semibold uppercase tracking-widest hover:bg-neutral-800 transition-all shadow-sm rounded-lg flex items-center justify-center space-x-2 border border-black disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProcessing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Processing Order...</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    <span>Complete Order ({formatPriceWithSymbol(totalWithTax)})</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Right Column: Order Summary Sidebar */}
          <div className="lg:col-span-5">
            <div className="bg-surface-muted border border-border-muted rounded-xl p-6 sticky top-8 space-y-6 shadow-sm">
              <div className="flex items-center justify-between border-b border-border-muted pb-4">
                <h2 className="text-base font-bold text-black tracking-tight">
                  Order Summary
                </h2>
                <span className="text-xs font-medium text-neutral-500 bg-white border border-border-muted px-2 py-0.5 rounded">
                  {items.length} {items.length === 1 ? 'item' : 'items'}
                </span>
              </div>

              {/* Items List */}
              <div className="space-y-4 max-h-[380px] overflow-y-auto pr-1">
                {isHydrated ? (
                  items.length > 0 ? (
                    items.map((item) => (
                      <div key={`${item.id}-${item.size}-${item.color}`} className="flex items-center gap-3 bg-white p-3 border border-border-muted rounded-lg">
                        {/* Product Thumbnail */}
                        <div className="relative w-16 h-20 bg-neutral-100 rounded overflow-hidden flex-shrink-0 border border-neutral-200">
                          <SafeImage
                            src={item.colorImageUrl || item.image || '/placeholder-product.svg'}
                            alt={`${item.name}${item.color ? ` - ${item.color}` : ''}`}
                            fill
                            className="object-cover"
                          />
                        </div>

                        {/* Product Details */}
                        <div className="flex-1 min-w-0 space-y-1">
                          <p className="text-xs font-bold text-black truncate">{item.name}</p>
                          <div className="flex flex-wrap gap-1 text-[10px] text-neutral-500">
                            {item.size && (
                              <span className="bg-neutral-100 px-1.5 py-0.5 rounded border border-neutral-200 uppercase font-mono">
                                Size: {item.size}
                              </span>
                            )}
                            {item.color && (
                              <span className="bg-neutral-100 px-1.5 py-0.5 rounded border border-neutral-200">
                                {item.color}
                              </span>
                            )}
                            <span className="bg-neutral-100 px-1.5 py-0.5 rounded border border-neutral-200 font-semibold">
                              Qty: {item.quantity}
                            </span>
                          </div>
                        </div>

                        {/* Price */}
                        <div className="text-right flex-shrink-0">
                          <p className="text-xs font-bold text-black">
                            {formatPriceWithSymbol(item.price * item.quantity)}
                          </p>
                          {item.quantity > 1 && (
                            <p className="text-[10px] text-neutral-400">
                              {formatPriceWithSymbol(item.price)} ea
                            </p>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 bg-white border border-dashed border-neutral-300 rounded-lg">
                      <p className="text-xs text-neutral-500">Your bag is empty.</p>
                      <Link href="/shop" className="text-xs font-bold text-black hover:underline mt-2 inline-block">
                        Return to Shop
                      </Link>
                    </div>
                  )
                ) : (
                  <div className="space-y-3">
                    {[1, 2].map((i) => (
                      <div key={i} className="flex gap-3 bg-white p-3 rounded-lg border border-neutral-200 animate-pulse">
                        <div className="w-16 h-20 bg-neutral-200 rounded"></div>
                        <div className="flex-1 space-y-2">
                          <div className="h-3 bg-neutral-200 rounded w-3/4"></div>
                          <div className="h-2 bg-neutral-200 rounded w-1/2"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Pricing Breakdown */}
              <div className="space-y-2.5 pt-4 border-t border-border-muted text-xs">
                <div className="flex justify-between text-neutral-600">
                  <span>Subtotal</span>
                  <span className="font-semibold text-black">{formatPriceWithSymbol(subtotal)}</span>
                </div>
                <div className="flex justify-between text-neutral-600">
                  <span>
                    Delivery ({selectedShippingZone === 'inside_valley' ? 'Inside Valley' : 'Outside Valley'})
                  </span>
                  <span className="font-semibold text-black">
                    {shippingFee === 0 ? (
                      <span className="text-emerald-700 font-bold uppercase text-[11px]">FREE</span>
                    ) : (
                      formatPriceWithSymbol(shippingFee)
                    )}
                  </span>
                </div>
                <div className="flex justify-between text-neutral-600">
                  <span>Nepal VAT (13%)</span>
                  <span className="font-semibold text-black">{formatPriceWithSymbol(taxAmount)}</span>
                </div>
                <div className="flex justify-between text-sm font-bold text-black border-t border-border-muted pt-3">
                  <span>Total Amount (COD)</span>
                  <span className="text-base text-black">{formatPriceWithSymbol(totalWithTax)}</span>
                </div>
              </div>

              {/* Security & Trust Badges */}
              <div className="pt-4 border-t border-border-muted space-y-2.5 text-[11px] text-neutral-500">
                <div className="flex items-center gap-2 text-neutral-700">
                  <ShieldCheck className="w-4 h-4 text-black flex-shrink-0" />
                  <span>100% Authentic JOOKA Luxury Quality</span>
                </div>
                <div className="flex items-center gap-2 text-neutral-700">
                  <Truck className="w-4 h-4 text-black flex-shrink-0" />
                  <span>Fast express delivery across Nepal</span>
                </div>
                <div className="flex items-center gap-2 text-neutral-700">
                  <Lock className="w-4 h-4 text-black flex-shrink-0" />
                  <span>Encrypted 256-bit checkout security</span>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  )
}