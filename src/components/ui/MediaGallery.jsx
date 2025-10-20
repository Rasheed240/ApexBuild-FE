import { useState } from 'react';
import { X, Download, Maximize2, ChevronLeft, ChevronRight, Play } from 'lucide-react';
import { Button } from './Button';

export function MediaGallery({
  items = [],
  onRemove,
  editable = false,
  columns = 3,
  className = '',
}) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!items || items.length === 0) {
    return null;
  }

  const gridCols = {
    2: 'grid-cols-2',
    3: 'grid-cols-3',
    4: 'grid-cols-4',
  };

  const openLightbox = (index) => {
    setCurrentIndex(index);
    setLightboxOpen(true);
  };

  const closeLightbox = () => {
    setLightboxOpen(false);
  };

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? items.length - 1 : prev - 1));
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev === items.length - 1 ? 0 : prev + 1));
  };

  const currentItem = items[currentIndex];
  const isVideo = currentItem?.type === 'video' || currentItem?.url?.match(/\.(mp4|webm|mov)$/i);

  return (
    <>
      <div className={`grid ${gridCols[columns]} gap-4 ${className}`}>
        {items.map((item, index) => {
          const itemUrl = typeof item === 'string' ? item : item.url;
          const itemType = typeof item === 'string'
            ? (item.match(/\.(mp4|webm|mov)$/i) ? 'video' : 'image')
            : item.type;

          return (
            <div
              key={index}
              className="relative group aspect-square rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800"
            >
              {itemType === 'video' ? (
                <div className="relative w-full h-full">
                  <video
                    src={itemUrl}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Play className="h-12 w-12 text-white opacity-75" />
                  </div>
                </div>
              ) : (
                <img
                  src={itemUrl}
                  alt={`Media ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              )}

              {/* Overlay with actions */}
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all flex items-center justify-center">
                <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openLightbox(index)}
                    className="bg-white dark:bg-gray-800"
                  >
                    <Maximize2 className="h-4 w-4" />
                  </Button>

                  <a
                    href={itemUrl}
                    download
                    className="inline-flex items-center justify-center px-3 py-2 text-sm font-medium rounded-md bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-300 dark:border-gray-600"
                  >
                    <Download className="h-4 w-4" />
                  </a>

                  {editable && onRemove && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onRemove(index, item)}
                      className="bg-white dark:bg-gray-800 text-red-600 hover:text-red-700"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Lightbox */}
      {lightboxOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center"
          onClick={closeLightbox}
        >
          <button
            onClick={closeLightbox}
            className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors"
          >
            <X className="h-8 w-8" />
          </button>

          {items.length > 1 && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  goToPrevious();
                }}
                className="absolute left-4 text-white hover:text-gray-300 transition-colors"
              >
                <ChevronLeft className="h-12 w-12" />
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  goToNext();
                }}
                className="absolute right-4 text-white hover:text-gray-300 transition-colors"
              >
                <ChevronRight className="h-12 w-12" />
              </button>
            </>
          )}

          <div
            className="max-w-6xl max-h-[90vh] w-full px-4"
            onClick={(e) => e.stopPropagation()}
          >
            {isVideo ? (
              <video
                src={currentItem?.url || currentItem}
                controls
                autoPlay
                className="w-full h-full max-h-[90vh] object-contain"
              />
            ) : (
              <img
                src={currentItem?.url || currentItem}
                alt={`Media ${currentIndex + 1}`}
                className="w-full h-full max-h-[90vh] object-contain"
              />
            )}
          </div>

          {items.length > 1 && (
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white text-sm">
              {currentIndex + 1} / {items.length}
            </div>
          )}
        </div>
      )}
    </>
  );
}
