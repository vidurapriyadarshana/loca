import { useState, useRef, useCallback, useEffect } from 'react';
import ReactCrop, { type Crop, type PixelCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

interface ImageCropperProps {
    open: boolean;
    onClose: () => void;
    onCropComplete: (croppedImageBlob: Blob) => void;
    imageFile: File | null;
}

export default function ImageCropper({ open, onClose, onCropComplete, imageFile }: ImageCropperProps) {
    const [crop, setCrop] = useState<Crop>({
        unit: '%',
        width: 90,
        height: 90,
        x: 5,
        y: 5,
    });
    const [completedCrop, setCompletedCrop] = useState<PixelCrop | null>(null);
    const [imageSrc, setImageSrc] = useState<string>('');
    const [isProcessing, setIsProcessing] = useState(false);
    const imgRef = useRef<HTMLImageElement | null>(null);

    // Load image when file changes
    useEffect(() => {
        if (imageFile) {
            const reader = new FileReader();
            reader.onload = (e) => {
                setImageSrc(e.target?.result as string);
            };
            reader.readAsDataURL(imageFile);
        }
    }, [imageFile]);

    const getCroppedImg = useCallback(async (): Promise<Blob | null> => {
        if (!completedCrop || !imgRef.current) {
            return null;
        }

        const image = imgRef.current;
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        if (!ctx) {
            return null;
        }

        const scaleX = image.naturalWidth / image.width;
        const scaleY = image.naturalHeight / image.height;

        // Set canvas size to desired output size (800x800 for profile pics)
        const targetSize = 800;
        canvas.width = targetSize;
        canvas.height = targetSize;

        // Draw the cropped image
        ctx.drawImage(
            image,
            completedCrop.x * scaleX,
            completedCrop.y * scaleY,
            completedCrop.width * scaleX,
            completedCrop.height * scaleY,
            0,
            0,
            targetSize,
            targetSize
        );

        return new Promise((resolve) => {
            canvas.toBlob(
                (blob) => {
                    resolve(blob);
                },
                'image/jpeg',
                0.9 // Quality (0-1)
            );
        });
    }, [completedCrop]);

    const handleCropComplete = async () => {
        setIsProcessing(true);
        try {
            const croppedBlob = await getCroppedImg();
            if (croppedBlob) {
                onCropComplete(croppedBlob);
            }
        } catch (error) {
            console.error('Error cropping image:', error);
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl">
                <DialogHeader>
                    <DialogTitle>Crop Your Profile Picture</DialogTitle>
                </DialogHeader>

                <div className="flex items-center justify-center max-h-[60vh] overflow-auto">
                    {imageSrc && (
                        <ReactCrop
                            crop={crop}
                            onChange={(c) => setCrop(c)}
                            onComplete={(c) => setCompletedCrop(c)}
                            aspect={1}
                            circularCrop
                        >
                            <img
                                ref={imgRef}
                                src={imageSrc}
                                alt="Crop preview"
                                style={{ maxHeight: '60vh', maxWidth: '100%' }}
                            />
                        </ReactCrop>
                    )}
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={onClose} disabled={isProcessing}>
                        Cancel
                    </Button>
                    <Button
                        onClick={handleCropComplete}
                        disabled={isProcessing || !completedCrop}
                        className="bg-linear-to-r from-primary to-secondary"
                    >
                        {isProcessing ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Processing...
                            </>
                        ) : (
                            'Crop & Upload'
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
