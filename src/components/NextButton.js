import React from "react";

export default function NextButton({ dispatch, answer, index }) {
  if (answer === null) return null;
  return (
    <button
      className="btn btn-ui"
      onClick={() => {
        if (index + 1 < 15) {
          dispatch({ type: "nextQuestion" });
        } else {
          dispatch({ type: "finished" });
        }
      }}
    >
      {index + 1 < 15 ? "Next" : "Finish"}
    </button>
  );
}
