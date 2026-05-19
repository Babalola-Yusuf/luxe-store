import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { FaUpload, FaTimes, FaSpinner, FaImage } from 'react-icons/fa'

export default function StoreAssetUpload({ onUploadComplete, existingUrl, assetType = 'logo' }) {
  const [uploading, setUploading] = useState(false)
  const [preview, setPreview] = useState(existingUrl || '')
  const [error, setError] = useState('')

  const isLogo = assetType === 'logo'
  const isFavicon = assetType === 'favicon'

  async function handleFileUpload(e) {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file')
      return
    }

    // Validate file size
    const maxSize = isFavicon ? 1 * 1024 * 1024 : 2 * 1024 * 1024 // 1MB for favicon, 2MB for logo
    if (file.size > maxSize) {
      setError(`Image must be less than ${isFavicon ? '1MB' : '2MB'}`)
      return
    }

    setUploading(true)
    setError('')

    try {
      // Create unique filename
      const fileExt = file.name.split('.').pop()
      const fileName = `${assetType}-${Date.now()}.${fileExt}`
      const filePath = `${assetType}/${fileName}`

      // Upload to Supabase Storage
      const { data, error: uploadError } = await supabase.storage
        .from('store-assets')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        })

      if (uploadError) throw uploadError

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('store-assets')
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
          <div className={`border border-border rounded-lg p-4 bg-bg ${isFavicon ? 'w-24' : ''}`}>
            <img 
              src={preview} 
              alt={`${assetType} preview`}
              className={`${isFavicon ? 'w-16 h-16' : 'h-20'} object-contain mx-auto`}
            />
          </div>
          <button
            onClick={removeImage}
            className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors text-xs"
          >
            <FaTimes />
          </button>
        </div>
      ) : (
        <label className="block">
          <div className="border-2 border-dashed border-border rounded-lg p-6 text-center cursor-pointer hover:border-brand transition-colors">
            {uploading ? (
              <div className="flex flex-col items-center gap-2">
                <FaSpinner className="text-2xl text-brand animate-spin" />
                <p className="text-xs text-muted">Uploading...</p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <FaImage className="text-2xl text-muted" />
                <p className="text-xs font-medium">
                  Click to upload {isLogo ? 'logo' : 'favicon'}
                </p>
                <p className="text-[10px] text-muted">
                  {isFavicon 
                    ? 'PNG, ICO (32x32 or 64x64, max 1MB)' 
                    : 'PNG, SVG, JPG (max 2MB)'}
                </p>
              </div>
            )}
          </div>
          <input
            type="file"
            accept={isFavicon ? 'image/png,image/x-icon,image/vnd.microsoft.icon' : 'image/*'}
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