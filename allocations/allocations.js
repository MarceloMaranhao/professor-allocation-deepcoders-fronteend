const projectURL = 'http://localhost:8080';
const professorsURL = projectURL+'/professors';
const departmentsURL = projectURL+'/departments';
const coursesURL = projectURL+'/courses';
const allocationsURL = projectURL+'/allocations';

const table = document.getElementById("allocationsTable");
const tableBody = document.getElementById("allocationsTableBody");
const btnAddAllocation = document.getElementById("addAllocation");
const divDeleteAllRows = document.getElementById("deleteAllRows");

const newAllocationCourse = document.getElementById("newAllocationCourse");
const newAllocationProfessor = document.getElementById("newAllocationProfessor");
const updateAllocationCourse = document.getElementById("updateAllocationCourse");
const updateAllocationProfessor = document.getElementById("updateAllocationProfessor");


async function getAllocations(){
    const response = await fetch(allocationsURL);
    
    if (response.ok) {
        const allocations = await response.json();
        if (allocations.length>0){
            table.removeAttribute("hidden");
            allocations.forEach(allocation => {
                createTableRow(allocation);    
            });

            //CREATE A DELETE ALL BUTTON
            const btnDelete = document.createElement('button');
            const spanDelete = document.createElement('span');
            const hrLine = document.createElement('hr');
            btnDelete.setAttribute('class','btnDeleteAll btn btn-danger btn-floating bi bi-trash-fill');
            btnDelete.setAttribute('title','Delete All Allocations');
            spanDelete.setAttribute('class','px-3 py-2');
            spanDelete.textContent = 'Delete All Allocations:';
            btnDelete.addEventListener("click", () => deleteAllRows());
            divDeleteAllRows.setAttribute('class','d-flex justify-content-end pt-3 mt-5 border-top')
            divDeleteAllRows.appendChild(hrLine);
            divDeleteAllRows.appendChild(spanDelete);
            divDeleteAllRows.appendChild(btnDelete);

        }
    } else {
        alert('No information to retrieve');
    }
}


function createTableRow({id,day,start,end,course,professor}){
    const row = document.createElement('tr');
    const idColumn = document.createElement('th');
    const dayColumn = document.createElement('td');
    const startColumn = document.createElement('td');
    const endColumn = document.createElement('td');
    const courseColumn = document.createElement('td');
    const professorColumn = document.createElement('td');
    const actionsColumn = document.createElement('td');
    const btnEdit = document.createElement('button');
    const btnDelete = document.createElement('button');

    btnDelete.setAttribute('class','btnDelete btn btn-danger btn-floating bi bi-trash');
    btnDelete.setAttribute('title','Delete Allocation #'+id);
    btnDelete.addEventListener("click", () => deleteRow(id,name,row));

    btnEdit.setAttribute('class','btnEdit btn btn-success btn-floating bi bi-pencil-fill');
    btnEdit.setAttribute('data-bs-toggle','modal');
    btnEdit.setAttribute('data-bs-target','#editAllocationModal');
    btnEdit.setAttribute('title','Edit Allocation #'+id);
    btnEdit.addEventListener('click', () => editRow(id,day,start,end,course,professor));

    idColumn.textContent = id;
    idColumn.setAttribute("scope","row");

    dayColumn.textContent = day;
    startColumn.textContent = start;
    endColumn.textContent = end;

    courseColumn.textContent = course.name;
    professorColumn.textContent = professor.name;

    actionsColumn.setAttribute('class','actionColumn');
    actionsColumn.appendChild(btnEdit);
    actionsColumn.appendChild(btnDelete);

    
    row.appendChild(idColumn);
    row.appendChild(professorColumn);
    row.appendChild(courseColumn);
    row.appendChild(dayColumn);
    row.appendChild(startColumn);
    row.appendChild(endColumn);
    row.appendChild(actionsColumn);

    tableBody.appendChild(row);
}

