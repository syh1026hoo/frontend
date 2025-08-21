/**
 * ETF 플랫폼 공통 JavaScript 유틸리티
 * 모든 페이지에서 공통으로 사용되는 함수들
 */

// 숫자 포맷팅 함수
function formatNumber(num) {
    if (num === null || num === undefined) return '-';
    return Number(num).toLocaleString('ko-KR');
}

// 가격 변동 색상 적용
function applyPriceColor(element, fltRt) {
    element.classList.remove('price-up', 'price-down', 'price-neutral');
    if (fltRt > 0) {
        element.classList.add('price-up');
    } else if (fltRt < 0) {
        element.classList.add('price-down');
    } else {
        element.classList.add('price-neutral');
    }
}

// 엘리먼트 표시/숨김 함수
function showElement(elementId) {
    const element = document.getElementById(elementId);
    if (element) {
        element.style.display = 'block';
    }
}

function hideElement(elementId) {
    const element = document.getElementById(elementId);
    if (element) {
        element.style.display = 'none';
    }
}

// 로딩 상태 표시/숨김
function showLoading(containerId) {
    showElement(containerId);
}

function hideLoading(containerId) {
    hideElement(containerId);
}

// API 요청 공통 함수
async function apiRequest(url, options = {}) {
    try {
        const response = await fetch(url, {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        return await response.json();
    } catch (error) {
        console.error('API 요청 실패:', error);
        throw error;
    }
}

// 토스트 메시지 표시
function showToast(message, type = 'info', duration = 3000) {
    // 토스트 컨테이너가 있는지 확인
    let toastContainer = document.getElementById('toastContainer');
    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.id = 'toastContainer';
        toastContainer.className = 'toast-container position-fixed top-0 end-0 p-3';
        toastContainer.style.zIndex = '1070';
        document.body.appendChild(toastContainer);
    }
    
    const toastId = 'toast-' + Date.now();
    const bgClass = type === 'success' ? 'bg-success' : 
                   type === 'error' ? 'bg-danger' : 
                   type === 'warning' ? 'bg-warning' : 'bg-info';
    
    const toastHtml = `
        <div id="${toastId}" class="toast align-items-center text-white ${bgClass} border-0" role="alert" aria-live="assertive" aria-atomic="true">
            <div class="d-flex">
                <div class="toast-body">
                    ${message}
                </div>
                <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
            </div>
        </div>
    `;
    
    toastContainer.insertAdjacentHTML('beforeend', toastHtml);
    
    const toastElement = document.getElementById(toastId);
    const toast = new bootstrap.Toast(toastElement, {
        autohide: true,
        delay: duration
    });
    
    toast.show();
    
    // 토스트가 숨겨진 후 DOM에서 제거
    toastElement.addEventListener('hidden.bs.toast', () => {
        toastElement.remove();
    });
}

// URL 파라미터 가져오기
function getUrlParameter(name) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(name);
}

// URL 파라미터 설정
function setUrlParameter(name, value) {
    const url = new URL(window.location);
    url.searchParams.set(name, value);
    window.history.pushState({}, '', url);
}

// 페이지 새로고침 없이 URL 변경
function updateUrl(params) {
    const url = new URL(window.location);
    Object.keys(params).forEach(key => {
        if (params[key] !== null && params[key] !== undefined) {
            url.searchParams.set(key, params[key]);
        } else {
            url.searchParams.delete(key);
        }
    });
    window.history.pushState({}, '', url);
}

// 로컬 스토리지 헬퍼
const Storage = {
    get: function(key, defaultValue = null) {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : defaultValue;
        } catch (error) {
            console.error('로컬 스토리지 읽기 실패:', error);
            return defaultValue;
        }
    },
    
    set: function(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (error) {
            console.error('로컬 스토리지 저장 실패:', error);
            return false;
        }
    },
    
    remove: function(key) {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (error) {
            console.error('로컬 스토리지 삭제 실패:', error);
            return false;
        }
    }
};

// 세션 스토리지 헬퍼
const SessionStorage = {
    get: function(key, defaultValue = null) {
        try {
            const item = sessionStorage.getItem(key);
            return item ? JSON.parse(item) : defaultValue;
        } catch (error) {
            console.error('세션 스토리지 읽기 실패:', error);
            return defaultValue;
        }
    },
    
    set: function(key, value) {
        try {
            sessionStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (error) {
            console.error('세션 스토리지 저장 실패:', error);
            return false;
        }
    },
    
    remove: function(key) {
        try {
            sessionStorage.removeItem(key);
            return true;
        } catch (error) {
            console.error('세션 스토리지 삭제 실패:', error);
            return false;
        }
    }
};

// 디바운스 함수
function debounce(func, wait, immediate) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            timeout = null;
            if (!immediate) func(...args);
        };
        const callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        if (callNow) func(...args);
    };
}

// 스로틀 함수
function throttle(func, limit) {
    let inThrottle;
    return function(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// 날짜 포맷팅
function formatDate(date, format = 'YYYY-MM-DD') {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    
    switch(format) {
        case 'YYYY-MM-DD':
            return `${year}-${month}-${day}`;
        case 'YYYY.MM.DD':
            return `${year}.${month}.${day}`;
        case 'MM/DD':
            return `${month}/${day}`;
        default:
            return d.toLocaleDateString('ko-KR');
    }
}

// ETF 카테고리 클래스 가져오기
function getCategoryClass(category) {
    switch(category) {
        case 'KODEX': return 'bg-success';
        case 'TIGER': return 'bg-warning';
        case '반도체': return 'bg-info';
        case 'SOL': return 'bg-primary';
        case 'ACE': return 'bg-dark';
        case '바이오': return 'bg-success';
        default: return 'bg-secondary';
    }
}

// 공통 초기화 함수
function initializeCommon() {
    console.log('공통 스크립트 초기화 완료');
}

// DOM 로드 시 공통 초기화 실행
document.addEventListener('DOMContentLoaded', initializeCommon);
