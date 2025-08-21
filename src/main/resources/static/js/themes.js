/**
 * ETF 테마별 페이지 AJAX 기능
 * 테마 데이터 로딩 및 검색 기능
 */

// 테마 데이터 로드
async function loadThemesData() {
    try {
        showMainThemesLoading();
        showAllThemesLoading();
        
        const response = await apiRequest('/api/themes');
        
        if (response.success) {
            hideMainThemesLoading();
            hideAllThemesLoading();
            
            // 주요 테마 카운트 업데이트
            updateMainThemeCounts(response.themeCounts);
            
            // 전체 테마 목록 표시
            displayAllThemes(response.categoryGroups);
            
        } else {
            console.error('테마 API 오류:', response.message);
            showThemesError();
        }
        
    } catch (error) {
        console.error('테마 데이터 로드 실패:', error);
        showThemesError();
        showToast('테마 데이터를 불러오는 중 오류가 발생했습니다.', 'error');
    }
}

// 주요 테마 카운트 업데이트
function updateMainThemeCounts(themeCounts) {
    document.getElementById('kodexCount').textContent = (themeCounts.KODEX || 0) + '개';
    document.getElementById('tigerCount').textContent = (themeCounts.TIGER || 0) + '개';
    document.getElementById('aceCount').textContent = (themeCounts.ACE || 0) + '개';
    
    showElement('mainThemesCards');
}

// 전체 테마 목록 표시
function displayAllThemes(categoryGroups) {
    const container = document.getElementById('allThemesList');
    
    if (!categoryGroups || Object.keys(categoryGroups).length === 0) {
        showNoThemesData();
        return;
    }
    
    let html = '';
    Object.keys(categoryGroups).forEach(category => {
        const count = categoryGroups[category].length;
        const categoryClass = getCategoryClass(category);
        
        html += `
            <div class="col-lg-3 col-md-4 col-sm-6 mb-3">
                <button class="btn btn-outline-primary w-100 text-start d-flex justify-content-between align-items-center" 
                        onclick="viewTheme('${category}')">
                    <span>
                        <i class="fas fa-tag me-2"></i>
                        <span>${category}</span>
                    </span>
                    <span class="badge ${categoryClass}">${count}</span>
                </button>
            </div>
        `;
    });
    
    container.innerHTML = html;
    showElement('allThemesList');
}

// 특정 테마 보기 (검색 페이지로 이동)
function viewTheme(theme) {
    window.location.href = `/search?keyword=${encodeURIComponent(theme)}`;
}

// 테마 검색 (검색 페이지로 이동)
function searchTheme() {
    const keyword = document.getElementById('themeSearchInput').value.trim();
    if (keyword) {
        window.location.href = `/search?keyword=${encodeURIComponent(keyword)}`;
    } else {
        showToast('검색어를 입력해주세요.', 'warning');
    }
}

// 테마 키워드 검색 (추천 키워드 클릭)
function searchThemeKeyword(keyword) {
    window.location.href = `/search?keyword=${encodeURIComponent(keyword)}`;
}

// UI 상태 관리 함수들
function showMainThemesLoading() {
    showElement('mainThemesLoading');
    hideElement('mainThemesCards');
}

function hideMainThemesLoading() {
    hideElement('mainThemesLoading');
}

function showAllThemesLoading() {
    showElement('allThemesLoading');
    hideElement('allThemesList');
    hideElement('noThemesData');
    hideElement('themesError');
}

function hideAllThemesLoading() {
    hideElement('allThemesLoading');
}

function showNoThemesData() {
    hideElement('allThemesLoading');
    hideElement('allThemesList');
    showElement('noThemesData');
    hideElement('themesError');
}

function showThemesError() {
    hideMainThemesLoading();
    hideAllThemesLoading();
    hideElement('mainThemesCards');
    hideElement('allThemesList');
    hideElement('noThemesData');
    showElement('themesError');
}

// 테마별 카테고리 클래스 (브랜드별 색상)
function getThemeCategoryClass(category) {
    switch(category) {
        case 'KODEX': return 'bg-success';
        case 'TIGER': return 'bg-warning';
        case 'ACE': return 'bg-secondary';
        case 'SOL': return 'bg-primary';
        case '반도체': return 'bg-info';
        case '바이오': return 'bg-success';
        case 'AI': return 'bg-info';
        case '배당': return 'bg-success';
        case '미국': return 'bg-primary';
        case '중국': return 'bg-danger';
        case '일본': return 'bg-warning';
        default: return 'bg-primary';
    }
}

// 엔터키 검색 지원
function setupSearchInput() {
    const searchInput = document.getElementById('themeSearchInput');
    
    searchInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            searchTheme();
        }
    });
}

// 페이지 로드 시 실행
document.addEventListener('DOMContentLoaded', function() {
    // 테마 데이터 로드
    loadThemesData();
    
    // 검색 입력 설정
    setupSearchInput();
    
    console.log('테마 페이지 AJAX 초기화 완료');
});
