import React, { useState } from 'react';
import { Camera, MapPin, Clock, Save } from 'lucide-react';

const FieldWork: React.FC = () => {
    const [location, setLocation] = useState<{lat: number, lng: number} | null>(null);
    const [status, setStatus] = useState<string>('');

    const captureLocation = () => {
        setStatus('Acquiring satellites...');
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setLocation({
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    });
                    setStatus('Location locked via GPS');
                },
                () => setStatus('Location access denied'),
                { enableHighAccuracy: true }
            );
        } else {
            setStatus('Geolocation not supported');
        }
    };

    return (
        <div className="max-w-md mx-auto bg-white min-h-[600px] border border-slate-200 rounded-xl shadow-lg overflow-hidden flex flex-col relative">
            <div className="bg-slate-900 text-white p-4 text-center">
                <h3 className="font-bold">Field Collector App</h3>
                <p className="text-xs text-slate-400">Secure Evidence Capture</p>
            </div>

            <div className="flex-1 p-6 space-y-6">
                <div className="bg-slate-100 rounded-xl h-48 flex flex-col items-center justify-center border-2 border-dashed border-slate-300 text-slate-400">
                    <Camera size={32} className="mb-2" />
                    <span className="text-sm font-medium">Tap to take photo of Cash Count</span>
                </div>

                <div className="space-y-4">
                    <button 
                        onClick={captureLocation}
                        className="w-full flex items-center justify-between p-4 bg-blue-50 text-blue-700 rounded-lg border border-blue-100"
                    >
                        <div className="flex items-center gap-3">
                            <MapPin size={20} />
                            <div className="text-left">
                                <span className="block font-bold text-sm">Geo-Tagging</span>
                                <span className="text-xs opacity-75">{location ? `${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}` : 'Tap to fetch'}</span>
                            </div>
                        </div>
                        {location && <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>}
                    </button>

                    <div className="flex items-center justify-between p-4 bg-slate-50 text-slate-700 rounded-lg border border-slate-100">
                        <div className="flex items-center gap-3">
                            <Clock size={20} />
                            <div className="text-left">
                                <span className="block font-bold text-sm">Timestamp</span>
                                <span className="text-xs opacity-75">{new Date().toLocaleString()}</span>
                            </div>
                        </div>
                    </div>
                    
                    {status && <p className="text-center text-xs text-slate-500">{status}</p>}
                </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200">
                <button className="w-full bg-emerald-600 text-white py-3 rounded-lg font-bold shadow-lg shadow-emerald-200 flex items-center justify-center gap-2">
                    <Save size={18} />
                    Upload Evidence
                </button>
            </div>
            
            {/* Simulation overlay */}
            <div className="absolute top-2 right-2 px-2 py-1 bg-black/50 text-white text-[10px] rounded backdrop-blur-sm">
                Mobile View Simulator
            </div>
        </div>
    );
};

export default FieldWork;