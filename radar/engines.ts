import type { DealAnalysis, DealEngine, MarketEngine, RiskAnalysis, RiskEngine } from './types';

export const notAnalyzedRisk = (): RiskAnalysis => ({ status: 'NOT_ANALYZED', score: null, reasons: [], version: 'foundation-1' });
export const notAnalyzedDeal = (): DealAnalysis => ({ classification: 'NOT_ANALYZED', marketMedianRub: null, marketP25Rub: null,
  marketP10Rub: null, deviationPercent: null, resaleMinRub: null, resaleMaxRub: null, profitRub: null,
  marketScore: null, profitScore: null, liquidityScore: null, personalScore: null, finalScore: null,
  risk: notAnalyzedRisk(), version: 'foundation-1', analyzedAt: null });
export const foundationRiskEngine: RiskEngine = { analyze: async () => notAnalyzedRisk() };
export const foundationMarketEngine: MarketEngine = { calculate: async () => null };
export const foundationDealEngine: DealEngine = { analyze: async () => notAnalyzedDeal() };
