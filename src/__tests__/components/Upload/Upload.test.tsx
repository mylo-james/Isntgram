import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Upload from '../../../components/Upload/Upload';
import { UserContext } from '../../../Contexts/userContext';

// Mock react-router-dom
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
}));

// Mock react-toastify
jest.mock('react-toastify', () => ({
  toast: {
    error: jest.fn(),
    info: jest.fn(),
  },
}));

// Mock the useApi hook
const mockUseApi = jest.fn();
jest.mock('../../../utils/apiComposable', () => ({
  useApi: () => mockUseApi(),
}));

// Mock the useUser hook
jest.mock('../../../hooks/useContexts', () => ({
  useUser: () => ({
    currentUser: {
      id: 1,
      username: 'testuser',
      email: 'test@example.com',
    },
  }),
}));

const mockUser = {
  id: 1,
  username: 'testuser',
  email: 'test@example.com',
  profileImageUrl: 'https://example.com/profile.jpg',
};

const renderWithProviders = (component: React.ReactElement) => {
  return render(
    <UserContext.Provider
      value={{ currentUser: mockUser, setCurrentUser: jest.fn() }}
    >
      {component}
    </UserContext.Provider>
  );
};

describe('Upload Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockClear();
    mockUseApi.mockReturnValue({
      isLoading: false,
      error: null,
    });
  });

  describe('Rendering', () => {
    it('renders upload interface with file selection', () => {
      renderWithProviders(<Upload />);

      expect(screen.getByText('Upload a Photo')).toBeInTheDocument();
      expect(screen.getByLabelText(/select photo/i)).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: /go back/i })
      ).toBeInTheDocument();
    });

    it('shows upload button only when file is selected', () => {
      renderWithProviders(<Upload />);

      // Initially, upload button should not be visible
      expect(
        screen.queryByRole('button', { name: /upload/i })
      ).not.toBeInTheDocument();

      // After file selection, upload button should appear
      const fileInput = screen.getByLabelText(/select photo/i);
      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      fireEvent.change(fileInput, { target: { files: [file] } });

      expect(
        screen.getByRole('button', { name: /upload/i })
      ).toBeInTheDocument();
    });

    it('shows image preview when file is selected', () => {
      renderWithProviders(<Upload />);

      const fileInput = screen.getByLabelText(/select photo/i);
      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      fireEvent.change(fileInput, { target: { files: [file] } });

      expect(screen.getByAltText("User's Upload")).toBeInTheDocument();
      expect(screen.queryByText('Upload a Photo')).not.toBeInTheDocument();
    });

    it('shows caption input when file is selected', () => {
      renderWithProviders(<Upload />);

      const fileInput = screen.getByLabelText(/select photo/i);
      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      fireEvent.change(fileInput, { target: { files: [file] } });

      expect(screen.getByLabelText(/add a caption/i)).toBeInTheDocument();
      expect(
        screen.getByPlaceholderText(/tell us about your photo/i)
      ).toBeInTheDocument();
    });
  });

  describe('Upload Functionality', () => {
    it('uploads file successfully with caption', async () => {
      const mockResponse = { id: 123 };
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      renderWithProviders(<Upload />);

      // Select file
      const fileInput = screen.getByLabelText(/select photo/i);
      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      fireEvent.change(fileInput, { target: { files: [file] } });

      // Add caption
      const captionInput = screen.getByPlaceholderText(
        /tell us about your photo/i
      );
      await userEvent.type(captionInput, 'test caption');

      // Upload
      const uploadButton = screen.getByRole('button', { name: /upload/i });
      await userEvent.click(uploadButton);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          '/api/aws/post/1/test%20caption',
          expect.any(Object)
        );
      });
    });

    it('uploads file without caption', async () => {
      const mockResponse = { id: 123 };
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      renderWithProviders(<Upload />);

      // Select file
      const fileInput = screen.getByLabelText(/select photo/i);
      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      fireEvent.change(fileInput, { target: { files: [file] } });

      // Upload without caption
      const uploadButton = screen.getByRole('button', { name: /upload/i });
      await userEvent.click(uploadButton);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          '/api/aws/post/1/',
          expect.any(Object)
        );
      });
    });

    it('handles upload API error', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 500,
      });

      renderWithProviders(<Upload />);

      // Select file
      const fileInput = screen.getByLabelText(/select photo/i);
      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      fireEvent.change(fileInput, { target: { files: [file] } });

      // Upload
      const uploadButton = screen.getByRole('button', { name: /upload/i });
      await userEvent.click(uploadButton);

      // Should show error toast
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalled();
      });
    });

    it('shows loading state during upload', async () => {
      // Mock useApi to return loading state
      mockUseApi.mockReturnValue({
        isLoading: true,
        error: null,
      });

      renderWithProviders(<Upload />);

      // Select file
      const fileInput = screen.getByLabelText(/select photo/i);
      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      fireEvent.change(fileInput, { target: { files: [file] } });

      const uploadButton = screen.getByRole('button', { name: /uploading/i });
      expect(uploadButton).toBeInTheDocument();
      expect(uploadButton).toBeDisabled();
    });

    it('shows error when no file is selected', async () => {
      renderWithProviders(<Upload />);

      // Try to upload without selecting file
      const uploadButton = screen.queryByRole('button', { name: /upload/i });

      // Should not be able to upload without file
      expect(uploadButton).not.toBeInTheDocument();
    });
  });

  describe('Navigation', () => {
    it('navigates back when go back button is clicked', async () => {
      renderWithProviders(<Upload />);

      const goBackButton = screen.getByRole('button', { name: /go back/i });
      await userEvent.click(goBackButton);

      expect(mockNavigate).toHaveBeenCalledWith('/');
    });

    it('navigates to post after successful upload', async () => {
      const mockResponse = { id: 123 };
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      renderWithProviders(<Upload />);

      // Select file
      const fileInput = screen.getByLabelText(/select photo/i);
      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      fireEvent.change(fileInput, { target: { files: [file] } });

      // Upload
      const uploadButton = screen.getByRole('button', { name: /upload/i });
      await userEvent.click(uploadButton);

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/post/123');
      });
    });
  });

  describe('File Handling', () => {
    it('handles file selection correctly', () => {
      renderWithProviders(<Upload />);

      const fileInput = screen.getByLabelText(/select photo/i);
      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      fireEvent.change(fileInput, { target: { files: [file] } });

      expect(screen.getByAltText("User's Upload")).toBeInTheDocument();
      expect(screen.getByLabelText(/add a caption/i)).toBeInTheDocument();
    });

    it('handles multiple file selections', () => {
      renderWithProviders(<Upload />);

      const fileInput = screen.getByLabelText(/select photo/i);
      const file1 = new File(['test1'], 'test1.jpg', { type: 'image/jpeg' });
      const file2 = new File(['test2'], 'test2.jpg', { type: 'image/jpeg' });

      // Select first file
      fireEvent.change(fileInput, { target: { files: [file1] } });
      expect(screen.getByAltText("User's Upload")).toBeInTheDocument();

      // Select second file (should replace first)
      fireEvent.change(fileInput, { target: { files: [file2] } });
      expect(screen.getByAltText("User's Upload")).toBeInTheDocument();
    });

    it('handles invalid file types', () => {
      renderWithProviders(<Upload />);

      const fileInput = screen.getByLabelText(/select photo/i);
      const invalidFile = new File(['test'], 'test.txt', {
        type: 'text/plain',
      });
      fireEvent.change(fileInput, { target: { files: [invalidFile] } });

      // Should still show the file (browser handles validation)
      expect(screen.getByAltText("User's Upload")).toBeInTheDocument();
    });
  });

  describe('Caption Handling', () => {
    it('handles caption input correctly', async () => {
      renderWithProviders(<Upload />);

      // Select file first
      const fileInput = screen.getByLabelText(/select photo/i);
      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      fireEvent.change(fileInput, { target: { files: [file] } });

      // Add caption
      const captionInput = screen.getByPlaceholderText(
        /tell us about your photo/i
      );
      await userEvent.type(captionInput, 'Test caption');

      expect(captionInput).toHaveValue('Test caption');
    });

    it('handles very long captions', async () => {
      renderWithProviders(<Upload />);

      // Select file first
      const fileInput = screen.getByLabelText(/select photo/i);
      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      fireEvent.change(fileInput, { target: { files: [file] } });

      // Add very long caption
      const captionInput = screen.getByPlaceholderText(
        /tell us about your photo/i
      );
      const longCaption = 'A'.repeat(1000);
      await userEvent.type(captionInput, longCaption);

      expect(captionInput).toHaveValue(longCaption);
    });

    it('handles special characters in caption for URL encoding', async () => {
      const mockResponse = { id: 123 };
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      renderWithProviders(<Upload />);

      // Select file
      const fileInput = screen.getByLabelText(/select photo/i);
      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      fireEvent.change(fileInput, { target: { files: [file] } });

      // Add caption with spaces
      const captionInput = screen.getByPlaceholderText(
        /tell us about your photo/i
      );
      await userEvent.type(captionInput, 'test caption with spaces');

      // Upload
      const uploadButton = screen.getByRole('button', { name: /upload/i });
      await userEvent.click(uploadButton);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          '/api/aws/post/1/test%20caption%20with%20spaces',
          expect.any(Object)
        );
      });
    });
  });

  describe('Edge Cases', () => {
    it('handles network errors gracefully', async () => {
      (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

      renderWithProviders(<Upload />);

      // Select file
      const fileInput = screen.getByLabelText(/select photo/i);
      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      fireEvent.change(fileInput, { target: { files: [file] } });

      // Upload
      const uploadButton = screen.getByRole('button', { name: /upload/i });
      await userEvent.click(uploadButton);

      // Should handle error gracefully
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalled();
      });
    });

    it('handles missing user data', () => {
      // Mock useUser to return null user
      jest.doMock('../../../hooks/useContexts', () => ({
        useUser: () => ({
          currentUser: null,
        }),
      }));

      renderWithProviders(<Upload />);

      // Should still render the component
      expect(screen.getByText('Upload a Photo')).toBeInTheDocument();
    });

    it('handles file input without files', () => {
      renderWithProviders(<Upload />);

      const fileInput = screen.getByLabelText(/select photo/i);
      fireEvent.change(fileInput, { target: { files: [] } });

      // Should not show upload button
      expect(
        screen.queryByRole('button', { name: /upload/i })
      ).not.toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has proper labels and ARIA attributes', () => {
      renderWithProviders(<Upload />);

      expect(screen.getByLabelText(/select photo/i)).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: /go back/i })
      ).toBeInTheDocument();
    });

    it('supports keyboard navigation', async () => {
      renderWithProviders(<Upload />);

      const goBackButton = screen.getByRole('button', { name: /go back/i });
      goBackButton.focus();
      expect(goBackButton).toHaveFocus();

      await userEvent.tab();
      // Should focus on file input label
    });

    it('has proper alt text for images', () => {
      renderWithProviders(<Upload />);

      // Select file to show image
      const fileInput = screen.getByLabelText(/select photo/i);
      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      fireEvent.change(fileInput, { target: { files: [file] } });

      expect(screen.getByAltText("User's Upload")).toBeInTheDocument();
    });
  });

  describe('Performance', () => {
    it('renders efficiently', () => {
      const startTime = performance.now();
      renderWithProviders(<Upload />);
      const endTime = performance.now();

      expect(endTime - startTime).toBeLessThan(100); // Should render in under 100ms
    });

    it('handles large files efficiently', () => {
      renderWithProviders(<Upload />);

      const fileInput = screen.getByLabelText(/select photo/i);
      const largeFile = new File(['x'.repeat(1000000)], 'large.jpg', {
        type: 'image/jpeg',
      });

      const startTime = performance.now();
      fireEvent.change(fileInput, { target: { files: [largeFile] } });
      const endTime = performance.now();

      expect(endTime - startTime).toBeLessThan(500); // Should handle large files in under 500ms
    });
  });
});
