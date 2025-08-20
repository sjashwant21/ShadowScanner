
import React, { useState, useRef, useCallback } from 'react';
import { AnalysisResult, ResultStatus } from './types';
import { analyzeLSB } from './services/steganalysisService';
import { UploadIcon, CheckCircleIcon, ExclamationTriangleIcon, ShieldExclamationIcon } from './components/icons';

const App: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setError('Invalid file type. Please upload an image (e.g., PNG, BMP, JPEG).');
        setSelectedFile(null);
        setImagePreview(null);
        setResult(null);
        return;
      }
      setSelectedFile(file);
      setError(null);
      setResult(null);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyzeClick = useCallback(async () => {
    if (!selectedFile || !imagePreview) return;

    setIsLoading(true);
    setResult(null);
    setError(null);

    // Use a timeout to ensure the UI updates to the loading state before the heavy computation starts
    setTimeout(() => {
        const image = new Image();
        image.onload = () => {
            const canvas = canvasRef.current;
            if (!canvas) {
                setError('Canvas element not found.');
                setIsLoading(false);
                return;
            }
            const context = canvas.getContext('2d', { willReadFrequently: true });
            if (!context) {
                setError('Could not get canvas context.');
                setIsLoading(false);
                return;
            }

            canvas.width = image.width;
            canvas.height = image.height;
            context.drawImage(image, 0, 0);

            try {
                const imageData = context.getImageData(0, 0, image.width, image.height);
                const probability = analyzeLSB(imageData);

                let message = '';
                let status: ResultStatus;

                if (probability > 0.95) {
                    message = 'Suspicious: High probability of hidden LSB data detected.';
                    status = ResultStatus.Suspicious;
                } else if (probability > 0.10) {
                    message = 'Indeterminate: Some statistical anomalies were found, but results are inconclusive.';
                    status = ResultStatus.Indeterminate;
                } else {
                    message = 'Likely Clean: No significant statistical signs of LSB steganography found.';
                    status = ResultStatus.Clean;
                }

                setResult({ probability, message, status });
            } catch (e) {
                console.error(e);
                setError('An error occurred during analysis. The image might be protected by CORS policy if loaded from a URL.');
            } finally {
                setIsLoading(false);
            }
        };
        image.onerror = () => {
            setError('Could not load the image for analysis.');
            setIsLoading(false);
        };
        image.src = imagePreview;
    }, 100);
  }, [selectedFile, imagePreview]);

  const getResultColors = (status: ResultStatus | undefined) => {
    switch (status) {
      case ResultStatus.Clean:
        return { text: 'text-green-400', bg: 'bg-green-500/10', border: 'border-green-500/30', icon: <CheckCircleIcon className="w-6 h-6 mr-3 text-green-400" /> };
      case ResultStatus.Indeterminate:
        return { text: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500/30', icon: <ExclamationTriangleIcon className="w-6 h-6 mr-3 text-yellow-400" /> };
      case ResultStatus.Suspicious:
        return { text: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/30', icon: <ShieldExclamationIcon className="w-6 h-6 mr-3 text-red-400" /> };
      default:
        return { text: 'text-gray-400', bg: 'bg-gray-700/20', border: 'border-gray-600/30', icon: null };
    }
  };
  
  const resultColors = getResultColors(result?.status);

  return (
    <div className="min-h-screen bg-gray-900 text-gray-200 flex flex-col items-center justify-center p-4 font-sans">
      <canvas ref={canvasRef} className="hidden"></canvas>
      <div className="w-full max-w-2xl mx-auto bg-gray-800 rounded-xl shadow-2xl overflow-hidden">
        <div className="p-8">
          <h1 className="text-3xl font-bold text-center text-white mb-2">Steganalysis Tool</h1>
          <p className="text-center text-gray-400 mb-8">Detect LSB Steganography with Chi-Square Attack</p>
          
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
            accept="image/png, image/bmp, image/jpeg"
          />
          
          <div 
            className="border-2 border-dashed border-gray-600 rounded-lg p-8 text-center cursor-pointer hover:border-teal-500 hover:bg-gray-700/50 transition-all duration-300"
            onClick={() => fileInputRef.current?.click()}
          >
            {imagePreview ? (
              <img src={imagePreview} alt="Selected preview" className="max-h-60 mx-auto rounded-lg shadow-md" />
            ) : (
              <div className="flex flex-col items-center">
                <UploadIcon className="w-12 h-12 text-gray-500 mb-4" />
                <p className="text-gray-400 font-semibold">Click to upload an image</p>
                <p className="text-sm text-gray-500">PNG, BMP, or JPEG</p>
              </div>
            )}
          </div>

          {selectedFile && <p className="text-center text-sm text-gray-400 mt-4">Selected: {selectedFile.name}</p>}

          {error && <div className="mt-6 bg-red-500/10 text-red-400 border border-red-500/30 p-4 rounded-lg text-center">{error}</div>}

          <div className="mt-8">
            <button
              onClick={handleAnalyzeClick}
              disabled={!selectedFile || isLoading}
              className="w-full bg-teal-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-teal-500 disabled:bg-gray-600 disabled:cursor-not-allowed disabled:text-gray-400 transition-all duration-300 flex items-center justify-center text-lg"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Analyzing...
                </>
              ) : (
                'Analyze for LSB Steganography'
              )}
            </button>
          </div>
        </div>

        {result && (
          <div className={`border-t-2 ${resultColors.border} ${resultColors.bg}`}>
            <div className="p-8">
                <h2 className="text-2xl font-bold text-center mb-4">Analysis Result</h2>
                <div className={`flex items-center justify-center p-4 rounded-lg border ${resultColors.border} ${resultColors.bg}`}>
                    {resultColors.icon}
                    <div className="text-left">
                        <p className={`font-bold text-lg ${resultColors.text}`}>{result.status}</p>
                        <p className="text-gray-300">{result.message}</p>
                    </div>
                </div>
                <div className="mt-6 text-center">
                    <p className="text-gray-400">Calculated Probability Score:</p>
                    <p className="text-4xl font-mono font-bold text-white mt-1">
                        {result.probability.toFixed(4)}
                    </p>
                    <div className="w-full bg-gray-700 rounded-full h-2.5 mt-4">
                        <div className={`h-2.5 rounded-full ${result.status === ResultStatus.Clean ? 'bg-green-500' : result.status === ResultStatus.Indeterminate ? 'bg-yellow-500' : 'bg-red-500'}`} style={{ width: `${result.probability * 100}%` }}></div>
                    </div>
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>Natural Data</span>
                        <span>Random Data</span>
                    </div>
                </div>
            </div>
          </div>
        )}
      </div>
      <footer className="text-center mt-8 text-gray-600 text-sm">
        <p>This tool performs analysis entirely within your browser. Your images are not uploaded to any server.</p>
      </footer>
    </div>
  );
};

export default App;
