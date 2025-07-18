import React from 'react';

export const ArticleIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
    </svg>
);

export const PatentIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
    </svg>
);

export const BioDataIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M12 6V5m0 14v-1m6.364-8.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
);

export const LinkIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 inline-block mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
    </svg>
);

export const LightbulbIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
    </svg>
);

export const GeneIcon = ({className = "h-5 w-5"}) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M7.293 2.293a1 1 0 011.414 0l4.5 4.5a1 1 0 01-1.414 1.414L10 6.414l-1.293 1.293a1 1 0 01-1.414-1.414l4.5-4.5zM7.293 12.293a1 1 0 011.414 0L10 13.586l1.293-1.293a1 1 0 111.414 1.414l-4.5 4.5a1 1 0 01-1.414 0l-4.5-4.5a1 1 0 111.414-1.414L7.293 12.293z" clipRule="evenodd" />
    </svg>
);

export const ProteinIcon = ({className = "h-5 w-5"}) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor">
        <path d="M10 3.5a1.5 1.5 0 013 0V5h-3V3.5zM10 5H3.5a1.5 1.5 0 000 3H10V5zm0 5H3.5a1.5 1.5 0 000 3H10v-3zm0 5H6.5a1.5 1.5 0 000 3H10v-3zM13.5 10a1.5 1.5 0 00-3 0v5a1.5 1.5 0 003 0v-5z" />
    </svg>
);

export const CompoundIcon = ({className = "h-5 w-5"}) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v1.946l4.062 4.062a1 1 0 01.312.638l.5 4a1 1 0 01-.312.962l-4.062 4.062V18a1 1 0 01-1.707.707l-4-4a1 1 0 010-1.414l4-4a1 1 0 01.707-.293H12V2a1 1 0 01-.7-.954zM8.5 8a.5.5 0 000 1h3a.5.5 0 000-1h-3z" clipRule="evenodd" />
    </svg>
);

export const PathwayIcon = ({className = "h-5 w-5"}) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor">
        <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a1 1 0 011-1h14a1 1 0 110 2H3a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" />
    </svg>
);

export const DiseaseIcon = ({className = "h-5 w-5"}) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm.707-10.293a1 1 0 00-1.414-1.414l-3 3a1 1 0 001.414 1.414L10 9.414l3.293 3.293a1 1 0 001.414-1.414l-4-4z" clipRule="evenodd" />
    </svg>
);

export const AgentIcon = ({className = "h-6 w-6"}) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="currentColor">
      <path fillRule="evenodd" d="M8 11.25a.75.75 0 0 1 .75-.75h6.5a.75.75 0 0 1 0 1.5h-6.5a.75.75 0 0 1-.75-.75Zm0 3.5a.75.75 0 0 1 .75-.75h3.5a.75.75 0 0 1 0 1.5h-3.5a.75.75 0 0 1-.75-.75Zm.75 2.25a.75.75 0 0 0 0 1.5h.5a.75.75 0 0 0 0-1.5h-.5Z" clipRule="evenodd" />
      <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12ZM12 3.75a8.25 8.25 0 1 0 0 16.5 8.25 8.25 0 0 0 0-16.5Z" clipRule="evenodd" />
    </svg>
);

export const GeneAnalystIcon = ({className = "h-6 w-6"}) => (
     <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" >
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 0 1 0 3.75H5.625a1.875 1.875 0 0 1 0-3.75Z" />
    </svg>
);

export const CompoundAnalystIcon = ({className = "h-6 w-6"}) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="currentColor">
      <path fillRule="evenodd" d="M10.5 3.75a.75.75 0 0 1 .75.75V7.5h6V4.5a.75.75 0 0 1 1.5 0v3.75a.75.75 0 0 1-.75.75h-6.75v1.5h3a.75.75 0 0 1 0 1.5h-3v3.75a.75.75 0 0 1-1.5 0V15h-3a.75.75 0 0 1 0-1.5h3V9.75H5.25a.75.75 0 0 1-.75-.75V5.25a.75.75 0 0 1 1.5 0v3h3.75V4.5a.75.75 0 0 1 .75-.75Z" clipRule="evenodd" />
      <path d="M4.5 19.5a3 3 0 1 0 6 0 3 3 0 0 0-6 0Zm12 0a3 3 0 1 0 6 0 3 3 0 0 0-6 0Z" />
    </svg>
);

export const TrajectoryIcon = ({className = "h-6 w-6"}) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18 9 11.25l4.306 4.306a11.95 11.95 0 0 1 5.814-5.518l2.74-1.22m0 0-5.94-2.281m5.94 2.28-2.28 5.941" />
    </svg>
);

export const TrendingUpIcon = ({className = "h-5 w-5"}) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.306a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" />
  </svg>
);

export const TrendingDownIcon = ({className = "h-5 w-5"}) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6L9 12.75l4.286-4.286a11.948 11.948 0 014.306 6.43l.776 2.898m0 0l3.182-5.511m-3.182 5.51l-5.511-3.181" />
  </svg>
);

