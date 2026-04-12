import { transformForPublic } from '../transform';

describe('transformForPublic', () => {
  it('normalizes and formats the public payload', () => {
    const result = transformForPublic({
      cash: {
        blocked: 0,
        free: 200,
        invested: 800,
        pieCash: 0,
        ppl: 100,
        result: 0,
        total: 1000,
      },
      portfolio: [
        {
          ticker: 'ABC_L',
          quantity: 2,
          averagePrice: 10,
          currentPrice: 10,
          pieQuantity: 0,
          ppl: 20,
          initialFillDate: '2026-04-12T00:00:00.000Z',
        },
      ],
      pies: [{}],
      pieDetails: [],
    });

    expect(result.apiStatus.t212).toBe(true);
    expect(result.metrics).toMatchObject({
      totalValue: expect.stringContaining('£'),
      invested: expect.stringContaining('£'),
      freeCash: expect.stringContaining('£'),
      simpleReturnPct: '25.00%',
      profitLossPct: '+12.50%',
    });
    expect(result.positions).toHaveLength(1);
    expect(result.positions[0]).toMatchObject({
      symbol: 'ABC',
      marketValue: '£20.00',
      pct: '+100.00%',
      purchaseDate: '12 Apr 2026',
    });
  });
});
