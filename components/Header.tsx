
import React from 'react';
import { GamificationState } from '../types';
import GamificationDashboard from './GamificationDashboard';

interface HeaderProps {
    gamification: GamificationState;
}

const Header: React.FC<HeaderProps> = ({ gamification }) => {
  return (
    <header className="py-8 px-4 flex flex-col items-center gap-8">
        <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-extrabold tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-teal-300 to-blue-500">
                The Ageless Odyssey
            </h1>
            <p className="mt-4 text-lg text-slate-400 max-w-3xl mx-auto">
                Embark on your personal quest to conquer aging. Navigate the science, track your progress, and rewrite your biological destiny.
                This journey is inspired by the <a href="https://transhuman.ru/starenie" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">Systemic Scheme of Human Aging</a>.
            </p>
        </div>
        <GamificationDashboard gamification={gamification} />
    </header>
  );
};

export default Header;