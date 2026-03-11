import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import StateSidebar from './StateSidebar'

const mockState = { name: 'New York', code: 'NY', capital: 'Albany' }

const defaultProps = {
  selectedState: mockState,
  cities: [],
  citiesLoading: false,
  citiesError: null,
  journalCounts: {},
  onClose: vi.fn(),
  onCityClick: vi.fn(),
}

describe('StateSidebar', () => {
  it('renders the state name, code, and capital', () => {
    render(<StateSidebar {...defaultProps} />)

    expect(screen.getByText('New York')).toBeInTheDocument()
    expect(screen.getByText('NY')).toBeInTheDocument()
    expect(screen.getByText('Capital: Albany')).toBeInTheDocument()
  })

  it('shows a loading spinner when citiesLoading is true', () => {
    render(<StateSidebar {...defaultProps} citiesLoading={true} />)

    expect(screen.getByText('Loading…')).toBeInTheDocument()
  })

  it('shows an error message when citiesError is set', () => {
    render(
      <StateSidebar {...defaultProps} citiesError="Failed to load cities" />
    )

    expect(screen.getByText('Failed to load cities')).toBeInTheDocument()
  })

  it('shows an empty-state message when there are no cities', () => {
    render(<StateSidebar {...defaultProps} cities={[]} />)

    expect(
      screen.getByText('No cities found for New York.')
    ).toBeInTheDocument()
  })

  it('renders a button for each city', () => {
    render(
      <StateSidebar
        {...defaultProps}
        cities={['Albany', 'Buffalo', 'Syracuse']}
      />
    )

    expect(screen.getByText('Albany')).toBeInTheDocument()
    expect(screen.getByText('Buffalo')).toBeInTheDocument()
    expect(screen.getByText('Syracuse')).toBeInTheDocument()
  })

  it('calls onCityClick with the city name when a city button is clicked', () => {
    const onCityClick = vi.fn()
    render(
      <StateSidebar
        {...defaultProps}
        cities={['Albany', 'Buffalo']}
        onCityClick={onCityClick}
      />
    )

    fireEvent.click(screen.getByText('Albany'))

    expect(onCityClick).toHaveBeenCalledWith('Albany')
    expect(onCityClick).toHaveBeenCalledOnce()
  })

  it('displays the journal count badge for cities that have journals', () => {
    render(
      <StateSidebar
        {...defaultProps}
        cities={['Albany', 'Buffalo']}
        journalCounts={{ Albany: 5 }}
      />
    )

    expect(screen.getByText('5')).toBeInTheDocument()
    expect(screen.queryByText('0')).not.toBeInTheDocument()
  })

  it('calls onClose when the close button is clicked', () => {
    const onClose = vi.fn()
    render(<StateSidebar {...defaultProps} onClose={onClose} />)

    fireEvent.click(screen.getByLabelText('Close panel'))

    expect(onClose).toHaveBeenCalledOnce()
  })
})
