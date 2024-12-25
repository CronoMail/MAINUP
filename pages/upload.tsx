import UploadForm from '../components/UploadForm';

export default function UploadPage() {
  return (
    <div className="min-h-screen bg-gray-100 py-12">
      <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-center mb-8">Upload New Work</h1>
        <UploadForm />
      </div>
    </div>
  );
}
