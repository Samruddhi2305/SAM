import React, { useState, useEffect } from 'react'
import { getBookings, updateBookingStatus, getAuditLogs } from '../services/bookingApi'
import { getAssets } from '../services/assetApi'
import BookingTable from '../components/BookingTable'

const AdminRequests = () => {
  const [bookings, setBookings] = useState([])
  const [assets, setAssets] = useState([])
  const [auditLogs, setAuditLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Scan simulation state
  const [scanPayload, setScanPayload] = useState('')
  const [scannedAsset, setScannedAsset] = useState(null)
  const [scanError, setScanError] = useState('')
  const [scanSuccess, setScanSuccess] = useState('')

  const fetchData = async () => {
    try {
      const bData = await getBookings()
      setBookings(bData)
      const aData = await getAssets()
      setAssets(aData)
      const auditData = await getAuditLogs()
      setAuditLogs(auditData)
    } catch (err) {
      setError('Failed to load transaction data.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleStatusChange = async (id, newStatus, notes = '') => {
    try {
      await updateBookingStatus(id, newStatus, notes)
      fetchData()
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to update booking status.')
    }
  }

  // QR Simulator
  const handleSimulateScan = () => {
    setScanError('')
    setScanSuccess('')
    setScannedAsset(null)

    if (!scanPayload) {
      setScanError('Please enter or paste a QR payload')
      return
    }

    try {
      const parsed = JSON.parse(scanPayload)
      if (!parsed.asset_id) {
        setScanError('Invalid QR payload format. Missing asset_id.')
        return
      }

      const found = assets.find(a => a._id === parsed.asset_id)
      if (!found) {
        setScanError('Asset matching this QR code was not found in catalog.')
        return
      }

      setScannedAsset(found)
      setScanSuccess(`Scanned: ${found.name}`)
    } catch (e) {
      // try treating payload as raw ID directly
      const found = assets.find(a => a._id === scanPayload)
      if (found) {
        setScannedAsset(found)
        setScanSuccess(`Scanned: ${found.name}`)
      } else {
        setScanError('Payload must be a valid JSON or asset ID.')
      }
    }
  }

  // Filter lists
  const pendingRequests = bookings.filter(b => b.status === 'pending')
  const activeAllocations = bookings.filter(b => ['approved', 'issued'].includes(b.status))
  const completedHistory = bookings.filter(b => ['returned', 'rejected'].includes(b.status))

  return (
    <div>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '2.25rem', fontWeight: 700, fontFamily: 'var(--font-display)', marginBottom: '8px' }}>
          Operations & Requests Queue
        </h1>
        <p style={{ color: 'var(--text-secondary)' }}>
          Review pending booking requests, handle hand-over issuances, returns, and track audit records.
        </p>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>Loading transactions...</div>
      ) : error ? (
        <div className="badge badge-danger" style={{ display: 'block', padding: '16px', borderRadius: '8px', textAlign: 'center', textTransform: 'none' }}>
          {error}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
          
          {/* QR Scan Simulation Panel */}
          <div className="glass-panel" style={{ padding: '24px', borderRadius: 'var(--border-radius-md)', border: '1px solid var(--border-color)', background: 'var(--bg-secondary)' }}>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '12px' }}>QR Code Operation Scanner</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '20px' }}>
              Simulate physical scanning of an asset QR label at checkout/check-in counter.
            </p>

            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginBottom: '20px' }}>
              <div style={{ flexGrow: 1, minWidth: '280px' }}>
                {/* Select asset to auto-fill to make simulation easy */}
                <select 
                  className="form-input"
                  onChange={(e) => setScanPayload(e.target.value)}
                  value={scanPayload}
                  style={{ marginBottom: '10px' }}
                >
                  <option value="">-- Choose Asset to Simulate QR Scan --</option>
                  {assets.map(a => (
                    <option key={a._id} value={JSON.stringify({ asset_id: a._id })}>
                      {a.name} (ID: {a._id.substring(0, 8)}...)
                    </option>
                  ))}
                </select>
                <input 
                  type="text"
                  className="form-input"
                  placeholder="Or paste custom QR text payload..."
                  value={scanPayload}
                  onChange={(e) => setScanPayload(e.target.value)}
                />
              </div>
              <button className="btn btn-primary" onClick={handleSimulateScan} style={{ height: '44px', padding: '0 24px' }}>
                Scan QR Code
              </button>
            </div>

            {scanError && <div className="badge badge-danger" style={{ display: 'block', marginBottom: '12px', textTransform: 'none' }}>{scanError}</div>}
            {scanSuccess && <div className="badge badge-success" style={{ display: 'block', marginBottom: '12px', textTransform: 'none' }}>{scanSuccess}</div>}

            {scannedAsset && (
              <div className="glass-panel" style={{ padding: '20px', borderRadius: 'var(--border-radius-sm)', background: 'var(--bg-primary)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                <div>
                  <h4 style={{ margin: 0 }}>{scannedAsset.name}</h4>
                  <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    Category: {scannedAsset.category} | Current Condition: <strong>{scannedAsset.condition}</strong>
                  </p>
                </div>
                
                {/* Find bookings related to this scanned asset */}
                <div style={{ display: 'flex', gap: '10px' }}>
                  {bookings
                    .filter(b => b.asset_id === scannedAsset._id && ['approved', 'issued'].includes(b.status))
                    .slice(0, 1) // perform operation on the first active booking
                    .map(b => (
                      <div key={b._id} style={{ display: 'flex', gap: '8px' }}>
                        {b.status === 'approved' && (
                          <button className="btn btn-primary" onClick={() => handleStatusChange(b._id, 'issued', 'Issued via QR scanner')}>
                            Check Out to {b.user_email.split('@')[0]}
                          </button>
                        )}
                        {b.status === 'issued' && (
                          <button className="btn btn-success" onClick={() => handleStatusChange(b._id, 'returned', 'Returned via QR scanner')}>
                            Check In from {b.user_email.split('@')[0]}
                          </button>
                        )}
                      </div>
                    ))}
                  {bookings.filter(b => b.asset_id === scannedAsset._id && ['approved', 'issued'].includes(b.status)).length === 0 && (
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>No active check-out/in queue for this asset.</span>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Pending requests queue */}
          <div>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              Pending Approval Requests
              <span className="badge badge-warning" style={{ fontSize: '0.7rem', padding: '2px 8px' }}>{pendingRequests.length}</span>
            </h3>
            <BookingTable 
              bookings={pendingRequests} 
              isAdmin={true} 
              onApprove={(id) => handleStatusChange(id, 'approved', 'Request approved')}
              onReject={(id) => handleStatusChange(id, 'rejected', 'Request rejected')}
            />
          </div>

          {/* Active allocations queue */}
          <div>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              Active Check-Out & Return Queue
              <span className="badge badge-success" style={{ fontSize: '0.7rem', padding: '2px 8px' }}>{activeAllocations.length}</span>
            </h3>
            <BookingTable 
              bookings={activeAllocations} 
              isAdmin={true} 
              onIssue={(id) => handleStatusChange(id, 'issued', 'Checked out')}
              onReturn={(id) => handleStatusChange(id, 'returned', 'Returned')}
            />
          </div>

          {/* Audit trail */}
          <div className="glass-panel" style={{ padding: '24px', borderRadius: 'var(--border-radius-md)', border: '1px solid var(--border-color)', background: 'var(--bg-secondary)' }}>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '16px' }}>Administrative Audit Trail</h3>
            <div style={{ maxHeight: '250px', overflowY: 'auto', background: 'var(--bg-primary)', borderRadius: 'var(--border-radius-sm)', border: '1px solid var(--border-color)' }}>
              {auditLogs.length === 0 ? (
                <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)' }}>No system actions logged.</div>
              ) : (
                <table className="data-table" style={{ width: '100%', fontSize: '0.75rem' }}>
                  <thead>
                    <tr>
                      <th style={{ padding: '10px 16px' }}>Action</th>
                      <th style={{ padding: '10px 16px' }}>User</th>
                      <th style={{ padding: '10px 16px' }}>Timestamp</th>
                      <th style={{ padding: '10px 16px' }}>Details</th>
                    </tr>
                  </thead>
                  <tbody>
                    {auditLogs.map((log) => (
                      <tr key={log._id}>
                        <td style={{ padding: '10px 16px', fontWeight: 600 }}>
                          <span className={`badge ${log.action.startsWith('CREATE') || log.action.includes('RETURN') ? 'badge-success' : log.action.includes('DELETE') || log.action.includes('REJECT') ? 'badge-danger' : 'badge-info'}`} style={{ fontSize: '0.6rem', padding: '2px 6px' }}>
                            {log.action}
                          </span>
                        </td>
                        <td style={{ padding: '10px 16px' }}>{log.user_email}</td>
                        <td style={{ padding: '10px 16px', color: 'var(--text-muted)' }}>
                          {new Date(log.timestamp).toLocaleString()}
                        </td>
                        <td style={{ padding: '10px 16px', color: 'var(--text-secondary)', fontSize: '0.7rem' }}>
                          {JSON.stringify(log.details)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
          
        </div>
      )}
    </div>
  )
}

export default AdminRequests