export const TrophyIcon = ({className = "h-6 w-6"}) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="currentColor">
        <path d="M18 2h-2a1 1 0 0 0-1 1v2.43a8 8 0 0 1 0 9.14V17a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1v-2.43a8 8 0 0 1 0-9.14V3a1 1 0 0 0-1-1Zm-5 2.51V3a1 1 0 0 0-1-1h-2a1 1 0 0 0-1 1v1.51a3.99 3.99 0 0 1 0 7.98V14a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1v-1.51a3.99 3.99 0 0 1 0-7.98Z" />
        <path d="M12 10.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z" />
        <path d="M13 22H7a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1h1.17a3 3 0 0 0 2.83-2H6a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1h5a1 1 0 0 1 1 1v5a1 1 0 0 1-1 1h-.83a3 3 0 0 0-2.83 2H13a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1Z" />
    </svg>
);

export const GeneticIcon = ({className = "h-6 w-6"}) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 4c0 1.1.9 2 2 2s2-.9 2-2-.9-2-2-2-2 .9-2 2zM18 4c0 1.1.9 2 2 2s2-.9 2-2-.9-2-2-2-2 .9-2 2zM6 6s.5 2 2.5 2S11 6 11 6M13 18s.5-2 2.5-2 2.5 2 2.5 2M11 6c0 2.5 2 4.5 2 4.5s2-2 2-4.5M6 18c0-2.5 2-4.5 2-4.5S10 11.5 10 14"/>
        <path d="M4 11.5c0 2 2 4.5 2 4.5s2-2.5 2-4.5"/>
        <path d="M18 11.5c0 2-2 4.5-2 4.5s-2-2.5-2-4.5"/>
    </svg>
);

export const CognitiveBandwidthIcon = ({className = "h-6 w-6"}) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2a10 10 0 0 0-3.5 19.33V18a2 2 0 0 1 2-2h3a2 2 0 0 1 2 2v3.33A10 10 0 0 0 12 2Z"/>
      <path d="M8 18a4 4 0 0 0 4 4 4 4 0 0 0 4-4h-8Z"/>
      <path d="M5 14c-1.5-1-2-2.5-2-4"/>
      <path d="M19 14c1.5-1 2-2.5 2-4"/>
      <path d="M2.5 9c-1-2 0-4.5 2.5-6"/>
      <path d="M21.5 9c1-2 0-4.5-2.5-6"/>
    </svg>
);

export const AscensionIcon = ({className = "h-6 w-6"}) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2.6l3.3 6.6 7.3.9-5.4 5.1 1.4 7.2L12 19l-6.6 3.4 1.4-7.2-5.4-5.1 7.3-.9L12 2.6z M12 5.5l-2.2 4.4-4.9.6 3.6 3.4-.9 4.8L12 16.3l4.4 2.2-.9-4.8 3.6-3.4-4.9-.6L12 5.5z"/>
    </svg>
);

export const OracleIcon = ({className = "h-6 w-6"}) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 11.25a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 15 3.75-3.75 3.75 3.75" />
    </svg>
);


export const GearIcon = ({className = "h-5 w-5"}) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.532 1.532 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.532 1.532 0 01-.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
    </svg>
);

export const ChevronDownIcon = ({className = "h-5 w-5"}) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
    </svg>
);

export const SingularityIcon = ({className = "h-7 w-7"}) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.042 21.672 13.684 16.6m0 0-2.51 2.225.569-2.474m0 0L3.182 6.37l5.159 2.972m0 0 3.182-5.5L12 6.37m0 0 8.818 5.09-5.159-2.972M12 6.37l-5.159 2.972m0 0 3.182 5.5M12 12.63l-2.51-2.225L12 6.37l2.51 2.225L12 12.63Z" />
    </svg>
);

export const NetworkIcon = ({className = "h-8 w-8"}) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 3.75H19.5M8.25 3.75A2.25 2.25 0 0 0 6 6v12a2.25 2.25 0 0 0 2.25 2.25h11.25" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 3.75h11.25a2.25 2.25 0 0 1 2.25 2.25v12a2.25 2.25 0 0 1-2.25 2.25H6.375" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 12h13.5" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 12a2.25 2.25 0 0 1-2.25-2.25V6" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 12a2.25 2.25 0 0 0-2.25 2.25v6" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12a2.25 2.25 0 0 1 2.25 2.25V18" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12a2.25 2.25 0 0 0 2.25-2.25V6" />
        <circle cx="9" cy="9" r="1.5" fill="currentColor"/>
        <circle cx="15" cy="15" r="1.5" fill="currentColor"/>
    </svg>
);

// --- Realm Icons ---
export const ShellIcon = ({className="h-6 w-6"}) => ( // Mortal Shell
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a5 5 0 1 0 0 10 5 5 0 0 0 0-10Zm0 2a3 3 0 1 1 0 6 3 3 0 0 1 0-6Z" /><path d="M12 13c-3.86 0-7 1.27-7 3v3h14v-3c0-1.73-3.14-3-7-3Z" /></svg>
);

