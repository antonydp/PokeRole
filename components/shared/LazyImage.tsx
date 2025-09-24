import React, { useState, useEffect, useRef } from 'react';

interface LazyImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
    placeholderSrc?: string;
    scrollContainerRef?: React.RefObject<HTMLElement>;
}

const LazyImage: React.FC<LazyImageProps> = ({ src, placeholderSrc, scrollContainerRef, ...props }) => {
    const [imageSrc, setImageSrc] = useState(placeholderSrc);
    const imageRef = useRef<HTMLImageElement | null>(null);

    useEffect(() => {
        const options = {
            root: scrollContainerRef?.current || null,
            rootMargin: '0px 0px 100px 0px', // Pre-carica le immagini 100px prima che entrino nel viewport
        };

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setImageSrc(src);
                    if (imageRef.current) {
                        observer.unobserve(imageRef.current);
                    }
                }
            },
            options
        );

        if (imageRef.current) {
            observer.observe(imageRef.current);
        }

        return () => {
            if (imageRef.current) {
                observer.unobserve(imageRef.current);
            }
        };
    }, [src, scrollContainerRef]);

    return <img ref={imageRef} src={imageSrc} {...props} />;
};

export default LazyImage;