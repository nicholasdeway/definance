"use client"

import { useState, useCallback } from "react"
import Cropper, { Area, Point } from "react-easy-crop"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Label } from "@/components/ui/label"

interface ImageCropperModalProps {
  image: string | null
  isOpen: boolean
  onClose: () => void
  onCropComplete: (croppedImage: Blob) => void
}

export function ImageCropperModal({ image, isOpen, onClose, onCropComplete }: ImageCropperModalProps) {
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null)

  const onCropChange = (crop: Point) => {
    setCrop(crop)
  }

  const onZoomChange = (zoom: number) => {
    setZoom(zoom)
  }

  const onCropAreaChange = useCallback((_croppedArea: Area, croppedAreaPixels: Area) => {
    setCroppedAreaPixels(croppedAreaPixels)
  }, [])

  const handleCrop = useCallback(async () => {
    if (!image || !croppedAreaPixels) return

    try {
      const croppedImage = await getCroppedImg(image, croppedAreaPixels)
      onCropComplete(croppedImage)
      onClose()
    } catch (e) {
      console.error(e)
    }
  }, [image, croppedAreaPixels, onCropComplete, onClose])

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] overflow-hidden">
        <DialogHeader>
          <DialogTitle>Ajustar Foto de Perfil</DialogTitle>
        </DialogHeader>
        
        <div className="relative h-[300px] w-full bg-muted rounded-md overflow-hidden">
          {image && (
            <Cropper
              image={image}
              crop={crop}
              zoom={zoom}
              aspect={1}
              cropShape="round"
              showGrid={false}
              onCropChange={onCropChange}
              onCropComplete={onCropAreaChange}
              onZoomChange={onZoomChange}
            />
          )}
        </div>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Zoom</Label>
            <Slider
              value={[zoom]}
              min={1}
              max={3}
              step={0.1}
              onValueChange={([val]) => setZoom(val)}
              className="cursor-pointer"
            />
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="ghost" onClick={onClose} className="cursor-pointer">
            Cancelar
          </Button>
          <Button onClick={handleCrop} className="bg-primary text-primary-foreground hover:bg-primary/70 cursor-pointer">
            Salvar Foto
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// Helper function to crop the image
async function getCroppedImg(imageSrc: string, pixelCrop: Area): Promise<Blob> {
  const image = await createImage(imageSrc)
  const canvas = document.createElement("canvas")
  const ctx = canvas.getContext("2d")

  if (!ctx) throw new Error("Could not get canvas context")

  canvas.width = pixelCrop.width
  canvas.height = pixelCrop.height

  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height
  )

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error("Canvas is empty"))
        return
      }
      resolve(blob)
    }, "image/jpeg")
  })
}

function createImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image()
    image.addEventListener("load", () => resolve(image))
    image.addEventListener("error", (error) => reject(error))
    image.setAttribute("crossOrigin", "anonymous")
    image.src = url
  })
}