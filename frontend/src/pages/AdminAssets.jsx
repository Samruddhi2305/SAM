import React, { useState, useEffect, useRef } from 'react'
import { getAssets, createAsset, updateAsset, deleteAsset, logMaintenance } from '../services/assetApi'

const AdminAssets = () => {
  const [assets, setAssets] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Asset Form Modal State
  const [showFormModal, setShowFormModal] = useState(false)
  const [editingAsset, setEditingAsset] = useState(null)
  const [name, setName] = useState('')
  const [category, setCategory] = useState('')
  const [description, setDescription] = useState('')
  const [quantity, setQuantity] = useState(1)
  const [status, setStatus] = useState('Available')
  const [condition, setCondition] = useState('Good')
  const [imageUrl, setImageUrl] = useState('')
  const [formError, setFormError] = useState('')
  const [formSuccess, setFormSuccess] = useState('')

  // Camera & Device Upload state
  const [cameraActive, setCameraActive] = useState(false)
  const [stream, setStream] = useState(null)
  const [showUrlInput, setShowUrlInput] = useState(false)
  const videoRef = useRef(null)

  const startCamera = async () => {
    try {
      setCameraActive(true)
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
      setStream(mediaStream)
    } catch (err) {
      alert("Could not access camera: " + err.message)
      setCameraActive(false)
    }
  }

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop())
      setStream(null)
    }
    setCameraActive(false)
  }

  const capturePhoto = () => {
    if (videoRef.current) {
      const video = videoRef.current
      const canvas = document.createElement('canvas')
      canvas.width = video.videoWidth || 640
      canvas.height = video.videoHeight || 480
      const ctx = canvas.getContext('2d')
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
      const dataUrl = canvas.toDataURL('image/jpeg', 0.85)
      setImageUrl(dataUrl)
      stopCamera()
    }
  }

  const handleFileUpload = (e) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setImageUrl(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleCloseFormModal = () => {
    stopCamera()
    setShowFormModal(false)
  }

  useEffect(() => {
    if (cameraActive && stream && videoRef.current) {
      videoRef.current.srcObject = stream
      videoRef.current.play().catch(err => console.error("Error playing video:", err))
    }
  }, [cameraActive, stream])

  // QR Modal State
  const [showQRModal, setShowQRModal] = useState(false)
  const [qrAsset, setQrAsset] = useState(null)

  // Maintenance Modal State
  const [showMaintenanceModal, setShowMaintenanceModal] = useState(false)
  const [maintAsset, setMaintAsset] = useState(null)
  const [maintAction, setMaintAction] = useState('')
  const [maintCost, setMaintCost] = useState('')
  const [maintUser, setMaintUser] = useState('')
  const [maintError, setMaintError] = useState('')
  const [maintSuccess, setMaintSuccess] = useState('')

  const fetchAssets = async () => {
    try {
      const data = await getAssets()
      setAssets(data)
    } catch (err) {
      setError('Failed to fetch inventory.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAssets()
  }, [])

  const handleOpenCreate = () => {
    setEditingAsset(null)
    setName('')
    setCategory('')
    setDescription('')
    setQuantity(1)
    setStatus('Available')
    setCondition('Good')
    setImageUrl('')
    setFormError('')
    setFormSuccess('')
    setShowUrlInput(false)
    setShowFormModal(true)
  }

  const handleOpenEdit = (asset) => {
    setEditingAsset(asset)
    setName(asset.name)
    setCategory(asset.category)
    setDescription(asset.description)
    setQuantity(asset.quantity)
    setStatus(asset.status)
    setCondition(asset.condition)
    setImageUrl(asset.image_url || '')
    setFormError('')
    setFormSuccess('')
    setShowUrlInput(false)
    setShowFormModal(true)
  }

  const handleSaveAsset = async (e) => {
    e.preventDefault()
    setFormError('')
    setFormSuccess('')

    const payload = { name, category, description, quantity: parseInt(quantity), status, condition, image_url: imageUrl }

    try {
      if (editingAsset) {
        await updateAsset(editingAsset._id, payload)
        setFormSuccess('Asset updated successfully!')
      } else {
        await createAsset(payload)
        setFormSuccess('Asset created successfully!')
      }
      setTimeout(() => {
        handleCloseFormModal()
        fetchAssets()
      }, 1200)
    } catch (err) {
      setFormError(err.response?.data?.detail || 'Failed to save asset.')
    }
  }

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this asset?')) {
      try {
        await deleteAsset(id)
        fetchAssets()
      } catch (err) {
        alert(err.response?.data?.detail || 'Failed to delete asset.')
      }
    }
  }

  const handleOpenQR = (asset) => {
    setQrAsset(asset)
    setShowQRModal(true)
  }

  const handleOpenMaintenance = (asset) => {
    setMaintAsset(asset)
    setMaintAction('')
    setMaintCost('')
    setMaintUser('')
    setMaintError('')
    setMaintSuccess('')
    setShowMaintenanceModal(true)
  }

  const handleSaveMaintenance = async (e) => {
    e.preventDefault()
    setMaintError('')
    setMaintSuccess('')

    const payload = {
      action: maintAction,
      cost: parseFloat(maintCost) || 0,
      performed_by: maintUser
    }

    try {
      await logMaintenance(maintAsset._id, payload)
      setMaintSuccess('Maintenance logged successfully!')
      setTimeout(() => {
        setShowMaintenanceModal(false)
        fetchAssets()
      }, 1200)
    } catch (err) {
      setMaintError(err.response?.data?.detail || 'Failed to log maintenance.')
    }
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '2.25rem', fontWeight: 700, fontFamily: 'var(--font-display)', marginBottom: '8px' }}>
            Inventory Management
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            Register new equipment, track health conditions, and download QR codes for check-out operations.
          </p>
        </div>
        <button className="btn btn-primary" onClick={handleOpenCreate}>
          Add New Asset
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>Loading catalog...</div>
      ) : error ? (
        <div className="badge badge-danger" style={{ display: 'block', padding: '16px', borderRadius: '8px', textAlign: 'center', textTransform: 'none' }}>
          {error}
        </div>
      ) : (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Asset Name</th>
                <th>Category</th>
                <th>Units</th>
                <th>Status</th>
                <th>Condition</th>
                <th>Maintenance logs</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {assets.map((asset) => (
                <tr key={asset._id}>
                  <td style={{ fontWeight: 600 }}>{asset.name}</td>
                  <td><span className="badge badge-info" style={{ fontSize: '0.65rem' }}>{asset.category}</span></td>
                  <td>{asset.quantity}</td>
                  <td>
                    {asset.status === 'Available' && <span className="badge badge-success">Available</span>}
                    {asset.status === 'Maintenance' && <span className="badge badge-warning">Maintenance</span>}
                    {asset.status === 'Damaged' && <span className="badge badge-danger">Damaged</span>}
                  </td>
                  <td>
                    <span style={{ 
                      color: asset.condition === 'Good' ? 'var(--accent-secondary)' : asset.condition === 'Fair' ? 'var(--accent-warning)' : 'var(--accent-danger)',
                      fontWeight: 500
                    }}>
                      {asset.condition}
                    </span>
                  </td>
                  <td>
                    <button className="btn btn-secondary" style={{ padding: '4px 8px', fontSize: '0.75rem' }} onClick={() => handleOpenMaintenance(asset)}>
                      Logs ({asset.maintenance_history?.length || 0})
                    </button>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '0.75rem' }} onClick={() => handleOpenEdit(asset)}>
                        Edit
                      </button>
                      <button className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '0.75rem' }} onClick={() => handleOpenQR(asset)}>
                        QR Code
                      </button>
                      <button className="btn btn-danger" style={{ padding: '6px 10px', fontSize: '0.75rem' }} onClick={() => handleDelete(asset._id)}>
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Asset Form Modal */}
      {showFormModal && (
        <div className="modal-overlay">
          <div className="modal-content glass-panel" style={{ border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', maxHeight: '90vh', overflowY: 'auto' }}>
            <button className="modal-close" onClick={handleCloseFormModal}>×</button>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '24px', color: 'var(--text-primary)' }}>
              {editingAsset ? 'Modify Asset Profile' : 'Add New Equipment'}
            </h3>

            {formError && (
              <div className="badge badge-danger" style={{ width: '100%', padding: '12px', borderRadius: 'var(--border-radius-sm)', marginBottom: '16px', textAlign: 'center', textTransform: 'none' }}>
                {formError}
              </div>
            )}

            {formSuccess && (
              <div className="badge badge-success" style={{ width: '100%', padding: '12px', borderRadius: 'var(--border-radius-sm)', marginBottom: '16px', textAlign: 'center', textTransform: 'none' }}>
                {formSuccess}
              </div>
            )}

            <form onSubmit={handleSaveAsset}>
              <div className="form-group">
                <label>Equipment Name</label>
                <input type="text" className="form-input" required value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. DSLR Camera Sony A7IV" />
              </div>

              <div style={{ display: 'flex', gap: '16px' }}>
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Category</label>
                  <input type="text" className="form-input" required value={category} onChange={(e) => setCategory(e.target.value)} placeholder="e.g. Cameras" />
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Total Quantity</label>
                  <input type="number" className="form-input" required min="1" value={quantity} onChange={(e) => setQuantity(e.target.value)} />
                </div>
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea className="form-input" style={{ minHeight: '80px', resize: 'vertical' }} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Technical specifications, locations..." />
              </div>

              <div className="form-group">
                <label>Asset Image</label>
                
                {/* Image Preview & Controls */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', padding: '16px', background: 'var(--bg-primary)', borderRadius: 'var(--border-radius-sm)', border: '1px solid var(--border-color)', marginBottom: '16px' }}>
                  {imageUrl ? (
                    <div style={{ position: 'relative', width: '100%', height: '180px', borderRadius: '8px', overflow: 'hidden', background: '#000', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                      <img src={imageUrl} alt="Asset preview" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                      <button 
                        type="button" 
                        style={{ position: 'absolute', top: '8px', right: '8px', background: 'var(--accent-danger)', color: '#fff', border: 'none', borderRadius: '50%', width: '32px', height: '32px', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', fontWeight: 'bold', fontSize: '1rem' }} 
                        onClick={() => setImageUrl('')}
                      >
                        ×
                      </button>
                    </div>
                  ) : (
                    <div style={{ width: '100%', height: '100px', borderRadius: '8px', border: '2px dashed var(--border-color)', display: 'flex', justifyContent: 'center', alignItems: 'center', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                      No Image Selected
                    </div>
                  )}

                  {/* Actions Selector */}
                  {!cameraActive && (
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <label className="btn btn-secondary" style={{ flex: 1, textAlign: 'center', display: 'flex', justifyContent: 'center', alignItems: 'center', cursor: 'pointer', margin: 0, padding: '8px 12px', fontSize: '0.85rem' }}>
                        Upload File
                        <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFileUpload} />
                      </label>
                      
                      <button type="button" className="btn btn-secondary" style={{ flex: 1, fontSize: '0.85rem', padding: '8px 12px' }} onClick={startCamera}>
                        Take Photo
                      </button>

                      <button type="button" className="btn btn-secondary" style={{ flex: 1, fontSize: '0.85rem', padding: '8px 12px' }} onClick={() => setShowUrlInput(!showUrlInput)}>
                        Web Link
                      </button>
                    </div>
                  )}

                  {/* Live Camera Stream */}
                  {cameraActive && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', alignItems: 'center' }}>
                      <div style={{ width: '100%', height: '220px', borderRadius: '8px', overflow: 'hidden', background: '#000' }}>
                        <video ref={videoRef} style={{ width: '100%', height: '100%', objectFit: 'cover' }} playsInline muted />
                      </div>
                      <div style={{ display: 'flex', gap: '8px', width: '100%' }}>
                        <button type="button" className="btn btn-primary" style={{ flex: 1, padding: '8px 12px', fontSize: '0.85rem' }} onClick={capturePhoto}>
                          Capture
                        </button>
                        <button type="button" className="btn btn-secondary" style={{ flex: 1, padding: '8px 12px', fontSize: '0.85rem' }} onClick={stopCamera}>
                          Cancel Camera
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Paste URL Option */}
                  {showUrlInput && !cameraActive && (
                    <div style={{ marginTop: '8px' }}>
                      <input 
                        type="url" 
                        className="form-input" 
                        value={imageUrl.startsWith('data:') ? '' : imageUrl} 
                        onChange={(e) => setImageUrl(e.target.value)} 
                        placeholder="Or paste image URL (https://...)" 
                        style={{ fontSize: '0.85rem' }}
                      />
                    </div>
                  )}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '16px' }}>
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Operational Status</label>
                  <select className="form-input" value={status} onChange={(e) => setStatus(e.target.value)}>
                    <option value="Available">Available</option>
                    <option value="Maintenance">Maintenance</option>
                    <option value="Damaged">Damaged</option>
                  </select>
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Condition</label>
                  <select className="form-input" value={condition} onChange={(e) => setCondition(e.target.value)}>
                    <option value="Good">Good</option>
                    <option value="Fair">Fair</option>
                    <option value="Poor">Poor</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '28px' }}>
                <button type="button" className="btn btn-secondary" style={{ flexGrow: 1 }} onClick={handleCloseFormModal}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" style={{ flexGrow: 2 }}>
                  Save Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* QR Code Modal */}
      {showQRModal && qrAsset && (
        <div className="modal-overlay">
          <div className="modal-content glass-panel" style={{ border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', maxWidth: '380px', textAlign: 'center' }}>
            <button className="modal-close" onClick={() => setShowQRModal(false)}>×</button>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '8px' }}>Asset QR Code</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '24px' }}>{qrAsset.name}</p>

            <div className="qr-preview">
              <img 
                src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(JSON.stringify({ asset_id: qrAsset._id }))}`}
                alt="Asset QR Code"
                style={{ width: '180px', height: '180px', borderRadius: '8px' }}
              />
            </div>
            
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '24px' }}>
              Scan during issuance or return to update records instantly.
            </p>

            <button className="btn btn-primary" style={{ width: '100%' }} onClick={() => window.print()}>
              Print QR Label
            </button>
          </div>
        </div>
      )}

      {/* Maintenance Logs Modal */}
      {showMaintenanceModal && maintAsset && (
        <div className="modal-overlay">
          <div className="modal-content glass-panel" style={{ border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', maxWidth: '500px' }}>
            <button className="modal-close" onClick={() => setShowMaintenanceModal(false)}>×</button>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '8px' }}>Asset Maintenance & Health</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '20px' }}>{maintAsset.name}</p>

            {/* List existing logs */}
            <div style={{ maxHeight: '150px', overflowY: 'auto', background: 'var(--bg-primary)', padding: '12px', borderRadius: 'var(--border-radius-sm)', border: '1px solid var(--border-color)', marginBottom: '20px' }}>
              <h4 style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>Logged Maintenance events</h4>
              {maintAsset.maintenance_history?.length === 0 ? (
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>No logs yet.</div>
              ) : (
                maintAsset.maintenance_history.map((log, index) => (
                  <div key={index} style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '6px', marginBottom: '6px', fontSize: '0.75rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 600 }}>
                      <span>{log.action}</span>
                      <span>₹{log.cost}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
                      <span>By: {log.performed_by}</span>
                      <span>{log.date}</span>
                    </div>
                  </div>
                ))
              )}
            </div>

            {maintError && (
              <div className="badge badge-danger" style={{ width: '100%', padding: '12px', borderRadius: 'var(--border-radius-sm)', marginBottom: '16px', textAlign: 'center', textTransform: 'none' }}>
                {maintError}
              </div>
            )}

            {maintSuccess && (
              <div className="badge badge-success" style={{ width: '100%', padding: '12px', borderRadius: 'var(--border-radius-sm)', marginBottom: '16px', textAlign: 'center', textTransform: 'none' }}>
                {maintSuccess}
              </div>
            )}

            {/* Add log form */}
            <form onSubmit={handleSaveMaintenance}>
              <h4 style={{ fontSize: '0.9rem', marginBottom: '12px' }}>Log New Maintenance Action</h4>
              
              <div className="form-group">
                <label>Action Performed</label>
                <input type="text" className="form-input" required value={maintAction} onChange={(e) => setMaintAction(e.target.value)} placeholder="e.g. Lens cleaning and calibration" />
              </div>

              <div style={{ display: 'flex', gap: '16px' }}>
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Cost (INR)</label>
                  <input type="number" className="form-input" required value={maintCost} onChange={(e) => setMaintCost(e.target.value)} placeholder="0" />
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Logged By</label>
                  <input type="text" className="form-input" required value={maintUser} onChange={(e) => setMaintUser(e.target.value)} placeholder="e.g. Tech Section Lead" />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
                <button type="button" className="btn btn-secondary" style={{ flexGrow: 1 }} onClick={() => setShowMaintenanceModal(false)}>
                  Close
                </button>
                <button type="submit" className="btn btn-primary" style={{ flexGrow: 2 }}>
                  Log Event
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminAssets
