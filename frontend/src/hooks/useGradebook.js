import { useState, useEffect } from "react";
import { db } from "../config/firebase.config";
import { collection, query, where, getDocs, doc, updateDoc, addDoc } from "firebase/firestore";

export default function useGradebook(taskId, sectionId) {
    const [gradebookData, setGradebookData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!taskId || !sectionId) return;

        const fetchData = async () => {
            setLoading(true);
            try {
                // 1. Fetch Students in Section (Master List)
                // Assuming 'users' collection has a 'section' field and 'role' field
                const studentsQuery = query(
                    collection(db, "users"), 
                    where("section", "==", sectionId),
                    where("role", "==", "student")
                );
                const studentsSnapshot = await getDocs(studentsQuery);
                const students = studentsSnapshot.docs.map(doc => ({
                    uid: doc.id,
                    ...doc.data()
                }));

                // 2. Fetch Submissions for this Task
                const submissionsQuery = query(
                    collection(db, "submissions"), 
                    where("taskId", "==", taskId)
                );
                const submissionsSnapshot = await getDocs(submissionsQuery);
                const submissions = submissionsSnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));

                // 3. Merge Data (Left Join: Students -> Submissions)
                const mergedData = students.map(student => {
                    const submission = submissions.find(sub => sub.studentId === student.uid);

                    if (submission) {
                        return {
                            student: student,
                            submissionId: submission.id,
                            status: submission.status || "submitted", // default if missing
                            score: submission.score || 0,
                            submittedAt: submission.submittedAt,
                            answers: submission.answers || null, // Map the 'answers' field from sample
                            codeSubmitted: submission.codeSubmitted || null, // Map the 'codeSubmitted' field
                            feedback: submission.feedback || ""
                        };
                    } else {
                        return {
                            student: student,
                            submissionId: null,
                            status: "missing",
                            score: 0,
                            submittedAt: null,
                            answers: null,
                            codeSubmitted: null,
                            feedback: ""
                        };
                    }
                });

                setGradebookData(mergedData);
            } catch (err) {
                console.error("Error fetching gradebook data:", err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [taskId, sectionId]);

    // 4. Update Grade Function
    const updateGrade = async (submissionId, studentId, newScore, feedback) => {
        try {
            if (submissionId) {
                // Update existing submission
                const submissionRef = doc(db, "submissions", submissionId);
                await updateDoc(submissionRef, {
                    score: Number(newScore),
                    feedback: feedback,
                    status: "graded",
                    gradedAt: new Date().toISOString()
                });
            } else {
                // Create a "graded empty submission" if the teacher grades a missing assignment (e.g., giving a 0)
                // This is optional but good for record keeping
                await addDoc(collection(db, "submissions"), {
                    taskId: taskId,
                    studentId: studentId,
                    score: Number(newScore),
                    feedback: feedback,
                    status: "graded", // Automatically graded (likely 0)
                    submittedAt: null, // Never submitted
                    gradedAt: new Date().toISOString()
                });
            }

            // Optimistic UI Update
            setGradebookData(prev => prev.map(item => {
                if (item.student.uid === studentId) {
                    return {
                        ...item,
                        score: Number(newScore),
                        feedback: feedback,
                        status: "graded"
                    };
                }
                return item;
            }));

            return true;
        } catch (err) {
            console.error("Error updating grade:", err);
            setError(err.message);
            return false;
        }
    };

    return { gradebookData, loading, error, updateGrade };
}