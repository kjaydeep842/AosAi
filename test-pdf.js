import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

try {
  const doc = new jsPDF();
  if (typeof doc.autoTable !== 'function') {
    console.log("doc.autoTable is NOT a function!");
  } else {
    console.log("doc.autoTable IS a function!");
  }
} catch (e) {
  console.log("Error:", e.message);
}
