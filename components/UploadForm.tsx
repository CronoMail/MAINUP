import { useState } from 'react';
import { useRouter } from 'next/router';
import type { Work } from '../types/work';

export default function UploadForm() {
  const router = useRouter();
  const [formData, setFormData] = useState<Omit<Work, 'id' | 'image'>>({
    title: '',
    category: 'illustration', // Default category matching existing works
    subcategory: '',
    twitterHandle: '',
    twitterId: '',
    description: ''
  });
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;
    setLoading(true);

    try {
      const data = new FormData();
      data.append('image', file);
      Object.entries(formData).forEach(([key, value]) => {
        if (value) data.append(key, value);
      });

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: data,
      });
      
      if (response.ok) {
        router.push('/#works');
      }
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl mx-auto p-4 bg-white rounded-lg shadow">
      <div className="space-y-4">
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          className="w-full p-2 border rounded"
          required
        />
        
        <input
          type="text"
          placeholder="Title"
          value={formData.title}
          onChange={(e) => setFormData({...formData, title: e.target.value})}
          className="w-full p-2 border rounded"
          required
        />
        
        <select
          value={formData.category}
          onChange={(e) => setFormData({...formData, category: e.target.value})}
          className="w-full p-2 border rounded"
          required
        >
          <option value="illustration">Illustration</option>
          <option value="fanart">FanArt</option>
          <option value="Product">Product</option>
        </select>

        <input
          type="text"
          placeholder="Subcategory (e.g., FanArt 2024)"
          value={formData.subcategory}
          onChange={(e) => setFormData({...formData, subcategory: e.target.value})}
          className="w-full p-2 border rounded"
        />
        
        <input
          type="text"
          placeholder="Twitter Handle (without @)"
          value={formData.twitterHandle}
          onChange={(e) => setFormData({...formData, twitterHandle: e.target.value})}
          className="w-full p-2 border rounded"
          required
        />

        <input
          type="text"
          placeholder="Twitter Post ID"
          value={formData.twitterId}
          onChange={(e) => setFormData({...formData, twitterId: e.target.value})}
          className="w-full p-2 border rounded"
          required
        />
        
        <input
          type="url"
          placeholder="Twitter Link"
          value={formData.twitterLink}
          onChange={(e) => setFormData({...formData, twitterLink: e.target.value})}
          className="w-full p-2 border rounded"
        />
        
        <textarea
          placeholder="Description"
          value={formData.description}
          onChange={(e) => setFormData({...formData, description: e.target.value})}
          className="w-full p-2 border rounded"
          rows={4}
        />
        
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#1DA1F2] text-white p-2 rounded hover:bg-[#1a91da] disabled:opacity-50"
        >
          {loading ? 'Uploading...' : 'Upload Work'}
        </button>
      </div>
    </form>
  );
}
