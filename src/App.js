import { useState, useEffect } from "react";
import questions from "./questions.json";
import "./index.css";

function App() {
  const [quizSelected, setQuizSelected] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedOptions, setSelectedOptions] = useState([]);
  const [history, setHistory] = useState([]);
  const [quizAttempts, setQuizAttempts] = useState([]);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [answered, setAnswered] = useState(false);
  const [quizFinished, setQuizFinished] = useState(false);

  const questionsData = quizSelected === 1 ? questions.quiz1 : questions.quiz2;
  const question = questionsData[currentQuestion];
  const isMultiSelect = question?.answers.length > 1;

  useEffect(() => {
    document.body.className = isDarkMode ? "dark" : "light";
  }, [isDarkMode]);

  const handleOptionSelect = (index) => {
    if (answered) return;
    if (isMultiSelect) {
      const updated = selectedOptions.includes(index)
        ? selectedOptions.filter((i) => i !== index)
        : [...selectedOptions, index];
      setSelectedOptions(updated);
      if (updated.length === question.answers.length) {
        setAnswered(true);
      }
    } else {
      setSelectedOptions([index]);
      setAnswered(true);
    }
  };

  const handleNext = () => {
    const result = {
      question: question.question,
      selected: selectedOptions,
      correct: question.answers,
    };
    const newHistory = [...history, result];
    setHistory(newHistory);
    setSelectedOptions([]);
    setAnswered(false);
    if (currentQuestion < questionsData.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      setQuizFinished(true);
      const attemptSummary = {
        date: new Date().toLocaleString(),
        total: newHistory.length,
        correct: newHistory.filter(
          (h) =>
            h.selected.length === h.correct.length &&
            h.selected.every((val) => h.correct.includes(val))
        ).length,
      };
      setQuizAttempts((prev) => [attemptSummary, ...prev.slice(0, 4)]);
    }
  };

  const handleRestart = () => {
    setCurrentQuestion(0);
    setSelectedOptions([]);
    setHistory([]);
    setAnswered(false);
    setQuizFinished(false);
    setQuizSelected(null);
  };

  const exportToCSV = () => {
    const csv = [
      ["Pergunta", "Respostas Corretas", "Respostas Selecionadas"],
      ...history.map((h, idx) => [
        h.question,
        h.correct.map((i) => questionsData[idx].options[i]).join("; "),
        h.selected.map((i) => questionsData[idx].options[i]).join("; ")
      ]),
    ]
      .map((e) => e.join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "quiz_resultados.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const total = history.length;
  const correct = history.filter(
    (h) =>
      h.selected.length === h.correct.length &&
      h.selected.every((val) => h.correct.includes(val))
  ).length;
  const incorrect = total - correct;

  if (quizSelected === null) {
    return (
      <div className="min-h-screen p-6 bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
        <header className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Simulado SAP EWM</h1>
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
          >
            Alternar Tema
          </button>
        </header>
        <div className="max-w-xl mx-auto text-center">
          <h2 className="text-xl mb-4">Escolha o quiz desejado:</h2>
          <div className="flex justify-center space-x-4">
            <button
              onClick={() => setQuizSelected(1)}
              className="px-6 py-3 bg-green-500 text-white rounded hover:bg-green-600"
            >
              SAP EWM EXAME 01
            </button>
            <button
              onClick={() => setQuizSelected(2)}
              className="px-6 py-3 bg-purple-500 text-white rounded hover:bg-purple-600"
            >
              SAP EWM EXAME 02
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen p-6 ${isDarkMode ? "dark bg-gray-900 text-white" : "bg-white text-gray-900"}`}>
      <header className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Simulado SAP EWM</h1>
        <button
          onClick={() => setIsDarkMode(!isDarkMode)}
          className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
        >
          Alternar Tema
        </button>
      </header>

      {!quizFinished ? (
        <div className="max-w-3xl mx-auto bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">
            Pergunta {currentQuestion + 1}: {question.question}
            {isMultiSelect && " (Selecione todas as corretas)"}
          </h2>
          <ul className="space-y-2">
            {question.options.map((option, index) => {
              const isChecked = selectedOptions.includes(index);
              const isCorrect = question.answers.includes(index);
              const isSelected = selectedOptions.includes(index);

              let optionClasses = "block p-3 rounded border";
              if (answered) {
                if (isCorrect) optionClasses += " border-green-500 bg-green-100 dark:bg-green-700";
                if (isSelected && !isCorrect) optionClasses += " border-red-500 bg-red-100 dark:bg-red-700";
              } else {
                optionClasses += " border-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700";
              }

              return (
                <li key={index} className={optionClasses}>
                  <label className="flex items-center space-x-2">
                    <input
                      type={isMultiSelect ? "checkbox" : "radio"}
                      name="option"
                      checked={isChecked}
                      onChange={() => handleOptionSelect(index)}
                      disabled={answered}
                    />
                    <span>{option}</span>
                  </label>
                </li>
              );
            })}
          </ul>
          <div className="mt-6 flex space-x-4 flex-wrap">
            <button
              onClick={handleNext}
              disabled={!answered}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
            >
              Próxima
            </button>
            <button
              onClick={exportToCSV}
              disabled={history.length === 0}
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
            >
              Exportar CSV
            </button>
            <button
              onClick={handleRestart}
              className="px-4 py-2 bg-gray-400 text-white rounded hover:bg-gray-500"
            >
              Voltar para Seleção de Quiz
            </button>
          </div>
        </div>
      ) : (
        <div className="max-w-2xl mx-auto bg-white dark:bg-gray-800 shadow-md rounded-lg p-6 text-center">
          <h2 className="text-2xl font-bold mb-4">Resultado Final</h2>
          <p className="mb-2 text-lg">Você respondeu {total} perguntas.</p>
          <p className="text-green-600 font-semibold">✔️ {correct} acertos ({((correct / total) * 100).toFixed(2)}%)</p>
          <p className="text-red-600 font-semibold mb-4">❌ {incorrect} erros ({(100 - (correct / total) * 100).toFixed(2)}%)</p>
          <div className="flex justify-center space-x-4 mb-6">
            <button
              onClick={handleRestart}
              className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
            >
              Voltar para Seleção de Quiz
            </button>
            <button
              onClick={exportToCSV}
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
            >
              Exportar Resultados CSV
            </button>
          </div>
          {quizAttempts.length > 0 && (
            <div className="text-left">
              <h3 className="text-lg font-semibold mb-2">Histórico de Tentativas</h3>
              <ul className="list-disc list-inside space-y-1">
                {quizAttempts.map((attempt, index) => (
                  <li key={index}>
                    {attempt.date}: {attempt.correct}/{attempt.total} acertos ({((attempt.correct / attempt.total) * 100).toFixed(1)}%)
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default App;
