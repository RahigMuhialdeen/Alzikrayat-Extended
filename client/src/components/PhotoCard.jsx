import { Link } from 'react-router-dom'
import CommentForm from './CommentForm'

// One photo in the gallery: image, details, owner-only delete and comments.
function PhotoCard({
  photo,
  comments,
  currentUserId,
  deleting,
  submittingComment,
  deletingCommentId,
  commentError,
  onDelete,
  onAddComment,
  onDeleteComment
}) {
  const isOwner = String(photo.userId?._id) === String(currentUserId)

  return (
    <article className="photo-card">
      <img
        src={`/uploads/${encodeURIComponent(photo.fileName)}`}
        alt={photo.title}
        className="photo-card-image"
      />

      <div className="photo-card-content">
        <h3>{photo.title}</h3>

        {photo.description && <p>{photo.description}</p>}

        
        <Link to={`/photos/${photo._id}`} className="view-details-link">
          View Details →
        </Link>


        <div className="photo-card-footer">
          <span>
            By {photo.userId?.firstName || 'Unknown'}{' '}
            {photo.userId?.lastName || ''}
          </span>

          <small>{new Date(photo.dateTime).toLocaleDateString()}</small>
        </div>

        {isOwner && (
          <button
            type="button"
            className="delete-memory-button"
            onClick={() => onDelete(photo._id)}
            disabled={deleting}
          >
            {deleting ? 'Deleting...' : 'Delete Memory'}
          </button>
        )}
      </div>

      <div className="comments-section">
        <h4>Comments</h4>

        <div className="comments-list">
          {comments.map((comment) => (
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
                  onClick={() => onDeleteComment(comment._id, photo._id)}
                  disabled={deletingCommentId === comment._id}
                >
                  {deletingCommentId === comment._id ? 'Deleting...' : 'Delete'}
                </button>
              )}
            </div>
          ))}
        </div>

        {commentError && <p className="memories-error">{commentError}</p>}

        {currentUserId ? (
          <CommentForm
            onSubmit={(text) => onAddComment(photo._id, text)}
            submitting={submittingComment}
          />
        ) : (
          <p className="comment-login-hint">Please login to comment.</p>
        )}
      </div>
    </article>
  )
}

export default PhotoCard
