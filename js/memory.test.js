import React from 'react'
import { render, screen } from '@testing-library/react'
import { domTestingLib as queryHelpers } from '@testing-library/dom'
import { Memory, Card } from '../js/memory'
import userEvent from '@testing-library/user-event'

jest.mock('howler')

describe('Memory game', () => {
  test('Renders components without error', () => {
    const memory = render(<Memory pairs={12} />);
    const titleElement = memory.getByText(
      /Choose any card to start/
    );
    expect(titleElement).toBeInTheDocument();
  });

  test('Flips cards and updates values', async () => {
    const memory = render(<Memory pairs={1} />);
    const cards = await screen.getAllByTestId('card-2');
    const firstCard = cards[0];
    const secondCard = cards[1];

    expect(firstCard).toHaveTextContent('0');
    expect(secondCard).toHaveTextContent('0');

    // flip card
    userEvent.click(firstCard);
    userEvent.click(secondCard);

    expect(firstCard).toHaveTextContent('2');
    expect(secondCard).toHaveTextContent('2');
  });
});
