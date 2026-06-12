import React, { useState, useEffect } from 'react'
import { getAssets } from '../services/assetApi'
import { createBooking } from '../services/bookingApi'
import AssetCard from '../components/AssetCard'

const Assets = () => {
  const [assets, setAssets] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  
  // Search & Filter
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('')
  const [categories, setCategories] = useState([])

  // Modal State
  const [showModal, setShowModal] = useState(false)
  const [selectedAsset, setSelectedAsset] = useState(null)
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [quantity, setQuantity] = useState(1)
  const [bookingError, setBookingError] = useState('')
  const [bookingSuccess, setBookingSuccess] = useState('')
  const [bookingLoading, setBookingLoading] = useState(false)

  const fetchAssets = async () => {
    try {
      const data = await getAssets()
      setAssets(data)
      // Extract unique categories
      const cats = [...new Set(data.map(a => a.category))]
      setCategories(cats)
    } catch (err) {
      setError('Failed to fetch assets.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAssets()
  }, [])

  const handleOpenBookModal = (asset) => {
    setSelectedAsset(asset)
    setQuantity(1)
    setStartDate('')
    setEndDate('')
    setBookingError('')
    setBookingSuccess('')
    setShowModal(true)
  }

  const handleCreateBooking = async (e) => {
    e.preventDefault()
    setBookingError('')
    setBookingSuccess('')

    if (quantity <= 0) {
      setBookingError('Quantity must be greater than 0')
      return
    }

    if (quantity > selectedAsset.quantity) {
      setBookingError(`Quantity requested exceeds total inventory of ${selectedAsset.quantity}`)
      return
    }

    setBookingLoading(true)

    try {
      const payload = {
        asset_id: selectedAsset._id,
        quantity: parseInt(quantity),
        start_date: new Date(startDate).toISOString(),
        end_date: new Date(endDate).toISOString()
      }

      const res = await createBooking(payload)
      setBookingSuccess(res.message || 'Request submitted!')
      setTimeout(() => {
        setShowModal(false)
        fetchAssets()
      }, 1500)
    } catch (err) {
      setBookingError(err.response?.data?.detail || 'Failed to request booking.')
    } finally {
      setBookingLoading(false)
    }
  }

  // Filtering Logic
  const filteredAssets = assets.filter(asset => {
    const matchSearch = asset.name.toLowerCase().includes(search.toLowerCase()) || 
                        asset.description.toLowerCase().includes(search.toLowerCase())
    const matchCategory = category === '' || asset.category === category
    return matchSearch && matchCategory
  })

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '20px', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '2.25rem', fontWeight: 700, fontFamily: 'var(--font-display)', marginBottom: '8px' }}>
            Browse Shared Resources
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            Search, check availability, and request bookings for DSLR cameras, lighting, props, and costumes.
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="glass-panel" style={{ padding: '20px', borderRadius: 'var(--border-radius-md)', marginBottom: '32px', display: 'flex', gap: '16px', flexWrap: 'wrap', border: '1px solid var(--border-color)', background: 'var(--bg-secondary)' }}>
        <div style={{ flexGrow: 1, minWidth: '250px' }}>
          <input 
            type="text" 
            placeholder="Search asset name or description..." 
            className="form-input"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div style={{ minWidth: '180px' }}>
          <select 
            className="form-input"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            style={{ cursor: 'pointer' }}
          >
            <option value="">All Categories</option>
            {categories.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>Loading asset catalog...</div>
      ) : error ? (
        <div className="badge badge-danger" style={{ display: 'block', padding: '16px', borderRadius: '8px', textAlign: 'center', textTransform: 'none' }}>
          {error}
        </div>
      ) : filteredAssets.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '80px', color: 'var(--text-secondary)', background: 'var(--bg-secondary)', borderRadius: 'var(--border-radius-md)', border: '1px solid var(--border-color)' }}>
          No assets match your search criteria. Try adjusting your filter!
        </div>
      ) : (
        <div className="assets-grid">
          {filteredAssets.map(asset => (
            <AssetCard 
              key={asset._id} 
              asset={asset}
              onBook={handleOpenBookModal}
            />
          ))}
        </div>
      )}

      {/* Booking Modal */}
      {showModal && selectedAsset && (
        <div className="modal-overlay">
          <div className="modal-content glass-panel" style={{ border: '1px solid var(--border-color)', background: 'var(--bg-secondary)' }}>
            <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '8px', color: 'var(--text-primary)' }}>Request Booking</h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '24px', fontSize: '0.9rem' }}>
              Booking resource: <strong>{selectedAsset.name}</strong> ({selectedAsset.category})
            </p>

            {bookingError && (
              <div className="badge badge-danger" style={{ width: '100%', padding: '12px', borderRadius: 'var(--border-radius-sm)', marginBottom: '16px', textAlign: 'center', textTransform: 'none' }}>
                {bookingError}
              </div>
            )}

            {bookingSuccess && (
              <div className="badge badge-success" style={{ width: '100%', padding: '12px', borderRadius: 'var(--border-radius-sm)', marginBottom: '16px', textAlign: 'center', textTransform: 'none' }}>
                {bookingSuccess}
              </div>
            )}

            <form onSubmit={handleCreateBooking}>
              <div className="form-group">
                <label>Quantity to Borrow (Max: {selectedAsset.quantity})</label>
                <input 
                  type="number" 
                  className="form-input"
                  min="1"
                  max={selectedAsset.quantity}
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label>Start Date & Time</label>
                <input 
                  type="datetime-local" 
                  className="form-input"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label>End Date & Time</label>
                <input 
                  type="datetime-local" 
                  className="form-input"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '28px' }}>
                <button type="button" className="btn btn-secondary" style={{ flexGrow: 1 }} onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" style={{ flexGrow: 2 }} disabled={bookingLoading}>
                  {bookingLoading ? 'Submitting...' : 'Submit Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Assets
