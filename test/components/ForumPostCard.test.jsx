// @vitest-environment jsdom
import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import ForumPostCard from '../../src/components/community/ForumPostCard.jsx';

const basePost = {
  id: '1',
  title: 'My First Forum Post',
  content: 'This is the content of the forum post.',
  author_display_name: 'Jane Doe',
  category: 'general',
  upvotes: 5,
  comment_count: 3,
  is_anonymous: false,
  pinned: false,
  tags: [],
  created_date: new Date().toISOString()
};

describe('ForumPostCard – Render with Props', () => {
  it('renders the post title', () => {
    render(<ForumPostCard post={basePost} onView={vi.fn()} onUpvote={vi.fn()} />);
    expect(screen.getByText('My First Forum Post')).toBeInTheDocument();
  });

  it('renders the post content', () => {
    render(<ForumPostCard post={basePost} onView={vi.fn()} onUpvote={vi.fn()} />);
    expect(screen.getByText('This is the content of the forum post.')).toBeInTheDocument();
  });

  it('renders the author display name', () => {
    render(<ForumPostCard post={basePost} onView={vi.fn()} onUpvote={vi.fn()} />);
    expect(screen.getByText('Jane Doe')).toBeInTheDocument();
  });

  it('renders the category badge', () => {
    render(<ForumPostCard post={basePost} onView={vi.fn()} onUpvote={vi.fn()} />);
    expect(screen.getByText('general')).toBeInTheDocument();
  });

  it('renders the upvote count', () => {
    render(<ForumPostCard post={basePost} onView={vi.fn()} onUpvote={vi.fn()} />);
    expect(screen.getByText('5')).toBeInTheDocument();
  });

  it('renders upvote count as 0 when upvotes is undefined', () => {
    const post = { ...basePost, upvotes: undefined };
    render(<ForumPostCard post={post} onView={vi.fn()} onUpvote={vi.fn()} />);
    expect(screen.getByText('0')).toBeInTheDocument();
  });

  it('renders different post data correctly', () => {
    const anotherPost = {
      ...basePost,
      title: 'Mental Health Tips',
      content: 'Here are some tips for mental well-being.',
      author_display_name: 'John Smith',
      category: 'mental_health',
      upvotes: 42
    };
    render(<ForumPostCard post={anotherPost} onView={vi.fn()} onUpvote={vi.fn()} />);
    expect(screen.getByText('Mental Health Tips')).toBeInTheDocument();
    expect(screen.getByText('Here are some tips for mental well-being.')).toBeInTheDocument();
    expect(screen.getByText('John Smith')).toBeInTheDocument();
    expect(screen.getByText('mental health')).toBeInTheDocument();
    expect(screen.getByText('42')).toBeInTheDocument();
  });
});

describe('ForumPostCard – Interactive Elements', () => {
  it('renders the Upvote button', () => {
    render(<ForumPostCard post={basePost} onView={vi.fn()} onUpvote={vi.fn()} />);
    const upvoteButton = screen.getByRole('button', { name: /5/i });
    expect(upvoteButton).toBeInTheDocument();
  });

  it('calls onUpvote with the post when the Upvote button is clicked', () => {
    const onUpvote = vi.fn();
    render(<ForumPostCard post={basePost} onView={vi.fn()} onUpvote={onUpvote} />);
    const upvoteButton = screen.getByRole('button', { name: /5/i });
    fireEvent.click(upvoteButton);
    expect(onUpvote).toHaveBeenCalledTimes(1);
    expect(onUpvote).toHaveBeenCalledWith(basePost);
  });

  it('calls onView when the card is clicked', () => {
    const onView = vi.fn();
    render(<ForumPostCard post={basePost} onView={onView} onUpvote={vi.fn()} />);
    fireEvent.click(screen.getByText('My First Forum Post'));
    expect(onView).toHaveBeenCalledTimes(1);
  });

  it('disables the Upvote button while isUpvoting is true', () => {
    render(<ForumPostCard post={basePost} onView={vi.fn()} onUpvote={vi.fn()} isUpvoting={true} />);
    const button = screen.getByRole('button', { name: /5/i });
    expect(button).toBeDisabled();
  });

  it('does not call onView when the Upvote button is clicked (stops propagation)', () => {
    const onView = vi.fn();
    const onUpvote = vi.fn();
    render(<ForumPostCard post={basePost} onView={onView} onUpvote={onUpvote} />);
    const upvoteButton = screen.getByRole('button', { name: /5/i });
    fireEvent.click(upvoteButton);
    expect(onView).not.toHaveBeenCalled();
  });
});

describe('ForumPostCard – Conditional Rendering (is_anonymous)', () => {
  it('shows the author display name when is_anonymous is false', () => {
    const post = { ...basePost, is_anonymous: false, author_display_name: 'Jane Doe' };
    render(<ForumPostCard post={post} onView={vi.fn()} onUpvote={vi.fn()} />);
    expect(screen.getByText('Jane Doe')).toBeInTheDocument();
    expect(screen.queryByText('Anonymous')).not.toBeInTheDocument();
  });

  it('shows the Anonymous badge when is_anonymous is true', () => {
    const post = { ...basePost, is_anonymous: true };
    render(<ForumPostCard post={post} onView={vi.fn()} onUpvote={vi.fn()} />);
    expect(screen.getByText('Anonymous')).toBeInTheDocument();
  });

  it('renders the author_display_name in the byline alongside the Anonymous badge when is_anonymous is true', () => {
    const post = { ...basePost, is_anonymous: true, author_display_name: 'Hidden User' };
    render(<ForumPostCard post={post} onView={vi.fn()} onUpvote={vi.fn()} />);
    expect(screen.getByText('Anonymous')).toBeInTheDocument();
    expect(screen.getByText('Hidden User')).toBeInTheDocument();
  });
});
