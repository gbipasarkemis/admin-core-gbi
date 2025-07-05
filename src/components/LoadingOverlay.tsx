export default function LoadingOverlay() {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white bg-opacity-60 backdrop-blur-sm">
  
        {/* Spinner */}
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mb-3" />
  
        {/* Caption */}
        <p className="text-gray-700 text-sm font-medium animate-fade-in">
          Memuat data...
        </p>
      </div>
    );
  }