async function editRow(id,day,start,end,course,professor){
    const editAllocationModal = document.getElementById('editAllocationModal');
    const saveButton = document.getElementById("btSaveChanges");
    const modalTitle = editAllocationModal.querySelector('.modal-title');

    modalTitle.textContent = `Edit allocation with id #${id}`;

    const optionDay = document.createElement("option");
    optionDay.setAttribute("value",day);
    optionDay.setAttribute("selected","selected");
    optionDay.textContent = day;

    document.getElementById("updateAllocationDay").appendChild(optionDay);

    //document.getElementById("updateAllocationDay").value = day;
    
    document.getElementById("updateAllocationStart").value = start;
    document.getElementById("updateAllocationEnd").value = end;
    document.getElementById("currentId").value = id;

    removeAllNodes(updateAllocationCourse);
    const option = document.createElement("option");
    option.setAttribute("value",course.id+";"+course.name);
    option.setAttribute("selected","selected");
    option.textContent = course.name;
    updateAllocationCourse.appendChild(option);
    fetchList(updateAllocationCourse,coursesURL);

    removeAllNodes(updateAllocationProfessor);
    const option2 = document.createElement("option");
    option2.setAttribute("value",professor.id+";"+professor.name);
    option2.setAttribute("selected","selected");
    option2.textContent = course.name;
    updateAllocationCourse.appendChild(option2);
    fetchList(updateAllocationProfessor,professorsURL);

    saveButton.addEventListener('click', () => updateRow());
    
    editAllocationModal.addEventListener('show.bs.modal', event => {
        // Button that triggered the modal
        const button = event.relatedTarget;
    })

}

async function updateRow(){
    const idAllocation = document.getElementById("currentId").value;
    const updateAllocationDay = document.getElementById('updateAllocationDay').value;
    const updateAllocationStart = document.getElementById('updateAllocationStart').value;
    const updateAllocationEnd = document.getElementById('updateAllocationEnd').value;
    const updateAllocationCourse = document.getElementById('updateAllocationCourse').value;
    const updateAllocationProfessor = document.getElementById('updateAllocationProfessor').value;
    let allocationCourseArray = updateAllocationCourse.split(";",2);
    let allocationProfessorArray = updateAllocationProfessor.split(";",2);
    let idCourse = allocationCourseArray[0];
    let idProfessor = allocationProfessorArray[0];

    console.log("Updating allocation...");
    console.log("URL: "+allocationsURL+"/"+idAllocation);
    console.log("Day: "+updateAllocationDay+" Start: " + updateAllocationStart + " End: "+ updateAllocationEnd + " Course Id:" + idCourse + " Professor Id:" + idProfessor);

    //Precisa incluir validação de CPF duplicado ----------------------------------

    if(updateAllocationDay==''){
        alert('Please, choose the Day to update');
    }else{
        if(updateAllocationDay.length<=5){
            alert("The Professor name can't have less then 6 characters");
        } else if(!validateCPF(updateAllocationStart)) {
                alert("The cpf is invalid");
        } else if (updateAllocationEnd==-1) {
                alert("You must select a department");
        } else {
            const response = await fetch(allocationsURL+"/"+idAllocation, 
                            {method:"PUT",
                            headers: {
                                "content-type": "application/json"
                            },
                            body: JSON.stringify({
                                cpf: updateAllocationStart,
                                departmentId: idCourse,
                                name: updateAllocationDay
                            })});
            if(response.status == 200){
                alert('Successfully Updated');
                window.location.reload();
            } else if(response.status == 404){
                alert('Professor not found');
            }
             else {
                alert('Try again!');
            }
            
        }
    }
}

async function deleteRow(id,row){
    try {
    const message = confirm('Do you really want to delete this allocation?');
    if(message){
        const response = await fetch(allocationsURL+"/"+id, {method:"DELETE"});
        if (response.status == 204){
            tableBody.removeChild(row);
        } else {
            alert('Allocation not found');
        }
    }
    } catch(error){
        console.log(error);
    }
}

async function deleteAllRows(){
    const message = confirm('Do you really want to delete all allocations?');
    if(message){
        //await fetch(professorsURL, {method:"DELETE"});
        alert('All allocations deleted');
        window.location.reload();
    }
}

async function fetchList(element,fetchURL){
    const response = await fetch(fetchURL);
    if (response.ok) {
        
        const fetched = await response.json();

        if (fetched.length>0){
            fetched.forEach(item => {
                createOption(item,element);
            });
        }
    }
}

function removeAllNodes(element){
    while (element.hasChildNodes()) {
    element.removeChild(element.firstChild);
    }
}

function createOption({id,name},element){
    const option = document.createElement("option");
    option.setAttribute("value",id+";"+name);
    option.textContent = name;

    element.appendChild(option);
}

$(document).ready(function(){
    btnAddAllocation.addEventListener('click',()=>addNewAllocation());    

    fetchList(newAllocationCourse,coursesURL);
    fetchList(newAllocationProfessor,professorsURL);
    getAllocations();
});