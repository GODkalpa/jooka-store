import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import ColorSelector from '@/components/ui/ColorSelector';
import SizeSelector from '@/components/ui/SizeSelector';

describe('ColorSelector', () => {
  const mockOnChange = jest.fn();

  beforeEach(() => {
    mockOnChange.mockClear();
  });

  it('renders correctly with empty colors', () => {
    render(<ColorSelector colors={[]} onChange={mockOnChange} />);
    
    expect(screen.getByText('Colors *')).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Enter color name/)).toBeInTheDocument();
    expect(screen.getByText('Add at least one color option for this product')).toBeInTheDocument();
  });

  it('allows adding a new color', () => {
    render(<ColorSelector colors={[]} onChange={mockOnChange} />);
    
    const input = screen.getByPlaceholderText(/Enter color name/);
    const addButton = screen.getByText('Add');
    
    fireEvent.change(input, { target: { value: 'Red' } });
    fireEvent.click(addButton);
    
    expect(mockOnChange).toHaveBeenCalledWith(['Red']);
  });

  it('displays existing colors with remove buttons', () => {
    render(<ColorSelector colors={['Red', 'Blue']} onChange={mockOnChange} />);
    
    expect(screen.getByText('Red')).toBeInTheDocument();
    expect(screen.getByText('Blue')).toBeInTheDocument();
    expect(screen.getAllByRole('button')).toHaveLength(3); // 2 remove buttons + 1 add button
  });

  it('allows removing colors', () => {
    render(<ColorSelector colors={['Red', 'Blue']} onChange={mockOnChange} />);
    
    const removeButtons = screen.getAllByRole('button').filter(btn => 
      btn.querySelector('svg') && !btn.textContent?.includes('Add')
    );
    
    fireEvent.click(removeButtons[0]);
    
    expect(mockOnChange).toHaveBeenCalledWith(['Blue']);
  });

  it('shows error message when provided', () => {
    render(<ColorSelector colors={[]} onChange={mockOnChange} error="At least one color is required" />);
    
    expect(screen.getByText('At least one color is required')).toBeInTheDocument();
  });

  it('prevents adding duplicate colors', () => {
    render(<ColorSelector colors={['Red']} onChange={mockOnChange} />);
    
    const input = screen.getByPlaceholderText(/Enter color name/);
    const addButton = screen.getByText('Add');
    
    fireEvent.change(input, { target: { value: 'Red' } });
    
    expect(addButton).toBeDisabled();
  });
});

describe('SizeSelector', () => {
  const mockOnChange = jest.fn();

  beforeEach(() => {
    mockOnChange.mockClear();
  });

  it('renders correctly with empty sizes', () => {
    render(<SizeSelector sizes={[]} onChange={mockOnChange} />);
    
    expect(screen.getByText('Sizes *')).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Enter custom size/)).toBeInTheDocument();
    expect(screen.getByText('Add at least one size option for this product')).toBeInTheDocument();
  });

  it('shows size preset buttons', () => {
    render(<SizeSelector sizes={[]} onChange={mockOnChange} />);
    
    expect(screen.getByText('Clothing (XS-XXL)')).toBeInTheDocument();
    expect(screen.getByText('Shoes (6-12)')).toBeInTheDocument();
    expect(screen.getByText('Numeric (28-46)')).toBeInTheDocument();
  });

  it('allows adding a custom size', () => {
    render(<SizeSelector sizes={[]} onChange={mockOnChange} />);
    
    const input = screen.getByPlaceholderText(/Enter custom size/);
    const addButton = screen.getByText('Add');
    
    fireEvent.change(input, { target: { value: 'XL' } });
    fireEvent.click(addButton);
    
    expect(mockOnChange).toHaveBeenCalledWith(['XL']);
  });

  it('applies clothing preset sizes', () => {
    render(<SizeSelector sizes={[]} onChange={mockOnChange} />);
    
    const clothingButton = screen.getByText('Clothing (XS-XXL)');
    fireEvent.click(clothingButton);
    
    expect(mockOnChange).toHaveBeenCalledWith(['XS', 'S', 'M', 'L', 'XL', 'XXL']);
  });

  it('displays existing sizes with remove buttons', () => {
    render(<SizeSelector sizes={['S', 'M', 'L']} onChange={mockOnChange} />);
    
    expect(screen.getByText('S')).toBeInTheDocument();
    expect(screen.getByText('M')).toBeInTheDocument();
    expect(screen.getByText('L')).toBeInTheDocument();
  });

  it('shows error message when provided', () => {
    render(<SizeSelector sizes={[]} onChange={mockOnChange} error="At least one size is required" />);
    
    expect(screen.getByText('At least one size is required')).toBeInTheDocument();
  });
});
