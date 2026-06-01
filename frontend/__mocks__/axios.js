// CommonJS manual mock for axios to ensure Jest picks it reliably in all transforms
const mockAxiosInstance = () => {
  const instance = {
    interceptors: {
      request: { use: jest.fn() },
      response: { use: jest.fn() },
    },
    defaults: {
      baseURL: undefined,
      timeout: undefined,
      headers: {},
    },
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
    patch: jest.fn(),
  }
  return instance
}

const axiosMock = {
  create: jest.fn((config = {}) => {
    const instance = mockAxiosInstance()
    instance.defaults = {
      baseURL: config.baseURL,
      timeout: config.timeout,
      headers: config.headers || {},
    }
    return instance
  }),
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
  delete: jest.fn(),
  patch: jest.fn(),
}

module.exports = axiosMock
module.exports.default = axiosMock