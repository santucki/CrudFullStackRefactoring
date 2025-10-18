/**
*    File        : frontend/js/controllers/studentsController.js
*    Project     : CRUD PHP
*    Author      : Tecnologías Informáticas B - Facultad de Ingeniería - UNMdP
*    License     : http://www.gnu.org/licenses/gpl.txt  GNU GPL 3.0
*    Date        : Mayo 2025
*    Status      : Prototype
*    Iteration   : 3.0 ( prototype )
*/

import { studentsAPI } from '../api/studentsAPI.js';

//2.0
//For pagination:
let currentPage = 1;
let totalPages = 1;
const limit = 5;

document.addEventListener('DOMContentLoaded', () => {   // Cargar cuando el DOM esté listo
    loadStudents();             // Cargar y mostrar la lista de estudiantes
    setupFormHandler();         // Configurar el manejador del formulario
    setupCancelHandler();       // Configurar el botón de cancelar
    setupPaginationControls();  // 2.0 - Configurar controles de paginación
});
  
function setupFormHandler() {     // Configurar el envio del formulario
    const form = document.getElementById('studentForm');    //Busca el formulario por ID "studentForm"
    form.addEventListener('submit', async e => {            //Configura form para no recargar la pagina al enviarse
        e.preventDefault();                                 //Cancela el comportamiento por defecto del navegador
        const student = getFormData();                      //Obtiene los datos del formulario          
        try {
            if (student.id) { // Si hay ID, es una actualización
                await studentsAPI.update(student);
            } 
            else {           // Si no hay ID, es una creación
                await studentsAPI.create(student);
            }
            clearForm();     // Limpia el formulario
            loadStudents();  // Recarga la lista de estudiantes
        }
        catch (err){
            console.error(err.message);
        }
    });
}

function setupCancelHandler() {   // Configurar el botón de cancelar
    const cancelBtn = document.getElementById('cancelBtn');
    cancelBtn.addEventListener('click', () => {             // Al hacer clic en cancelar
        document.getElementById('studentId').value = '';    // Limpia el campo oculto de ID
    });
}

//2.0
function setupPaginationControls() // Configurar controles de paginación
{
    document.getElementById('prevPage').addEventListener('click', () => 
    {
        if (currentPage > 1) 
        {
            currentPage--;
            loadStudents();
        }
    });

    document.getElementById('nextPage').addEventListener('click', () => 
    {
        if (currentPage < totalPages) 
        {
            currentPage++;
            loadStudents();
        }
    });

    document.getElementById('resultsPerPage').addEventListener('change', e => 
    {
        currentPage = 1;
        loadStudents();
    });
}

function getFormData() {          // Obtener datos del formulario
    return {
        id: document.getElementById('studentId').value.trim(),          // Campo oculto para ID
        fullname: document.getElementById('fullname').value.trim(),     // Nombre completo
        email: document.getElementById('email').value.trim(),           // Email
        age: parseInt(document.getElementById('age').value.trim(), 10)  // Edad
    };
    //trim() elimina espacios en blanco al inicio y al final de una cadena
    //parseInt(valor, base) convierte una cadena en un número entero, el segundo parámetro (10) indica que es base decimal
}
  
function clearForm() {            // Limpiar el formulario
    document.getElementById('studentForm').reset();
    //reset() restablece todos los campos del formulario a sus valores iniciales
    document.getElementById('studentId').value = '';
}
/*//////////  1.0 LOAD STUDENTS SIN PAGINACIÓN //////////    

async function loadStudents() {   //Carga desde el backend y los muestra en la tabla
    try {
        const students = await studentsAPI.fetchAll();
        //fetchAll() obtiene la lista de estudiantes desde el backend
        renderStudentTable(students);
    } 
    catch (err) {
        console.error('Error cargando estudiantes:', err.message);
    }
}*/

////////////// 2.0 LOAD STUDENTS CON PAGINACIÓN //////////
async function loadStudents()
{
    try 
    {
        const resPerPage = parseInt(document.getElementById('resultsPerPage').value, 10) || limit;
        const data = await studentsAPI.fetchPaginated(currentPage, resPerPage);
        console.log(data);
        renderStudentTable(data.students);
        totalPages = Math.ceil(data.total / resPerPage);
        document.getElementById('pageInfo').textContent = `Página ${currentPage} de ${totalPages}`;
    } 
    catch (err) 
    {
        console.error('Error cargando estudiantes:', err.message);
    }
}

function renderStudentTable(students) {   // Renderiza la tabla de estudiantes
    const tbody = document.getElementById('studentTableBody');  // Cuerpo de la tabla donde se mostrarán los estudiantes
    tbody.replaceChildren();    // Limpia el contenido existente
  
    students.forEach(student => {   // Recorre cada estudiante y crea una fila en la tabla
        const tr = document.createElement('tr');
    
        tr.appendChild(createCell(student.fullname));
        tr.appendChild(createCell(student.email));
        tr.appendChild(createCell(student.age.toString()));
        //tostring() convierte el número de edad a cadena para mostrarlo en la tabla
        tr.appendChild(createActionsCell(student)); // Celda con botones de acción
    
        tbody.appendChild(tr); // Agrega la fila al cuerpo de la tabla
    });
}
  
function createCell(text) {   // Crea una celda de tabla con el texto dado
    const td = document.createElement('td');
    td.textContent = text;
    //textContent establece el contenido de texto de la celda
    return td;
}
  
function createActionsCell(student) {  // Crea la celda de acciones (editar, borrar)
    const td = document.createElement('td');
  
    const editBtn = document.createElement('button');
    editBtn.textContent = 'Editar';
    editBtn.className = 'w3-button w3-blue w3-small';
    editBtn.addEventListener('click', () => fillForm(student));
  
    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = 'Borrar';
    deleteBtn.className = 'w3-button w3-red w3-small w3-margin-left';
    deleteBtn.addEventListener('click', () => confirmDelete(student.id));
  
    td.appendChild(editBtn);
    td.appendChild(deleteBtn);
    return td;
}
  
function fillForm(student) { // Rellena el formulario con los datos del estudiante para editar
    document.getElementById('studentId').value = student.id;
    document.getElementById('fullname').value = student.fullname;
    document.getElementById('email').value = student.email;
    document.getElementById('age').value = student.age;
}
  
async function confirmDelete(id) {
    if (!confirm('¿Estás seguro que deseas borrar este estudiante?')) return;
    try {
        await studentsAPI.remove(id);   // Elimina el estudiante por ID
        loadStudents();                 // Recarga la lista de estudiantes  
    } 
    catch (err) {
        console.error('Error al borrar:', err.message);
    }
}
  