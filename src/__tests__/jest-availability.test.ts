describe('Jest Availability', () => {
  it('should have jest available', () => {
    expect(jest).toBeDefined();
    expect(typeof jest.fn).toBe('function');
    expect(typeof jest.spyOn).toBe('function');
  });

  it('should be able to create mocks', () => {
    const mockFn = jest.fn();
    expect(mockFn).toBeDefined();
    expect(typeof mockFn).toBe('function');
  });

  it('should be able to spy on objects', () => {
    const obj = { method: () => 'test' };
    const spy = jest.spyOn(obj, 'method');
    expect(spy).toBeDefined();
  });
});
