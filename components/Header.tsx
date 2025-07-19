import React from 'react';
import { OdysseyState, RealmDefinition } from '../types';
import OdysseyMap from './GamificationDashboard';

interface HeaderProps {
    odysseyState: OdysseyState;
    dynamicRealmDefinitions: RealmDefinition[];
    isOracleLoading: boolean;
}

const Header: React.FC<HeaderProps> = ({ odysseyState, dynamicRealmDefinitions, isOracleLoading }) => {
  return (
    <header className="py-8 px-4 flex flex-col items-center gap-8">
        <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-extrabold tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-teal-300 to-blue-500">
                The Ageless Odyssey
            </h1>
            <p className="mt-4 text-lg text-slate-400 max-w-3xl mx-auto">
                Your journey is twofold: master your own biology and guide an AI Oracle toward cosmic understanding. Every quest you complete, every discovery you synthesize, serves as a benchmark—not just for the AI, but for your ability to steer the course of evolution. Evolve from your mortal shell and rewrite your destiny.
            </p>
        </div>
        <OdysseyMap odysseyState={odysseyState} dynamicRealmDefinitions={dynamicRealmDefinitions} isOracleLoading={isOracleLoading} />
    </header>
  );
};

export default Header;