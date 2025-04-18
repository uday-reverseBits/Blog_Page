import { FC, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './store/store';
import BlogListing from './components/BlogListing';
import BlogDetail from './components/BlogDetail';
import AuthorPage from './components/AuthorPage';
import './App.css'

const App: FC = () => {
  useEffect(() => {
    console.log('App component mounted');
  }, []);

  return (
    <Provider store={store}>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Routes>
            <Route path="/" element={
              <div>
                <BlogListing />
              </div>
            } />
            <Route path="/blog/:slug" element={<BlogDetail />} />
            <Route path="/author/:authorSlug" element={<AuthorPage />} />
          </Routes>
        </div>
      </Router>
    </Provider>
  );
};

export default App;
