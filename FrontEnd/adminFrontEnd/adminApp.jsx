import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import AppWrapper from './appWrapper';

const App = () => {
  return (
    <Router>
      <AppWrapper />
    </Router>
  );
};

export default App;
