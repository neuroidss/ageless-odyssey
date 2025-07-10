import React from 'react';
import { type TrajectoryState, type Biomarker } from '../types';
import LineChart from './LineChart';
import { TrajectoryIcon, TrendingUpIcon, TrendingDownIcon } from './icons';

interface TrajectoryViewProps {
    trajectoryState: TrajectoryState;
    onApplyIntervention: (interventionId: string | null) => void;
}

const BiomarkerCard: React.FC<{ biomarker: Biomarker }> = ({ biomarker }) => {
    const currentValue = biomarker.projection[0].value;
    const isGoodTrend = (biomarker.projection[1].value - currentValue) > 0;
    
    const TrendIcon = () => {
        if ((isGoodTrend && biomarker.trendDirection === 'up') || (!isGoodTrend && biomarker.trendDirection === 'down')) {
            return <TrendingUpIcon className="h-5 w-5 text-green-400" />;
        }
        return <TrendingDownIcon className="h-5 w-5 text-red-400" />;
    };
    
    return (
        <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700 flex flex-col">
            <div className="flex-grow">
                 <div className="flex justify-between items-start">
                    <h4 className="font-bold text-slate-200 text-md">{biomarker.name}</h4>
                    <TrendIcon />
                </div>
                <p className="text-2xl font-bold text-slate-100 my-1">
                    {currentValue.toFixed(1)} <span className="text-base font-normal text-slate-400">{biomarker.unit}</span>
                </p>
                <p className="text-xs text-slate-500">{biomarker.description}</p>
            </div>
            <div className="h-20 mt-3">
                 <LineChart
                    series={[
                        { data: [...biomarker.history, ...biomarker.projection], color: 'rgba(75, 85, 99, 0.7)', strokeWidth: 2 },
                        { data: biomarker.projection, color: 'rgba(239, 68, 68, 0.8)', isDashed: true, strokeWidth: 2 },
                        ...(biomarker.interventionProjection ? [{ data: biomarker.interventionProjection, color: 'rgba(52, 211, 153, 1)', isDashed: true, strokeWidth: 3 }] : []),
                    ]}
                 />
            </div>
        </div>
    );
};


const TrajectoryView: React.FC<TrajectoryViewProps> = ({ trajectoryState, onApplyIntervention }) => {
    const { biomarkers, interventions, activeInterventionId, overallScore } = trajectoryState;
    const currentScore = overallScore.projection[0].value;

    return (
        <div className="p-4 sm:p-6 bg-slate-900/50 backdrop-blur-sm rounded-lg border border-slate-700">
            <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 mb-4">
                <TrajectoryIcon className="h-8 w-8 text-green-400" />
                <h2 className="text-2xl font-bold text-slate-100 text-center sm:text-left">
                    Your Personal Longevity Trajectory
                </h2>
            </div>
            <p className="text-slate-400 text-center sm:text-left mb-6">
                This is a simulation of your key biomarkers and biological age. Select an intervention to see its potential impact on your future.
            </p>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Chart */}
                <div className="lg:col-span-3 bg-slate-800/50 p-4 rounded-lg border border-slate-700">
                     <div className="flex flex-col md:flex-row justify-between md:items-center mb-4">
                        <div>
                            <h3 className="text-lg font-bold text-slate-200">Overall Biological Age</h3>
                            <p className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-300 to-yellow-400">{currentScore.toFixed(1)} <span className="text-2xl">years</span></p>
                            <p className="text-sm text-slate-400">Lower is better. Score is a composite of all biomarkers.</p>
                        </div>
                        <div className="mt-4 md:mt-0">
                            <label htmlFor="intervention-select" className="block text-sm font-medium text-slate-300 mb-1">Simulate Intervention:</label>
                             <select
                                id="intervention-select"
                                value={activeInterventionId || ''}
                                onChange={(e) => onApplyIntervention(e.target.value || null)}
                                className="w-full md:w-auto bg-slate-700 text-slate-200 font-semibold pl-3 pr-8 py-2 rounded-lg hover:bg-slate-600 focus:ring-2 focus:ring-blue-500/50 focus:outline-none transition-all duration-300 border border-slate-600"
                            >
                                <option value="">None (Baseline)</option>
                                {interventions.map(i => (
                                    <option key={i.id} value={i.id}>{i.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                    <div className="h-64">
                         <LineChart
                            series={[
                                { data: [...overallScore.history, ...overallScore.projection], color: 'rgba(107, 114, 128, 0.8)', name: 'History', strokeWidth: 3 },
                                { data: overallScore.projection, color: 'rgba(239, 68, 68, 0.9)', name: 'Baseline Projection', isDashed: true, strokeWidth: 3 },
                                ...(overallScore.interventionProjection ? [{ data: overallScore.interventionProjection, color: 'rgba(52, 211, 153, 1)', name: 'Intervention', isDashed: true, strokeWidth: 4 }] : []),
                            ]}
                        />
                    </div>
                </div>

                {biomarkers.map(b => (
                    <BiomarkerCard key={b.id} biomarker={b} />
                ))}
            </div>
        </div>
    );
};

export default TrajectoryView;
