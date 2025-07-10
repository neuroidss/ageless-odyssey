import { type TrajectoryState, type Intervention, type Biomarker, type TrajectoryDataPoint } from '../types';

const CURRENT_YEAR = new Date().getFullYear();
const CURRENT_AGE = 40; // Simulated user age

const BIOMARKER_DEFS: Omit<Biomarker, 'history' | 'projection'>[] = [
    { id: 'telomere_length', name: 'Telomere Length', description: 'Average length of protective caps on chromosomes.', unit: 'kbp', trendDirection: 'up' },
    { id: 'senescent_cells', name: 'Senescent Cell Load', description: 'Percentage of non-dividing, inflammatory cells.', unit: '%', trendDirection: 'down' },
    { id: 'mito_efficiency', name: 'Mitochondrial Efficiency', description: 'ATP production capacity of mitochondria.', unit: '%', trendDirection: 'up' },
    { id: 'epigenetic_noise', name: 'Epigenetic Noise', description: 'Accumulated errors in gene expression patterns.', unit: 'au', trendDirection: 'down' },
    { id: 'proteostasis', name: 'Proteostasis', description: 'Cellular protein quality control effectiveness.', unit: '%', trendDirection: 'up' },
];

const INTERVENTIONS: Intervention[] = [
    { id: 'cr', name: 'Caloric Restriction', description: 'Reduces metabolic stress and nutrient-sensing pathways.', effects: { mito_efficiency: 0.1, epigenetic_noise: 0.08, proteostasis: 0.05 } },
    { id: 'senolytics', name: 'Senolytics', description: 'Selectively clear senescent cells from tissues.', effects: { senescent_cells: 0.3 } },
    { id: 'metformin', name: 'Metformin', description: 'Improves insulin sensitivity and mitochondrial function.', effects: { mito_efficiency: 0.15, senescent_cells: 0.05 } },
    { id: 'nad_precursors', name: 'NAD+ Precursors', description: 'Boosts levels of NAD+, a key coenzyme for DNA repair and metabolism.', effects: { telomere_length: 0.02, mito_efficiency: 0.1, proteostasis: 0.08 } },
];

const generateHistory = (startValue: number, yearlyChange: number): TrajectoryDataPoint[] => {
    const history: TrajectoryDataPoint[] = [];
    for (let i = 0; i < 5; i++) {
        const year = CURRENT_YEAR - (4 - i);
        history.push({ year, value: startValue + yearlyChange * i });
    }
    return history;
};

const generateProjection = (startValue: number, yearlyChange: number, years: number = 20): TrajectoryDataPoint[] => {
    const projection: TrajectoryDataPoint[] = [];
    for (let i = 0; i <= years; i++) {
        const year = CURRENT_YEAR + i;
        projection.push({ year, value: startValue + yearlyChange * i });
    }
    return projection;
};


let cachedState: TrajectoryState | null = null;

export const getInitialTrajectory = (): TrajectoryState => {
    if (cachedState) return cachedState;
    
    const baseValues = {
      telomere_length: { start: 7.5, change: -0.05 },
      senescent_cells: { start: 5, change: 0.3 },
      mito_efficiency: { start: 90, change: -0.8 },
      epigenetic_noise: { start: 20, change: 0.5 },
      proteostasis: { start: 95, change: -0.7 },
    };

    const biomarkers: Biomarker[] = BIOMARKER_DEFS.map(def => {
        const { start, change } = baseValues[def.id];
        const history = generateHistory(start, change);
        const currentValue = history[history.length - 1].value;
        const projection = generateProjection(currentValue, change);
        return { ...def, history, projection };
    });

    // Calculate overall score (simplified as an average of normalized values)
    const calculateScore = (yearOffset: number): number => {
      let totalScore = 0;
      biomarkers.forEach(b => {
          const base = baseValues[b.id];
          const val = (base.start + base.change * (4 + yearOffset));
          // Normalize to a 0-100 scale where 100 is good
          let normalized = b.trendDirection === 'up' ? (val / (base.start * 1.5)) * 100 : ((base.start * 2 - val) / (base.start * 2)) * 100;
          totalScore += Math.max(0, Math.min(100, normalized));
      });
      return totalScore / biomarkers.length;
    }

    const overallScoreHistory = Array.from({length: 5}, (_, i) => ({ year: CURRENT_YEAR - (4-i), value: calculateScore(i-4) }));
    const overallScoreProjection = Array.from({length: 21}, (_, i) => ({ year: CURRENT_YEAR + i, value: calculateScore(i) }));
    
    cachedState = {
        biomarkers,
        interventions: INTERVENTIONS,
        activeInterventionId: null,
        overallScore: {
            history: overallScoreHistory,
            projection: overallScoreProjection,
        }
    };
    return cachedState;
};

export const applyIntervention = (interventionId: string | null): TrajectoryState => {
    const state = getInitialTrajectory(); // Start with the clean, cached state
    if (!interventionId) {
        return { ...state, activeInterventionId: null, biomarkers: state.biomarkers.map(b => ({...b, interventionProjection: undefined})), overallScore: {...state.overallScore, interventionProjection: undefined} };
    }

    const intervention = INTERVENTIONS.find(i => i.id === interventionId);
    if (!intervention) return state;

    const newBiomarkers = state.biomarkers.map(biomarker => {
        const effect = intervention.effects[biomarker.id];
        if (!effect) return {...biomarker, interventionProjection: undefined };

        const baseChange = (biomarker.projection[1].value - biomarker.projection[0].value);
        // Improvement factor reduces the magnitude of negative change or increases positive change
        const interventionChange = biomarker.trendDirection === 'up' 
          ? baseChange + Math.abs(baseChange * effect)
          : baseChange - Math.abs(baseChange * effect);

        const interventionProjection = generateProjection(biomarker.projection[0].value, interventionChange);
        return { ...biomarker, interventionProjection };
    });

    // Recalculate overall score with intervention
    const calculateInterventionScore = (yearOffset: number): number => {
      let totalScore = 0;
       newBiomarkers.forEach(b => {
          const base = baseValues[b.id];
          const projectionData = b.interventionProjection || b.projection;
          const val = projectionData.find(p => p.year === CURRENT_YEAR + yearOffset)?.value || 0;
          let normalized = b.trendDirection === 'up' ? (val / (base.start * 1.5)) * 100 : ((base.start * 2 - val) / (base.start * 2)) * 100;
          totalScore += Math.max(0, Math.min(100, normalized));
      });
      return totalScore / newBiomarkers.length;
    }
    const overallInterventionProjection = Array.from({length: 21}, (_, i) => ({ year: CURRENT_YEAR + i, value: calculateInterventionScore(i) }));


    cachedState = { ...state, activeInterventionId: interventionId, biomarkers: newBiomarkers, overallScore: {...state.overallScore, interventionProjection: overallInterventionProjection } };
    return cachedState;
};

// Simple object to access base values outside the service if needed
const baseValues = {
  telomere_length: { start: 7.5, change: -0.05 },
  senescent_cells: { start: 5, change: 0.3 },
  mito_efficiency: { start: 90, change: -0.8 },
  epigenetic_noise: { start: 20, change: 0.5 },
  proteostasis: { start: 95, change: -0.7 },
};
