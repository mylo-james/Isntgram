import '@testing-library/jest-dom';

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
};

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
};

// Mock URL.createObjectURL for file uploads
global.URL.createObjectURL = jest.fn(() => 'mocked-url');

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
global.localStorage = localStorageMock;

// Mock sessionStorage
const sessionStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
global.sessionStorage = sessionStorageMock;

// Mock fetch globally
global.fetch = jest.fn();

// Polyfill Response constructor for tests
if (typeof Response === 'undefined') {
  global.Response = class Response {
    public ok: boolean;
    public status: number;
    public statusText: string;
    public headers: Headers;
    private _body: string;

    constructor(body?: string, init?: ResponseInit) {
      this._body = body || '';
      this.ok = (init?.status || 200) < 400;
      this.status = init?.status || 200;
      this.statusText = init?.statusText || '';
      this.headers = new Headers(init?.headers);
    }

    async json() {
      return JSON.parse(this._body);
    }

    async text() {
      return this._body;
    }
  } as any;
}

// Setup modal element for react-modal
beforeEach(() => {
  // Create a div element for react-modal
  const modalRoot = document.createElement('div');
  modalRoot.setAttribute('id', 'root');
  document.body.appendChild(modalRoot);

  // Also create a modal root for react-modal
  const modalPortal = document.createElement('div');
  modalPortal.setAttribute('id', 'modal-root');
  document.body.appendChild(modalPortal);
});

afterEach(() => {
  // Clean up modal roots
  const modalRoot = document.getElementById('root');
  if (modalRoot) {
    document.body.removeChild(modalRoot);
  }

  const modalPortal = document.getElementById('modal-root');
  if (modalPortal) {
    document.body.removeChild(modalPortal);
  }
});
