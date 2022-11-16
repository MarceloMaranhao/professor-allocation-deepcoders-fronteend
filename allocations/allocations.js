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
const newAllocationStart = document.getElementById("newAllocationStart");
const newAllocationEnd = document.getElementById("newAllocationEnd");
const updateAllocationCourse = document.getElementById("updateAllocationCourse");
const updateAllocationProfessor = document.getElementById("updateAllocationProfessor");
const updateAllocationDay = document.getElementById("updateAllocationDay");
const updateAllocationStart = document.getElementById("updateAllocationStart");
const updateAllocationEnd = document.getElementById("updateAllocationEnd");


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
            const iDelete = document.createElement('i');
            const hrLine = document.createElement('hr');

            btnDelete.setAttribute('class','btnDeleteAll btn btn-danger btn-floating');
            btnDelete.setAttribute('title','Delete All Allocations');
            spanDelete.setAttribute('class','px-3 py-2');
            spanDelete.textContent = 'Delete All Allocations:';
            btnDelete.addEventListener("click", () => deleteAllRows());
            iDelete.setAttribute('class','fa-solid fa-trash-can');
            btnDelete.appendChild(iDelete);
            divDeleteAllRows.setAttribute('class','d-flex justify-content-end pt-3 mt-5 border-top')
            divDeleteAllRows.appendChild(hrLine);
            divDeleteAllRows.appendChild(spanDelete);
            divDeleteAllRows.appendChild(btnDelete);

        }
    } else {
        alert('No information to retrieve');
    }
}

