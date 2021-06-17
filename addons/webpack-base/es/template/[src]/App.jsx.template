import React, { Suspense } from 'react';
import { HashRouter } from 'react-router-dom';

import 'theme';

import Loading from 'components/Loading';
import AppRoutes from 'routes/AppRoutes';

const App = () => (
  <Suspense fallback={<Loading />}>
    <HashRouter basename={process.env.PUBLIC_URL}>
      <AppRoutes />
    </HashRouter>
  </Suspense>
);

export default App;
