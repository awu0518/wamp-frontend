import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import JournalForm from './JournalForm'

vi.mock('../../services/api', () => ({
  createJournal: vi.fn(),
}))

import { createJournal } from '../../services/api'

const defaultProps = {
  city: 'New York',
  stateCode: 'NY',
  onSuccess: vi.fn(),
  onCancel: vi.fn(),
}

describe('JournalForm', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders all form fields and action buttons', () => {
    render(<JournalForm {...defaultProps} />)

    expect(screen.getByPlaceholderText('e.g. Weekend in the city')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('What did you do there?')).toBeInTheDocument()
    expect(screen.getByText('Date visited')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument()
  })

  it('disables the Save button when title is empty', () => {
    render(<JournalForm {...defaultProps} />)

    expect(screen.getByRole('button', { name: 'Save' })).toBeDisabled()
  })

  it('enables Save button once a title is typed', () => {
    render(<JournalForm {...defaultProps} />)

    fireEvent.change(screen.getByPlaceholderText('e.g. Weekend in the city'), {
      target: { value: 'My Trip' },
    })

    expect(screen.getByRole('button', { name: 'Save' })).not.toBeDisabled()
  })

  it('calls onCancel when the Cancel button is clicked', () => {
    render(<JournalForm {...defaultProps} />)

    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }))

    expect(defaultProps.onCancel).toHaveBeenCalledOnce()
  })

  it('calls onSuccess after a successful API submission', async () => {
    createJournal.mockResolvedValueOnce({})
    render(<JournalForm {...defaultProps} />)

    fireEvent.change(screen.getByPlaceholderText('e.g. Weekend in the city'), {
      target: { value: 'Weekend Getaway' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Save' }))

    await waitFor(() => expect(defaultProps.onSuccess).toHaveBeenCalledOnce())
  })

  it('shows an error message when the API call fails', async () => {
    createJournal.mockRejectedValueOnce({ message: 'Network error' })
    render(<JournalForm {...defaultProps} />)

    fireEvent.change(screen.getByPlaceholderText('e.g. Weekend in the city'), {
      target: { value: 'Failed Trip' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Save' }))

    await waitFor(() =>
      expect(screen.getByText('Network error')).toBeInTheDocument()
    )
  })

  it('shows "Saving…" on the button while the request is in flight', async () => {
    let resolve
    createJournal.mockReturnValueOnce(new Promise((r) => { resolve = r }))
    render(<JournalForm {...defaultProps} />)

    fireEvent.change(screen.getByPlaceholderText('e.g. Weekend in the city'), {
      target: { value: 'In-flight test' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Save' }))

    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'Saving…' })).toBeInTheDocument()
    )

    await waitFor(() => { resolve({}) })
  })
})