export const BiologicalOptimizerIcon = ({className="h-6 w-6"}) => ( // Biological Optimizer
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 0 0 1.5-.189m-1.5.189a6.01 6.01 0 0 1-1.5-.189m3.75 7.478a12.06 12.06 0 0 1-4.5 0m3.75 2.311a15.018 15.018 0 0 1-6.75 0" /><path strokeLinecap="round" strokeLinejoin="round" d="M9.344 3.071c.72.124 1.453.124 2.173 0a13.842 13.842 0 0 1 5.234 1.705 13.831 13.831 0 0 1 3.546 4.291 13.842 13.842 0 0 1 0 6.666 13.831 13.831 0 0 1-3.546 4.291 13.842 13.842 0 0 1-5.234 1.705 13.842 13.842 0 0 1-2.173 0 13.842 13.842 0 0 1-5.234-1.705 13.831 13.831 0 0 1-3.546-4.291 13.842 13.842 0 0 1 0-6.666 13.831 13.831 0 0 1 3.546-4.291 13.842 13.842 0 0 1 5.234-1.705Z" /></svg>
);

export const SubstrateEnhancedIcon = ({className="h-6 w-6"}) => ( // Substrate Enhanced
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25H12" /><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 5.25c5.333 3.333 5.333 8.167 0 11.5" /><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 5.25c-5.333 3.333-5.333 8.167 0 11.5" /></svg>
);

export const ExocortexIntegratorIcon = ({className="h-6 w-6"}) => ( // Exocortex Integrator
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /><path strokeLinecap="round" strokeLinejoin="round" d="M18.828 15.172a9 9 0 0 0-13.656 0M18.828 8.828a9 9 0 0 1-13.656 0" /></svg>
);

export const DigitalAscendantIcon = ({className="h-6 w-6"}) => ( // Digital Ascendant
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="m9.75 3.104 5.25 1.625M16.5 6.375l-5.25 1.625m-3.75 0l-5.25 1.625m10.5-1.625 5.25 1.625M4.5 6.375l5.25 1.625M4.5 17.625l5.25-1.625M9.75 20.896l5.25-1.625m-3.75 0l-5.25-1.625m10.5 1.625 5.25-1.625m-14.25-4.5-5.25-1.625m5.25 1.625 5.25-1.625" /><path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z" /></svg>
);

export const DistributedEntityIcon = ({className = "h-6 w-6"}) => ( // Distributed Entity
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 3v1m0 16v1M3 12h1m16 0h1M5.6 5.6l.7.7m12.1-.7l-.7.7M5.6 18.4l.7-.7m12.1.7l-.7-.7"/>
        <circle cx="12" cy="12" r="2"/>
        <path d="M12 14v2a2 2 0 0 0 2 2h2"/>
        <path d="M10 20h2a2 2 0 0 0 2-2v-2"/>
        <path d="M12 8V6a2 2 0 0 1 2-2h2"/>
        <path d="M10 4h2a2 2 0 0 1 2 2v2"/>
        <path d="M14 12h2a2 2 0 0 1 2 2v2"/>
        <path d="M20 10v2a2 2 0 0 1-2 2h-2"/>
        <path d="M8 12H6a2 2 0 0 0-2 2v2"/>
        <path d="M4 10v2a2 2 0 0 0 2 2h2"/>
    </svg>
);

export const StellarMetamorphIcon = ({className="h-6 w-6"}) => ( // Stellar Metamorph
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 12a5.25 5.25 0 1 1 10.5 0 5.25 5.25 0 0 1-10.5 0Z" /><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 12a8.25 8.25 0 1 1 16.5 0 8.25 8.25 0 0 1-16.5 0Z" /><path strokeLinecap="round" strokeLinejoin="round" d="M12 1.5a10.5 10.5 0 0 0-10.5 10.5v.75" /><path strokeLinecap="round" strokeLinejoin="round" d="M12 22.5a10.5 10.5 0 0 1-10.5-10.5v-.75" /><path strokeLinecap="round" strokeLinejoin="round" d="M1.5 12a10.5 10.5 0 0 0 10.5 10.5h.75" /><path strokeLinecap="round" strokeLinejoin="round" d="M22.5 12a10.5 10.5 0 0 1-10.5 10.5h-.75" /></svg>
);

// General purpose Memic icon for vectors
export const MemicIcon = ({className = "h-6 w-6"}) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 3v1m0 16v1M3 12h1m16 0h1M5.6 5.6l.7.7m12.1-.7l-.7.7M5.6 18.4l.7-.7m12.1.7l-.7-.7"/>
        <circle cx="12" cy="12" r="2"/>
        <path d="M12 14v2a2 2 0 0 0 2 2h2"/>
        <path d="M10 20h2a2 2 0 0 0 2-2v-2"/>
        <path d="M12 8V6a2 2 0 0 1 2-2h2"/>
        <path d="M10 4h2a2 2 0 0 1 2 2v2"/>
        <path d="M14 12h2a2 2 0 0 1 2 2v2"/>
        <path d="M20 10v2a2 2 0 0 1-2 2h-2"/>
        <path d="M8 12H6a2 2 0 0 0-2 2v2"/>
        <path d="M4 10v2a2 2 0 0 0 2 2h2"/>
    </svg>
);