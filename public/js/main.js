

const submitButton = document.getElementById('add-button');
const allTab = document.getElementById('ex1-tab-1');
const activeTab = document.getElementById('ex1-tab-2');
const completedTab = document.getElementById('ex1-tab-3');

window.addEventListener('DOMContentLoaded',()=>{
    readToDoList(document.getElementById('all-tab'), 'http://localhost:8080/post')
})

//추가하기 클릭 이벤트
submitButton.addEventListener('click', () => {
    const title = document.querySelector('.todo-title').value;
    const dueDate = document.querySelector('.due-date').value;
    const response = sendHttpRequest('POST', 'http://localhost:8080/post', { title: title, dueDate: dueDate })
        .then(() => {
            document.querySelector('.todo-title').value = null;
            document.querySelector('.nav-link.active').click();
        }).catch(error => console.log(error))
})

function readToDoList(tabContent, url) {
    tabContent.innerHTML = '';
    sendHttpRequest('GET', url)
    .then(res => {   
        res.list.forEach(function(data) { 
            let dueData = `
                <li class="list-group-item px-3 py-1 d-flex align-items-center border-0 bg-transparent">
                    <div class="py-2 px-3 me-2 border border-warning rounded-3 d-flex align-items-center bg-light">
                        <p class="small mb-0">
                            <a data-mdb-toggle="tooltip" title="마감일">
                                <i class="fas fa-hourglass-half me-2 text-warning"></i>
                            </a>
                        ${data.dueDate}
                        </p>
                    </div>
                </li>
            `
            if(data.title) { 
                tabContent.insertAdjacentHTML('beforeend', `
                    <ul class="list-group list-group-horizontal rounded-0">
                        <li class="list-group-item d-flex align-items-center ps-0 pe-3 py-1 rounded-0 border-0 bg-transparent">
                            <div class="form-check">
                                <input class="form-check-input me-0" type="checkbox" value="" id="flexCheckChecked2" aria-label="..." />
                            </div>
                        </li>
                        <li class="list-group-item px-3 py-1 d-flex align-items-center flex-grow-1 border-0 bg-transparent">
                            <p class="lead fw-normal mb-0">${data.title}</p>
                        </li>
                        ${data.dueDate && dueData} 
                        <li class="list-group-item ps-3 pe-0 py-1 rounded-0 border-0 bg-transparent">
                            <div class="d-flex flex-row justify-content-end mb-1">
                                <a class="cursor-pointer text-info" data-mdb-toggle="tooltip" title="할 일 수정하기"><i class="fas fa-pencil-alt me-3"></i></a>
                                <a class="cursor-pointer text-danger" data-mdb-toggle="tooltip" title="할 일 삭제하기"><i class="fas fa-trash-alt"></i></a>
                            </div>
                            <div class="text-end text-muted">
                                <a class="cursor-pointer text-muted" data-mdb-toggle="tooltip" title="생성일">
                                    <p class="small mb-0"><i class="fas fa-info-circle me-2"></i>${data.createdAt}</p>
                                </a>
                            </div>
                        </li>
                    </ul>
                `)  
            }      
        })         
    })
    .catch(error => console.log(error))
}

allTab.addEventListener('click', () => {
    readToDoList(document.getElementById('all-tab'), 'http://localhost:8080/post')
})

activeTab.addEventListener('click', () => {
    readToDoList(document.getElementById('active-tab'), 'http://localhost:8080/post?isCompleted=n')
})

completedTab.addEventListener('click', () => {
    readToDoList(document.getElementById('completed-tab'), 'http://localhost:8080/post?isCompleted=y')
})

//ajax 통신
async function sendHttpRequest(method, url = '', data = {}) {
    if (method === 'GET') {
        const response = await fetch(url);
        return response.json();
    }

    const response = await fetch(url, {
        method: method,
        mode: 'cors',
        cache: 'no-cache',
        credentials: 'same-origin',
        headers: {
            'Content-Type': 'application/json',
        },
        redirect: 'follow',
        referrerPolicy: 'no-referrer',
        body: JSON.stringify(data),
    });
}