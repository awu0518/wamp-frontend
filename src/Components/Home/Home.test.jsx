import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import Home from './Home'

describe('Homepage', () => {
  it('matches snapshot', () => {
    const { container } = render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    )
    expect(container).toMatchSnapshot()
  })
})
