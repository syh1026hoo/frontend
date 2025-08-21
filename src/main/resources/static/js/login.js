/**
 * 로그인 페이지 JavaScript
 * 로그인/회원가입 폼 관리
 */

let isLoginForm = true;

// 페이지 로드 시 로그인 상태 확인
document.addEventListener('DOMContentLoaded', function() {
    const isLoggedIn = sessionStorage.getItem('isLoggedIn');
    if (isLoggedIn === 'true') {
        window.location.href = '/';
    }
    
    // 이벤트 리스너 등록
    setupEventListeners();
});

// 이벤트 리스너 설정
function setupEventListeners() {
    // 폼 전환 버튼
    document.getElementById('toggleForm').addEventListener('click', toggleForm);
    
    // 로그인 폼
    document.getElementById('loginForm').addEventListener('submit', handleLogin);
    
    // 회원가입 폼
    document.getElementById('registerForm').addEventListener('submit', handleRegister);
}

// 폼 전환
function toggleForm() {
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const toggleBtn = document.getElementById('toggleForm');
    
    if (isLoginForm) {
        loginForm.style.display = 'none';
        registerForm.style.display = 'block';
        toggleBtn.textContent = '로그인하기';
        isLoginForm = false;
    } else {
        loginForm.style.display = 'block';
        registerForm.style.display = 'none';
        toggleBtn.textContent = '회원가입하기';
        isLoginForm = true;
    }
    
    // 알림 메시지 초기화
    clearAlert();
}

// 로그인 처리
async function handleLogin(e) {
    e.preventDefault();
    
    const username = document.getElementById('loginUsername').value.trim();
    const password = document.getElementById('loginPassword').value.trim();
    
    if (!username || !password) {
        showAlert('모든 필드를 입력해주세요.', 'danger');
        return;
    }
    
    try {
        const response = await fetch('/api/users/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: `usernameOrEmail=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}`
        });
        
        const data = await response.json();
        
        if (data.success) {
            showAlert('로그인 성공! 잠시 후 홈으로 이동합니다.', 'success');
            
            // 사용자 정보를 세션스토리지에 저장
            sessionStorage.setItem('user', JSON.stringify(data.user));
            sessionStorage.setItem('isLoggedIn', 'true');
            
            // 2초 후 홈으로 이동
            setTimeout(() => {
                window.location.href = '/';
            }, 2000);
        } else {
            showAlert(data.message || '로그인에 실패했습니다.', 'danger');
        }
    } catch (error) {
        console.error('로그인 오류:', error);
        showAlert('로그인 처리 중 오류가 발생했습니다.', 'danger');
    }
}

// 회원가입 처리
async function handleRegister(e) {
    e.preventDefault();
    
    const username = document.getElementById('registerUsername').value.trim();
    const email = document.getElementById('registerEmail').value.trim();
    const fullName = document.getElementById('registerFullName').value.trim();
    const password = document.getElementById('registerPassword').value;
    const passwordConfirm = document.getElementById('registerPasswordConfirm').value;
    
    if (!username || !email || !fullName || !password || !passwordConfirm) {
        showAlert('모든 필드를 입력해주세요.', 'danger');
        return;
    }
    
    if (password !== passwordConfirm) {
        showAlert('비밀번호가 일치하지 않습니다.', 'danger');
        return;
    }
    
    if (password.length < 8) {
        showAlert('비밀번호는 최소 8자 이상이어야 합니다.', 'danger');
        return;
    }
    
    try {
        const response = await fetch('/api/users', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: `username=${encodeURIComponent(username)}&email=${encodeURIComponent(email)}&fullName=${encodeURIComponent(fullName)}&password=${encodeURIComponent(password)}`
        });
        
        const data = await response.json();
        
        if (data.success) {
            showAlert('회원가입이 완료되었습니다! 로그인해주세요.', 'success');
            
            // 폼 초기화
            document.getElementById('registerForm').reset();
            
            // 로그인 폼으로 전환
            toggleForm();
        } else {
            showAlert(data.message || '회원가입에 실패했습니다.', 'danger');
        }
    } catch (error) {
        console.error('회원가입 오류:', error);
        showAlert('회원가입 처리 중 오류가 발생했습니다.', 'danger');
    }
}

// 알림 메시지 표시
function showAlert(message, type) {
    const alertContainer = document.getElementById('alertContainer');
    const alertHtml = `
        <div class="alert alert-${type} alert-dismissible fade show" role="alert">
            <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-triangle'} me-2"></i>
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        </div>
    `;
    alertContainer.innerHTML = alertHtml;
}

// 알림 메시지 초기화
function clearAlert() {
    document.getElementById('alertContainer').innerHTML = '';
}
