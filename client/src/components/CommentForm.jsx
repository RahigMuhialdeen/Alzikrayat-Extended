import { useState } from 'react'

// Reusable comment form. It owns the text input and clears it
// only when the parent reports that the comment was saved.
function CommentForm({
  onSubmit,
  submitting,
  className = 'comment-form',
  buttonLabel = 'Post',
  sendingLabel = 'Sending...'
}) {
  const [text, setText] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()

    const trimmed = text.trim()

    if (!trimmed) {
      return
    }

    const saved = await onSubmit(trimmed)

    if (saved) {
      setText('')
    }
  }

  return (
    <form className={className} onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Write a comment..."
        value={text}
        onChange={(e) => setText(e.target.value)}
        required
      />

      <button type="submit" disabled={submitting}>
        {submitting ? sendingLabel : buttonLabel}
      </button>
    </form>
  )
}

export default CommentForm
