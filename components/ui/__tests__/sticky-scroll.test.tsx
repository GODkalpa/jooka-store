import { render, screen } from '@testing-library/react'
import StickyScrollComponent from '../sticky-scroll'

// Mock ReactLenis since it requires browser environment
jest.mock('lenis/react', () => ({
  ReactLenis: ({ children }: { children: React.ReactNode }) => <div data-testid="react-lenis">{children}</div>
}))

describe('StickyScrollComponent', () => {
  it('renders the main heading', () => {
    render(<StickyScrollComponent />)
    
    expect(screen.getByText('Our Story')).toBeInTheDocument()
    expect(screen.getByText('Through Time')).toBeInTheDocument()
  })

  it('renders the heritage section', () => {
    render(<StickyScrollComponent />)
    
    expect(screen.getByText('Heritage')).toBeInTheDocument()
  })

  it('renders the JOOKA brand name in footer', () => {
    render(<StickyScrollComponent />)
    
    expect(screen.getByText('JOOKA')).toBeInTheDocument()
  })

  it('renders all story milestone elements', () => {
    render(<StickyScrollComponent />)
    
    expect(screen.getByText('2019')).toBeInTheDocument()
    expect(screen.getByText('Craftsmanship')).toBeInTheDocument()
    expect(screen.getByText('Innovation')).toBeInTheDocument()
  })

  it('renders with ReactLenis wrapper', () => {
    render(<StickyScrollComponent />)
    
    expect(screen.getByTestId('react-lenis')).toBeInTheDocument()
  })
})
