import { useRouter } from 'next/router';
import React, { useState } from 'react';
import type { Work } from '../types/work';

export default function UploadForm() {
  const router = useRouter();
  const [formData, setFormData] = useState<Omit<Work, 'id' | 'imageSrc' | 'date'>>({
    title: '',
    category: 'illustration', // Default category matching existing works
    subcategory: '',
    twitterHandle: '',
    twitterId: '',
    twitterUrl: '',
    mcol: '',
    description: '',
    twitterLink: ''
  });
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(''); // Add status message

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setStatus('Please select a file');
      return;
    }
    setLoading(true);
    setStatus('Uploading...');

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('file', file); // Make sure field name is 'file'
      
      // Append other form fields
      Object.entries(formData).forEach(([key, value]) => {
        if (value) formDataToSend.append(key, value);
      });

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formDataToSend,
      });
      
      const result = await response.json();
      console.log('Upload response:', result);
      
      if (response.ok) {
        setStatus('Upload successful!');
        // Optional: Clear form
        setFile(null);
        setFormData({
          title: '',
          category: 'illustration',
          subcategory: '',
          twitterHandle: '',
          twitterId: '',
          mcol: '',
          twitterUrl: '',
          description: '',
          twitterLink: ''
        });
      } else {
        setStatus(`Upload failed: ${result.message}`);
      }
    } catch (error) {
      setStatus('Upload failed: ' + (error as Error).message);
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
          <option value="landscape">Illustration</option>
          <option value="fanart">FanArt</option>
          <option value="occhara">OC</option>
          <option value="comm">Commission</option>
          <option value="male">Male</option>
          <option value="vtube">Vtubers</option>
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
        {status && <p className="text-center mt-4">{status}</p>}
      </div>
    </form>
  );
}