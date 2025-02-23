import React from 'react';
import { render, fireEvent, waitFor, screen } from '@testing-library/react';
import axios from 'axios';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import '@testing-library/jest-dom/extend-expect';
import SearchInput from './SearchInput';

jest.mock('axios');

jest.mock('../../context/search', () => ({
  useSearch: jest.fn(() => [{ keyword: '' }, jest.fn()]),
}));

// reused from CategoryProduct.test.js
let logSpy;

describe('SearchInput Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
  });

  it('render search input', () => {
    render(
      <MemoryRouter>
        <Routes>
          <Route path='/' element={<SearchInput />} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByPlaceholderText('Search')).toBeInTheDocument();
    expect(screen.getByText('Search')).toBeInTheDocument();
  });

  it('inputs should be initially empty', () => {
    render(
      <MemoryRouter>
        <Routes>
          <Route path='/' element={<SearchInput />} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByPlaceholderText('Search').value).toBe('');
  });

  it('should allow typing search keyword', () => {
    render(
      <MemoryRouter>
        <Routes>
          <Route path='/' element={<SearchInput />} />
        </Routes>
      </MemoryRouter>
    );

    fireEvent.change(screen.getByPlaceholderText('Search'), {
      target: { value: 'test search' },
    });
  });

  it('should submit the form', async () => {
    axios.get.mockResolvedValueOnce({
      data: [],
    });

    render(
      <MemoryRouter>
        <Routes>
          <Route path='/' element={<SearchInput />} />
        </Routes>
      </MemoryRouter>
    );

    fireEvent.change(screen.getByPlaceholderText('Search'), {
      target: { value: 'test search' },
    });

    fireEvent.click(screen.getByText('Search'));

    await waitFor(() => {
      expect(axios.get).toHaveBeenCalled();
    });
  });

  it('should log error if an error occurs', async () => {
    const err = new Error("Error with getting data");
    axios.get.mockRejectedValueOnce(err);

    render(
      <MemoryRouter>
        <Routes>
          <Route path='/' element={<SearchInput />} />
        </Routes>
      </MemoryRouter>
    );

    fireEvent.change(screen.getByPlaceholderText('Search'), {
      target: { value: 'test search' },
    });

    fireEvent.click(screen.getByText('Search'));

    await waitFor(() => {
      expect(axios.get).toHaveBeenCalled();
    });

    expect(logSpy).toHaveBeenCalledWith(err);
  });
});
