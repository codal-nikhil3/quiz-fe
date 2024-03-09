import Login from './login/login';
import Quiz from "./quiz/quiz"
import AddQuestion from './quiz/add_quiz'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login/>} />
        <Route path="/quiz" element={<Quiz />} />
        <Route path="/add_quiz" element={<AddQuestion />} />
      </Routes>
    </Router>
  );
}

export default App;