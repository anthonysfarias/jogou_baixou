"use client";

import { useState, useEffect } from "react";
import { use } from "react";
import Link from "next/link";

// API URL
const API_URL = "http://localhost:3001/api";

// Simulated file data type
interface FileData {
  id: string;
  name: string;
  size: string;
  sizeInBytes: number;
  valid: boolean;
}

export default function DownloadPage({ params }: { params: { id: string } | Promise<{ id: string }> }) {
  // Unwrap params using React.use()
  const unwrappedParams = params instanceof Promise ? use(params) : params;
  const [fileData, setFileData] = useState<FileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [isDownloading, setIsDownloading] = useState(false);

  // Fetch file data from the backend
  useEffect(() => {
    const fetchFileData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Check if ID is valid UUID format
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        if (!uuidRegex.test(unwrappedParams.id)) {
          throw new Error("ID de arquivo inválido");
        }

        // Fetch file info from the API with timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
        
        try {
          const response = await fetch(`${API_URL}/file/${unwrappedParams.id}`, {
            signal: controller.signal
          });
          
          clearTimeout(timeoutId);
          
          if (!response.ok) {
            if (response.status === 404 || response.status === 410) {
              // Redirecionar para a página inicial quando o arquivo não for encontrado
              window.location.href = '/';
              return;
            } else if (response.status === 403) {
              throw new Error("Acesso negado");
            } else if (response.status >= 500) {
              throw new Error("Erro no servidor. Tente novamente mais tarde.");
            }
            throw new Error("Erro ao buscar informações do arquivo");
          }
          
          const data = await response.json();
          
          const fileData: FileData = {
            id: data.id,
            name: data.originalName,
            size: formatBytes(data.size),
            sizeInBytes: data.size,
            valid: true,
          };
          
          setFileData(fileData);
        } catch (fetchError: any) {
          if (fetchError && fetchError.name === 'AbortError') {
            throw new Error("Tempo de conexão esgotado. Verifique sua conexão com a internet.");
          }
          throw fetchError;
        }
      } catch (error) {
        console.error("Error fetching file:", error);
        setFileData(null);
        setError(error instanceof Error ? error.message : "Erro desconhecido");
      } finally {
        setLoading(false);
      }
    };

    fetchFileData();
  }, [unwrappedParams.id]);

  // Handle file download
  const handleDownload = () => {
    if (!fileData) return;
    
    setIsDownloading(true);
    setDownloadProgress(0);
    
    // Create a hidden anchor element to trigger the download
    const downloadLink = document.createElement('a');
    downloadLink.href = `${API_URL}/download/${fileData.id}`;
    downloadLink.target = '_blank';
    document.body.appendChild(downloadLink);
    
    // Simulate download progress (since we can't track actual download progress easily)
    const totalTime = 3000; // 3 seconds for simulated download
    const interval = 100; // Update every 100ms
    const steps = totalTime / interval;
    let currentStep = 0;
    
    const downloadInterval = setInterval(() => {
      currentStep++;
      const newProgress = Math.min(Math.round((currentStep / steps) * 100), 100);
      setDownloadProgress(newProgress);
      
      if (newProgress >= 100) {
        clearInterval(downloadInterval);
        // Trigger the actual download
        downloadLink.click();
        
        // Clean up and reset state
        setTimeout(() => {
          document.body.removeChild(downloadLink);
          setIsDownloading(false);
          setDownloadProgress(0);
        }, 500);
      }
    }, interval);
  };

  // Format bytes to human readable format
  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <div className="min-h-screen bg-secondary flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-md p-8 w-full max-w-md">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-8">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-gray-600">Carregando informações do arquivo...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="w-20 h-20 mb-6 text-error">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h2 className="text-2xl font-semibold mb-2 text-error">Link Expirado</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <Link 
              href="/" 
              className="px-6 py-3 bg-primary text-white rounded-full font-medium hover:bg-primary/90 transition-colors shadow-md"
            >
              Voltar para página inicial
            </Link>
          </div>
        ) : fileData && (
          <div className="flex flex-col items-center justify-center py-4 text-center">
            <div className="w-24 h-24 mb-6 text-primary">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            
            <h2 className="text-2xl font-semibold mb-1 text-textColor">{fileData.name}</h2>
            <p className="text-gray-500 mb-4">{fileData.size}</p>
            
            <p className="text-gray-600 mb-6">
              Este arquivo foi compartilhado via Jogou Baixou e está disponível para download.
            </p>
            
            {isDownloading ? (
              <div className="w-full mb-6">
                <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2">
                  <div 
                    className="bg-success h-2.5 rounded-full transition-all duration-300 ease-out"
                    style={{ width: `${downloadProgress}%` }}
                  ></div>
                </div>
                <p className="text-sm text-gray-600">Baixando... {downloadProgress}%</p>
              </div>
            ) : (
              <div>
                <button
                  onClick={handleDownload}
                  className="w-full px-6 py-4 bg-primary text-white rounded-xl font-medium hover:bg-primary/90 transition-colors shadow-md flex items-center justify-center gap-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Baixar Arquivo
                </button>
                
                {/* Direct download link as fallback */}
                <a 
                  href={`${API_URL}/download/${fileData.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-center text-primary text-sm mt-2 hover:underline"
                >
                  Ou clique aqui se o download não iniciar automaticamente
                </a>
              </div>
            )}
            
            <div className="mt-6 text-xs text-gray-500">
              ID: {fileData.id} • Tamanho: {formatBytes(fileData.sizeInBytes)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
