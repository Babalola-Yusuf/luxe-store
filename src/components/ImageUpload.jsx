import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { FaUpload, FaTimes, FaSpinner, FaImage } from 'react-icons/fa'

export default function ImageUpload({ onUploadComplete, existingUrl }) {
  const [uploading, setUploading] = useState(false)
  const [preview, setPreview] = useState(existingUrl || '')
  const [error, setError] = useState('')

  async function handleFileUpload(e) {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file')
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image must be less than 5MB')
      return
    }

    setUploading(true)
    setError('')

    try {
      // Create unique filename
      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
      const filePath = `products/${fileName}`

      // Upload to Supabase Storage
      const { data, error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        })

      if (uploadError) throw uploadError

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('product-images')
        .getPublicUrl(filePath)

      setPreview(publicUrl)
      onUploadComplete(publicUrl)
    } catch (err) {
      console.error('Upload error:', err)
      setError(err.message || 'Failed to upload image')
    } finally {
      setUploading(false)
    }
  }

  function removeImage() {
    setPreview('')
    onUploadComplete('')
  }

  return (
    <div className="space-y-3">
      {preview ? (
        <div className="relative">
          <img 
            src={preview} 
            alt="Preview" 
            className="w-full h-48 object-cover rounded-lg border border-border"
          />
          <button
            onClick={removeImage}
            className="absolute top-2 right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
          >
            <FaTimes />
          </button>
        </div>
      ) : (
        <label className="block">
          <div className="border-2 border-dashed border-border rounded-lg p-8 text-center cursor-pointer hover:border-brand transition-colors">
            {uploading ? (
              <div className="flex flex-col items-center gap-2">
                <FaSpinner className="text-3xl text-brand animate-spin" />
                <p className="text-sm text-muted">Uploading...</p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <FaImage className="text-3xl text-muted" />
                <p className="text-sm font-medium">Click to upload image</p>
                <p className="text-xs text-muted">PNG, JPG, WEBP (max 5MB)</p>
              </div>
            )}
          </div>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            disabled={uploading}
            className="hidden"
          />
        </label>
      )}

      {error && (
        <p className="text-xs text-red-600">{error}</p>
      )}
    </div>
  )
}