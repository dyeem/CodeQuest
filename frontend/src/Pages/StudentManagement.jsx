import { useEffect, useState, Fragment } from 'react';
import bg from "../assets/SMbg.png";
import Banner from '../Components/Banner';
import { Search, Funnel } from 'lucide-react';
import studentImg from "../assets/student.png";
import { Dialog, Transition } from '@headlessui/react';
import battlemode from '../assets/battlemode.png';
import adventuremode from '../assets/adventuremode.png';
import specialchallenge from '../assets/specialchallenge.png';
import debugmode from "../assets/debugmode.png";

export default function StudentManagement() {
  useEffect(() => {
    document.title = "Student Management | CodeQuest";
  }, []);

  const [search, setSearch] = useState("");
  const [selectedClass, setSelectedClass] = useState("All");
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const studentsData = [
    { id: 1, name: "John Doe", class: "Class A", progress: 35 },
    { id: 2, name: "Jane Smith", class: "Class B", progress: 50 },
    { id: 3, name: "Alice Johnson", class: "Class C", progress: 75 },
    { id: 4, name: "Bob Lee", class: "Class A", progress: 90 },
    { id: 5, name: "Michael Brown", class: "Class B", progress: 65 },
    { id: 6, name: "Emily Davis", class: "Class C", progress: 80 },
    { id: 7, name: "David Wilson", class: "Class A", progress: 45 },
    { id: 8, name: "Sophia Martinez", class: "Class B", progress: 55 },
    { id: 9, name: "Chris Taylor", class: "Class C", progress: 70 },
    { id: 10, name: "Olivia Anderson", class: "Class A", progress: 95 },
    { id: 11, name: "Daniel Thomas", class: "Class B", progress: 40 },
    { id: 12, name: "Isabella Jackson", class: "Class C", progress: 85 },
    { id: 13, name: "Matthew White", class: "Class A", progress: 60 },
    { id: 14, name: "Mia Harris", class: "Class B", progress: 75 },
    { id: 15, name: "Andrew Lewis", class: "Class C", progress: 50 },
    { id: 16, name: "Charlotte Robinson", class: "Class A", progress: 30 },
    { id: 17, name: "Joshua Walker", class: "Class B", progress: 80 },
    { id: 18, name: "Amelia Hall", class: "Class C", progress: 90 },
    { id: 19, name: "Ethan Allen", class: "Class A", progress: 65 },
    { id: 20, name: "Harper Young", class: "Class B", progress: 55 },
    ];


  const classes = ["All", ...new Set(studentsData.map((s) => s.class))];

  const filteredStudents = studentsData.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(search.toLowerCase());
    const matchesClass =
      selectedClass === "All" || s.class === selectedClass;
    return matchesSearch && matchesClass;
  });

  const openModal = (student) => {
    setSelectedStudent(student);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedStudent(null);
  };

  return (
    <div
      className="font-rajdhani min-h-screen w-full flex tracking-wide justify-center bg-fixed"
      style={{
        backgroundImage: `url(${bg})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="mt-14 w-full">
        <Banner />
        <div className="bg-white/70 px-50 py-8">
          <div className="flex justify-between items-center mb-5">
            <p className="text-4xl font-bold text-[#212832] mb-6">
              Student Management Page
            </p>

            <div className="flex items-center gap-3">
              <div className="flex items-center bg-[#bbbbbb] rounded-full px-3 py-2 cursor-pointer">
                <Funnel className="text-gray-900 mr-2" />
                <select
                  value={selectedClass}
                  onChange={(e) => setSelectedClass(e.target.value)}
                  className="bg-transparent focus:outline-none text-gray-900 font-semibold"
                >
                  {classes.map((cls) => (
                    <option key={cls} value={cls}>
                      {cls}
                    </option>
                  ))}
                </select>
              </div>

              {/* Search Input */}
              <div className="flex items-center bg-[#bbbbbb] rounded-full px-3 py-2 w-full md:w-auto">
                <label htmlFor="student-search" className="sr-only">
                  Search Students
                </label>
                <input
                  type="search"
                  id="student-search"
                  placeholder="Search students..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="bg-transparent text-white font-semibold placeholder-gray-900 focus:outline-none w-full"
                />
                <Search className="text-gray-900 hover:text-white cursor-pointer" />
              </div>
            </div>
          </div>

          {/* Students Grid */}
          <div className="grid grid-cols-6 gap-5">
            {filteredStudents.map((student) => (
              <div
                key={student.id}
                className="flex flex-col items-center bg-gray-200/70 p-3 cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => openModal(student)}
              >
                <div className="bg-gray-400/70 flex items-center rounded-full p-3">
                  <img
                    src={studentImg}
                    alt={student.name}
                    className="w-24 h-24 object-cover rounded-full"
                  />
                </div>
                <div className="flex flex-col items-center mt-2">
                  <p className="text-xl font-semibold text-[#212832]">
                    {student.name}
                  </p>
                  <p className="text-gray-700">{student.class}</p>
                </div>
                <p className="font-semibold text-2xl mt-2">
                  Progress: {student.progress}%
                </p>
                <div className="w-full h-3 bg-gray-300 rounded-full overflow-hidden mt-1">
                  <div
                    className="h-3 bg-blue-500 rounded-full transition-all duration-500"
                    style={{ width: `${student.progress}%` }}
                  ></div>
                </div>
              </div>
            ))}

            {filteredStudents.length === 0 && (
              <p className="col-span-full text-center text-gray-700 py-10">
                No students found.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Modal */}
      <Transition appear show={isModalOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={closeModal}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/70" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center font-rajdhani">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-5xl transform overflow-hidden rounded-2xl bg-transparent p-6 text-left align-middle shadow-xl transition-all">
                    <Dialog.Title
                        as="h3"
                        className="text-gray-900 bg-white flex justify-between items-center px-5 py-3 rounded-t-lg shadow"
                        >
                        {/* Left: Student info */}
                        <div className="flex items-center gap-4">
                            <div className="p-2 bg-gray-200 rounded-full">
                            <img
                                src={studentImg}
                                alt={selectedStudent?.name}
                                className="w-20 h-20 object-cover rounded-full"
                            />
                            </div>
                            <div className="flex flex-col">
                            <span className="text-3xl font-bold">{selectedStudent?.name}</span>
                            <span className="text-xg font-semibold text-gray-600">{selectedStudent?.class}</span>
                            </div>
                        </div>

                        {/* center: Progress or optional actions */}
                        <div className="flex flex-col items-center">
                            <span className="text-2xl font-bold text-gray-900">
                                Progress: {selectedStudent?.progress}%
                            </span>
                            <div className="w-24 h-3 bg-gray-300 rounded-full mt-1 overflow-hidden">
                            <div
                                className="h-3 bg-blue-500 rounded-full transition-all duration-500"
                                style={{ width: `${selectedStudent?.progress}%` }}
                            ></div>
                            </div>
                        </div>
                        <div className="flex flex-col items-center text-center">
                            <span className="text-2xl font-bold text-gray-900">
                                Total Earned Points:
                            </span>
                            <span className='text-2xl font-semibold'>5000</span>
                        </div>
                    </Dialog.Title>
                    <div className="mt-5" style={{ backgroundImage: `url(${specialchallenge})`, backgroundSize: "cover", backgroundPosition: "center"}}>
                        <div className="flex flex-col items-center text-3xl justify-center p-5 font-bold text-white" style={{ WebkitTextStroke: "2px black" }}>
                            <p >Special Challenges</p>
                            <p >Completed: 4</p>
                            <p >Ongoing: 4</p>
                        </div>
                    </div>
                    <div className="mt-2" style={{ backgroundImage: `url(${adventuremode})`, backgroundSize: "cover", backgroundPosition: "center"}}>
                        <div className="flex flex-col items-center text-3xl justify-center p-5 font-bold text-white" style={{ WebkitTextStroke: "2px black" }}>
                            <p >Adventure Mode</p>
                            <p >Progress: 20%</p>
                            <p >Total Earn Points:</p>
                            <p >5000</p>
                        </div>
                    </div>
                    <div className="mt-2" style={{ backgroundImage: `url(${battlemode})`, backgroundSize: "cover", backgroundPosition: "center"}}>
                        <div className="flex flex-col items-center text-3xl justify-center p-5 font-bold text-white" style={{ WebkitTextStroke: "2px black" }}>
                            <p >Battle Mode</p>
                            <p >Current Rank: 2</p>
                            <p >Total Earn Points:</p>
                            <p >5000</p>
                        </div>
                    </div>
                    <div className="mt-2" style={{ backgroundImage: `url(${debugmode})`, backgroundSize: "cover", backgroundPosition: "center"}}>
                        <div className="flex flex-col items-center text-3xl justify-center p-5 font-bold text-white" style={{ WebkitTextStroke: "2px black" }}>
                            <p >Debug Mode</p>
                            <p >Highest Level Reach: 10</p>
                            <p >Total Earn Points:</p>
                            <p >5000</p>
                        </div>
                    </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </div>
  );
}
