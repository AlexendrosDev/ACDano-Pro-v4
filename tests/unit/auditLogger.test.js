import { describe, expect, test, jest } from '@jest/globals';
import AuditLogger from '../../src/shared/AuditLogger.js';

describe('AuditLogger', () => {
  test('formato de log estructurado', () => {
    const spy = jest.spyOn(console, 'log').mockImplementation(() => {});
    const entry = AuditLogger.log('calculo:start', { foo: 'bar' });
    expect(entry).toHaveProperty('ts');
    expect(entry).toHaveProperty('event', 'calculo:start');
    expect(entry).toHaveProperty('foo', 'bar');
    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });
});
