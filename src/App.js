import { useEffect, useReducer } from "react";
import Header from "./components/Header";
import Main from "./components/Main";
import Loader from "./components/Loader";
import Error from "./components/Error";
import StartScreen from "./components/StartScreen";
import Questions from "./components/Questions";
import NextButton from "./components/NextButton";
import Progress from "./components/Progress";
import FinishedScreen from "./components/FinishedScreen";
import Timer from "./components/Timer";
import Footer from "./components/Footer";

const secsPerQuestion = 30;

const initialState = {
  questions: [],
  status: "loading",
  index: 0,
  points: 0,
  highScore: 0,
  answer: null,
  secondsRemaining: null,
};
const reducer = (state, action) => {
  switch (action.type) {
    case "dataReceived":
      return {
        ...state,
        questions: action.payLoad,
        status: "ready",
        answer: null,
      };
    case "dataFailed":
      return { ...state, status: "error" };
    case "start":
      return {
        ...state,
        status: "active",
        secondsRemaining: state.questions.length * secsPerQuestion,
      };
    case "newAnswer":
      const curQuestion = state.questions.at(state.index);
      return {
        ...state,
        answer: action.payLoad,
        points:
          action.payLoad === curQuestion.correctOption
            ? state.points + curQuestion.points
            : state.points,
      };
    case "nextQuestion":
      return { ...state, index: state.index + 1, answer: null };
    case "finished":
      return {
        ...state,
        status: "finished",
        highScore: Math.max(state.points, state.highScore),
      };
    case "restart":
      return {
        ...initialState,
        questions: state.questions,
        highScore: state.highScore,
        status: "ready",
      };
    case "tick":
      return {
        ...state,
        secondsRemaining: state.secondsRemaining - 1,
        status: state.secondsRemaining === 0 ? "finished" : state.status,
        highScore:
          state.secondsRemaining === 0
            ? Math.max(state.points, state.highScore)
            : state.highScore,
      };
    default:
      throw new Error("Action unkown");
  }
};

function App() {
  const [
    { questions, status, index, answer, points, highScore, secondsRemaining },
    dispatch,
  ] = useReducer(reducer, initialState);
  const numQuestions = questions.length;
  const maxPointsPossible = questions.reduce(
    (acc, curr) => acc + curr.points,
    0
  );
  ///////////////////////////////////
  useEffect(() => {
    fetch(" http://localhost:8000/questions")
      .then((res) => res.json())
      .then((data) => dispatch({ type: "dataReceived", payLoad: data }))
      .catch((err) => dispatch({ type: "dataFailed" }));
  }, []);
  ////////////////////////////////////
  return (
    <div className="app">
      <Header />
      <Main>
        {status === "loading" && <Loader />}
        {status === "error" && <Error />}
        {status === "ready" && (
          <StartScreen num={numQuestions} dispatch={dispatch} />
        )}
        {status === "active" && (
          <>
            <Progress
              i={index}
              numQuestions={numQuestions}
              points={points}
              maxPoints={maxPointsPossible}
              answer={answer}
            />
            <Questions
              question={questions[index]}
              answer={answer}
              dispatch={dispatch}
            />
            <Footer>
              <Timer dispatch={dispatch} secondsRemaining={secondsRemaining} />

              <NextButton dispatch={dispatch} answer={answer} index={index} />
            </Footer>
          </>
        )}
        {status === "finished" && (
          <FinishedScreen
            points={points}
            maxPoints={maxPointsPossible}
            highScore={highScore}
            dispatch={dispatch}
          />
        )}
      </Main>
    </div>
  );
}

export default App;
