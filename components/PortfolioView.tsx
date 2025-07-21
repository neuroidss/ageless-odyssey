import React from 'react';
import { OdysseyState, CartItem, InvestmentItem } from '../types';
import { ShoppingBagIcon, BanknotesIcon, CurrencyDollarIcon, MemicIcon } from './icons';

interface PortfolioViewProps {
    odysseyState: OdysseyState;
    onExecutePlan: () => void;
    onFinalizeInvestments: () => void;
}

const PortfolioView: React.FC<PortfolioViewProps> = ({ odysseyState, onExecutePlan, onFinalizeInvestments }) => {
    const { rejuvenationCart, investmentPortfolio, vectors } = odysseyState;

    const cartTotal = rejuvenationCart.reduce((sum, item) => sum + item.price, 0);
    const portfolioTotal = investmentPortfolio.reduce((sum, item) => sum + item.amount, 0);
    const totalCost = cartTotal + portfolioTotal;
    const canAfford = vectors.capital >= totalCost;

    return (
        <div className="p-4 sm:p-6 bg-slate-900/50 backdrop-blur-sm rounded-lg border border-slate-700">
            <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 mb-4">
                <ShoppingBagIcon className="h-8 w-8 text-green-300" />
                <h2 className="text-2xl font-bold text-slate-100 text-center sm:text-left">
                    Longevity Portfolio
                </h2>
            </div>
            <p className="text-slate-400 text-center sm:text-left mb-4">
                Strategically allocate your capital. Purchase current therapies or invest in future breakthroughs.
            </p>

            <div className="space-y-6">
                {/* Rejuvenation Plan (Cart) */}
                <div>
                    <h3 className="text-lg font-semibold text-slate-200 mb-2 border-b border-slate-700 pb-2">Rejuvenation Plan (Now)</h3>
                    {rejuvenationCart.length === 0 ? (
                        <p className="text-sm text-slate-500 text-center py-4">Add market-ready items to your plan.</p>
                    ) : (
                        <div className="space-y-2">
                            {rejuvenationCart.map(item => (
                                <div key={item.interventionId} className="flex justify-between items-center text-sm p-2 bg-slate-800/50 rounded">
                                    <span className="text-slate-300">{item.name}</span>
                                    <span className="font-semibold text-slate-200">${item.price.toLocaleString()}</span>
                                </div>
                            ))}
                            <div className="flex justify-between items-center text-sm font-bold p-2 border-t border-slate-700">
                                <span className="text-slate-300">Plan Total:</span>
                                <span className="text-green-300">${cartTotal.toLocaleString()}</span>
                            </div>
                        </div>
                    )}
                </div>

                {/* Investment Portfolio */}
                <div>
                    <h3 className="text-lg font-semibold text-slate-200 mb-2 border-b border-slate-700 pb-2">R&D Investments (Future)</h3>
                    {investmentPortfolio.length === 0 ? (
                        <p className="text-sm text-slate-500 text-center py-4">Invest in promising R&D stages.</p>
                    ) : (
                        <div className="space-y-2">
                            {investmentPortfolio.map((item, index) => (
                                <div key={`${item.interventionId}-${index}`} className="flex justify-between items-center text-sm p-2 bg-slate-800/50 rounded">
                                    <div>
                                        <p className="text-slate-300">{item.name}</p>
                                        <p className="text-xs text-slate-500">{item.stageName}</p>
                                    </div>
                                    <span className="font-semibold text-slate-200">${item.amount.toLocaleString()}</span>
                                </div>
                            ))}
                            <div className="flex justify-between items-center text-sm font-bold p-2 border-t border-slate-700">
                                <span className="text-slate-300">Investment Total:</span>
                                <span className="text-blue-300">${portfolioTotal.toLocaleString()}</span>
                            </div>
                        </div>
                    )}
                </div>

                {/* Totals and Execution */}
                <div className="pt-4 border-t-2 border-slate-600 space-y-4">
                    <div className="flex justify-between items-center font-bold text-lg">
                        <span className="text-slate-200">Total Allocation:</span>
                        <span className={canAfford ? 'text-yellow-300' : 'text-red-400'}>${totalCost.toLocaleString()}</span>
                    </div>
                     <div className="flex justify-between items-center font-semibold text-md">
                        <span className="text-slate-400">Remaining Capital:</span>
                        <span className="text-green-300">${(vectors.capital - totalCost).toLocaleString()}</span>
                    </div>
                    <div className="flex gap-4">
                        <button 
                            onClick={onExecutePlan}
                            disabled={rejuvenationCart.length === 0 || vectors.capital < cartTotal}
                            className="flex-1 px-4 py-2 text-sm font-bold rounded-lg transition-colors border bg-teal-600 text-white border-teal-500 enabled:hover:bg-teal-500 disabled:bg-slate-600 disabled:border-slate-500 disabled:text-slate-300 disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                            Execute Plan
                        </button>
                        <button 
                            onClick={onFinalizeInvestments}
                             disabled={investmentPortfolio.length === 0 || vectors.capital < portfolioTotal}
                            className="flex-1 px-4 py-2 text-sm font-bold rounded-lg transition-colors border bg-blue-600 text-white border-blue-500 enabled:hover:bg-blue-500 disabled:bg-slate-600 disabled:border-slate-500 disabled:text-slate-300 disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                            Finalize Investments
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PortfolioView;