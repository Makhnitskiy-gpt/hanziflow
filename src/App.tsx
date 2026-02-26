import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppShell } from '@/components/layout/AppShell';

// Lazy-loaded pages
const Home = lazy(() => import('@/pages/Home'));
const Radicals = lazy(() => import('@/pages/Radicals'));
const Characters = lazy(() => import('@/pages/Characters'));
const Logic = lazy(() => import('@/pages/Logic'));
const Review = lazy(() => import('@/pages/Review'));
const Practice = lazy(() => import('@/pages/Practice'));
const Progress = lazy(() => import('@/pages/Progress'));
const Guide = lazy(() => import('@/pages/Guide'));

function PageLoader() {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="flex flex-col items-center gap-3">
        <span className="font-hanzi text-4xl text-rice-dim animate-pulse">載</span>
        <span className="text-sm text-rice-dim">Загрузка...</span>
      </div>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppShell />}>
          <Route
            index
            element={
              <Suspense fallback={<PageLoader />}>
                <Home />
              </Suspense>
            }
          />
          <Route
            path="radicals"
            element={
              <Suspense fallback={<PageLoader />}>
                <Radicals />
              </Suspense>
            }
          />
          <Route
            path="characters"
            element={
              <Suspense fallback={<PageLoader />}>
                <Characters />
              </Suspense>
            }
          />
          <Route
            path="logic"
            element={
              <Suspense fallback={<PageLoader />}>
                <Logic />
              </Suspense>
            }
          />
          <Route
            path="review"
            element={
              <Suspense fallback={<PageLoader />}>
                <Review />
              </Suspense>
            }
          />
          <Route
            path="practice"
            element={
              <Suspense fallback={<PageLoader />}>
                <Practice />
              </Suspense>
            }
          />
          <Route
            path="progress"
            element={
              <Suspense fallback={<PageLoader />}>
                <Progress />
              </Suspense>
            }
          />
          <Route
            path="guide"
            element={
              <Suspense fallback={<PageLoader />}>
                <Guide />
              </Suspense>
            }
          />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
