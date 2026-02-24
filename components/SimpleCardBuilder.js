import React, { useState, useCallback } from 'react';

const SimpleCardBuilder = ({ cardData, setCardData }) => {
    const [selectedTool, setSelectedTool] = useState('text');
    const [uploading, setUploading] = useState(false);
    const [textColor, setTextColor] = useState('#ffffff');
    const [fontSize, setFontSize] = useState(48);
    const [fontFamily, setFontFamily] = useState('Arial');
    const [cardText, setCardText] = useState('');
    const [backgroundImage, setBackgroundImage] = useState('');
    const [overlayImages, setOverlayImages] = useState([]);
    const [imagePositions, setImagePositions] = useState({});

    // Generate random positions and rotations for polaroid effect
    const generatePolaroidPositions = (imageCount) => {
        const positions = [];
        for (let i = 0; i < imageCount; i++) {
            positions.push({
                x: 20 + Math.random() * 60, // 20% to 80% of card width
                y: 20 + Math.random() * 60, // 20% to 80% of card height
                rotation: (Math.random() - 0.5) * 30, // -15 to +15 degrees
                zIndex: i + 5
            });
        }
        return positions;
    };

    const fonts = [
        { name: 'Arial', value: 'Arial' },
        { name: 'Times New Roman', value: 'Times New Roman' },
        { name: 'Georgia', value: 'Georgia' },
        { name: 'Verdana', value: 'Verdana' },
        { name: 'Impact', value: 'Impact' },
        { name: 'Comic Sans MS', value: 'Comic Sans MS' },
        { name: 'Courier New', value: 'Courier New' },
        { name: 'Tahoma', value: 'Tahoma' },
    ];

    const updateCardData = useCallback(() => {
        const cardHTML = generateCardHTML();
        setCardData(prev => ({
            ...prev,
            cardHTML: cardHTML,
            cardText: cardText,
            backgroundImage: backgroundImage,
            overlayImages: overlayImages
        }));
    }, [cardText, backgroundImage, overlayImages, setCardData]);

    const generateCardHTML = () => {
        const backgroundStyle = backgroundImage 
            ? `background-image: url('${backgroundImage}'); background-size: cover; background-position: center;`
            : 'background: linear-gradient(45deg, #f0f0f0, #e0e0e0);';

        return `
            <div style="
                width: 400px;
                height: 600px;
                ${backgroundStyle}
                border-radius: 15px;
                box-shadow: 0 4px 15px rgba(0,0,0,0.1);
                overflow: hidden;
                position: relative;
                display: flex;
                align-items: center;
                justify-content: center;
                color: ${textColor};
                font-family: ${fontFamily};
                font-size: ${fontSize}px;
                text-align: center;
                padding: 2rem;
                word-wrap: break-word;
            ">
                ${cardText || 'Your card text here'}
            </div>
        `;
    };

    const handleImageUpload = async (file, type) => {
        setUploading(true);
        try {
            // Process and compress the image first
            const processedFile = await processAndCompressImage(file);
            
            // Upload to AWS S3
            const formData = new FormData();
            formData.append('file', processedFile);

            const response = await fetch('${process.env.NEXT_PUBLIC_REGISTRY_URL}/api/uploadToAWS', {
                method: 'POST',
                body: formData
            });

            if (!response.ok) throw new Error('Upload failed');

            const resJSON = await response.json();
            const uploadedUrl = resJSON.url;
            
            if (type === 'background') {
                setBackgroundImage(uploadedUrl);
                updateCardData();
            } else {
                const newImageId = `img_${Date.now()}`;
                const newPosition = {
                    x: 20 + Math.random() * 60,
                    y: 20 + Math.random() * 60,
                    rotation: (Math.random() - 0.5) * 30,
                    zIndex: overlayImages.length + 5
                };
                
                setOverlayImages(prev => [...prev, { id: newImageId, url: uploadedUrl }]);
                setImagePositions(prev => ({
                    ...prev,
                    [newImageId]: newPosition
                }));
                updateCardData();
            }
        } catch (error) {
            console.error('Upload failed:', error);
            alert('Image upload failed. Please try again.');
        } finally {
            setUploading(false);
        }
    };

    const processAndCompressImage = (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onerror = () => reject(new Error('FileReader failed'));
            reader.onload = (event) => {
                const img = new Image();
                img.onerror = () => reject(new Error('Image loading failed'));
                img.src = event.target.result;
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d');

                    let width = img.width;
                    let height = img.height;
                    
                    // Resize if too large (max 800px for card images)
                    const maxSize = 800;
                    if (width > height && width > maxSize) {
                        height = Math.round((height * maxSize) / width);
                        width = maxSize;
                    } else if (height > maxSize) {
                        width = Math.round((width * maxSize) / height);
                        height = maxSize;
                    }

                    canvas.width = width;
                    canvas.height = height;
                    ctx.drawImage(img, 0, 0, width, height);

                    canvas.toBlob((blob) => {
                        resolve(new File([blob], file.name.replace(/\.[^/.]+$/, '.jpg'), {
                            type: 'image/jpeg',
                            lastModified: Date.now()
                        }));
                    }, 'image/jpeg', 0.8);
                };
            };
        });
    };

    const clearCard = () => {
        setCardText('');
        setBackgroundImage('');
        setOverlayImages([]);
        setImagePositions({});
        updateCardData();
    };

    const CardPreview = () => {
        const backgroundStyle = backgroundImage 
            ? { backgroundImage: `url('${backgroundImage}')`, backgroundSize: 'cover', backgroundPosition: 'center' }
            : { background: 'linear-gradient(45deg, #f0f0f0, #e0e0e0)' };

        return (
            <div 
                style={{
                    width: '400px',
                    height: '600px',
                    ...backgroundStyle,
                    borderRadius: '15px',
                    boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
                    overflow: 'hidden',
                    position: 'relative',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: textColor,
                    fontFamily: fontFamily,
                    fontSize: `${fontSize}px`,
                    textAlign: 'center',
                    padding: '2rem',
                    wordWrap: 'break-word'
                }}
            >
                {/* Overlay Images - Polaroid Style */}
                {overlayImages.map((image, index) => {
                    const position = imagePositions[image.id];
                    if (!position) return null; // Skip if no position stored yet
                    
                    return (
                        <div
                            key={image.id}
                            style={{
                                position: 'absolute',
                                top: `${position.y}%`,
                                left: `${position.x}%`,
                                transform: `translate(-50%, -50%) rotate(${position.rotation}deg)`,
                                zIndex: position.zIndex,
                                background: 'white',
                                padding: '8px',
                                borderRadius: '4px',
                                boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                                border: '1px solid #e0e0e0'
                            }}
                        >
                            <img 
                                src={image.url} 
                                alt={`Card image ${index + 1}`}
                                style={{
                                    width: '120px',
                                    height: '120px',
                                    objectFit: 'cover',
                                    borderRadius: '2px',
                                    display: 'block'
                                }}
                            />
                        </div>
                    );
                })}

                {/* Text - Centered */}
                <div 
                    style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        zIndex: 10,
                        textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
                        maxWidth: '80%'
                    }}
                >
                    {cardText || 'Your card text here'}
                </div>
            </div>
        );
    };

    return (
        <div>
            <label style={{
                display: 'block',
                marginBottom: '0.5rem',
                fontSize: '0.9rem',
                fontWeight: '600',
                color: '#555'
            }}>
                Design Your Card
            </label>

            {/* Toolbar */}
            <div style={{
                display: 'flex',
                gap: '0.5rem',
                marginBottom: '1rem',
                flexWrap: 'wrap'
            }}>
                <button
                    onClick={() => setSelectedTool('text')}
                    style={{
                        padding: '0.5rem 1rem',
                        border: 'none',
                        borderRadius: '6px',
                        background: selectedTool === 'text' ? '#007bff' : '#f8f9fa',
                        color: selectedTool === 'text' ? 'white' : '#333',
                        cursor: 'pointer',
                        fontSize: '0.9rem'
                    }}
                >
                    Add Text
                </button>
                <button
                    onClick={() => setSelectedTool('background')}
                    style={{
                        padding: '0.5rem 1rem',
                        border: 'none',
                        borderRadius: '6px',
                        background: selectedTool === 'background' ? '#007bff' : '#f8f9fa',
                        color: selectedTool === 'background' ? 'white' : '#333',
                        cursor: 'pointer',
                        fontSize: '0.9rem'
                    }}
                >
                    Background
                </button>
                <button
                    onClick={() => setSelectedTool('image')}
                    style={{
                        padding: '0.5rem 1rem',
                        border: 'none',
                        borderRadius: '6px',
                        background: selectedTool === 'image' ? '#007bff' : '#f8f9fa',
                        color: selectedTool === 'image' ? 'white' : '#333',
                        cursor: 'pointer',
                        fontSize: '0.9rem'
                    }}
                >
                    Add Image
                </button>
                <button
                    onClick={clearCard}
                    style={{
                        padding: '0.5rem 1rem',
                        border: 'none',
                        borderRadius: '6px',
                        background: '#dc3545',
                        color: 'white',
                        cursor: 'pointer',
                        fontSize: '0.9rem'
                    }}
                >
                    Clear All
                </button>
            </div>

            {/* Text Controls */}
            {selectedTool === 'text' && (
                <div style={{
                    display: 'flex',
                    gap: '1rem',
                    marginBottom: '1rem',
                    alignItems: 'center',
                    flexWrap: 'wrap'
                }}>
                    <div>
                        <label style={{ fontSize: '0.8rem', marginRight: '0.5rem' }}>Font:</label>
                        <select
                            value={fontFamily}
                            onChange={(e) => setFontFamily(e.target.value)}
                            style={{
                                padding: '0.25rem',
                                borderRadius: '4px',
                                border: '1px solid #ddd'
                            }}
                        >
                            {fonts.map(font => (
                                <option key={font.value} value={font.value}>
                                    {font.name}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label style={{ fontSize: '0.8rem', marginRight: '0.5rem' }}>Size:</label>
                        <input
                            type="range"
                            min="12"
                            max="72"
                            value={fontSize}
                            onChange={(e) => setFontSize(parseInt(e.target.value))}
                            style={{ width: '80px' }}
                        />
                        <span style={{ fontSize: '0.8rem', marginLeft: '0.5rem' }}>{fontSize}px</span>
                    </div>
                    <div>
                        <label style={{ fontSize: '0.8rem', marginRight: '0.5rem' }}>Color:</label>
                        <input
                            type="color"
                            value={textColor}
                            onChange={(e) => setTextColor(e.target.value)}
                            style={{ width: '40px', height: '30px', border: 'none', borderRadius: '4px' }}
                        />
                    </div>
                </div>
            )}

            {/* Text Input */}
            {selectedTool === 'text' && (
                <div style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                        Card Text
                    </label>
                    <textarea
                        value={cardText}
                        onChange={(e) => {
                            setCardText(e.target.value);
                            updateCardData();
                        }}
                        placeholder="Enter your card text here..."
                        style={{
                            width: '100%',
                            minHeight: '100px',
                            padding: '0.75rem',
                            borderRadius: '8px',
                            border: '1px solid #e1e5e9',
                            fontSize: '1rem',
                            fontFamily: fontFamily,
                            fontSize: `${fontSize}px`,
                            color: textColor,
                            resize: 'vertical'
                        }}
                    />
                </div>
            )}

            {/* Background Upload */}
            {selectedTool === 'background' && (
                <div style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                        Upload Background Image
                    </label>
                    <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                            const file = e.target.files[0];
                            if (file) handleImageUpload(file, 'background');
                        }}
                        style={{ width: '100%' }}
                    />
                    {uploading && <p style={{ fontSize: '0.8rem', color: '#666' }}>Uploading...</p>}
                    {backgroundImage && (
                        <div style={{ marginTop: '0.5rem' }}>
                            <p style={{ fontSize: '0.8rem', color: '#666' }}>Background image uploaded!</p>
                        </div>
                    )}
                </div>
            )}

            {/* Image Upload */}
            {selectedTool === 'image' && (
                <div style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                        Upload Image
                    </label>
                    <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                            const file = e.target.files[0];
                            if (file) handleImageUpload(file, 'image');
                        }}
                        style={{ width: '100%' }}
                    />
                    {uploading && <p style={{ fontSize: '0.8rem', color: '#666' }}>Uploading...</p>}
                    {overlayImages.length > 0 && (
                        <div style={{ marginTop: '0.5rem' }}>
                            <p style={{ fontSize: '0.8rem', color: '#666' }}>
                                {overlayImages.length} image(s) uploaded! Drag to reposition.
                            </p>
                        </div>
                    )}
                </div>
            )}

            {/* Live Preview */}
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                marginBottom: '1rem'
            }}>
                <CardPreview />
            </div>

            {/* Instructions */}
            <div style={{
                background: '#f8f9fa',
                padding: '1rem',
                borderRadius: '8px',
                fontSize: '0.85rem',
                color: '#666'
            }}>
                <strong>Instructions:</strong>
                <ul style={{ margin: '0.5rem 0 0 0', paddingLeft: '1.5rem' }}>
                    <li>Use "Add Text" to write your card message</li>
                    <li>Use "Background" to upload a background image</li>
                    <li>Use "Add Image" to add overlay images</li>
                    <li><strong>Drag and drop</strong> text and images to reposition them</li>
                    <li>See live preview of your card below</li>
                    <li>Your card will be saved when you continue to payment</li>
                </ul>
            </div>
        </div>
    );
};

export default SimpleCardBuilder; 