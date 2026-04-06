import React from 'react';
import { render } from '@testing-library/react';
import Page from '../app/page';

jest.mock('content-collections', () => ({
  allProjects: [
    {
      slug: 'mock-project',
      title: 'Mock Project',
      summary: 'Mock project summary',
      thumb: '/images/projects/craig-watt-website/craig-watt-website1-thumb.webp',
      thumbWidth: 800,
      thumbHeight: 450,
      badges: ['next.js'],
    },
  ],
  allPosts: [
    {
      slug: 'mock-post',
      title: 'Mock Post',
      excerpt: 'Mock post excerpt',
      thumb: '/images/posts/slow-cooker-chili/slow-cooker-thumb.webp',
      thumbWidth: 800,
      thumbHeight: 450,
      date: '2025-01-01',
      readingTime: '1 min read',
      category: 'Testing',
      badges: ['typescript'],
    },
  ],
}));

describe('Page', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<Page />);
    expect(baseElement).toBeTruthy();
  });
});
