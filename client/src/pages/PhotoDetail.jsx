import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import './PhotoDetail.css'
import CommentForm from '../components/CommentForm'
import { socket, acquireSocket } from '../socket'

function PhotoDetail({ currentUserId }) {
  const { id } = useParams()

  const [photo, setPhoto] = useState(null)
  const [comments, setComments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [live, setLive] = useState(socket.connected)
  const [viewers, setViewers] = useState(0)

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

  // Real-time updates: join this photo's room and listen for events
  useEffect(() => {
    const release = acquireSocket()
    let hasConnectedBefore = false

    const reloadComments = async () => {
      try {
        const response = await fetch(`/api/photos/${id}/comments`)

        if (response.ok) {
          setComments(await response.json())
        }
      } catch (err) {
        console.error('Could not refresh comments:', err)
      }
    }

    // Runs on the first connection and after every automatic reconnection
    const handleConnect = () => {
      setLive(true)
      socket.emit('photo:join', id)

      // Comments posted while we were offline were missed: reload them
      if (hasConnectedBefore) {
        reloadComments()
      }

      hasConnectedBefore = true
    }

    const handleDisconnect = () => {
      setLive(false)
    }

    const handleNewComment = (newComment) => {
      if (newComment.photoId !== id) {
        return
      }

      // The author also receives this event: ignore comments already shown
      setComments((current) =>
        current.some((item) => item._id === newComment._id)
          ? current
          : [newComment, ...current]
      )
    }

    const handleCommentDeleted = ({ commentId, photoId }) => {
      if (photoId !== id) {
        return
      }

      setComments((current) =>
        current.filter((item) => item._id !== commentId)
      )
    }

    const handleViewers = ({ photoId, count }) => {
      if (photoId === id) {
        setViewers(count)
      }
    }

    const handlePhotoDeleted = ({ photoId }) => {
      if (photoId === id) {
        setError('This photo was deleted by its owner.')
      }
    }

    socket.on('connect', handleConnect)
    socket.on('disconnect', handleDisconnect)
    socket.on('comment:new', handleNewComment)
    socket.on('comment:deleted', handleCommentDeleted)
    socket.on('room:viewers', handleViewers)
    socket.on('photo:deleted', handlePhotoDeleted)

    // The socket may already be connected (e.g. navigating between photos)
    if (socket.connected) {
      hasConnectedBefore = true
      socket.emit('photo:join', id)
    }

    // Cleanup on unmount (or when the photo id changes)
    return () => {
      socket.emit('photo:leave', id)

      socket.off('connect', handleConnect)
      socket.off('disconnect', handleDisconnect)
      socket.off('comment:new', handleNewComment)
      socket.off('comment:deleted', handleCommentDeleted)
      socket.off('room:viewers', handleViewers)
      socket.off('photo:deleted', handlePhotoDeleted)

      setLive(false)
      setViewers(0)
      release()
    }
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

      // Show it right away; the live event for the same comment is ignored
      // because we skip comments whose id is already in the list
      const savedComment = data.newComment

      if (savedComment) {
        setComments((current) =>
          current.some((item) => item._id === savedComment._id)
            ? current
            : [savedComment, ...current]
        )
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

            <p
              className={`live-status ${live ? 'online' : 'offline'}`}
              aria-live="polite"
            >
              <span className="live-dot" />
              {live
                ? `Live · ${viewers} ${viewers === 1 ? 'person' : 'people'} viewing`
                : 'Reconnecting...'}
            </p>

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
