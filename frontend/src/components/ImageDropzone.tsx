import { useRef, useState } from 'react'
import { apiUrl } from '../lib/api'

interface ImageDropzoneProps {
  token: string
  onUploaded: (url: string) => void
}

export default function ImageDropzone({ token, onUploaded }: ImageDropzoneProps) {
  const [dragOver, setDragOver] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const upload = async (file: File) => {
    setUploading(true)
    setError('')
    try {
      const formData = new FormData()
      formData.append('file', file)
      const res = await fetch(apiUrl('/api/admin/upload'), {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      })
      const data = await res.json()
      if (data.success) {
        // Stored as the relative "/media/..." key the API returned. Saving the absolute
        // URL instead would pin the catalog to whichever API host uploaded the file, so
        // every previously uploaded photo would break the day that host changes.
        onUploaded(data.url)
      } else {
        setError(data.message || 'Upload failed')
      }
    } catch {
      setError('Upload failed')
    }
    setUploading(false)
  }

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
      onDragLeave={() => setDragOver(false)}
      onDrop={(e) => {
        e.preventDefault()
        setDragOver(false)
        const file = e.dataTransfer.files?.[0]
        if (file) upload(file)
      }}
      onClick={() => inputRef.current?.click()}
      style={{
        border: `1px dashed ${dragOver ? 'var(--text-color)' : '#ccc'}`,
        padding: '0.5rem',
        textAlign: 'center',
        fontSize: '0.72rem',
        color: '#888',
        cursor: 'pointer',
        marginTop: '0.3rem',
      }}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) upload(file)
          e.target.value = ''
        }}
      />
      {uploading ? 'Uploading...' : 'Drop image here or click to upload'}
      {error && <div style={{ color: 'red' }}>{error}</div>}
    </div>
  )
}