async function addNewAllocation(){
    let allocationProfessor = newAllocationProfessor.value;
    let allocationProfessorArray = allocationProfessor.split(";",2);
    let idProfessor = allocationProfessorArray[0];

    let allocationCourse = newAllocationCourse.value;
    let allocationCourseArray = allocationCourse.split(";",2);
    let idCourse = allocationCourseArray[0];

    let allocationDay = newAllocationDay.value;
    let allocationDayArray = allocationDay.split(";",2);
    let day = allocationDayArray[1];
    let allocationStart = newAllocationStart.value+"-0300";
    let allocationEnd = newAllocationEnd.value+"-0300";
    
    if(!validatePeriod(newAllocationStart.value,newAllocationEnd.value)){
        alert('Choose a valid period!');
    }else{
    
        try {
            const response = await fetch(allocationsURL+"", 
                {method:"POST",
                headers: {
                    "content-type": "application/json"
                },
                body: JSON.stringify({
                    courseId: idCourse,
                    professorId: idProfessor,
                    day: day,
                    start: allocationStart,
                    end: allocationEnd
                })});

            if(response.status == 201){
                alert('New Allocation created');
                window.location.reload();
            } else if (response.status == 400){
                alert('No action taken: Allocation collision!');
            };
        } 
        catch (error){
            console.log(error);
        };
    };
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
    const iEditElement = document.createElement('i');
    const iDeleteElement = document.createElement('i');

    btnDelete.setAttribute('class','btnDelete btn btn-danger btn-floating me-2');
    btnDelete.setAttribute('title','Delete Allocation #'+id);
    btnDelete.addEventListener("click", () => deleteRow(id,row));
    iDeleteElement.setAttribute('class','fa-solid fa-trash');
    btnDelete.appendChild(iDeleteElement);

    btnEdit.setAttribute('class','btnEdit btn btn-success btn-floating me-2');
    btnEdit.setAttribute('data-bs-toggle','modal');
    btnEdit.setAttribute('data-bs-target','#editAllocationModal');
    btnEdit.setAttribute('title','Edit Allocation #'+id);
    iEditElement.setAttribute('class','fa-regular fa-pen-to-square');
    btnEdit.appendChild(iEditElement);
    btnEdit.addEventListener('click', () => editRow(id,day,start,end,course,professor));

    idColumn.textContent = id;
    idColumn.setAttribute("scope","row");

    dayColumn.textContent = day;

    startColumn.textContent = subtract3Hours(start).substring(0,5);
    endColumn.textContent = subtract3Hours(end).substring(0,5);

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

function createDayOrTimeOptions(element,value,choice){
    const option = document.createElement("option")

    removeAllNodes(element);
    option.setAttribute("value",value);
    option.setAttribute("selected","selected");
    if (choice=='day')
    option.textContent = value.substring(2);
    else
        option.textContent = value;
    element.appendChild(option);
    if (choice=='day')
        getListDay(element);
    else if (choice=='time')
        addTimes(element);
}

function createCourseOrProfessorOptions(element, id, name, URL){
    removeAllNodes(element);
    const option = document.createElement("option");
    option.setAttribute("value",id+";"+name);
    option.setAttribute("selected","selected");
    option.textContent = name;
    element.appendChild(option);
    fetchList(element,URL);
}

async function editRow(id,day,start,end,course,professor){
    const editAllocationModal = document.getElementById('editAllocationModal');
    const saveButton = document.getElementById("btSaveChanges");
    const modalTitle = editAllocationModal.querySelector('.modal-title');

    modalTitle.textContent = `Edit allocation with id #${id}`;

    let specificWeekDay = findSpecificWeekDay(day);
    let startPlus3 = subtract3Hours(start).substring(0,5);
    let endPlus3 = subtract3Hours(end).substring(0,5);

    createDayOrTimeOptions(updateAllocationDay,specificWeekDay,"day");
    createDayOrTimeOptions(updateAllocationStart,startPlus3,"time");
    createDayOrTimeOptions(updateAllocationEnd,endPlus3,"time");

    document.getElementById("currentId").value = id;

    createCourseOrProfessorOptions(updateAllocationCourse, course.id, course.name, coursesURL);
    createCourseOrProfessorOptions(updateAllocationProfessor, professor.id, professor.name, professorsURL);

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
    let allocationDayArray = updateAllocationDay.split(";",2);
    let idCourse = allocationCourseArray[0];
    let idProfessor = allocationProfessorArray[0];


    let startLocale = updateAllocationStart + "-0300";
    let endLocale = updateAllocationEnd + "-0300";
    let validDay = allocationDayArray[1];

    console.log("Updating allocation...");
    console.log("URL: "+allocationsURL+"/"+idAllocation);
    console.log("Day: "+validDay+" Start: " + startLocale + " End: "+ endLocale + " Course Id:" + idCourse + " Professor Id:" + idProfessor);

    if(!validatePeriod(updateAllocationStart,updateAllocationEnd)){
        alert('Choose a valid period!');
    }else{
        const response = await fetch(allocationsURL+"/"+idAllocation, 
                        {method:"PUT",
                        headers: {
                            "content-type": "application/json"
                        },
                        body: JSON.stringify({
                            courseId: idCourse,
                            professorId: idProfessor,
                            day: validDay,
                            start: startLocale,
                            end: endLocale
                        })});
        if(response.status == 200){
            alert('Successfully Updated');
            window.location.reload();
        } else if(response.status == 404){
            alert('Allocation not found');
        } else {
            alert('Try again!');
        }

    }
}

function validatePeriod(start,end){
    if(end.valueOf()<=start.valueOf()){
        return false;
    } else 
        return true;
}

function subtract3Hours(value){
    let newValue = parseInt(value.substring(0,2));
    let newStringValue = "00:00-0300";
    
    if(newValue==2)
        newStringValue = "23:00-0300";
    else if (newValue==1) 
        newStringValue = "22:00-0300";
    else if (newValue==0)
        newStringValue = "21:00-0300";
    else if (newValue<10 && newValue >2)
        newStringValue = "0"+(newValue - 3)+":00-0300";
    else if (newValue>12)
        newStringValue = (newValue - 3) + ":00-0300";
    else
        newStringValue = "0" + (newValue - 3) + ":00-0300";

    return newStringValue;
}

function findSpecificWeekDay(newValue){
    if(newValue=="SATURDAY")
        return "7;SATURDAY"
    else if (newValue=="SUNDAY")
        return "1;SUNDAY"
    else if (newValue=="MONDAY")
        return "2;MONDAY"
    else if (newValue=="TUESDAY")
        return "3;TUESDAY"
    else if (newValue=="WEDNESDAY")
        return "4;WEDNESDAY"
    else if (newValue=="THURSDAY")
        return "5;THURSDAY"
    else 
        return "6;FRIDAY"
};

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
    }catch(error){
        console.log(error);
    }
};

async function deleteAllRows(){
    const message = confirm('Do you really want to delete all allocations?');
    if(message){
        //await fetch(professorsURL, {method:"DELETE"});
        alert('All allocations deleted');
        window.location.reload();
    }
};

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

function getListDay(element){
    const days = ["1;SUNDAY", "2;MONDAY", "3;TUESDAY", "4;WEDNESDAY", "5;THURSDAY", "6;FRIDAY", "7;SATURDAY"];
    days.forEach(item => {
        let option = document.createElement("option");
        option.setAttribute("value",item.valueOf());
        option.textContent = item.valueOf().substring(2);
        element.appendChild(option);
    });
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

function addTimes(element){
    let i;
    for(i=0;i<=23;i++){
        let option = document.createElement("option");
        if(i<=9){
            option.setAttribute("value","0"+i+":00");
            option.textContent = "0"+i+":00";
        }
        else {
            option.setAttribute("value",i+":00");
            option.textContent = i+":00";
        }
        element.appendChild(option);
    }
}

$(document).ready(function(){
    addTimes(newAllocationStart);
    addTimes(newAllocationEnd);
    getListDay(newAllocationDay);
    btnAddAllocation.addEventListener('click',()=>addNewAllocation());
    btnAddAllocation.addEventListener("submit", (event) => {event.preventDefault();})  

    fetchList(newAllocationCourse,coursesURL);
    fetchList(newAllocationProfessor,professorsURL);
    getAllocations();
});