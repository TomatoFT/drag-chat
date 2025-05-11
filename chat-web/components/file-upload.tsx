"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Upload, File, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"

type FileUploadProps = {
  onFilesUploaded?: (files: File[]) => void
}

export function FileUpload({ onFilesUploaded }: FileUploadProps) {
  const [files, setFiles] = useState<File[]>([])
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files)
      setFiles([...files, ...newFiles])
      simulateUpload(newFiles)
    }
  }

  const simulateUpload = (newFiles: File[]) => {
    setUploading(true)
    setProgress(0)

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          setUploading(false)
          if (onFilesUploaded) {
            onFilesUploaded(newFiles)
          }
          return 100
        }
        return prev + 10
      })
    }, 300)
  }

  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index))
  }

  const handleBrowseClick = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className="w-full">
      <div
        className="border-2 border-dashed border-cyan-300 rounded-lg p-8 flex flex-col items-center"
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault()
          if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            const newFiles = Array.from(e.dataTransfer.files)
            setFiles([...files, ...newFiles])
            simulateUpload(newFiles)
          }
        }}
      >
        <div className="bg-cyan-500 text-white p-4 rounded-full mb-4">
          <Upload size={24} />
        </div>
        <p className="text-center mb-2">Drag and Drop Or</p>
        <button onClick={handleBrowseClick} className="text-cyan-500 font-medium">
          Browse File
        </button>
        <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" multiple />
        <p className="text-gray-500 mt-2">To Upload Document</p>
      </div>

      {uploading && (
        <div className="mt-4">
          <Progress value={progress} className="h-2" />
          <p className="text-sm text-gray-500 mt-2">Uploading... {progress}%</p>
        </div>
      )}

      {files.length > 0 && (
        <div className="mt-4 space-y-2">
          <p className="text-sm font-medium">Uploaded Files:</p>
          {files.map((file, index) => (
            <div key={index} className="flex items-center justify-between bg-gray-100 p-2 rounded">
              <div className="flex items-center gap-2">
                <File size={16} className="text-cyan-500" />
                <span className="text-sm truncate max-w-[200px]">{file.name}</span>
              </div>
              <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => removeFile(index)}>
                <X size={14} />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
