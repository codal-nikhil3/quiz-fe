import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './quiz.css';
import axios from 'axios';

function Quiz() {
  const navigate = useNavigate();
  const [quizData, setQuizData] = useState(null);
  const [activeQuestion, setActiveQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState('');
  const [selectedAnswerIndex, setSelectedAnswerIndex] = useState(null);
  const [attemptedQuestions, setAttemptedQuestions] = useState(new Set());
  const savedTimer = localStorage.getItem('quizTimer');
  const [timer, setTimer] = useState({ savedTimer });
  const [selectedAnswers, setSelectedAnswers] = useState(Array(quizData ? quizData.questions.length : 0).fill(''));
  const sameUser = localStorage.getItem('isSameUser')

  useEffect(() => {
      if (sameUser === 'true') {
        setTimer(parseInt(savedTimer, 10));
      } else {
        setTimer(30 * 60);
      }
    }
  ,[]);

  useEffect(() => {
    localStorage.setItem('quizTimer', timer.toString());
  }, [timer]);

  const fetchData = async () => {
    const username = JSON.parse(localStorage.getItem('username')).username
    const password = JSON.parse(localStorage.getItem('password')).password
    try {
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
  
        setQuizData(formattedQuizData);
      } else {
        console.error('Invalid data structure received from the API:', result);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    let interval;

    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prevTimer) => {
          const newTimer = prevTimer - 1;
          return newTimer > 0 ? newTimer : 0;
        });
      }, 1000);
    }

    return () => {
      clearInterval(interval);
    };
  }, [timer]);

  const onClickNext = () => {
    setSelectedAnswerIndex(null);
    setAttemptedQuestions((prev) => new Set(prev.add(activeQuestion)));

    if (activeQuestion !== (quizData ? quizData.questions.length - 1 : 0)) {
      setActiveQuestion((prev) => prev + 1);
    } else {
      submitAnswersToBackend();
      setActiveQuestion(0);
    }
    if (quizData && activeQuestion === quizData.questions.length - 1){
      navigate("/login");
    } 
  };

  const onClickPrev = () => {
    setSelectedAnswerIndex(null);

    if (activeQuestion !== 0) {
      setActiveQuestion((prev) => prev - 1);
    }
  };

  const onAnswerSelected = (answer, index) => {
    setSelectedAnswerIndex(index);
    setSelectedAnswer(answer === quizData.questions[activeQuestion].correctAnswer);
    setSelectedAnswers((prevAnswers) => {
      const newAnswers = [...prevAnswers];
      newAnswers[activeQuestion] = answer;
      return newAnswers;
    });
  };

  const onPendingQuestionClick = (index) => {
    setActiveQuestion(index);
    setSelectedAnswer('');
    setSelectedAnswerIndex(null);
  };

  const addLeadingZero = (number) => (number > 9 ? number : `0${number}`);

  const candidateInfo = {
    name: 'John Doe',
    age: 25,
    experience: '2 years',
    education: "Bachelor's in Computer Science",
  };

  const submitAnswersToBackend = async () => {
    const username = JSON.parse(localStorage.getItem('username')).username
    const password = JSON.parse(localStorage.getItem('password')).password
    try {
      const userAnswers = selectedAnswers.map((answer, index) => ({
        question: quizData.questions[index].question,
        selectedAnswer: answer,
      }));
  
      const credentials = `${username}:${password}`; 
      const base64Credentials = btoa(credentials);
  
      const response = await axios.post('http://127.0.0.1:8000/api/quiz', {
        userAnswers,
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${base64Credentials}`,
        },
      });
  
      console.log('Answers submitted successfully:', response.data);
    } catch (error) {
      console.error('Error submitting answers:', error);
    }
  };

  return (
    <div className="quiz-container">
      <div className="left-column">
        <h3>Pending Questions:</h3>
        <ul>
          {quizData &&
            quizData.questions.length > 0 &&
            quizData.questions.map((q, index) => (
              <li
                key={index}
                className={`${
                  attemptedQuestions.has(index) ? 'attempted-question' : ''
                } ${index === activeQuestion ? 'active-question' : ''}`}
                onClick={() => onPendingQuestionClick(index)}
              >
                {addLeadingZero(index + 1)}
              </li>
            ))}
        </ul>
      </div>
      <div className="vl"></div>
      <div className="center-column">
        <div className="countdown-timer">
          Time left: <br />
          <span className="timer">
            {Math.floor(timer / 60)}:{addLeadingZero(timer % 60)}
          </span>
        </div>
        <div className="question-panel">
          <div>
            <span className="active-question-no">
              {addLeadingZero(activeQuestion + 1)}/
              <span className="total-question">
                {addLeadingZero(quizData ? quizData.questions.length : 0)}
              </span>
            </span>
          </div>
          <h2>{quizData && quizData.questions[activeQuestion].question}</h2>
          <ul>
            {quizData &&
              quizData.questions[activeQuestion].choices.map((answer, index) => (
                <li
                  onClick={() => onAnswerSelected(answer, index)}
                  key={answer}
                  className={
                    selectedAnswerIndex === index || selectedAnswers[activeQuestion] === answer
                      ? 'selected-answer'
                      : null
                  }
                >
                  {answer}
                </li>
              ))}
          </ul>
          <div className="flex-right">
            <button onClick={onClickPrev} disabled={activeQuestion === 0}>
              Prev
            </button>
            <button
              onClick={onClickNext}
              disabled={!attemptedQuestions.has(activeQuestion) && selectedAnswerIndex === null}
            >
              {quizData && activeQuestion === quizData.questions.length - 1 ? 'Finish' : 'Next'}
            </button>
          </div>
        </div>
      </div>
      <div className="vl"></div>
      <div className="right-column">
        <h2>Candidate Information</h2>
        <p>Name: {candidateInfo.name}</p>
        <p>Age: {candidateInfo.age}</p>
        <p>Experience: {candidateInfo.experience}</p>
        <p>Education: {candidateInfo.education}</p>
      </div>
    </div>
  );
}

export default Quiz;
