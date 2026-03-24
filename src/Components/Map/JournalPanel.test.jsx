import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import JournalPanel from './JournalPanel'

vi.mock('../../services/api', () => ({
  getJournals: vi.fn(),
  createJournal: vi.fn(),
  updateJournal: vi.fn(),
  deleteJournal: vi.fn(),
}))

import { getJournals, updateJournal, deleteJournal } from '../../services/api'

const defaultProps = {
  city: 'Austin',
  stateCode: 'TX',
  onClose: vi.fn(),
  onJournalAdded: vi.fn(),
}

describe('JournalPanel', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
  })

  it('shows a login prompt when no auth token is present', () => {
    render(<JournalPanel {...defaultProps} />)

    expect(
      screen.getByText(/Log in to see and add journal entries/i)
    ).toBeInTheDocument()
  })

  it('renders the city name and state code in the header', () => {
    render(<JournalPanel {...defaultProps} />)

    expect(screen.getByText('Austin')).toBeInTheDocument()
    expect(screen.getByText('TX')).toBeInTheDocument()
  })

  it('calls onClose when the close button is clicked', () => {
    const onClose = vi.fn()
    render(<JournalPanel {...defaultProps} onClose={onClose} />)

    fireEvent.click(screen.getByLabelText('Close journal panel'))

    expect(onClose).toHaveBeenCalledOnce()
  })

  it('shows journal entries and Add Journal button when logged in', async () => {
    localStorage.setItem('token', 'fake-token')
    getJournals.mockResolvedValueOnce({
      journals: [
        {
          _id: 'j1',
          title: 'SXSW Weekend',
          location_name: 'Austin',
          state_code: 'TX',
        },
      ],
    })

    render(<JournalPanel {...defaultProps} />)

    await waitFor(() =>
      expect(screen.getByText('SXSW Weekend')).toBeInTheDocument()
    )
    expect(screen.getByRole('button', { name: '+ Add Journal' })).toBeInTheDocument()
  })

  it('shows an empty-state message when logged in but no journals exist for the city', async () => {
    localStorage.setItem('token', 'fake-token')
    getJournals.mockResolvedValueOnce({ journals: [] })

    render(<JournalPanel {...defaultProps} />)

    await waitFor(() =>
      expect(
        screen.getByText(`No journal entries for Austin yet.`)
      ).toBeInTheDocument()
    )
  })

  it('shows an error message when the API call fails', async () => {
    localStorage.setItem('token', 'fake-token')
    getJournals.mockRejectedValueOnce({ message: 'Could not load journals' })

    render(<JournalPanel {...defaultProps} />)

    await waitFor(() =>
      expect(screen.getByText('Could not load journals')).toBeInTheDocument()
    )
  })

  it('reveals the JournalForm when Add Journal is clicked', async () => {
    localStorage.setItem('token', 'fake-token')
    getJournals.mockResolvedValueOnce({ journals: [] })

    render(<JournalPanel {...defaultProps} />)

    await waitFor(() =>
      expect(screen.getByRole('button', { name: '+ Add Journal' })).toBeInTheDocument()
    )

    fireEvent.click(screen.getByRole('button', { name: '+ Add Journal' }))

    expect(screen.getByText('New Journal Entry')).toBeInTheDocument()
  })

  it('removes a journal entry from the list after successful delete', async () => {
    localStorage.setItem('token', 'fake-token')
    getJournals.mockResolvedValueOnce({
      journals: [
        { _id: 'j1', title: 'SXSW Weekend', location_name: 'Austin', state_code: 'TX' },
        { _id: 'j2', title: 'ACL Fest', location_name: 'Austin', state_code: 'TX' },
      ],
    })
    deleteJournal.mockResolvedValueOnce(null)

    render(<JournalPanel {...defaultProps} />)

    await waitFor(() =>
      expect(screen.getByText('SXSW Weekend')).toBeInTheDocument()
    )

    fireEvent.click(screen.getByLabelText('Delete journal SXSW Weekend'))

    await waitFor(() =>
      expect(screen.queryByText('SXSW Weekend')).not.toBeInTheDocument()
    )
    expect(screen.getByText('ACL Fest')).toBeInTheDocument()
  })

  it('shows the edit form inline when the edit button is clicked', async () => {
    localStorage.setItem('token', 'fake-token')
    getJournals.mockResolvedValueOnce({
      journals: [
        { _id: 'j1', title: 'SXSW Weekend', body: 'Great time', location_name: 'Austin', state_code: 'TX' },
      ],
    })

    render(<JournalPanel {...defaultProps} />)

    await waitFor(() =>
      expect(screen.getByText('SXSW Weekend')).toBeInTheDocument()
    )

    fireEvent.click(screen.getByLabelText('Edit journal SXSW Weekend'))

    expect(screen.getByText('Edit Journal Entry')).toBeInTheDocument()
    expect(screen.getByDisplayValue('SXSW Weekend')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Great time')).toBeInTheDocument()
  })

  it('closes the edit form and re-fetches after a successful update', async () => {
    localStorage.setItem('token', 'fake-token')
    getJournals
      .mockResolvedValueOnce({
        journals: [
          { _id: 'j1', title: 'SXSW Weekend', location_name: 'Austin', state_code: 'TX' },
        ],
      })
      .mockResolvedValueOnce({
        journals: [
          { _id: 'j1', title: 'SXSW Weekend (edited)', location_name: 'Austin', state_code: 'TX' },
        ],
      })
    updateJournal.mockResolvedValueOnce({})

    render(<JournalPanel {...defaultProps} />)

    await waitFor(() =>
      expect(screen.getByText('SXSW Weekend')).toBeInTheDocument()
    )

    fireEvent.click(screen.getByLabelText('Edit journal SXSW Weekend'))

    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'Update' })).toBeInTheDocument()
    )

    fireEvent.click(screen.getByRole('button', { name: 'Update' }))

    await waitFor(() =>
      expect(screen.getByText('SXSW Weekend (edited)')).toBeInTheDocument()
    )
    expect(screen.queryByText('Edit Journal Entry')).not.toBeInTheDocument()
  })

  it('shows a delete error message when the delete API call fails', async () => {
    localStorage.setItem('token', 'fake-token')
    getJournals.mockResolvedValueOnce({
      journals: [
        { _id: 'j1', title: 'SXSW Weekend', location_name: 'Austin', state_code: 'TX' },
      ],
    })
    deleteJournal.mockRejectedValueOnce({ message: 'Delete failed' })

    render(<JournalPanel {...defaultProps} />)

    await waitFor(() =>
      expect(screen.getByText('SXSW Weekend')).toBeInTheDocument()
    )

    fireEvent.click(screen.getByLabelText('Delete journal SXSW Weekend'))

    await waitFor(() =>
      expect(screen.getByText('Delete failed')).toBeInTheDocument()
    )
    expect(screen.getByText('SXSW Weekend')).toBeInTheDocument()
  })
})
