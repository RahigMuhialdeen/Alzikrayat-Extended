import { useEffect, useState } from 'react'
import './Memories.css'
import { Link } from 'react-router-dom'

function Memories({ currentUserId }) {
  const [photos, setPhotos] = useState([])
  const [viewMode, setViewMode] = useState('grid')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [showForm, setShowForm] = useState(false)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [selectedFile, setSelectedFile] = useState(null)

  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState('')
  const [success, setSuccess] = useState('')

  const [deletingPhotoId, setDeletingPhotoId] = useState(null)
  const [deleteError, setDeleteError] = useState('')
  const [comments, setComments] = useState({})
const [commentInputs, setCommentInputs] = useState({})
const [commentErrors, setCommentErrors] = useState({})
const [submittingComment, setSubmittingComment] = useState(null)
const [deletingCommentId, setDeletingCommentId] = useState(null)

  const fetchPhotos = async () => {
    try {
      const response = await fetch(
        '/api/photos'
      )

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
    const response = await fetch(
      `/api/photos/${photoId}/comments`
    )

    if (!response.ok) {
      throw new Error('Failed to load comments')
    }

    const data = await response.json()

    setComments((currentComments) => ({
      ...currentComments,
      [photoId]: data
    }))
  } catch (err) {
    setCommentErrors((currentErrors) => ({
      ...currentErrors,
      [photoId]: err.message || 'Something went wrong'
    }))
  }
}

const handleAddComment = async (photoId) => {
  const commentText = commentInputs[photoId]?.trim()

  if (!commentText) {
    return
  }

  setCommentErrors((currentErrors) => ({
    ...currentErrors,
    [photoId]: ''
  }))

  setSubmittingComment(photoId)

  try {
    const response = await fetch(
      `/api/photos/${photoId}/comments`,
      {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          comment: commentText
        })
      }
    )

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.message || 'Failed to add comment')
    }

    setCommentInputs((currentInputs) => ({
      ...currentInputs,
      [photoId]: ''
    }))

    await fetchComments(photoId)

  } catch (err) {
    setCommentErrors((currentErrors) => ({
      ...currentErrors,
      [photoId]: err.message || 'Something went wrong'
    }))
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

  setCommentErrors((currentErrors) => ({
    ...currentErrors,
    [photoId]: ''
  }))

  setDeletingCommentId(commentId)

  try {
    const response = await fetch(
      `/api/comments/${commentId}`,
      {
        method: 'DELETE',
        credentials: 'include'
      }
    )

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
    setCommentErrors((currentErrors) => ({
      ...currentErrors,
      [photoId]: err.message || 'Something went wrong'
    }))
  } finally {
    setDeletingCommentId(null)
  }
}

  useEffect(() => {
  const loadMemories = async () => {
    try {
      const response = await fetch(
        '/api/photos'
      )

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
        '/api/photos',
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

      await fetchPhotos()

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
      const response = await fetch(
        `/api/photos/${photoId}`,
        {
          method: 'DELETE',
          credentials: 'include'
        }
      )

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
            setDeleteError('')
          }}
        >
          {showForm ? 'Cancel' : '+ Add Memory'}
        </button>
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

      {success && (
        <p className="upload-success">{success}</p>
      )}

      {deleteError && (
        <p className="memories-error">{deleteError}</p>
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
              onChange={(e) =>
                setSelectedFile(e.target.files[0] || null)
              }
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
        <div className={`photo-grid ${viewMode === 'list' ? 'list-view' : ''}`}>
          {photos.map((photo) => (
            <article className="photo-card" key={photo._id}>
              <img
                src={`/uploads/${encodeURIComponent(photo.fileName)}`}
                alt={photo.title}
                className="photo-card-image"
              />

              <div className="photo-card-content">
                <h3>{photo.title}</h3>
                
                <Link
  to={`/photos/${photo._id}`}
  className="view-details-link"
>
  View Details →
</Link>

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

                {String(photo.userId?._id) === String(currentUserId) && (
                  <button
                    type="button"
                    className="delete-memory-button"
                    onClick={() => handleDelete(photo._id)}
                    disabled={deletingPhotoId === photo._id}
                  >
                    {deletingPhotoId === photo._id
                      ? 'Deleting...'
                      : 'Delete Memory'}
                  </button>
                )}
              </div>
              <div className="comments-section">
  <h4>Comments</h4>

  <div className="comments-list">
    {(comments[photo._id] || []).map((comment) => (
      <div className="comment-item" key={comment._id}>
        <div className="comment-content">
          <strong>
            {comment.userId?.firstName || 'Unknown'}{' '}
            {comment.userId?.lastName || ''}
          </strong>

          <p>{comment.comment}</p>
        </div>

        {String(comment.userId?._id) === String(currentUserId) && (
          <button
            type="button"
            className="delete-comment-button"
            onClick={() => handleDeleteComment(comment._id, photo._id)}
            disabled={deletingCommentId === comment._id}
          >
            {deletingCommentId === comment._id ? 'Deleting...' : 'Delete'}
          </button>
        )}
      </div>
    ))}
  </div>

  {commentErrors[photo._id] && (
    <p className="memories-error">{commentErrors[photo._id]}</p>
  )}

  <form
    className="comment-form"
    onSubmit={(e) => {
      e.preventDefault()
      handleAddComment(photo._id)
    }}
  >
    <input
      type="text"
      placeholder="Write a comment..."
      value={commentInputs[photo._id] || ''}
      onChange={(e) =>
        setCommentInputs((currentInputs) => ({
          ...currentInputs,
          [photo._id]: e.target.value
        }))
      }
      required
    />

    <button
      type="submit"
      disabled={submittingComment === photo._id}
    >
      {submittingComment === photo._id ? 'Sending...' : 'Post'}
    </button>
  </form>
</div>
            </article>
          ))}
        </div>
      )}

    </div>
  )
}

export default Memories