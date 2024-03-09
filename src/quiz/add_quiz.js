import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './add_quiz.css';

function AddQuestion() {
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState([{ text: '', isCorrect: false }]);
  const [addedQuestions, setAddedQuestions] = useState([]);
  const [fetchedQuestions, setFetchedQuestions] = useState([]);

const fetchQuestions = async () => {
    try {
    const username = JSON.parse(localStorage.getItem('username')).username;
    const password = JSON.parse(localStorage.getItem('password')).password;
    const credentials = `${username}:${password}`;
    const base64Credentials = btoa(credentials);

    const response = await axios.get('http://127.0.0.1:8000/api/quiz', {
        headers: {
        'Authorization': `Basic ${base64Credentials}`,
        },
    });

    const result = response.data;
    if (Array.isArray(result) && result.length > 0) {
        const formattedQuizData = {
        questions: result.map(question => ({
            question: question.question,
            choices: question.options.map(option => option.answer),
            correctAnswer: question.correctAnswer,
        })),
        };
        setFetchedQuestions(formattedQuizData);
    } else {
        console.error('Empty or non-array response from the server');
    }
    } catch (error) {
    console.error('Error fetching questions:', error);
    }
};

useEffect(() => {
    fetchQuestions();
}, []);

  const addNewOption = () => {
    setOptions((prevOptions) => [...prevOptions, { text: '', isCorrect: false }]);
  };
  const addLeadingZero = (number) => (number > 9 ? number : `0${number}`);
  const removeOption = (index) => {
    setOptions((prevOptions) => prevOptions.filter((_, i) => i !== index));
  };

  const handleOptionChange = (index, value) => {
    const newOptions = [...options];
    newOptions[index] = {
      text: value,
      isCorrect: newOptions[index].isCorrect,
    };
    setOptions(newOptions);
  };

  const handleCheckboxChange = (index) => {
    const newOptions = [...options];
    newOptions[index] = {
      text: newOptions[index].text,
      isCorrect: !newOptions[index].isCorrect,
    };
    setOptions(newOptions);
  };

  const addNewQuestion = async () => {
    try {
      const newOptions = options.map((option) => ({
        text: option.text,
        isCorrect: option.isCorrect,
      }));
      const newQuestion = {
        question,
        newOptions
      };
      const username = JSON.parse(localStorage.getItem('username')).username
      const password = JSON.parse(localStorage.getItem('password')).password
      const credentials = `${username}:${password}`;
      const base64Credentials = btoa(credentials);
  
      const response = await axios.post('http://127.0.0.1:8000/api/quiz/add_quiz', {
        newQuestion,
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${base64Credentials}`,
        },
      });

      console.log('Question added successfully:', response.data);

      setAddedQuestions((prevQuestions) => [...prevQuestions, newQuestion]);
      setQuestion('');
      setOptions([{ text: '', isCorrect: false }]);
      fetchQuestions();
    } catch (error) {
      console.error('Error adding question:', error);
    }
  };
  return (
    <div className="add-question-container">
      <div className="left-panel">
        <h2>Added Questions</h2>
        <ul>
          {fetchedQuestions &&
            fetchedQuestions?.questions?.length > 0 &&
            fetchedQuestions?.questions?.map((q, index) => (
              <li
                key={index}
              >
                {addLeadingZero(index + 1)}
              </li>
            ))}
        </ul>
      </div>
      <div className="vl"></div>
      <div className="center-panel">
        <h2>Add New Question</h2>
        <div className="question-input">
          <label>Question:</label>
          <textarea
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Enter the question..."
          />
        </div>
        <div className="options-input">
          <label>Options:</label>
          {options.map((option, index) => (
            <div key={index} className="option-input">
              <input
                type="text"
                value={option.text}
                onChange={(e) => handleOptionChange(index, e.target.value)}
                placeholder={`Option ${index + 1}`}
              />
              <label className="checkbox-label">
                Correct
                <input
                  type="checkbox"
                  checked={option.isCorrect}
                  onChange={() => handleCheckboxChange(index)}
                />
              </label>
              {index > 0 && (
                <button
                  type="button"
                  onClick={() => removeOption(index)}
                  className="remove-option-btn small-minus-btn"
                >
                  &minus;
                </button>
              )}
            </div>
          ))}
          <button type="button" onClick={addNewOption}>
            Add Option
          </button>
        </div>
        <button onClick={addNewQuestion}>Add Question</button>
      </div>
      <div className="vl"></div>
      <div className="right-panel">
        <h2>Candidate Info</h2>
      </div>
    </div>
  );
}

export default AddQuestion;