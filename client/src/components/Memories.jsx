import { useEffect, useState } from 'react'
import './Memories.css'

function Memories() {
  const [photos, setPhotos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [showForm, setShowForm] = useState(false)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [selectedFile, setSelectedFile] = useState(null)

  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    const fetchPhotos = async () => {
      try {
        const response = await fetch(
          'http://localhost:5000/api/photos'
        )

        if (!response.ok) {
          throw new Error('Failed to load memories')
        }

        const data = await response.json()
        setPhotos(data)

      } catch (err) {
        setError(err.message || 'Something went wrong')
      } finally {
        setLoading(false)
      }
    }

    fetchPhotos()
  }, [])

  const handleUpload = async (e) => {
    e.preventDefault()

    setUploadError('')
    setSuccess('')
    setUploading(true)

    try {
      const formData = new FormData()

      formData.append('photo', selectedFile)
      formData.append('title', title)
      formData.append('description', description)

      const response = await fetch(
        'http://localhost:5000/api/photos/upload',
        {
          method: 'POST',
          credentials: 'include',
          body: formData
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Photo upload failed')
      }

      const photosResponse = await fetch(
        'http://localhost:5000/api/photos'
      )

      if (!photosResponse.ok) {
        throw new Error('Photo uploaded, but failed to refresh memories')
      }

      const updatedPhotos = await photosResponse.json()
      setPhotos(updatedPhotos)

      setTitle('')
      setDescription('')
      setSelectedFile(null)
      e.target.reset()

      setShowForm(false)
      setSuccess('Your memory has been uploaded successfully!')

    } catch (err) {
      setUploadError(err.message || 'Something went wrong')
    } finally {
      setUploading(false)
    }
  }

  if (loading) {
    return <p className="memories-message">Loading memories...</p>
  }

  if (error) {
    return <p className="memories-error">{error}</p>
  }

  return (
    <div className="memories-container">

      <div className="memories-actions">
        <button
          type="button"
          className="add-memory-button"
          onClick={() => {
            setShowForm(!showForm)
            setUploadError('')
            setSuccess('')
          }}
        >
          {showForm ? 'Cancel' : '+ Add Memory'}
        </button>
      </div>

      {success && (
        <p className="upload-success">{success}</p>
      )}

      {showForm && (
        <form
          className="memory-upload-form"
          onSubmit={handleUpload}
        >
          <h3>Share a New Memory</h3>

          <div className="upload-field">
            <label htmlFor="memory-title">Memory Title</label>
            <input
              id="memory-title"
              type="text"
              placeholder="Enter a title for your memory"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="upload-field">
            <label htmlFor="memory-description">
              Description (Optional)
            </label>
            <textarea
              id="memory-description"
              placeholder="Tell us about this memory..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows="3"
            />
          </div>
          <div className="upload-field">
            <label htmlFor="memory-photo">Choose a Photo</label>
            <input
              id="memory-photo"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={(e) => setSelectedFile(e.target.files[0] || null)}
              required
            />
            <small>JPEG, PNG or WebP. Maximum size: 5 MB.</small>
          </div>

          {uploadError && (
            <p className="memories-error">{uploadError}</p>
          )}

          <button
            type="submit"
            className="upload-submit-button"
            disabled={uploading}
          >
            {uploading ? 'Uploading...' : 'Upload Memory'}
          </button>
        </form>
      )}

      {photos.length === 0 ? (
        <div className="memories-empty">
          <div className="empty-icon">♡</div>
          <h3>Your memory collection starts here</h3>
          <p>
            No memories have been shared yet.
            Be the first to share a beautiful moment.
          </p>
        </div>
      ) : (
        <div className="photo-grid">
          {photos.map((photo) => (
            <article className="photo-card" key={photo._id}>
              <img
                src={`http://localhost:5000/uploads/${encodeURIComponent(photo.fileName)}`}
                alt={photo.title}
                className="photo-card-image"
              />

              <div className="photo-card-content">
                <h3>{photo.title}</h3>

                {photo.description && (
                  <p>{photo.description}</p>
                )}

                <div className="photo-card-footer">
                  <span>
                    By {photo.userId?.firstName || 'Unknown'}{' '}
                    {photo.userId?.lastName || ''}
                  </span>

                  <small>
                    {new Date(photo.dateTime).toLocaleDateString()}
                  </small>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

    </div>
  )
}

export default Memories