import { type TrajectoryState, type Intervention, type Biomarker, type TrajectoryDataPoint } from '../types';
import { INTERVENTIONS } from '../constants';

const CURRENT_YEAR = new Date().getFullYear();
const CURRENT_AGE = 100; // Simulated user age

const BIOMARKER_DEFS: Omit<Biomarker, 'history' | 'projection'>[] = [
    { id: 'telomere_length', name: 'Telomere Length', description: 'Average length of protective caps on chromosomes.', unit: 'kbp', trendDirection: 'up' },
    { id: 'senescent_cells', name: 'Senescent Cell Load', description: 'Percentage of non-dividing, inflammatory cells.', unit: '%', trendDirection: 'down' },
    { id: 'mito_efficiency', name: 'Mitochondrial Efficiency', description: 'ATP production capacity of mitochondria.', unit: '%', trendDirection: 'up' },
    { id: 'epigenetic_noise', name: 'Epigenetic Noise', description: 'Accumulated errors in gene expression patterns.', unit: 'au', trendDirection: 'down' },
    { id: 'proteostasis', name: 'Proteostasis', description: 'Cellular protein quality control effectiveness.', unit: '%', trendDirection: 'up' },
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

export const getInitialTrajectory = (): TrajectoryState => {
    const baseValues = {
      telomere_length: { start: 7.5, change: -0.05, optimal: 10.0 },
      senescent_cells: { start: 5, change: 0.3, optimal: 0 },
      mito_efficiency: { start: 90, change: -0.8, optimal: 100 },
      epigenetic_noise: { start: 20, change: 0.5, optimal: 0 },
      proteostasis: { start: 95, change: -0.7, optimal: 100 },
    };

    const biomarkers: Biomarker[] = BIOMARKER_DEFS.map(def => {
        const { start, change } = baseValues[def.id];
        const history = generateHistory(start, change);
        const currentValue = history[history.length - 1].value;
        const projection = generateProjection(currentValue, change);
        return { ...def, history, projection, bypassed: false };
    });

    const interventionsWithStatus = INTERVENTIONS.map(i => ({
        ...i,
        // Basic interventions start unlocked, others are locked.
        status: i.id === 'cr' ? 'unlocked' : 'locked',
    } as (Intervention & { sophistication: number })));

    // Calculate overall score (simplified as a biological age)
    const calculateBioAge = (yearOffset: number): number => {
      // This is a simplified model. A real one would be more complex.
      // Starts at 100 (chrono age) and increases based on biomarker degradation.
      let age = CURRENT_AGE + yearOffset;
      let deviation = 0;
      biomarkers.forEach(b => {
          const base = baseValues[b.id];
          const val = b.projection.find(p => p.year === CURRENT_YEAR + yearOffset)?.value || 0;
          const pct_from_start = (val - base.start) / base.start;
          deviation += (b.trendDirection === 'up' ? -1 : 1) * pct_from_start * 20; // Heuristic factor
      });
      return age + (deviation / biomarkers.length);
    }

    const overallScoreHistory = Array.from({length: 5}, (_, i) => ({ year: CURRENT_YEAR - (4-i), value: calculateBioAge(i-4) }));
    const overallScoreProjection = Array.from({length: 21}, (_, i) => ({ year: CURRENT_YEAR + i, value: calculateBioAge(i) }));
    
    return {
        biomarkers,
        interventions: interventionsWithStatus,
        activeInterventionId: null,
        isRadicalInterventionActive: false,
        overallScore: {
            history: overallScoreHistory,
            projection: overallScoreProjection,
        }
    };
};

export const applyIntervention = (currentState: TrajectoryState, interventionId: string | null): TrajectoryState => {
    // Re-calculate baseline from initial principles to ensure intervention effects don't stack improperly
    const baselineState = getInitialTrajectory();
    const state = { ...baselineState, interventions: currentState.interventions }; // Use current intervention statuses

    if (!interventionId) {
        return { ...state, activeInterventionId: null, isRadicalInterventionActive: false, biomarkers: state.biomarkers.map(b => ({...b, interventionProjection: undefined})), overallScore: {...state.overallScore, interventionProjection: undefined} };
    }

    const intervention = state.interventions.find(i => i.id === interventionId);
    if (!intervention || intervention.status === 'locked') return state;
    
    const baseValues = {
      telomere_length: { start: 7.5, change: -0.05, optimal: 10.0 },
      senescent_cells: { start: 5, change: 0.3, optimal: 0 },
      mito_efficiency: { start: 90, change: -0.8, optimal: 100 },
      epigenetic_noise: { start: 20, change: 0.5, optimal: 0 },
      proteostasis: { start: 95, change: -0.7, optimal: 100 },
    };

    // Radical interventions that bypass biology
    if (intervention.type === 'radical' && intervention.effects.all_biomarkers) {
        const newBiomarkers = state.biomarkers.map(biomarker => {
             const base = baseValues[biomarker.id];
             const optimalProjection = generateProjection(base.optimal, 0); // Flatline at optimal
             return { ...biomarker, interventionProjection: optimalProjection, bypassed: true };
        });
        const newBioAge = 20; // The new "effective" biological age is a constant 20
        const overallInterventionProjection = generateProjection(newBioAge, 0);

        return { ...state, activeInterventionId: interventionId, isRadicalInterventionActive: true, biomarkers: newBiomarkers, overallScore: {...state.overallScore, interventionProjection: overallInterventionProjection } };
    }

    // Handle biological, environmental, and non-bypassing radical interventions
    const newBiomarkers = state.biomarkers.map(biomarker => {
        const effect = intervention.effects[biomarker.id];
        if (effect === undefined) return {...biomarker, interventionProjection: undefined, bypassed: false };

        const baseChange = (biomarker.projection[1].value - biomarker.projection[0].value);
        // Improvement factor reduces the magnitude of negative change or increases positive change
        const interventionChange = biomarker.trendDirection === 'up' 
          ? baseChange + Math.abs(baseChange * effect)
          : baseChange - Math.abs(baseChange * effect);

        const interventionProjection = generateProjection(biomarker.projection[0].value, interventionChange);
        return { ...biomarker, interventionProjection, bypassed: false };
    });

    // Recalculate overall score with intervention
    const calculateInterventionBioAge = (yearOffset: number): number => {
      let age = CURRENT_AGE + yearOffset;
      let deviation = 0;
       newBiomarkers.forEach(b => {
          const base = baseValues[b.id];
          const projectionData = b.interventionProjection || b.projection;
          const val = projectionData.find(p => p.year === CURRENT_YEAR + yearOffset)?.value || 0;
          const pct_from_start = (val - base.start) / base.start;
          deviation += (b.trendDirection === 'up' ? -1 : 1) * pct_from_start * 20;
      });
      return age + (deviation / newBiomarkers.length);
    }
    const overallInterventionProjection = Array.from({length: 21}, (_, i) => ({ year: CURRENT_YEAR + i, value: calculateInterventionBioAge(i) }));

    return { ...state, activeInterventionId: interventionId, isRadicalInterventionActive: false, biomarkers: newBiomarkers, overallScore: {...state.overallScore, interventionProjection: overallInterventionProjection } };
};