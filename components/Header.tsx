import React from 'react';
import { OdysseyState, RealmDefinition } from '../types';
import OdysseyMap from './GamificationDashboard';
import { NetworkIcon } from './icons';

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
                Longevity research is a "chicken-and-egg" problem with a low signal-to-noise ratio. This is an engineering simulator to solve it. Your goal: use AI agents to find high-impact research trends, fund them, and guide your evolution from a fragile mortal shell to a post-biological entity.
            </p>
        </div>
        <OdysseyMap odysseyState={odysseyState} dynamicRealmDefinitions={dynamicRealmDefinitions} isOracleLoading={isOracleLoading} />
    </header>
  );
};

export default Header;