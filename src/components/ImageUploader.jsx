import React, { useState, useRef } from 'react';
import { Upload, Image, Loader2, Check, AlertCircle, X, ExternalLink, Sparkles, Link } from 'lucide-react';
import { uploadImageToCloudinary } from '../utils/cloudinary';
import { useData } from '../context/DataContext';

export const ImageUploader = ({
  value,
  onChange,
  label = 'Image',
  placeholder = 'https://images.unsplash.com/... or upload from computer',
  aspectRatio = 'video', // 'video', 'square', 'avatar'
  onOpenSettings,
}) => {
  const { cloudinaryConfig } = useData();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const [isManualMode, setIsManualMode] = useState(false);
  const fileInputRef = useRef(null);

  const isCloudinaryReady = Boolean(
    cloudinaryConfig?.cloudName?.trim() && cloudinaryConfig?.uploadPreset?.trim()
  );

  const handleFile = async (file) => {
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setUploadError('Please select a valid image file (PNG, JPG, WEBP, etc.)');
      return;
    }

    if (!isCloudinaryReady) {
      setUploadError('Cloudinary is not configured. Click "Configure Cloudinary" or paste an image URL.');
      return;
    }

    setIsUploading(true);
    setUploadError('');

    try {
      const result = await uploadImageToCloudinary(
        file,
        cloudinaryConfig.cloudName,
        cloudinaryConfig.uploadPreset
      );
      onChange(result.url);
    } catch (err) {
      setUploadError(err.message || 'Upload failed. Please check your Cloudinary settings.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
          <Image className="w-3.5 h-3.5 text-blue-600" />
          {label}
        </label>
        
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsManualMode(!isManualMode)}
            className="text-[11px] text-blue-600 hover:text-blue-700 font-semibold cursor-pointer flex items-center gap-1"
          >
            <Link className="w-3 h-3" />
            {isManualMode ? 'Switch to Cloudinary Uploader' : 'Paste Direct URL'}
          </button>
        </div>
      </div>

      {isManualMode ? (
        /* Direct URL Input Mode */
        <div className="space-y-2">
          <div className="relative">
            <input
              type="url"
              value={value || ''}
              onChange={(e) => onChange(e.target.value)}
              placeholder={placeholder}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600 text-sm bg-white"
            />
            {value && (
              <button
                type="button"
                onClick={() => onChange('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-red-500"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      ) : (
        /* Cloudinary Direct Upload Zone */
        <div className="space-y-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileInputChange}
            className="hidden"
          />

          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => {
              if (isCloudinaryReady) {
                fileInputRef.current?.click();
              } else if (onOpenSettings) {
                onOpenSettings();
              }
            }}
            className={`relative rounded-2xl border-2 border-dashed p-4 transition-all cursor-pointer text-center ${
              dragActive
                ? 'border-blue-500 bg-blue-50/80 scale-[1.01]'
                : value
                ? 'border-emerald-300 bg-emerald-50/30 hover:border-emerald-400'
                : 'border-slate-300 bg-slate-50/70 hover:border-blue-400 hover:bg-blue-50/30'
            }`}
          >
            {isUploading ? (
              <div className="py-6 flex flex-col items-center justify-center gap-2">
                <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                <p className="text-xs font-bold text-blue-700">Uploading to Cloudinary...</p>
                <p className="text-[11px] text-slate-500">Optimizing & generating secure CDN URL</p>
              </div>
            ) : value ? (
              /* Uploaded Image Preview */
              <div className="flex items-center gap-4 text-left">
                <div className="w-16 h-16 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 shrink-0 relative group">
                  <img
                    src={value}
                    alt="Preview"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src = 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=400&q=80';
                    }}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 text-emerald-600 text-xs font-bold mb-0.5">
                    <Check className="w-3.5 h-3.5" />
                    <span>Image Ready</span>
                  </div>
                  <p className="text-xs text-slate-600 truncate font-mono">{value}</p>
                  <p className="text-[11px] text-slate-400 mt-1">Click to replace or drop new file</p>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onChange('');
                  }}
                  className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Remove Image"
                >
                  <TrashIcon className="w-4 h-4" />
                </button>
              </div>
            ) : (
              /* Empty Upload Prompt */
              <div className="py-4 px-2 flex flex-col items-center justify-center">
                <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mb-2 shadow-xs">
                  <Upload className="w-5 h-5" />
                </div>
                
                {isCloudinaryReady ? (
                  <>
                    <p className="text-xs font-bold text-slate-800 mb-1">
                      Drop image here, or <span className="text-blue-600 underline">Browse from Device</span>
                    </p>
                    <p className="text-[11px] text-slate-500">
                      Cloudinary direct upload (JPEG, PNG, WEBP — auto-optimized)
                    </p>
                  </>
                ) : (
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-amber-700 flex items-center justify-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                      Cloudinary Setup Needed
                    </p>
                    <p className="text-[11px] text-slate-600">
                      Click here to configure Cloud Name & Upload Preset in Settings
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Error Message */}
      {uploadError && (
        <div className="p-2.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <div className="flex-1">
            <span>{uploadError}</span>
            {!isCloudinaryReady && onOpenSettings && (
              <button
                type="button"
                onClick={onOpenSettings}
                className="ml-2 underline font-bold hover:text-red-900 cursor-pointer"
              >
                Go to Settings
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const TrashIcon = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
);
