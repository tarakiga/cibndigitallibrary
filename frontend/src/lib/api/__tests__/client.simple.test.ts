/**
 * Simple API Client Tests
 * Basic tests for the API client functionality
 */

describe('API Client', () => {
  it('should be importable', () => {
    expect(() => {
      require('../client')
    }).not.toThrow()
  })

  it('should have correct base URL configuration', () => {
    const { apiClient } = require('../client')
    expect(apiClient.defaults.baseURL).toBe('http://localhost:8000/api/v1')
  })

  it('should have correct timeout configuration', () => {
    const { apiClient } = require('../client')
    expect(apiClient.defaults.timeout).toBe(30000)
  })

  it('should have correct content type header', () => {
    const { apiClient } = require('../client')
    expect(apiClient.defaults.headers['Content-Type']).toBe('application/json')
  })
})
