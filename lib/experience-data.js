import first14 from "../data/first-14-days.json";
import transportGuides from "../data/transport-guides.json";
import studentJobBoardAu from "../data/student-job-board-au.json";

/** @param {string} key */
export function getFirst14Days(key) {
  return first14[key] ?? null;
}

/** @param {string} key */
export function getTransportGuide(key) {
  return transportGuides[key] ?? null;
}

export function getStudentJobBoardAu() {
  return studentJobBoardAu;
}
