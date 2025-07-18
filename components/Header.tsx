

import React from 'react';
import { OdysseyState } from '../types';
import OdysseyMap from './GamificationDashboard';

interface HeaderProps {
    odysseyState: OdysseyState;
}

const Header: React.FC<HeaderProps> = ({ odysseyState }) => {
  return (
    <header className="py-8 px-4 flex flex-col items-center gap-8">
        <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-extrabold tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-teal-300 to-blue-500">
                The Ageless Odyssey
            </h1>
            <p className="mt-4 text-lg text-slate-400 max-w-3xl mx-auto">
                Your journey to the stars begins within. Evolve from your mortal shell, conquer the challenges of new frontiers, and rewrite your biological destiny.
            </p>
        </div>
        <OdysseyMap odysseyState={odysseyState} />
    </header>
  );
};

export default Header;
