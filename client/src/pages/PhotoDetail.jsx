import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import './PhotoDetail.css'
import CommentForm from '../components/CommentForm'

function PhotoDetail({ currentUserId }) {
  const { id } = useParams()

  const [photo, setPhoto] = useState(null)
  const [comments, setComments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const [photoResponse, commentsResponse] = await Promise.all([
          fetch(`/api/photos/${id}`),
          fetch(`/api/photos/${id}/comments`)
        ])

        if (!photoResponse.ok) {
          throw new Error('Could not load photo details.')
        }

        if (!commentsResponse.ok) {
          throw new Error('Could not load comments.')
        }

        const photoData = await photoResponse.json()
        const commentsData = await commentsResponse.json()

        setPhoto(photoData.photo || photoData)
        setComments(
          Array.isArray(commentsData)
            ? commentsData
            : commentsData.comments || []
        )
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchDetails()
  }, [id])

  // Returns true when the comment was saved (so the form can clear itself)
  const handleAddComment = async (commentText) => {
    setSubmitting(true)

    try {
      const response = await fetch(`/api/photos/${id}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ comment: commentText })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Could not add comment.')
      }

      // Reload comments so the new one appears with the author's name
      const refreshed = await fetch(`/api/photos/${id}/comments`)
      if (refreshed.ok) {
        setComments(await refreshed.json())
      }

      return true
    } catch (err) {
      alert(err.message)
      return false
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return <div className="photo-details-message">Loading photo...</div>
  }

  if (error || !photo) {
    return (
      <div className="photo-details-message">
        <p>{error || 'Photo not found.'}</p>
        <Link to="/memories">Back to Memories</Link>
      </div>
    )
  }

  const owner = photo.userId
  const ownerName = owner
    ? `${owner.firstName || ''} ${owner.lastName || ''}`.trim()
    : 'Unknown user'

  return (
    <section className="photo-details-section">
      <Link to="/memories" className="back-to-memories">
        ← Back to Memories
      </Link>

      <div className="photo-details-card">
        <img
          src={`/uploads/${photo.fileName}`}
          alt={photo.title}
          className="photo-details-image"
        />

        <div className="photo-details-content">
          <h1>{photo.title}</h1>

          <p className="photo-details-description">
            {photo.description || 'No description provided.'}
          </p>

          <div className="photo-details-meta">
            <span>Shared by: {ownerName}</span>
            <span>
              {photo.dateTime
                ? new Date(photo.dateTime).toLocaleString()
                : ''}
            </span>
          </div>

          <div className="photo-comments">
            <h2>Comments ({comments.length})</h2>

            {currentUserId && (
              <CommentForm
                onSubmit={handleAddComment}
                submitting={submitting}
                className="detail-comment-form"
                buttonLabel="Post Comment"
                sendingLabel="Posting..."
              />
            )}

            {comments.length === 0 ? (
              <p className="no-comments">No comments yet.</p>
            ) : (
              <div className="detail-comments-list">
                {comments.map((item) => {
                  const commenter = item.userId

                  return (
                    <div className="detail-comment" key={item._id}>
                      <strong>
                        {commenter
                          ? `${commenter.firstName || ''} ${commenter.lastName || ''}`.trim()
                          : 'User'}
                      </strong>
                      <p>{item.comment}</p>
                      <small>
                        {item.dateTime
                          ? new Date(item.dateTime).toLocaleString()
                          : ''}
                      </small>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}

export default PhotoDetail