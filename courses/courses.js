const coursesURL = 'http://localhost:8080/courses';
const table = document.getElementById("coursesTable");
const tableBody = document.getElementById("coursesTableBody");
const inputNewCourse = document.getElementById("courseName");
const btnAddCourse = document.getElementById("addCourse");
const divDeleteAllRows = document.getElementById("deleteAllRows");
let courseName = "";

btnAddCourse.addEventListener('click',()=>addNewCourse());

async function getCourses(){
    const response = await fetch(coursesURL);
    
    if (response.ok) {
        const courses = await response.json();
        if (courses.length>0){
            table.removeAttribute("hidden");
            courses.forEach(course => {
                createTableRow(course);    
            });

            //CREATE A DELETE ALL BUTTON
            const btnDelete = document.createElement('button');
            const spanDelete = document.createElement('span');
            const hrLine = document.createElement('hr');
            btnDelete.setAttribute('class','btnDeleteAll btn btn-danger btn-floating bi bi-trash-fill');
            btnDelete.setAttribute('title','Delete All Courses');
            spanDelete.setAttribute('class','px-3 py-2');
            spanDelete.textContent = 'Delete All Courses:';
            btnDelete.addEventListener("click", () => deleteAllRows());
            divDeleteAllRows.setAttribute('class','d-flex justify-content-end pt-3 mt-5 border-top')
            divDeleteAllRows.appendChild(hrLine);
            divDeleteAllRows.appendChild(spanDelete);
            divDeleteAllRows.appendChild(btnDelete);

        }
    } else {
        alert('Unable to retrieve the information');
    }
}

async function addNewCourse(){
    courseName = inputNewCourse.value;

    if(courseName==''){
        alert('Please, inform the name of the new course to proceed');
    }else{
        if(courseName.length<=5){
            alert("The name of the course can't have less then 6 characters");
        } else {
            const response = await fetch(coursesURL+"", 
                {method:"POST",
                headers: {
                    "content-type": "application/json"
                },
                body: JSON.stringify({
                    name: courseName
                })})
            const data = await response.json();
            console.log(data);

            if(response.status == 201){
                alert('New Course created');
                window.location.reload();
            } 
            
        }
    }
}

async function deleteRow(id,name,row){
    const message = confirm('Do you really want to delete the course: "'+name+'"?');
    if(message){
        const response = await fetch(coursesURL+"/"+id, {method:"DELETE"});
        if (response.status == 204){
            tableBody.removeChild(row);
        } 
    }
}

async function deleteAllRows(){
    const message = confirm('Do you really want to delete all courses?');
    if(message){
        //await fetch(coursesURL, {method:"DELETE"});
        alert('All courses deleted');
        window.location.reload();
    }
}

async function editRow(id,name){
    const editCourseModal = document.getElementById('editCourseModal');
    const saveButton = document.getElementById("btSaveChanges");
    const modalTitle = editCourseModal.querySelector('.modal-title');

    modalTitle.textContent = `Edit course with id #${id}`;
    document.getElementById("updateCourseName").value = name;
    saveButton.addEventListener('click', () => updateRow(id));
    
    editCourseModal.addEventListener('show.bs.modal', event => {
        // Button that triggered the modal
        const button = event.relatedTarget;
    })

}

async function updateRow(id){
    const updateCourseName = document.getElementById('updateCourseName').value;

    if(updateCourseName==''){
        alert('Please, inform the Course name to update');
    }else{
        if(updateCourseName.length<=5){
            alert("The Course name can't have less then 6 characters");
        } else {
            const response = await fetch(coursesURL+"/"+id, 
                            {method:"PUT",
                            headers: {
                                "content-type": "application/json"
                            },
                            body: JSON.stringify({
                                name: updateCourseName
                            })});
            if(response.status == 200){
                alert('Successfully Updated');
                window.location.reload();
            } else if(response.status == 404){
                alert('Course not found');
            }
             else {
                alert('Try again!');
            }
            
        }
    }
}

function createTableRow({id,name}){
    const row = document.createElement('tr');
    const idColumn = document.createElement('th');
    const nameColumn = document.createElement('td');
    const actionsColumn = document.createElement('td');
    const btnEdit = document.createElement('button');
    const btnDelete = document.createElement('button');

    btnDelete.setAttribute('class','btnDelete btn btn-danger btn-floating bi bi-trash');
    btnDelete.setAttribute('title','Delete Course #'+id);
    btnDelete.addEventListener("click", () => deleteRow(id,name,row));
    btnEdit.setAttribute('class','btnEdit btn btn-success btn-floating bi bi-pencil-fill');
    btnEdit.setAttribute('data-bs-toggle','modal');
    btnEdit.setAttribute('data-bs-target','#editCourseModal');
    btnEdit.setAttribute('title','Edit Course #'+id);
    btnEdit.addEventListener('click', () => editRow(id,name));

    idColumn.textContent = id;
    idColumn.setAttribute("scope","row");

    nameColumn.textContent = name;

    actionsColumn.setAttribute('class','actionColumn');
    actionsColumn.appendChild(btnEdit);
    actionsColumn.appendChild(btnDelete);

    row.appendChild(idColumn);
    row.appendChild(nameColumn);
    row.appendChild(actionsColumn);

    tableBody.appendChild(row);
}


getCourses();