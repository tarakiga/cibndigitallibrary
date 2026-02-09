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
  beforeEach(() => {
    jest.resetModules()
    jest.clearAllMocks()
    localStorageMock.getItem.mockClear()
    localStorageMock.setItem.mockClear()
    localStorageMock.removeItem.mockClear()
    mockDispatchEvent.mockClear()
  })

  const buildAxiosInstance = () => ({
    interceptors: {
      request: { use: jest.fn() },
      response: { use: jest.fn() },
    },
    defaults: {},
  })

  const loadClient = (env: Record<string, string | undefined>) => {
    mockedAxios = require('axios')
    mockedAxios.isAxiosError = jest.fn((value: any) => !!(value && typeof value === 'object' && 'response' in value))
    mockedAxios.create.mockImplementation(() => buildAxiosInstance())
    const originalEnv = { ...process.env }
    Object.entries(env).forEach(([key, value]) => {
      if (value === undefined) {
        delete process.env[key]
      } else {
        process.env[key] = value
      }
    })
    jest.isolateModules(() => {
      require('../client')
    })
    process.env = originalEnv
  }

  it('creates axios instance with correct configuration', () => {
    loadClient({
      NODE_ENV: 'development',
      NEXT_PUBLIC_API_URL: 'http://localhost:8000/api/v1',
      NEXT_PUBLIC_API_BASE_URL: undefined,
    })
    expect(mockedAxios.create).toHaveBeenCalledWith(
      expect.objectContaining({
        baseURL: 'http://localhost:8000/api/v1',
        timeout: 30000,
        headers: {
          'Content-Type': 'application/json',
        },
        withCredentials: true,
      })
    )
  })

  it('adds authorization header when token exists', () => {
    const mockToken = 'test-token'
    localStorageMock.getItem.mockReturnValue(mockToken)

    loadClient({
      NODE_ENV: 'development',
      NEXT_PUBLIC_API_URL: 'http://localhost:8000/api/v1',
      NEXT_PUBLIC_API_BASE_URL: undefined,
    })

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

    loadClient({
      NODE_ENV: 'development',
      NEXT_PUBLIC_API_URL: 'http://localhost:8000/api/v1',
      NEXT_PUBLIC_API_BASE_URL: undefined,
    })

    const requestInterceptor = mockedAxios.create.mock.results[0].value.interceptors.request.use.mock.calls[0][0]
    
    const config = {
      headers: {},
      url: '/test',
      method: 'get',
    }

    const result = requestInterceptor(config)

    expect(result.headers.Authorization).toBeUndefined()
  })

  it('handles 401 unauthorized response', async () => {
    loadClient({
      NODE_ENV: 'development',
      NEXT_PUBLIC_API_URL: 'http://localhost:8000/api/v1',
      NEXT_PUBLIC_API_BASE_URL: undefined,
    })

    const responseInterceptor = mockedAxios.create.mock.results[0].value.interceptors.response.use.mock.calls[0][1]
    
    const error = {
      response: {
        status: 401,
      },
      config: { _retry: true },
    }

    await responseInterceptor(error).catch(() => undefined)

    expect(localStorageMock.removeItem).toHaveBeenCalledWith('access_token')
    expect(localStorageMock.removeItem).toHaveBeenCalledWith('user')
    expect(mockDispatchEvent).toHaveBeenCalledWith(new Event('auth:logout'))
  })

  it('does not handle non-401 errors', async () => {
    loadClient({
      NODE_ENV: 'development',
      NEXT_PUBLIC_API_URL: 'http://localhost:8000/api/v1',
      NEXT_PUBLIC_API_BASE_URL: undefined,
    })

    const responseInterceptor = mockedAxios.create.mock.results[0].value.interceptors.response.use.mock.calls[0][1]
    
    const error = {
      response: {
        status: 500,
      },
      config: {},
    }

    await responseInterceptor(error).catch(() => undefined)

    expect(localStorageMock.removeItem).not.toHaveBeenCalled()
    expect(mockDispatchEvent).not.toHaveBeenCalled()
  })

  it('handles errors without response', async () => {
    loadClient({
      NODE_ENV: 'development',
      NEXT_PUBLIC_API_URL: 'http://localhost:8000/api/v1',
      NEXT_PUBLIC_API_BASE_URL: undefined,
    })

    const responseInterceptor = mockedAxios.create.mock.results[0].value.interceptors.response.use.mock.calls[0][1]
    
    const error = {
      message: 'Network error',
    }

    await responseInterceptor(error).catch(() => undefined)

    expect(localStorageMock.removeItem).not.toHaveBeenCalled()
    expect(mockDispatchEvent).not.toHaveBeenCalled()
  })

  it('uses environment variable for API base URL', () => {
    loadClient({
      NODE_ENV: 'development',
      NEXT_PUBLIC_API_URL: undefined,
      NEXT_PUBLIC_API_BASE_URL: 'https://api.example.com/v1',
    })

    expect(mockedAxios.create).toHaveBeenCalledWith(
      expect.objectContaining({
        baseURL: 'https://api.example.com/v1',
      })
    )
  })

  it('falls back to default API URL when environment variable is not set', () => {
    loadClient({
      NODE_ENV: 'development',
      NEXT_PUBLIC_API_URL: undefined,
      NEXT_PUBLIC_API_BASE_URL: undefined,
    })

    expect(mockedAxios.create).toHaveBeenCalledWith(
      expect.objectContaining({
        baseURL: 'http://localhost:8000/api/v1',
      })
    )
  })
})
