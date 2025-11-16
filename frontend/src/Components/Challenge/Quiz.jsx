import { useState } from 'react';
import MCQForm from '../Quizzes/MCQForm.jsx';
import TrueFalseForm from '../Quizzes/TrueFalseForm.jsx';
import EnumForm from '../Quizzes/EnumForm.jsx';
import ParagraphForm from '../Quizzes/ParagraphForm.jsx';
export default function Quiz() {
    const [codingChallenge, setCodingChallenge] = useState("");
    const [quizSubtype, setQuizSubtype] = useState("");
    const [ mcQuestions, setMCQuestions ] = useState([]);
    const [ truefalseQuestions, setTrueFalseQuestions ] = useState([]);
    const [ enumQuestions, setEnumQuestions ] = useState([]);
    const [ paragraphQuestions, setParagraphQuestions ] = useState([]);
    return (
        <>
             <div className="w-full flex flex-col items-center my-6">
                <p className="text-3xl font-semibold mb-4">Create a Quiz</p>

                {/* Quiz Subtype Selector */}
                <div className="flex gap-4 mb-6">
                    <button 
                        className={`px-4 py-2 rounded-lg border ${
                            quizSubtype === "mcq" ? "bg-[#212832] text-white" : "bg-white"
                        }`}
                        onClick={() => setQuizSubtype("mcq")}
                    >
                        Multiple Choice
                    </button>

                    <button 
                        className={`px-4 py-2 rounded-lg border ${
                            quizSubtype === "tf" ? "bg-[#212832] text-white" : "bg-white"
                        }`}
                        onClick={() => setQuizSubtype("tf")}
                    >
                        True or False
                    </button>

                    <button 
                        className={`px-4 py-2 rounded-lg border ${
                            quizSubtype === "enum" ? "bg-[#212832] text-white" : "bg-white"
                        }`}
                        onClick={() => setQuizSubtype("enum")}
                    >
                        Enumeration
                    </button>

                    <button 
                        className={`px-4 py-2 rounded-lg border ${
                            quizSubtype === "paragraph" ? "bg-[#212832] text-white" : "bg-white"
                        }`}
                        onClick={() => setQuizSubtype("paragraph")}
                    >
                        Paragraph
                    </button>
                </div>

                {/* Render chosen quiz type */}
                {quizSubtype === "mcq" && <MCQForm mcQuestions={mcQuestions} setMCQuestions={setMCQuestions} />}
                {quizSubtype === "tf" && <TrueFalseForm truefalseQuestions={truefalseQuestions} setTrueFalseQuestions={setTrueFalseQuestions} />}
                {quizSubtype === "enum" && <EnumForm enumQuestions={enumQuestions} setEnumQuestions={setEnumQuestions} />}
                {quizSubtype === "paragraph" && <ParagraphForm paragraphQuestions={paragraphQuestions} setParagraphQuestions={setParagraphQuestions}/>}
            </div>
        </>
    )
}