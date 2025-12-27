// utils/compressImage.js

export const compressImage = (file, quality = 0.7, maxWidth = 1200) => {
    return new Promise((resolve, reject) => {
        const image = new Image();
        image.src = URL.createObjectURL(file);
        
        image.onload = () => {
            const canvas = document.createElement('canvas');
            let width = image.width;
            let height = image.height;

            // Resize if wider than maxWidth (maintain aspect ratio)
            if (width > maxWidth) {
                height = (height * maxWidth) / width;
                width = maxWidth;
            }

            canvas.width = width;
            canvas.height = height;

            const ctx = canvas.getContext('2d');
            ctx.drawImage(image, 0, 0, width, height);

            canvas.toBlob((blob) => {
                if (!blob) {
                    reject(new Error('Canvas is empty'));
                    return;
                }
                // Create a new File object with the compressed blob
                const compressedFile = new File([blob], file.name, {
                    type: 'image/jpeg',
                    lastModified: Date.now(),
                });
                resolve(compressedFile);
            }, 'image/jpeg', quality);
        };

        image.onerror = (error) => reject(error);
    });
};