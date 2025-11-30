import { updateTraitVector } from './traits';

test('updateTraitVector increases trait on positive reward', () => {
  const traits = { positivity: 0.5 };
  const updated = updateTraitVector(traits, 1, 0.1);
  expect(updated.positivity).toBeGreaterThan(0.5);
});

test('updateTraitVector decreases trait on negative reward', () => {
  const traits = { positivity: 0.5 };
  const updated = updateTraitVector(traits, -1, 0.1);
  expect(updated.positivity).toBeLessThan(0.5);
});

test('updateTraitVector clips trait to [0,1]', () => {
  const traits = { positivity: 0.99 };
  const updated = updateTraitVector(traits, 1, 0.2);
  expect(updated.positivity).toBeLessThanOrEqual(1);
  const traits2 = { positivity: 0.01 };
  const updated2 = updateTraitVector(traits2, -1, 0.2);
  expect(updated2.positivity).toBeGreaterThanOrEqual(0);
});
