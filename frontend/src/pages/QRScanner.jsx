import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { QrCode, ArrowLeft, ShieldCheck, AlertCircle } from 'lucide-react';

const QRScanner = () => {
    const navigate = useNavigate();
    const [scanResult, setScanResult] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        const scanner = new Html5QrcodeScanner('reader', {
            qrbox: {
                width: 250,
                height: 250,
            },
            fps: 10,
        });

        scanner.render(onScanSuccess, onScanError);

        function onScanSuccess(result) {
            scanner.clear();
            setScanResult(result);
            
            console.log("Scanned result:", result);
            
            // Expected result format: http://localhost:5173/trace/BATCH_ID
            // Extract BATCH_ID from URL or handle raw ID
            try {
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
                    // Assume it's a raw batch ID
                    navigate(`/trace/${result}`);
                }
            } catch (e) {
                console.error("Scan processing error:", e);
                navigate(`/trace/${result}`);
            }
        }

        function onScanError(err) {
            // console.warn(err);
        }

        return () => {
            scanner.clear().catch(error => console.error("Failed to clear scanner", error));
        };
    }, [navigate]);

    return (
        <div className="max-w-2xl mx-auto py-10 animate-in fade-in slide-in-from-bottom-6 duration-700">
            <button onClick={() => navigate(-1)} className="mb-8 flex items-center gap-2 text-gray-400 hover:text-green-600 font-bold transition-all group">
                <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                Back
            </button>

            <header className="text-center mb-10">
                <div className="bg-green-100 w-16 h-16 rounded-3xl mx-auto flex items-center justify-center text-green-600 mb-4 shadow-inner">
                    <QrCode size={32} />
                </div>
                <h2 className="text-4xl font-black text-gray-900 tracking-tight mb-2">Secure Scanner</h2>
                <p className="text-gray-500 font-medium">Point your camera at a product QR code to verify its provenance.</p>
            </header>

            <div className="bg-white p-4 md:p-8 rounded-[40px] shadow-2xl border border-gray-100 overflow-hidden relative">
                <div id="reader" className="rounded-3xl overflow-hidden border-0"></div>
                
                <div className="mt-8 pt-8 border-t border-gray-50 flex items-center justify-center gap-6">
                    <div className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                        <ShieldCheck className="text-blue-500" size={14} />
                        AES-256 Encrypted
                    </div>
                    <div className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                        Live Verification
                    </div>
                </div>
            </div>

            {error && (
                <div className="mt-6 p-4 bg-red-50 rounded-2xl border border-red-100 flex items-center gap-3 text-red-600 animate-in slide-in-from-top-2">
                    <AlertCircle size={20} />
                    <p className="text-sm font-bold">{error}</p>
                </div>
            )}

            <div className="mt-12 group p-8 bg-gradient-to-br from-gray-900 to-gray-800 rounded-[40px] text-white overflow-hidden relative">
                <div className="absolute top-0 right-0 p-8 opacity-10">
                    <QrCode size={120} />
                </div>
                <h4 className="text-xl font-bold mb-2 relative z-10">How it works?</h4>
                <p className="text-gray-400 text-sm leading-relaxed relative z-10">
                    Each AgriTrace QR code contains a unique identifier linked to a blockchain transaction. 
                    When scanned, our system retrieves the entire journey—from seed to shelf—ensuring absolute transparency.
                </p>
            </div>
        </div>
    );
};

export default QRScanner;
