import { useState, useRef } from 'react';
import { X, Upload, Camera } from 'lucide-react';
import { Product, ProductSize, ShoeSize } from '../types';

interface EditProductModalProps {
  product: Product;
  onClose: () => void;
  onEdit: (productId: string, updatedProduct: Omit<Product, 'id'>) => void;
}

export function EditProductModal({ product, onClose, onEdit }: EditProductModalProps) {
  const [name, setName] = useState(product.name);
  const [price, setPrice] = useState(product.price.toString());
  const [image, setImage] = useState(product.image);
  const [imagePreview, setImagePreview] = useState(product.image);
  const [type, setType] = useState<'clothing' | 'shoes'>(product.type);
  const [sizes, setSizes] = useState<Record<ProductSize | ShoeSize, number>>(product.sizes);
  const [showCamera, setShowCamera] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const clothingSizes: ProductSize[] = ['S', 'M', 'L', 'XL', 'XXL', 'XXXL', '4XL', '5XL', '6XL'];
  const shoeSizes: ShoeSize[] = ['36', '37', '38', '39', '40', '41', '42', '43', '44', '45'];

  const currentSizes = type === 'clothing' ? clothingSizes : shoeSizes;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setImage(base64String);
        setImagePreview(base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      streamRef.current = stream;
      setShowCamera(true);
    } catch (err) {
      console.error('Error accessing camera:', err);
      alert('Could not access camera. Please make sure you have granted camera permissions.');
    }
  };

  const capturePhoto = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0);
        const base64Image = canvas.toDataURL('image/jpeg');
        setImage(base64Image);
        setImagePreview(base64Image);
        stopCamera();
      }
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setShowCamera(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const updatedProduct = {
      name,
      price: parseFloat(price),
      image,
      type,
      sizes: Object.fromEntries(
        currentSizes.map(size => [size, parseInt(sizes[size]?.toString() || '0')])
      ) as Record<ProductSize | ShoeSize, number>,
      createdAt: product.createdAt // Keep the original creation timestamp
    };

    onEdit(product.id, updatedProduct);
    onClose();
  };

  const updateStock = (size: ProductSize | ShoeSize, value: string) => {
    setSizes(prev => ({
      ...prev,
      [size]: Math.max(0, parseInt(value) || 0)
    }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">Ürünü Düzenle</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <X size={24} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Ürün Adı</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 w-full px-3 py-2 border rounded-md"
                placeholder="Ürün adı"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Fiyat (TL)</label>
              <input
                type="number"
                required
                min="0"
                step="0.01"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="mt-1 w-full px-3 py-2 border rounded-md"
                placeholder="299.99"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Ürün Görseli</label>
              <div className="space-y-4">
                {imagePreview && (
                  <div className="mt-2">
                    <img
                      src={imagePreview}
                      alt="Önizleme"
                      className="w-full max-w-md h-48 object-cover rounded-lg"
                    />
                  </div>
                )}

                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-2 px-4 py-2 border rounded-md hover:bg-gray-50"
                  >
                    <Upload size={20} />
                    Görsel Yükle
                  </button>

                  <button
                    type="button"
                    onClick={startCamera}
                    className="flex items-center gap-2 px-4 py-2 border rounded-md hover:bg-gray-50"
                  >
                    <Camera size={20} />
                    Fotoğraf Çek
                  </button>
                </div>

                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />

                {showCamera && (
                  <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center">
                    <div className="bg-white p-4 rounded-lg">
                      <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        className="rounded-lg"
                      />
                      <div className="flex justify-center gap-4 mt-4">
                        <button
                          type="button"
                          onClick={capturePhoto}
                          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                        >
                          Çek
                        </button>
                        <button
                          type="button"
                          onClick={stopCamera}
                          className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
                        >
                          İptal
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Ürün Tipi</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as 'clothing' | 'shoes')}
                className="mt-1 w-full px-3 py-2 border rounded-md"
              >
                <option value="clothing">Giyim</option>
                <option value="shoes">Ayakkabı</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Beden Stokları</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {currentSizes.map((size) => (
                  <div key={size} className="flex items-center space-x-2">
                    <label className="w-12">{size}:</label>
                    <input
                      type="number"
                      min="0"
                      value={sizes[size] || ''}
                      onChange={(e) => updateStock(size, e.target.value)}
                      className="w-full px-3 py-2 border rounded-md"
                      placeholder="0"
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-4 mt-6">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                İptal
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
              >
                Değişiklikleri Kaydet
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}