"use client";

import { useRef, useState, useEffect } from "react";
import { Upload, Camera, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface AvatarUploadProps {
  currentImage: string;
  creatorName: string;
  onImageChange?: (imageUrl: string) => void;
  className?: string;
}

export function AvatarUpload({ currentImage, creatorName, onImageChange, className }: AvatarUploadProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [imageUrl, setImageUrl] = useState(currentImage);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Synchroniser imageUrl avec currentImage
  useEffect(() => {
    setImageUrl(currentImage);
  }, [currentImage]);

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Vérifier le type de fichier
    if (!file.type.startsWith('image/')) {
      alert('Veuillez sélectionner une image (JPG, PNG, etc.)');
      return;
    }

    // Vérifier la taille (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('L\'image est trop grande (max 5MB)');
      return;
    }

    setIsUploading(true);

    try {
      // Compresser l'image avant de la sauvegarder
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          // Créer un canvas pour redimensionner - garde une bonne qualité
          const canvas = document.createElement('canvas');
          const maxWidth = 600;
          const maxHeight = 600;
          let width = img.width;
          let height = img.height;

          // Calculer les nouvelles dimensions
          if (width > height) {
            if (width > maxWidth) {
              height *= maxWidth / width;
              width = maxWidth;
            }
          } else {
            if (height > maxHeight) {
              width *= maxHeight / height;
              height = maxHeight;
            }
          }

          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);

          // Convertir en Base64 avec haute qualité (qualité 0.92 pour meilleure qualité)
          const compressedImageUrl = canvas.toDataURL('image/jpeg', 0.92);
          
          setImageUrl(compressedImageUrl);
          onImageChange?.(compressedImageUrl);
          setIsUploading(false);
        };
        img.src = e.target?.result as string;
      };
      reader.readAsDataURL(file);

    } catch (error) {
      console.error('Erreur lors de l\'upload:', error);
      alert('Erreur lors de l\'upload de l\'image');
      setIsUploading(false);
    }
  };

  return (
    <div className="relative">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />
      
      <button
        onClick={handleClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        disabled={isUploading}
        className={cn(
          "relative overflow-hidden rounded-2xl bg-black/5 transition-all duration-300 hover:shadow-lg",
          isUploading && "cursor-wait",
          !isUploading && "cursor-pointer hover:scale-105",
          className
        )}
      >
        {/* Image */}
        {imageUrl ? (
          <img 
            src={imageUrl}
            alt={creatorName}
            className={cn(
              "w-full h-full object-cover transition-all duration-300",
              isHovered && !isUploading && "brightness-75 scale-110"
            )}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-stone-100 to-stone-200">
            <span className="text-4xl font-light text-stone-400">
              {creatorName?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U'}
            </span>
          </div>
        )}

        {/* Overlay au hover */}
        {isHovered && !isUploading && (
          <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] flex flex-col items-center justify-center text-white transition-all duration-300">
            <Camera className="w-8 h-8 mb-2" />
            <span className="text-sm font-light">Changer la photo</span>
          </div>
        )}

        {/* Loading state */}
        {isUploading && (
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex flex-col items-center justify-center text-white">
            <Loader2 className="w-8 h-8 mb-2 animate-spin" />
            <span className="text-sm font-light">Upload en cours...</span>
          </div>
        )}

        {/* Badge "Upload" dans le coin */}
        {!isUploading && (
          <div className={cn(
            "absolute top-3 right-3 p-2 rounded-full bg-black/60 backdrop-blur-sm text-white transition-all duration-300",
            isHovered ? "opacity-100 scale-110" : "opacity-0 scale-90"
          )}>
            <Upload className="w-4 h-4" />
          </div>
        )}
      </button>

      {/* Indication discrète */}
      <p className="text-xs text-black/40 font-light mt-2 text-center">
        Cliquez pour changer la photo
      </p>
    </div>
  );
}

