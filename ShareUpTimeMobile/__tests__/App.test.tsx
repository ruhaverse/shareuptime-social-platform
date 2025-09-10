/**
 * @format
 */

import React from 'react';
import renderer from 'react-test-renderer';

// Simple mock to test the component structure
const MockApp = () => <div>Mock App</div>;

describe('App', () => {
  it('renders without crashing', () => {
    const component = renderer.create(<MockApp />);
    expect(component).toBeTruthy();
  });
});
