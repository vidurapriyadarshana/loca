import { useState, useRef, useCallback, useEffect } from 'react';
import ReactCrop, { type Crop, type PixelCrop, centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Loader2, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';

interface ImageCropperProps {
    open: boolean;
    onClose: () => void;
    onCropComplete: (croppedImageBlob: Blob) => void;
    imageFile: File | null;
    aspectRatio?: number;
    circularCrop?: boolean;
}

function centerAspectCrop(
    mediaWidth: number,
    mediaHeight: number,
    aspect: number,
) {
    return centerCrop(
        makeAspectCrop(
            {
                unit: '%',
                width: 80,
            },
            aspect,
            mediaWidth,
            mediaHeight,
        ),
        mediaWidth,
        mediaHeight,
    );
}

export default function ImageCropper({
    open,
    onClose,
    onCropComplete,
    imageFile,
    aspectRatio = 1,
    circularCrop = true
}: ImageCropperProps) {
    const [crop, setCrop] = useState<Crop>();
    const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
    const [imageSrc, setImageSrc] = useState<string>('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [scale, setScale] = useState(1);
    const [rotate, setRotate] = useState(0);
    const imgRef = useRef<HTMLImageElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    // Load image when file changes
    useEffect(() => {
        if (imageFile) {
            const reader = new FileReader();
            reader.onload = (e) => {
                setImageSrc(e.target?.result as string);
                // Reset crop state for new image
                setCrop(undefined);
                setCompletedCrop(undefined);
                setScale(1);
                setRotate(0);
            };
            reader.readAsDataURL(imageFile);
        } else {
            setImageSrc('');
        }
    }, [imageFile]);

    // Reset state when dialog closes
    useEffect(() => {
        if (!open) {
            setImageSrc('');
            setCrop(undefined);
            setCompletedCrop(undefined);
            setScale(1);
            setRotate(0);
        }
    }, [open]);

    const onImageLoad = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
        const { width, height } = e.currentTarget;
        const initialCrop = centerAspectCrop(width, height, aspectRatio);
        setCrop(initialCrop);
    }, [aspectRatio]);

    const getCroppedImg = useCallback(async (): Promise<Blob | null> => {
        const image = imgRef.current;
        const canvas = canvasRef.current;

        if (!completedCrop || !image || !canvas) {
            return null;
        }

        const ctx = canvas.getContext('2d');
        if (!ctx) {
            return null;
        }

        const scaleX = image.naturalWidth / image.width;
        const scaleY = image.naturalHeight / image.height;

        // Calculate the actual crop dimensions
        const pixelRatio = window.devicePixelRatio || 1;
        const targetSize = 800;

        canvas.width = targetSize * pixelRatio;
        canvas.height = targetSize * pixelRatio;

        ctx.scale(pixelRatio, pixelRatio);
        ctx.imageSmoothingQuality = 'high';

        const cropX = completedCrop.x * scaleX;
        const cropY = completedCrop.y * scaleY;
        const cropWidth = completedCrop.width * scaleX;
        const cropHeight = completedCrop.height * scaleY;

        // Calculate center point for rotation
        const centerX = targetSize / 2;
        const centerY = targetSize / 2;

        ctx.save();

        // Move to center, rotate, then draw
        ctx.translate(centerX, centerY);
        ctx.rotate((rotate * Math.PI) / 180);
        ctx.scale(scale, scale);
        ctx.translate(-centerX, -centerY);

        ctx.drawImage(
            image,
            cropX,
            cropY,
            cropWidth,
            cropHeight,
            0,
            0,
            targetSize,
            targetSize
        );

        ctx.restore();

        return new Promise((resolve) => {
            canvas.toBlob(
                (blob) => {
                    resolve(blob);
                },
                'image/jpeg',
                0.92
            );
        });
    }, [completedCrop, scale, rotate]);

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

    const handleReset = () => {
        setScale(1);
        setRotate(0);
        if (imgRef.current) {
            const { width, height } = imgRef.current;
            setCrop(centerAspectCrop(width, height, aspectRatio));
        }
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden">
                <DialogHeader>
                    <DialogTitle>Crop Your Profile Picture</DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                    {/* Image Crop Area */}
                    <div className="flex items-center justify-center bg-gray-100 rounded-lg overflow-hidden min-h-[300px] max-h-[50vh]">
                        {imageSrc ? (
                            <ReactCrop
                                crop={crop}
                                onChange={(_, percentCrop) => setCrop(percentCrop)}
                                onComplete={(c) => setCompletedCrop(c)}
                                aspect={aspectRatio}
                                circularCrop={circularCrop}
                                className="max-h-[50vh]"
                            >
                                <img
                                    ref={imgRef}
                                    src={imageSrc}
                                    alt="Crop preview"
                                    onLoad={onImageLoad}
                                    style={{
                                        transform: `scale(${scale}) rotate(${rotate}deg)`,
                                        maxHeight: '50vh',
                                        maxWidth: '100%',
                                        transition: 'transform 0.2s ease'
                                    }}
                                />
                            </ReactCrop>
                        ) : (
                            <div className="flex items-center justify-center h-[300px] text-gray-400">
                                <Loader2 className="w-8 h-8 animate-spin" />
                            </div>
                        )}
                    </div>

                    {/* Controls */}
                    <div className="space-y-4 px-2">
                        {/* Zoom Control */}
                        <div className="flex items-center gap-4">
                            <ZoomOut className="w-4 h-4 text-gray-500" />
                            <Slider
                                value={[scale]}
                                onValueChange={(value) => setScale(value[0])}
                                min={0.5}
                                max={2}
                                step={0.1}
                                className="flex-1"
                            />
                            <ZoomIn className="w-4 h-4 text-gray-500" />
                            <span className="text-sm text-gray-500 w-12 text-right">
                                {Math.round(scale * 100)}%
                            </span>
                        </div>

                        {/* Rotation Control */}
                        <div className="flex items-center gap-4">
                            <RotateCcw className="w-4 h-4 text-gray-500" />
                            <Slider
                                value={[rotate]}
                                onValueChange={(value) => setRotate(value[0])}
                                min={-180}
                                max={180}
                                step={1}
                                className="flex-1"
                            />
                            <span className="text-sm text-gray-500 w-12 text-right">
                                {rotate}°
                            </span>
                        </div>
                    </div>
                </div>

                {/* Hidden canvas for processing */}
                <canvas ref={canvasRef} className="hidden" />

                <DialogFooter className="gap-2 sm:gap-0">
                    <Button
                        variant="ghost"
                        onClick={handleReset}
                        disabled={isProcessing}
                        className="text-gray-600"
                    >
                        <RotateCcw className="w-4 h-4 mr-2" />
                        Reset
                    </Button>
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={onClose} disabled={isProcessing}>
                            Cancel
                        </Button>
                        <Button
                            onClick={handleCropComplete}
                            disabled={isProcessing || !completedCrop}
                            className="bg-gradient-to-r from-primary to-secondary"
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
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
