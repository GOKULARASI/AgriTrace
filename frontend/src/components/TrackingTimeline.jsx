import React from 'react';
import { CheckCircle2, Clock, Circle } from 'lucide-react';

const TrackingTimeline = ({ track }) => {
    if (!track) return null;

    const stages = [
        {
            id: 'sown',
            label: 'Sown',
            date: track.dateOfSowing,
            info: `Farmer: ${track.farmerName || 'N/A'}`,
            status: track.dateOfSowing ? 'completed' : 'pending'
        },
        {
            id: 'harvested',
            label: 'Harvested',
            date: track.dateOfHarvesting,
            status: track.dateOfHarvesting ? 'completed' : (track.dateOfSowing ? 'current' : 'pending')
        },
        {
            id: 'processed',
            label: 'Processed',
            date: track.dateOfProcessing,
            info: `Industry: ${track.industryName || 'N/A'}`,
            status: track.dateOfProcessing ? 'completed' : (track.dateOfHarvesting ? 'current' : 'pending')
        },
        {
            id: 'packed',
            label: 'Packed',
            date: track.dateOfPacking,
            status: track.dateOfPacking ? 'completed' : (track.dateOfProcessing ? 'current' : 'pending')
        },
        {
            id: 'shipped',
            label: 'Shipped',
            date: track.dateOfShipping,
            info: `Transporter: ${track.transporterName || 'N/A'}`,
            status: track.dateOfShipping ? 'completed' : (track.dateOfPacking ? 'current' : 'pending')
        },
        {
            id: 'delivered',
            label: 'Delivered',
            date: track.dateOfDelivery,
            status: track.dateOfDelivery ? 'completed' : (track.dateOfShipping ? 'current' : 'pending')
        }
    ];

    const formatDate = (dateString) => {
        if (!dateString) return null;
        return new Date(dateString).toLocaleDateString(undefined, {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    return (
        <div className="py-8">
            <div className="relative">
                {/* Vertical line connector */}
                <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gray-200"></div>

                <div className="space-y-12">
                    {stages.map((stage, index) => (
                        <div key={stage.id} className="relative flex items-start group">
                            {/* Icon / Status indicator */}
                            <div className="relative z-10 flex items-center justify-center w-16 h-16">
                                {stage.status === 'completed' ? (
                                    <div className="bg-green-100 p-3 rounded-full text-green-600 shadow-sm border-4 border-white">
                                        <CheckCircle2 size={24} />
                                    </div>
                                ) : stage.status === 'current' ? (
                                    <div className="bg-blue-100 p-3 rounded-full text-blue-600 shadow-sm border-4 border-white animate-pulse">
                                        <Clock size={24} />
                                    </div>
                                ) : (
                                    <div className="bg-gray-100 p-3 rounded-full text-gray-400 border-4 border-white">
                                        <Circle size={24} />
                                    </div>
                                )}
                            </div>

                            {/* Content */}
                            <div className="ml-6 pt-2">
                                <h4 className={`text-lg font-bold ${stage.status === 'pending' ? 'text-gray-400' : 'text-gray-900'}`}>
                                    {stage.label}
                                </h4>
                                {stage.date && (
                                    <p className="text-sm font-medium text-green-600 mt-1">
                                        {formatDate(stage.date)}
                                    </p>
                                )}
                                {stage.info && (
                                    <p className="text-sm text-gray-500 mt-1 italic">
                                        {stage.info}
                                    </p>
                                )}
                                {stage.status === 'pending' && (
                                    <p className="text-xs text-gray-400 mt-1">Pending update...</p>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default TrackingTimeline;
