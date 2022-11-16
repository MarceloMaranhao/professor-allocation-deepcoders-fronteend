const projectURL = 'http://localhost:8080';
const professorsURL = projectURL+'/professors';
const departmentsURL = projectURL+'/departments';
const optionDepartment = document.getElementById("departmentProfessor");
const newProfessorName = document.getElementById("professorName");
const newProfessorCPF = document.getElementById("professorCPF");
const newProfessorDepartment = document.getElementById("departmentProfessor");
const updateProfessorDepartment = document.getElementById("updateProfessorDepartment");
const table = document.getElementById("professorsTable");
const tableBody = document.getElementById("professorsTableBody");
const btnAddProfessor = document.getElementById("addProfessor");
const btnFindProfessor = document.getElementById("btnFindProfessor");
const divDeleteAllRows = document.getElementById("deleteAllRows");
let professorName = "";

async function getProfessors(){
    const response = await fetch(professorsURL);
    
    if (response.ok) {
        const professors = await response.json();
        if (professors.length>0){
            table.removeAttribute("hidden");
            professors.forEach(professor => {
                createTableRow(professor);    
            });

            //CREATE A DELETE ALL BUTTON
            const btnDelete = document.createElement('button');
            const spanDelete = document.createElement('span');
            const iDelete = document.createElement('i');
            const hrLine = document.createElement('hr');
            btnDelete.setAttribute('class','btnDeleteAll btn btn-danger btn-floating');
            btnDelete.setAttribute('title','Delete All Professors');
            iDelete.setAttribute('class','fa-solid fa-trash-can');
            btnDelete.appendChild(iDelete);
            spanDelete.setAttribute('class','px-3 py-2');
            spanDelete.textContent = 'Delete All Professors:';
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

/*async function findProfessorByCPF(){
    console.log("Initializing search...");
    let cpfProfessor = document.getElementById("findProfessorByCPF").value;
    if (cpfProfessor==''){
        alert("Please, inform the CPF");
    } else if(validateCPF(cpfProfessor)){
        cpfProfessor = cpfProfessor.replace(/[^\d]+/g,"");
        console.log("URL retrieving: " + professorsURL+"/cpf/"+cpfProfessor);
        const response = await fetch(professorsURL+"/cpf/"+cpfProfessor, 
        {method:"GET",
        headers: {
            "content-type": "application/json"
        }});
        alert(response.body);
        if (response.ok) {
            const professorsFind = await response.json();
            console.log("Professor searching...");
            if(professorsFind.length > 0){
                table.removeAttribute("hidden");
                removeAllNodes(tableBody);

                professorsFind.forEach(professor => {
                    createTableRow(professor); 
                    alert('1');
                });
            }else{
                alert("L: No Professor found");
            };
        } else if (response.status = 404){
            alert("R: No Professor found");
        } else {
            alert("Try again later");
        }
    } else {
        alert("Invalid CPF. Try again");
    }
}*/

async function existsCPFInDatabase(value){
    value = value.replace(/[^\d]+/g,"");
    try {
        const response = await fetch(professorsURL+"/cpf/"+value, {
            method: 'GET',
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json"
            }
          })
        if (response.status == 200){
            return true;
        } else {
            return false;
        }
    }
    catch (error){
        console.log(error);
        return false;
    }
}

async function addNewProfessor(){
    let professorName = newProfessorName.value;
    let professorCPF = newProfessorCPF.value;
    professorCPF = professorCPF.replace(/[^\d]+/g,'');
    let professorDepartment = newProfessorDepartment.value;
    let professorDepartmentArray = professorDepartment.split(";",2);
    let idDepartment = professorDepartmentArray[0];
    
    if(professorName==''){
        alert('Please, inform the name of the new professor to proceed');
    }else{
        if(professorName.length<=5){
            alert("The name of the professor can't have less then 6 characters");
        } else if(!validateCPF(professorCPF)) {
            alert("The cpf is invalid");
        } else if (await existsCPFInDatabase(professorCPF)){
            alert("Duplicate CPF in database, please inform another to continue");
        } else if (professorDepartment==-1) {
            alert("You must select a department");
        }  else {
            
            const response = await fetch(professorsURL+"", 
                {method:"POST",
                headers: {
                    "content-type": "application/json"
                },
                body: JSON.stringify({
                    name: professorName,
                    cpf : professorCPF,
                    departmentId : idDepartment
                })})
            const data = await response.json();
            console.log(data);

            if(response.status == 201){
                alert('New Professor created');
                window.location.reload();
            } 
            
        }
    }
}

async function deleteRow(id,name,row){
    try {
    const message = confirm('Do you really want to delete the professor: "'+name+'"?');
    if(message){
        const response = await fetch(professorsURL+"/"+id, {method:"DELETE"});
        if (response.status == 204){
            tableBody.removeChild(row);
        } else if (response.status == 500){
            alert('Warning: operation failed!\nThis professor is alocated. You must delete the alocation first');
        } else {
            alert('Professor not found');
        }
    }
    } catch(error){
        console.log(error);
    }
}

async function deleteAllRows(){
    const message = confirm('Do you really want to delete all professors?');
    if(message){
        //await fetch(professorsURL, {method:"DELETE"});
        alert('All professors deleted');
        window.location.reload();
    }
}

async function editRow(id,name,cpf,department){
    const editProfessorModal = document.getElementById('editProfessorModal');
    const saveButton = document.getElementById("btSaveChanges");
    const modalTitle = editProfessorModal.querySelector('.modal-title');

    modalTitle.textContent = `Edit professor with id #${id}`;
    document.getElementById("updateProfessorName").value = name;
    document.getElementById("updateProfessorCPF").value = cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
    document.getElementById("currentId").value = id;

    removeAllNodes(updateProfessorDepartment);
    const option = document.createElement("option");
    option.setAttribute("value",department.id+";"+department.name);
    option.setAttribute("selected","selected");
    option.textContent = department.name;
    updateProfessorDepartment.appendChild(option);
    getDepartments(updateProfessorDepartment);

    saveButton.addEventListener('click', () => updateRow());
    
    editProfessorModal.addEventListener('show.bs.modal', event => {
        // Button that triggered the modal
        const button = event.relatedTarget;
    })

}

async function updateRow(){
    const idProfessor = document.getElementById("currentId").value;
    const updateProfessorName = document.getElementById('updateProfessorName').value;
    let updateProfessorCPF = document.getElementById('updateProfessorCPF').value;
    updateProfessorCPF = updateProfessorCPF.replace(/[^\d]+/g,'');
    let updateProfessorDepartment = document.getElementById('updateProfessorDepartment').value;
    let professorDepartmentArray = updateProfessorDepartment.split(";",2);
    let idDepartment = professorDepartmentArray[0];

    console.log("Updating professor...");
    console.log("URL: "+professorsURL+"/"+idProfessor);
    console.log("Name: "+updateProfessorName+" CPF: "+ updateProfessorCPF + " Department Id:" + idDepartment);

    //Precisa incluir validação de CPF duplicado ----------------------------------

    if(updateProfessorName==''){
        alert('Please, inform the Professor name to update');
    }else{
        if(updateProfessorName.length<=5){
            alert("The Professor name can't have less then 6 characters");
        } else if(!validateCPF(updateProfessorCPF)) {
                alert("The cpf is invalid");
        } else if (updateProfessorDepartment==-1) {
                alert("You must select a department");
        } else {
            const response = await fetch(professorsURL+"/"+idProfessor, 
                            {method:"PUT",
                            headers: {
                                "content-type": "application/json"
                            },
                            body: JSON.stringify({
                                cpf: updateProfessorCPF,
                                departmentId: idDepartment,
                                name: updateProfessorName
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

function createTableRow({id,name,cpf,department}){
    const row = document.createElement('tr');
    const idColumn = document.createElement('th');
    const nameColumn = document.createElement('td');
    const cpfColumn = document.createElement('td');
    const departmentColumn = document.createElement('td');
    const actionsColumn = document.createElement('td');
    const btnEdit = document.createElement('button');
    const btnDelete = document.createElement('button');
    const iEditElement = document.createElement('i');
    const iDeleteElement = document.createElement('i');

    btnDelete.setAttribute('class','btnDelete btn btn-danger btn-floating me-2');
    btnDelete.setAttribute('title','Delete Professor #'+id);
    btnDelete.addEventListener("click", () => deleteRow(id,name,row));
    iDeleteElement.setAttribute('class','fa-solid fa-trash');
    btnDelete.appendChild(iDeleteElement);

    btnEdit.setAttribute('class','btnEdit btn btn-success btn-floating me-2');
    btnEdit.setAttribute('data-bs-toggle','modal');
    btnEdit.setAttribute('data-bs-target','#editProfessorModal');
    btnEdit.setAttribute('title','Edit Professor #'+id);
    iEditElement.setAttribute('class','fa-regular fa-pen-to-square');
    btnEdit.appendChild(iEditElement);
    btnEdit.addEventListener('click', () => editRow(id,name,cpf,department));

    idColumn.textContent = id;
    idColumn.setAttribute("scope","row");

    nameColumn.textContent = name;
    let maskedCPF = cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
    cpfColumn.textContent = maskedCPF;

    departmentColumn.textContent = department.name;

    actionsColumn.setAttribute('class','actionColumn');
    actionsColumn.appendChild(btnEdit);
    actionsColumn.appendChild(btnDelete);

    row.appendChild(idColumn);
    row.appendChild(nameColumn);
    row.appendChild(cpfColumn);
    row.appendChild(departmentColumn);
    row.appendChild(actionsColumn);

    tableBody.appendChild(row);
}

function validateCPF(strCPF) {
    strCPF = strCPF.replace(/[^\d]+/g,'');
    var addNumbers;
    var leftOver;
    addNumbers = 0;
    if (strCPF == "00000000000") return false;

    for (i=1; i<=9; i++) addNumbers = addNumbers + parseInt(strCPF.substring(i-1, i)) * (11 - i);
    leftOver = (addNumbers * 10) % 11;

    if ((leftOver == 10) || (leftOver == 11))  leftOver = 0;
    if (leftOver != parseInt(strCPF.substring(9, 10)) ) return false;

    addNumbers = 0;
    for (i = 1; i <= 10; i++) addNumbers = addNumbers + parseInt(strCPF.substring(i-1, i)) * (12 - i);
    leftOver = (addNumbers * 10) % 11;

    if ((leftOver == 10) || (leftOver == 11))  leftOver = 0;
    if (leftOver != parseInt(strCPF.substring(10, 11) ) ) return false;
    return true;
}

function removeAllNodes(element){
    while (element.hasChildNodes()) {
    element.removeChild(element.firstChild);
    }
}

async function getDepartments(element){
    const response = await fetch(departmentsURL);
    if (response.ok) {
        
        const departments = await response.json();

        if (departments.length>0){
            departments.forEach(department => {
                createOption(department,element);
            });
        }
    }
}

function createOption({id,name},element){
    const option = document.createElement("option");
    option.setAttribute("value",id+";"+name);
    option.textContent = name;

    element.appendChild(option);
}

/*function callFindByCPF(){
    console.log("Calling Find Professor");
    findProfessorByCPF();
   
}*/

$(document).ready(function(){
    btnAddProfessor.addEventListener('click',()=>addNewProfessor());
    btnAddProfessor.addEventListener("submit", (event) => {event.preventDefault();})
    //btnFindProfessor.addEventListener('click',()=>findProfessorByCPF());
    //btnFindProfessor.setAttribute('onclick','javascript: callFindByCPF();');

    $('#professorCPF').mask('000.000.000-00');
    $('#updateProfessorCPF').mask('000.000.000-00');
    //$('#findProfessorByCPF').mask('000.000.000-00');

    getDepartments(optionDepartment);
    getProfessors();
});