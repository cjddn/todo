const submitButton = document.getElementById('add-button');
const allTab = document.getElementById('ex1-tab-1');
const activeTab = document.getElementById('ex1-tab-2');
const completedTab = document.getElementById('ex1-tab-3');

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

//체크박스 눌렀을 때 완료 상태 변경시키는 이벤트
function completeEvent(button) {
    const parent = button.closest('ul');
    const titleWrap = parent.querySelector('.title-wrap');
    const id = parent.dataset.id;
    //업데이트 반대로 변경(dataset은 스네이크 케이스 카멜로 가져올 수 있음)
    const isCompleted = parent.dataset.isCompleted == 'n' ? 'y' : 'n';
    sendHttpRequest('PUT', 'http://localhost:8080/post', { id: id, updateData: { isCompleted: isCompleted } })
        .then(data => console.log(data));
}

//연필 버튼 눌렀을 때 이벤트
function editEvent(button) {
    const parent = button.closest('ul');
    const titleWrap = parent.querySelector('.title-wrap');
    const pTag = titleWrap.querySelector("p");
    const pencilIcon = parent.querySelector('.edit-button');
    const trashIcon = parent.querySelector('.delete-button');

    //연필 아이콘을 체크 아이콘으로 바꾸고 클래스 명 변경, 툴팁 제거, 클릭이벤트 함수 변경
    pencilIcon.removeAttribute("data-mdb-original-title");
    pencilIcon.firstChild.classList.replace('fa-pencil-alt', 'fa-check');
    pencilIcon.classList.replace('edit-button', 'check-button');
    pencilIcon.setAttribute("onclick", "checkEvent(this)");
    //휴지통 아이콘을 x 아이콘으로 바꾸고 클래스 명 변경, 툴팁 제거, 클릭이벤트 함수 변경
    trashIcon.removeAttribute("data-mdb-original-title");
    trashIcon.classList.replace('delete-button', 'cancel-button');
    trashIcon.firstChild.classList.replace('fa-trash-alt', 'fa-x');
    trashIcon.setAttribute("onclick", "cancelEvent(this)");


    // 수정을 위해 p태그를 input으로 변경하기 위해 input태그 생성
    const editInput = document.createElement("input");
    editInput.setAttribute("value", pTag.innerText);
    editInput.setAttribute("data-origin", pTag.innerText);
    editInput.setAttribute("class", "edit-input form-control form-control-lg");
    titleWrap.classList.add('card');
    titleWrap.replaceChild(editInput, pTag);
}
/**
 * 수정 확인버튼
 * 체크 버튼 누르면 변경사항 적용됨
 */
function checkEvent(button) {
    const parent = button.closest('ul');
    const titleWrap = parent.querySelector('.title-wrap');
    const inputTag = titleWrap.querySelector("input");
    const id = parent.dataset.id;
    sendHttpRequest('PUT', 'http://localhost:8080/post', { id: id, updateData: { title: inputTag.value } })
        .then(() => cancelEvent(button, inputTag.value))
}
/**
 * 수정 취소버튼
 * X버튼 누르면 기존 UI로 돌리기
 */
function cancelEvent(button, origin) {
    const parent = button.closest('ul');
    const titleWrap = parent.querySelector('.title-wrap');
    const inputTag = titleWrap.querySelector("input");
    const checkIcon = parent.querySelector('.check-button');
    const cancelIcon = parent.querySelector('.cancel-button');
    const pTag = document.createElement("p");
    //저장해 둔 수정 전 텍스트를 p태그로 다시 집어넣기
    pTag.innerText = origin ?? inputTag.dataset.origin;
    pTag.setAttribute("class", "lead fw-normal mb-0");
    titleWrap.classList.remove('card');
    titleWrap.replaceChild(pTag, inputTag);

    checkIcon.setAttribute("data-mdb-original-title", checkIcon.getAttribute('aria-label'));
    checkIcon.firstChild.classList.replace('fa-check', 'fa-pencil-alt');
    checkIcon.classList.replace('check-button', 'edit-button');
    checkIcon.setAttribute("onclick", "editEvent(this)");

    cancelIcon.setAttribute("data-mdb-original-title", cancelIcon.getAttribute('aria-label'));
    cancelIcon.classList.replace('cancel-button', 'delete-button');
    cancelIcon.firstChild.classList.replace('fa-x', 'fa-trash-alt');
    cancelIcon.setAttribute("onclick", "deleteEvent(this)");

}
/**
 * 삭제버튼 이벤트
 * 
 */
function deleteEvent(button) {
    const parent = button.closest('ul');
    const titleWrap = parent.querySelector('.title-wrap');
    const id = parent.dataset.id;
    sendHttpRequest('DELETE', 'http://localhost:8080/post', { id: id })
        .then(() => parent.remove())
}

function readToDoList(tabContent, url) {
    tabContent.innerHTML = '';
    sendHttpRequest('GET', url)
        .then(res => {
            res.list.forEach(function (data) {
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
                if (data.title) {
                    tabContent.insertAdjacentHTML('beforeend', `
                            <ul data-id="${data.id}" data-is-completed="${data.isCompleted}" class="list-group list-group-horizontal rounded-0">
                                <li class="list-group-item d-flex align-items-center ps-0 pe-3 py-1 rounded-0 border-0 bg-transparent">
                                    <div class="form-check">
                                        <input ${data.isCompleted == 'y' && 'checked'} onclick="completeEvent(this)" class="form-check-input me-0" type="checkbox" value="" id="flexCheckChecked2" aria-label="..." />
                                    </div>
                                </li>
                                <li class="list-group-item title-wrap px-3 py-1 d-flex align-items-center flex-grow-1 border-0 bg-transparent">
                                    <p class="lead title fw-normal mb-0">${data.title}</p>
                                </li>
                                ${data.dueDate && dueData} 
                                <li class="list-group-item ps-3 pe-0 py-1 rounded-0 border-0 bg-transparent">
                                    <div class="d-flex flex-row justify-content-end mb-1">
                                        <a onclick="editEvent(this)" class="cursor-pointer text-info edit-button" data-mdb-toggle="tooltip" title="할 일 수정하기"><i class="fas fa-pencil-alt me-3"></i></a>
                                        <a onclick="deleteEvent(this)" class="cursor-pointer text-danger delete-button" data-mdb-toggle="tooltip" title="할 일 삭제하기"><i class="fas fa-trash-alt"></i></a>
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

//전체 탭
allTab.addEventListener('click', () => {
    readToDoList(document.getElementById('all-tab'), 'http://localhost:8080/post')
})

//진행중 탭
activeTab.addEventListener('click', () => {
    readToDoList(document.getElementById('active-tab'), 'http://localhost:8080/post?isCompleted=n')
})

//완료 탭
completedTab.addEventListener('click', () =>
    readToDoList(document.getElementById('completed-tab'), 'http://localhost:8080/post?isCompleted=y')
)

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