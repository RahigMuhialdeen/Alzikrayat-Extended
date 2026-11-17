import { useState } from 'react'

// Upload form for a new photo. The parent performs the request.
function PhotoUploadForm({ onSubmit, uploading, error }) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [selectedFile, setSelectedFile] = useState(null)

  const handleSubmit = (e) => {
    e.preventDefault()

    onSubmit({
      title,
      description,
      file: selectedFile
    })
  }

  return (
    <form className="memory-upload-form" onSubmit={handleSubmit}>
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

      {error && <p className="memories-error">{error}</p>}

      <button
        type="submit"
        className="upload-submit-button"
        disabled={uploading}
      >
        {uploading ? 'Uploading...' : 'Upload Memory'}
      </button>
    </form>
  )
}

export default PhotoUploadForm
