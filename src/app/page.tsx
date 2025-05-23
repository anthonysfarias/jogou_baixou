"use client";

import { useState, useRef, useCallback } from "react";
import Link from "next/link";

export default function Home() {
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadComplete, setUploadComplete] = useState(false);
  const [shareLink, setShareLink] = useState("");
  const [downloadLink, setDownloadLink] = useState("");
  const [copySuccess, setCopySuccess] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // API URL
  // const API_URL = "http://localhost:3001/api";
  const API_URL = "https://jogou-baixou-backend.onrender.com/api";

  // Upload file to the backend
  const uploadFile = useCallback(async (file: File) => {
    setIsUploading(true);
    setUploadError(null);
    
    try {
      // Create form data
      const formData = new FormData();
      formData.append('file', file);
      
      // Send file to backend
      const response = await fetch(`${API_URL}/upload`, {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error('Falha ao enviar o arquivo');
      }
      
      const data = await response.json();
      
      setIsUploading(false);
      setUploadComplete(true);
      
      // Set share link
      const fileId = data.id || data.fileId; // Handle both response formats
      const shareUrl = `${window.location.origin}/share/${fileId}`;
      const downloadUrl = `${window.location.origin}/download/${fileId}`;
      setShareLink(shareUrl);
      setDownloadLink(downloadUrl);
    } catch (error) {
      console.error('Upload error:', error);
      setIsUploading(false);
      setUploadError(error instanceof Error ? error.message : 'Erro desconhecido ao enviar o arquivo');
    }
  }, [API_URL]);

  // Common file handling logic
  const handleFileSelected = useCallback((selectedFile: File) => {
    setFile(selectedFile);
    uploadFile(selectedFile);
  }, [uploadFile, setFile]);

  // Handle drag events
  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  // Handle file drop
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFile = e.dataTransfer.files[0];
      handleFileSelected(droppedFile);
    }
  }, [handleFileSelected]);

  // Handle file selection via button
  const handleFileButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      handleFileSelected(selectedFile);
    }
  };

  // Handle copy link
  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareLink);
      setCopySuccess(true);
      
      // Reset copy success message after 2 seconds
      setTimeout(() => {
        setCopySuccess(false);
      }, 2000);
    } catch (err) {
      console.error("Failed to copy link", err);
    }
  };

  // Reset the form to upload another file
  const handleReset = () => {
    setFile(null);
    setUploadComplete(false);
    setShareLink("");
    setCopySuccess(false);
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="py-6 border-b border-gray-100">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold text-center text-primary">Jogou Baixou</h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow flex items-center justify-center p-4 sm:p-8">
        <div className="w-full max-w-md mx-auto">
          {!uploadComplete ? (
            <div className="text-center">
              <h2 className="text-2xl font-semibold mb-2">Compartilhe seus arquivos</h2>
              <p className="text-gray-600 mb-8">Arraste e solte seu arquivo ou clique para selecionar</p>
              
              {/* Error message */}
              {uploadError && (
                <div className="bg-error/10 text-error p-4 rounded-lg mb-6">
                  <p className="font-medium">{uploadError}</p>
                </div>
              )}
              
              {/* Upload Area */}
              <div 
                className={`border-2 border-dashed rounded-2xl p-8 mb-6 transition-colors ${isDragging ? 'border-primary bg-primary/5' : 'border-gray-300 hover:border-primary'}`}
                onDragEnter={handleDragEnter}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <input 
                  type="file" 
                  className="hidden" 
                  ref={fileInputRef} 
                  onChange={handleFileInputChange}
                />
                
                <div className="flex flex-col items-center justify-center">
                  <div className="w-16 h-16 mb-4 text-primary">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                  </div>
                  
                  {isUploading ? (
                    <div className="text-center">
                      <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                      <p className="text-sm text-gray-600">Enviando {file?.name}...</p>
                    </div>
                  ) : (
                    <div className="text-center">
                      <p className="font-medium mb-1">Arraste seu arquivo aqui</p>
                      <p className="text-sm text-gray-500">ou</p>
                      <button 
                        onClick={handleFileButtonClick}
                        className="mt-3 px-4 py-2 bg-primary text-white rounded-full text-sm font-medium hover:bg-primary/90 transition-colors shadow-md"
                      >
                        Selecionar arquivo
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center bg-white p-8 rounded-2xl shadow-md">
              <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              
              <h2 className="text-2xl font-semibold mb-2">Upload concluído!</h2>
              <p className="text-gray-600 mb-2">Seu arquivo está pronto para compartilhar</p>
              <p className="text-error text-sm font-medium mb-6">Atenção: O link expira em 5 minutos!</p>
              
              <div className="mb-6">
                <p className="text-sm text-gray-500 mb-2">Link para compartilhamento:</p>
                <div className="flex items-center">
                  <input 
                    type="text" 
                    value={shareLink} 
                    readOnly 
                    className="flex-grow p-3 bg-secondary rounded-l-lg text-sm border border-gray-200 focus:outline-none"
                  />
                  <button 
                    onClick={handleCopyLink}
                    className="bg-primary text-white p-3 rounded-r-lg hover:bg-primary/90 transition-colors"
                  >
                    {copySuccess ? (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                      </svg>
                    )}
                  </button>
                </div>
                {copySuccess && (
                  <p className="text-xs text-success mt-1">Link copiado para a área de transferência!</p>
                )}
              </div>
              
              <div className="mb-6">
                <Link 
                  href={downloadLink}
                  className="block w-full px-6 py-3 bg-primary text-white rounded-xl font-medium hover:bg-primary/90 transition-colors shadow-md text-center"
                >
                  Ir para página de download
                </Link>
              </div>
              
              <button 
                onClick={handleReset}
                className="text-primary hover:text-primary/80 text-sm font-medium transition-colors"
              >
                Enviar outro arquivo
              </button>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 border-t border-gray-100">
        <div className="container mx-auto px-4 text-center text-sm text-gray-500">
          &copy; {new Date().getFullYear()} Jogou Baixou. Todos os direitos reservados.
        </div>
      </footer>
    </div>
  );
}
