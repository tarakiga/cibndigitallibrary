// Mock axios before importing modules under test to ensure axios.create is intercepted
jest.mock('axios')
let mockedAxios: any

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
})

// Mock window.dispatchEvent
const mockDispatchEvent = jest.fn()
Object.defineProperty(window, 'dispatchEvent', {
  value: mockDispatchEvent,
})

describe('API Client', () => {
  beforeAll(() => {
    mockedAxios = require('axios')
    require('../client')
  })

  beforeEach(() => {
    jest.clearAllMocks()
    localStorageMock.getItem.mockClear()
    localStorageMock.setItem.mockClear()
    localStorageMock.removeItem.mockClear()
    mockDispatchEvent.mockClear()
  })

it('creates axios instance with correct configuration', () => {
    // Module is required in beforeEach to trigger axios.create
    expect(mockedAxios.create).toHaveBeenCalledWith({
      baseURL: 'http://localhost:8000/api/v1',
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    })
  })

  it('adds authorization header when token exists', () => {
    const mockToken = 'test-token'
    localStorageMock.getItem.mockReturnValue(mockToken)

    // Mock the request interceptor
    const requestInterceptor = mockedAxios.create.mock.results[0].value.interceptors.request.use.mock.calls[0][0]
    
    const config = {
      headers: {},
      url: '/test',
      method: 'get',
    }

    const result = requestInterceptor(config)

    expect(result.headers.Authorization).toBe(`Bearer ${mockToken}`)
  })

  it('does not add authorization header when no token', () => {
    localStorageMock.getItem.mockReturnValue(null)

    // Mock the request interceptor
    const requestInterceptor = mockedAxios.create.mock.results[0].value.interceptors.request.use.mock.calls[0][0]
    
    const config = {
      headers: {},
      url: '/test',
      method: 'get',
    }

    const result = requestInterceptor(config)

    expect(result.headers.Authorization).toBeUndefined()
  })

  it('handles 401 unauthorized response', () => {
    // Mock the response interceptor
    const responseInterceptor = mockedAxios.create.mock.results[0].value.interceptors.response.use.mock.calls[0][1]
    
    const error = {
      response: {
        status: 401,
      },
    }

    responseInterceptor(error)

    expect(localStorageMock.removeItem).toHaveBeenCalledWith('access_token')
    expect(localStorageMock.removeItem).toHaveBeenCalledWith('user')
    expect(mockDispatchEvent).toHaveBeenCalledWith(new Event('auth:logout'))
  })

  it('does not handle non-401 errors', () => {
    // Mock the response interceptor
    const responseInterceptor = mockedAxios.create.mock.results[0].value.interceptors.response.use.mock.calls[0][1]
    
    const error = {
      response: {
        status: 500,
      },
    }

    responseInterceptor(error)

    expect(localStorageMock.removeItem).not.toHaveBeenCalled()
    expect(mockDispatchEvent).not.toHaveBeenCalled()
  })

  it('handles errors without response', () => {
    // Mock the response interceptor
    const responseInterceptor = mockedAxios.create.mock.results[0].value.interceptors.response.use.mock.calls[0][1]
    
    const error = {
      message: 'Network error',
    }

    responseInterceptor(error)

    expect(localStorageMock.removeItem).not.toHaveBeenCalled()
    expect(mockDispatchEvent).not.toHaveBeenCalled()
  })

  it('uses environment variable for API base URL', () => {
    const originalEnv = process.env.NEXT_PUBLIC_API_BASE_URL
    process.env.NEXT_PUBLIC_API_BASE_URL = 'https://api.example.com/v1'

    // Re-import to get the new environment variable
    jest.resetModules()
    require('../client')

    expect(mockedAxios.create).toHaveBeenCalledWith(
      expect.objectContaining({
        baseURL: 'https://api.example.com/v1',
      })
    )

    // Restore original environment
    process.env.NEXT_PUBLIC_API_BASE_URL = originalEnv
  })

  it('falls back to default API URL when environment variable is not set', () => {
    const originalEnv = process.env.NEXT_PUBLIC_API_BASE_URL
    delete process.env.NEXT_PUBLIC_API_BASE_URL

    // Re-import to get the default URL
    jest.resetModules()
    require('../client')

    expect(mockedAxios.create).toHaveBeenCalledWith(
      expect.objectContaining({
        baseURL: 'http://localhost:8000/api/v1',
      })
    )

    // Restore original environment
    process.env.NEXT_PUBLIC_API_BASE_URL = originalEnv
  })
})
