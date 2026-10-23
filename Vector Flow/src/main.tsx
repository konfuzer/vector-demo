import { createRoot } from 'react-dom/client';
import { Provider } from './context';
import { App } from './App';
import './style.css';
import './visual-refinement.css';
import './responsive.css';
createRoot(document.getElementById('root')!).render(<Provider><App/></Provider>);
