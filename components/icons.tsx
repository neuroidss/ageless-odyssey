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

export const DnaIcon = ({className = "h-6 w-6"}) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 4c0 1.1.9 2 2 2s2-.9 2-2-.9-2-2-2-2 .9-2 2zM18 4c0 1.1.9 2 2 2s2-.9 2-2-.9-2-2-2-2 .9-2 2zM6 6s.5 2 2.5 2S11 6 11 6M13 18s.5-2 2.5-2 2.5 2 2.5 2M11 6c0 2.5 2 4.5 2 4.5s2-2 2-4.5M6 18c0-2.5 2-4.5 2-4.5S10 11.5 10 14"/>
        <path d="M4 11.5c0 2 2 4.5 2 4.5s2-2.5 2-4.5"/>
        <path d="M18 11.5c0 2-2 4.5-2 4.5s-2-2.5-2-4.5"/>
    </svg>
);

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

export const CognitiveIcon = ({className = "h-6 w-6"}) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2a10 10 0 0 0-3.5 19.33V18a2 2 0 0 1 2-2h3a2 2 0 0 1 2 2v3.33A10 10 0 0 0 12 2Z"/>
        <path d="M8 18a4 4 0 0 0 4 4 4 4 0 0 0 4-4h-8Z"/>
        <path d="M12 12a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"/>
        <path d="M19.33 15.5a2 2 0 0 1 0-7"/>
        <path d="M4.67 15.5a2 2 0 0 0 0-7"/>
    </svg>
);

export const AscensionIcon = ({className = "h-6 w-6"}) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2.6l3.3 6.6 7.3.9-5.4 5.1 1.4 7.2L12 19l-6.6 3.4 1.4-7.2-5.4-5.1 7.3-.9L12 2.6z M12 5.5l-2.2 4.4-4.9.6 3.6 3.4-.9 4.8L12 16.3l4.4 2.2-.9-4.8 3.6-3.4-4.9-.6L12 5.5z"/>
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
