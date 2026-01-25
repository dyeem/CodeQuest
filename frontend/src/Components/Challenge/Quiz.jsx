import { useState } from 'react';
import MCQForm from '../Quizzes/MCQForm.jsx';
import TrueFalseForm from '../Quizzes/TrueFalseForm.jsx';
import EnumForm from '../Quizzes/EnumForm.jsx';
import ParagraphForm from '../Quizzes/ParagraphForm.jsx';
import { BookOpen, CheckSquare, ListOrdered, AlignLeft } from 'lucide-react';

export default function Quiz() {
    const [quizSubtype, setQuizSubtype] = useState("");
    const [ mcQuestions, setMCQuestions ] = useState([]);
    const [ truefalseQuestions, setTrueFalseQuestions ] = useState([]);
    const [ enumQuestions, setEnumQuestions ] = useState([]);
    const [ paragraphQuestions, setParagraphQuestions ] = useState([]);
    
    return (
        <div className="w-full flex flex-col items-center my-6 animate-fade-in">
            <p className="text-3xl font-bold mb-8 text-[#d4af37] tracking-[0.2em] uppercase">
                Quiz Questions
            </p>

            {/* Quiz Subtype Selector */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10 w-full max-w-4xl px-4">
                <SubTypeButton 
                    id="mcq" 
                    label="Multiple Choice" 
                    icon={<BookOpen size={20}/>} 
                    selected={quizSubtype === "mcq"}
                    onClick={() => setQuizSubtype("mcq")}
                />
                <SubTypeButton 
                    id="tf" 
                    label="True or False" 
                    icon={<CheckSquare size={20}/>} 
                    selected={quizSubtype === "tf"}
                    onClick={() => setQuizSubtype("tf")}
                />
                <SubTypeButton 
                    id="enum" 
                    label="Enumeration" 
                    icon={<ListOrdered size={20}/>} 
                    selected={quizSubtype === "enum"}
                    onClick={() => setQuizSubtype("enum")}
                />
                <SubTypeButton 
                    id="paragraph" 
                    label="Paragraph" 
                    icon={<AlignLeft size={20}/>} 
                    selected={quizSubtype === "paragraph"}
                    onClick={() => setQuizSubtype("paragraph")}
                />
            </div>

            {/* Render chosen quiz type */}
            <div className="w-full flex justify-center">
                {quizSubtype === "mcq" && <MCQForm mcQuestions={mcQuestions} setMCQuestions={setMCQuestions} />}
                {quizSubtype === "tf" && <TrueFalseForm truefalseQuestions={truefalseQuestions} setTrueFalseQuestions={setTrueFalseQuestions} />}
                {quizSubtype === "enum" && <EnumForm enumQuestions={enumQuestions} setEnumQuestions={setEnumQuestions} />}
                {quizSubtype === "paragraph" && <ParagraphForm paragraphQuestions={paragraphQuestions} setParagraphQuestions={setParagraphQuestions}/>}
            </div>
        </div>
    )
}

function SubTypeButton({ id, label, icon, selected, onClick }) {
    return (
        <button 
            className={`flex items-center justify-center gap-2 px-6 py-4 rounded-sm border-2 transition-all duration-300 font-bold uppercase tracking-widest text-[10px] ${
                selected 
                ? "bg-[#2c241b] border-[#d4af37] text-[#d4af37] shadow-[0_0_15px_rgba(212,175,55,0.2)]" 
                : "bg-[#0c0a09] border-[#292524] text-[#57534e] hover:border-[#57534e] hover:text-[#a8a29e]"
            }`}
            onClick={onClick}
        >
            {icon}
            <span>{label}</span>
        </button>
    )
}