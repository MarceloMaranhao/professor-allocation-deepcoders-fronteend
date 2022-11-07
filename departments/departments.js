const departmentsURL = 'http://localhost:8080/departments';
const table = document.getElementById("departmentsTable");
const tableBody = document.getElementById("departmentsTableBody");
const inputNewDepartment = document.getElementById("departmentName");
const btnAddDepartment = document.getElementById("addDepartment");
const divDeleteAllRows = document.getElementById("deleteAllRows");
let departmentName = "";

btnAddDepartment.addEventListener('click',()=>addNewDepartment());

async function getDepartments(){
    const response = await fetch(departmentsURL);
    
    if (response.ok) {
        const departments = await response.json();
        if (departments.length>0){
            table.removeAttribute("hidden");
            departments.forEach(department => {
                createTableRow(department);    
            });

            //CREATE A DELETE ALL BUTTON
            const btnDelete = document.createElement('button');
            const spanDelete = document.createElement('span');
            const hrLine = document.createElement('hr');
            btnDelete.setAttribute('class','btnDeleteAll btn btn-danger btn-floating bi bi-trash-fill');
            btnDelete.setAttribute('title','Delete All Departments');
            spanDelete.setAttribute('class','px-3 py-2');
            spanDelete.textContent = 'Delete All Departments:';
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

async function addNewDepartment(){
    departmentName = inputNewDepartment.value;

    if(departmentName==''){
        alert('Please, inform the name of the new department to proceed');
    }else{
        if(departmentName.length<=5){
            alert("The name of the department can't have less then 6 characters");
        } else {
            const response = await fetch(departmentsURL, 
                            {method:"POST",
                            headers: {
                                Accept: "application/json",
                                "Content-Type": "application/json"
                            },
                            body: JSON.stringify({
                                name: departmentName
                            })});

            const data = await response.json();
            console.log(data);
            
            if(response.status == 201){
                alert('New Department created');
                //window.location.reload();
            } else {
                alert('Try again!');
            }
            
        }
    }
}

async function deleteRow(id,name,row){
    const message = confirm('Do you really want to delete the department: "'+name+'"?');
    if(message){
        const response = await fetch(departmentsURL+"/"+id, {method:"DELETE"});
        if (response.status == 200){
            tableBody.removeChild(row);
            window.location.reload();
        } else if (response.status == 400){
            message("This department is not empty. First you must detach the professor.");
        }
    }
}

async function deleteAllRows(){
    const message = confirm('Do you really want to delete all departments?');
    if(message){
        //await fetch(departmentsURL, {method:"DELETE"});
        alert('All departments deleted');
        window.location.reload();
    }
}

async function editRow(id,name){
    const editDepartmentModal = document.getElementById('editDepartmentModal');
    const saveButton = document.getElementById("btSaveChanges");
    const modalTitle = editDepartmentModal.querySelector('.modal-title');

    modalTitle.textContent = `Edit department with id #${id}`;
    document.getElementById("updateDepartmentName").value = name;
    saveButton.addEventListener('click', () => updateRow(id));
    
    editDepartmentModal.addEventListener('show.bs.modal', event => {
        // Button that triggered the modal
        const button = event.relatedTarget;
    })

}

async function updateRow(id){
    const updateDepartmentName = document.getElementById('updateDepartmentName').value;

    if(updateDepartmentName==''){
        alert('Please, inform the Department name to update');
    }else{
        if(updateDepartmentName.length<=5){
            alert("The Department name can't have less then 6 characters");
        } else {
            const response = await fetch(departmentsURL+"/"+id, 
                            {method:"PUT",
                            headers: {
                                "content-type": "application/json"
                            },
                            body: JSON.stringify({
                                name: updateDepartmentName
                            })},);
            if(response.status == 200){
                alert('Successfully Updated');
                window.location.reload();
            } else if(response.status == 404){
                alert('Department not found');
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
    btnDelete.setAttribute('title','Delete Department #'+id);
    btnDelete.addEventListener("click", () => deleteRow(id,name,row));
    btnEdit.setAttribute('class','btnEdit btn btn-success btn-floating bi bi-pencil-fill');
    btnEdit.setAttribute('data-bs-toggle','modal');
    btnEdit.setAttribute('data-bs-target','#editDepartmentModal');
    btnEdit.setAttribute('title','Edit Department #'+id);
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


getDepartments();