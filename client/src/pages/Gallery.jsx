import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import './Gallery.css'
import Navbar from '../components/Navbar'
import PhotoCard from '../components/PhotoCard'
import PhotoUploadForm from '../components/PhotoUploadForm'

// Gallery page: fetches photos from the API and shows them as a grid or list
function Gallery({ currentUserId, currentUser, onLogout }) {
  const [photos, setPhotos] = useState([])
  const [viewMode, setViewMode] = useState('grid')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [showForm, setShowForm] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState('')
  const [success, setSuccess] = useState('')

  const [deletingPhotoId, setDeletingPhotoId] = useState(null)
  const [deleteError, setDeleteError] = useState('')

  const [comments, setComments] = useState({})
  const [commentErrors, setCommentErrors] = useState({})
  const [submittingComment, setSubmittingComment] = useState(null)
  const [deletingCommentId, setDeletingCommentId] = useState(null)

  const setCommentError = (photoId, message) => {
    setCommentErrors((currentErrors) => ({
      ...currentErrors,
      [photoId]: message
    }))
  }

  const fetchPhotos = async () => {
    try {
      const response = await fetch('/api/photos')

      if (!response.ok) {
        throw new Error('Failed to load memories')
      }

      const data = await response.json()
      setPhotos(data)
      setError('')
    } catch (err) {
      setError(err.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  const fetchComments = async (photoId) => {
    try {
      const response = await fetch(`/api/photos/${photoId}/comments`)

      if (!response.ok) {
        throw new Error('Failed to load comments')
      }

      const data = await response.json()

      setComments((currentComments) => ({
        ...currentComments,
        [photoId]: data
      }))
    } catch (err) {
      setCommentError(photoId, err.message || 'Something went wrong')
    }
  }

  // Returns true when the comment was saved (so the form can clear itself)
  const handleAddComment = async (photoId, commentText) => {
    setCommentError(photoId, '')
    setSubmittingComment(photoId)

    try {
      const response = await fetch(`/api/photos/${photoId}/comments`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ comment: commentText })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to add comment')
      }

      await fetchComments(photoId)
      return true

    } catch (err) {
      setCommentError(photoId, err.message || 'Something went wrong')
      return false
    } finally {
      setSubmittingComment(null)
    }
  }

  const handleDeleteComment = async (commentId, photoId) => {
    const confirmed = window.confirm(
      'Are you sure you want to delete this comment?'
    )

    if (!confirmed) {
      return
    }

    setCommentError(photoId, '')
    setDeletingCommentId(commentId)

    try {
      const response = await fetch(`/api/comments/${commentId}`, {
        method: 'DELETE',
        credentials: 'include'
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to delete comment')
      }

      setComments((currentComments) => ({
        ...currentComments,
        [photoId]: currentComments[photoId].filter(
          (comment) => comment._id !== commentId
        )
      }))

    } catch (err) {
      setCommentError(photoId, err.message || 'Something went wrong')
    } finally {
      setDeletingCommentId(null)
    }
  }

  useEffect(() => {
    const loadMemories = async () => {
      try {
        const response = await fetch('/api/photos')

        if (!response.ok) {
          throw new Error('Failed to load memories')
        }

        const data = await response.json()
        setPhotos(data)
        setError('')

        data.forEach((photo) => {
          fetchComments(photo._id)
        })
      } catch (err) {
        setError(err.message || 'Something went wrong')
      } finally {
        setLoading(false)
      }
    }

    loadMemories()
  }, [])

  const handleUpload = async ({ title, description, file }) => {
    setUploadError('')
    setSuccess('')
    setUploading(true)

    try {
      const formData = new FormData()

      formData.append('photo', file)
      formData.append('title', title)
      formData.append('description', description)

      const response = await fetch('/api/photos', {
        method: 'POST',
        credentials: 'include',
        body: formData
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Photo upload failed')
      }

      await fetchPhotos()

      setShowForm(false)
      setSuccess('Your memory has been uploaded successfully!')

    } catch (err) {
      setUploadError(err.message || 'Something went wrong')
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = async (photoId) => {
    const confirmed = window.confirm(
      'Are you sure you want to delete this memory?'
    )

    if (!confirmed) {
      return
    }

    setDeleteError('')
    setSuccess('')
    setDeletingPhotoId(photoId)

    try {
      const response = await fetch(`/api/photos/${photoId}`, {
        method: 'DELETE',
        credentials: 'include'
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to delete memory')
      }

      setPhotos((currentPhotos) =>
        currentPhotos.filter((photo) => photo._id !== photoId)
      )

      setSuccess('Memory deleted successfully!')

    } catch (err) {
      setDeleteError(err.message || 'Something went wrong')
    } finally {
      setDeletingPhotoId(null)
    }
  }

  let content

  if (loading) {
    content = <p className="memories-message">Loading memories...</p>
  } else if (error) {
    content = <p className="memories-error">{error}</p>
  } else {
    content = (
      <div className="memories-container">
        <div className="memories-actions">
          {currentUserId ? (
            <button
              type="button"
              className="add-memory-button"
              onClick={() => {
                setShowForm(!showForm)
                setUploadError('')
                setSuccess('')
                setDeleteError('')
              }}
            >
              {showForm ? 'Cancel' : '+ Add Memory'}
            </button>
          ) : (
            <p className="comment-login-hint">
              Please login to share a memory.
            </p>
          )}

          <div className="view-toggle">
            <button
              type="button"
              className={viewMode === 'grid' ? 'active' : ''}
              onClick={() => setViewMode('grid')}
            >
              Grid View
            </button>

            <button
              type="button"
              className={viewMode === 'list' ? 'active' : ''}
              onClick={() => setViewMode('list')}
            >
              List View
            </button>
          </div>
        </div>

        {success && <p className="upload-success">{success}</p>}

        {deleteError && <p className="memories-error">{deleteError}</p>}

        {showForm && (
          <PhotoUploadForm
            onSubmit={handleUpload}
            uploading={uploading}
            error={uploadError}
          />
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
          <div
            className={`photo-grid ${viewMode === 'list' ? 'list-view' : ''}`}
          >
            {photos.map((photo) => (
              <PhotoCard
                key={photo._id}
                photo={photo}
                comments={comments[photo._id] || []}
                currentUserId={currentUserId}
                deleting={deletingPhotoId === photo._id}
                submittingComment={submittingComment === photo._id}
                deletingCommentId={deletingCommentId}
                commentError={commentErrors[photo._id]}
                onDelete={handleDelete}
                onAddComment={handleAddComment}
                onDeleteComment={handleDeleteComment}
              />
            ))}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="app">
      <Navbar
        currentUser={currentUser}
        onLogout={onLogout}
        activePage="memories"
      />

      <main>
        <section className="memories-section" id="memories">
          <div className="section-heading">
            <div>
              <span className="eyebrow">YOUR PERSONAL SPACE</span>
              <h2>Welcome to your memories</h2>
              <p>Your special moments deserve to be remembered.</p>
            </div>

            <span className="memory-symbol">✿</span>
          </div>

          {content}
        </section>

        <section className="about-section" id="about">
          <span className="about-symbol">✧</span>
          <p>
            "Some moments become memories.
            Some memories become treasures."
          </p>
          <span className="about-name">— Alzikrayat</span>
        </section>
      </main>

      <footer className="footer">
        <Link to="/memories" className="brand footer-brand">
          <span className="brand-icon">✿</span>
          <span>Alzikrayat</span>
        </Link>

        <p>Made for the moments that matter.</p>
        <span>© 2026 Alzikrayat</span>
      </footer>
    </div>
  )
}

export default Gallery
