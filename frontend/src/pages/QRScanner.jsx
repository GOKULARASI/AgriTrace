import React, { useEffect, useState, useRef, useCallback, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { Html5Qrcode } from 'html5-qrcode';
import { QrCode, ArrowLeft, ShieldCheck, AlertCircle, Camera, Upload, CheckCircle2, Loader2 } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';

const QRScanner = ({ isEmbedded = false }) => {
    const navigate = useNavigate();
    const { user } = useContext(AuthContext);
    const userRole = user?.user?.role || 'Consumer'; // Public/Default to Consumer if not logged in
    const [error, setError] = useState(null);
    const [isScanning, setIsScanning] = useState(false);
    const [scanMode, setScanMode] = useState('camera'); 
    const [filePreview, setFilePreview] = useState(null);
    const [isProcessingFile, setIsProcessingFile] = useState(false);
    const [isStopping, setIsStopping] = useState(false);
    const scannerRef = useRef(null);

    // Handle scan result
    const processResult = useCallback((result) => {
        try {
            console.log("Decoding successful:", result);
            if (result.startsWith('http')) {
                const url = new URL(result);
                const pathParts = url.pathname.split('/');
                const batchId = pathParts[pathParts.length - 1];
                if (batchId) {
                    navigate(`/trace/${batchId}`);
                } else {
                    setError('Invalid QR Code structure.');
                }
            } else if (result.includes('/trace/')) {
                const batchId = result.split('/trace/')[1];
                navigate(`/trace/${batchId}`);
            } else {
                navigate(`/trace/${result}`);
            }
        } catch (e) {
            console.error("Scan processing error:", e);
            navigate(`/trace/${result}`);
        }
    }, [navigate]);

    // Initialize Instance
    useEffect(() => {
        if (!scannerRef.current) {
            scannerRef.current = new Html5Qrcode('reader-hidden');
        }
        return () => {
            if (scannerRef.current?.isScanning) {
                scannerRef.current.stop().catch(() => {});
            }
        };
    }, []);

    const startCamera = async () => {
        if (!scannerRef.current) return;
        if (scannerRef.current.isScanning) return;

        setError(null);
        setIsScanning(true);
        setIsStopping(false);
        setFilePreview(null);

        try {
            await scannerRef.current.start(
                { facingMode: "environment" },
                { 
                    fps: 10, 
                    qrbox: { width: 250, height: 250 },
                    aspectRatio: 1.0
                },
                async (result) => {
                    await scannerRef.current.stop();
                    setIsScanning(false);
                    processResult(result);
                },
                () => {} // high frequency errors
            );
        } catch (err) {
            console.error("Camera error:", err);
            setError("Camera access denied or lens busy.");
            setIsScanning(false);
        }
    };

    const stopCamera = async () => {
        if (!scannerRef.current || !scannerRef.current.isScanning) return;
        setIsStopping(true);
        try {
            await scannerRef.current.stop();
            setIsScanning(false);
        } catch (e) {
            console.error("Stop error:", e);
        } finally {
            setIsStopping(false);
        }
    };

    // File Upload Handler
    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Generate Preview
        const reader = new FileReader();
        reader.onloadend = () => {
            setFilePreview(reader.result);
        };
        reader.readAsDataURL(file);

        setIsProcessingFile(true);
        setError(null);

        try {
            // Small delay to show preview
            await new Promise(resolve => setTimeout(resolve, 800));
            const result = await scannerRef.current.scanFile(file, true);
            processResult(result);
        } catch (err) {
            console.error("Scan error:", err);
            setError("No QR code detected in this image. Please ensure the code is clear and well-lit.");
        } finally {
            setIsProcessingFile(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto py-10 animate-in fade-in slide-in-from-bottom-6 duration-700 px-4">
            {!isEmbedded && (
                <button onClick={() => navigate(-1)} className="mb-8 flex items-center gap-2 text-gray-400 hover:text-green-600 font-bold transition-all group">
                    <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                    Back
                </button>
            )}

            {!isEmbedded && (
                <header className="text-center mb-10">
                    <div className="bg-green-100 w-16 h-16 rounded-3xl mx-auto flex items-center justify-center text-green-600 mb-4 shadow-inner">
                        <QrCode size={32} />
                    </div>
                    <h2 className="text-4xl font-black text-gray-900 tracking-tight mb-2 uppercase">Secure Trace</h2>
                    <p className="text-gray-500 font-medium italic">
                        Blockchain-backed product verification hub
                    </p>
                </header>
            )}

            {/* Mode Switcher */}
            <div className="flex p-1.5 bg-gray-100 rounded-2xl mb-8 max-w-xs mx-auto">
                <button 
                    onClick={() => { setScanMode('camera'); stopCamera(); }}
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-sm transition-all ${scanMode === 'camera' ? 'bg-white text-green-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                >
                    <Camera size={18} />
                    Camera
                </button>
                <button 
                    onClick={() => { setScanMode('file'); stopCamera(); }}
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-sm transition-all ${scanMode === 'file' ? 'bg-white text-green-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                >
                    <Upload size={18} />
                    File
                </button>
            </div>

            <div className="bg-white p-4 md:p-6 rounded-[40px] shadow-2xl border border-gray-100 overflow-hidden relative">
                {/* Hidden reader for the library to use */}
                <div id="reader-hidden" className={`${isScanning ? 'block' : 'hidden'} rounded-3xl overflow-hidden aspect-square bg-black`}></div>

                {/* Custom UI Overlays */}
                {!isScanning && (
                    <div className="aspect-square bg-gray-50/50 rounded-3xl flex flex-col items-center justify-center p-4 md:p-8 border-2 border-dashed border-gray-200 overflow-hidden relative">
                        {scanMode === 'camera' ? (
                            <div className="text-center w-full max-w-sm mx-auto">
                                <div className="bg-green-100 p-6 md:p-8 rounded-full text-green-600 mb-6 mx-auto w-fit shadow-inner">
                                    <Camera size={40} className="md:w-12 md:h-12" />
                                </div>
                                <h3 className="text-xl md:text-2xl font-black text-gray-900 mb-2">Live Lens Scanning</h3>
                                <p className="text-gray-400 text-xs md:text-sm mb-6 md:mb-8">Point your device at the product batch tag</p>
                                <button 
                                    onClick={startCamera}
                                    className="bg-green-600 text-white px-8 md:px-10 py-3 md:py-4 rounded-2xl font-black shadow-xl shadow-green-200 hover:bg-green-700 transition-all flex items-center gap-2 mx-auto text-sm md:text-base"
                                >
                                    <Camera size={20} />
                                    START CAMERA
                                </button>
                            </div>
                        ) : (
                            <div className="text-center w-full h-full flex flex-col items-center justify-center">
                                {isProcessingFile ? (
                                    <div className="space-y-6 animate-in zoom-in duration-500 text-center w-full">
                                        {filePreview && (
                                            <div className="relative w-40 h-40 md:w-56 md:h-56 mx-auto rounded-3xl overflow-hidden ring-4 ring-green-500/20 shadow-2xl">
                                                <img src={filePreview} alt="QR Preview" className="w-full h-full object-contain bg-white grayscale opacity-50" />
                                                <div className="absolute inset-0 bg-green-600/10 flex items-center justify-center">
                                                    <Loader2 className="w-10 h-10 text-green-600 animate-spin" />
                                                </div>
                                            </div>
                                        )}
                                        <div>
                                            <p className="text-gray-900 font-black text-lg mb-1">Decoding Passport</p>
                                            <p className="text-gray-400 font-bold text-[10px] uppercase tracking-widest animate-pulse">Consulting Ledger...</p>
                                        </div>
                                    </div>
                                ) : filePreview && !error ? (
                                    <div className="space-y-6 text-center animate-in fade-in duration-500 w-full">
                                        <div className="relative w-48 h-48 md:w-72 md:h-72 mx-auto rounded-[32px] overflow-hidden ring-8 ring-gray-100 shadow-2xl group bg-white">
                                            <img src={filePreview} alt="Uploaded QR" className="w-full h-full object-contain p-4" />
                                            <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                <div className="bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg">
                                                    <p className="text-gray-900 text-[10px] font-black uppercase tracking-tighter">Preview Ready</p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex gap-3 justify-center px-4">
                                            <button 
                                                onClick={() => { setFilePreview(null); setError(null); }}
                                                className="bg-gray-100 text-gray-600 px-6 py-3 rounded-xl font-bold text-xs md:text-sm hover:bg-gray-200 transition-all border border-gray-200"
                                            >
                                                Clear
                                            </button>
                                            <label className="bg-gray-900 text-white px-8 py-3 rounded-xl font-bold text-xs md:text-sm hover:bg-gray-800 transition-all cursor-pointer shadow-lg shadow-gray-200 flex-1 md:flex-none">
                                                Try Another
                                                <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                                            </label>
                                        </div>
                                    </div>
                                ) : (
                                    <label className="cursor-pointer group flex flex-col items-center w-full h-full justify-center p-4">
                                        <div className="bg-blue-100 p-8 rounded-full text-blue-600 mb-6 group-hover:scale-110 group-hover:bg-blue-200 transition-all duration-300 shadow-inner">
                                            <Upload size={48} />
                                        </div>
                                        <h3 className="text-xl md:text-2xl font-black text-gray-900 mb-2">Upload QR Photo</h3>
                                        <p className="text-gray-400 text-xs md:text-sm mb-2 max-w-[200px] mx-auto">Select a clear image of the batch code tag</p>
                                        <input 
                                            type="file" 
                                            className="hidden" 
                                            accept="image/*" 
                                            onChange={handleFileChange}
                                        />
                                    </label>
                                )}
                            </div>
                        )}
                    </div>
                )}

                {isScanning && (
                    <div className="absolute bottom-10 left-0 right-0 z-50 px-8 text-center">
                        <button 
                            onClick={stopCamera}
                            className="bg-red-500 text-white px-6 py-2 rounded-xl text-xs font-black shadow-lg hover:bg-red-600 transition-all"
                        >
                            {isStopping ? 'STOPPING...' : 'CLOSE CAMERA'}
                        </button>
                    </div>
                )}

                {error && (
                    <div className="text-center text-red-500 p-8 z-20 bg-white/95 absolute inset-0 flex flex-col items-center justify-center">
                        <div className="bg-red-50 p-4 rounded-3xl mb-4">
                            <AlertCircle size={40} />
                        </div>
                        <p className="font-bold text-lg mb-2">{error}</p>
                        <button 
                            onClick={() => setError(null)} 
                            className="mt-4 bg-gray-900 text-white px-8 py-3 rounded-2xl text-sm font-bold shadow-lg"
                        >
                            Dismiss
                        </button>
                    </div>
                )}
            </div>
            
            <div className="mt-8 flex items-center justify-center gap-6">
                <div className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                    <ShieldCheck className="text-blue-500" size={14} />
                    Decentralized Verification
                </div>
                <div className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                    <div className={`w-1.5 h-1.5 rounded-full ${isScanning || isProcessingFile ? 'bg-green-500 animate-pulse' : 'bg-gray-300'}`}></div>
                    {isScanning ? 'Camera On' : isProcessingFile ? 'Analyzing' : 'Ready'}
                </div>
            </div>
        </div>
    );
};

export default QRScanner;
