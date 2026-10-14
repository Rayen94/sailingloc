import * as matchers from '@testing-library/jest-dom/matchers';
import { afterEach, expect } from 'vitest';
import { cleanup } from '@testing-library/react';

// Ajoute les vérifications de Testing Library (toBeInTheDocument, toBeDisabled...).
expect.extend(matchers);

afterEach(() => {
  cleanup();
  localStorage.clear();
  document.head.querySelectorAll('script#sailingloc-gtm').forEach((script) => script.remove());
});
