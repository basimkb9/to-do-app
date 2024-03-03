let country = "Pakistan", population = 260, isIsland = false, language;

console.log("Country: " + country + "\nPopulation: " + population + " million\n" + "Language: " + language + "\nIs "+ country + " an island? " + isIsland);


let itemList = [];
  
  const inputText = document.getElementById("task-name");
  const listContainer = document.getElementById("list-container");
  
  renderList(itemList);

  function fetchJSONAndStoreInArray() {
    return fetch('db.json')
      .then((response) => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then((data) => {
        itemList = data.tasks;
        return itemList;
      })
      .catch((error) => {
        console.error('There was a problem with the fetch operation:', error);
        itemList = [];
        return itemList;
        
      });
  }

  function addTask() {
  let inputValue = inputText.value;

  if (inputValue === '') {
    alert('Please write a task name!');
  } else {
    const newTaskId = getMaxId() + 1;

    const newTask = {
      id: newTaskId,
      task: inputValue.trim(),
      status: 'incomplete',
    };

    // Add the new task to the itemList
    itemList.push(newTask);

    // Render the updated list
    renderList(itemList);

    // Send a POST request to add the new task to the JSON data
    fetch('http://localhost:3000/tasks', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newTask),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then((data) => {
        // Handle the response from your API if needed
        console.log('Task added successfully:', data);
      })
      .catch((error) => {
        console.error('There was a problem with the POST request:', error);
        // You might want to handle errors here
      });

    inputText.value = '';
  }
  }

  function deleteTask(id){
  const getTask = itemList.findIndex(item => item.id === id);

  if(getTask !== -1){
      // itemList.splice(getTask,1);

      fetch(`http://localhost:3000/tasks/${id}`,{
          method: 'DELETE',
          headers: {
              'Content-type' : 'application/json'
          }
      })

      renderList(itemList);
  }
  }

  function markAsComplete(id) {
  const taskIndex = itemList.findIndex(item => item.id === id);

  if (taskIndex !== -1) {
      const updatedTask = {
          task: itemList[taskIndex].task,
          status: 'complete'
      }

      console.log(updatedTask);

      fetch(`http://localhost:3000/tasks/${id}`, {
              method: 'PUT',
              headers:
              {
                  'Content-type' : 'application/json'
              },
              body : JSON.stringify(updatedTask)
          }
      )

      // renderList(itemList);
  }
  }

  function renderList(itemList) {
  // Call the function to fetch JSON and store it in an array
  fetchJSONAndStoreInArray()
  .then((itemList) => {
      console.log(itemList);

      
  listContainer.innerHTML = "";

  for(let item of itemList){
      const listItem = document.createElement("li")
      listItem.className = "list-item";

      const taskText = document.createElement("p");
      taskText.textContent = item.task;

      if(item.status === "complete"){
          taskText.className = "completed";

          const actionsDiv = document.createElement("div")
          actionsDiv.className = "actions";

          actionsDiv.innerHTML = `
              <button class="btn btn-warning" disabled>Completed</button>
              <button class="btn btn-danger" onClick="deleteTask(${item.id})">Remove</button>    
          `;
              
          listItem.appendChild(taskText);
          listItem.appendChild(actionsDiv);

      }

      else{ 
          taskText.className = "incomplete";

          const actionsDiv = document.createElement("div")
          actionsDiv.className = "actions";

          actionsDiv.innerHTML = `
          
          <div class="actions">
              <button class="btn btn-primary" onClick="editTask(${item.id})">Edit</button>
              <button class="btn btn-warning" onClick="markAsComplete(${item.id})">Mark as Complete</button>
              <button class="btn btn-danger" onClick="deleteTask(${item.id})">Remove</button>
          </div>
          
          `;

          listItem.appendChild(taskText);
          listItem.appendChild(actionsDiv);

      }


      listContainer.appendChild(listItem);
  }
  });


  }

  function editTask(id){
  const editDiv = document.getElementById("edit-form");
  const taskIndex = itemList.findIndex(item => item.id === id);
  const existingTaskName = itemList[taskIndex].task;


  editDiv.style.cssText = `
      display: inline-flex;
      justify-content: center;
      z-index: 99;
  `;


  editDiv.innerHTML = `
      <button id="edit-close" class="closebutton" onclick="closeEditForm()"><span>X</span></button>
      
      <input type="text" id="task-name" class="form-control" value="${existingTaskName}">
      <button class="btn btn-success" id="update" onclick="updateTask(${id})">UPDATE</button>
  `;

  }

  function closeEditForm(){
  const editForm = document.getElementById("edit-form");

  editForm.style.display = "none";

  renderList(itemList);
  }

  function updateTask(id) {
  const updatedTask = {
    id: id,
    task: document.getElementById("edit-form").querySelector("#task-name").value.trim(),
    status: getStatus(id),
  };

  for (let item of itemList) {
    if (item.id === id) {
      item.task = updatedTask.task;
      item.status = updatedTask.status;
    }
  }

  fetch(`http://localhost:3000/tasks/${id}`, {
    method: 'PUT',
    headers: {
      'Content-type': 'application/json',
    },
    body: JSON.stringify(updatedTask), // Pass the updatedTask object, not an object with { task: updatedTask }
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    })
    .then((data) => {
      console.log('Task updated successfully', data);

      closeEditForm(id);
      renderList(itemList);
    })
    .catch((error) => {
      console.error('There was a problem with the PUT request: ', error);
      alert('There was some error: ' + error.message); // Concatenate the error message
    });
  }

  function getMaxId(){
  let max = 0;

  for (let item of itemList) {
      if(item.id > max){
          max = item.id;
      }
  }

  return max;
  }

function getStatus(id){
    const item = itemList.findIndex(item => item.id === id);
    const status = itemList[item].status;

    return status;
}

