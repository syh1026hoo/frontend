/**
 * 테마 상세정보 페이지 AJAX 기능
 * 테마별 ETF 목록 로딩, 필터링, 정렬 기능
 */

let currentTheme = '';
let allEtfs = [];
let filteredEtfs = [];
let currentFilter = 'all';
let currentSort = 'name';

// 테마 상세정보 로드
async function loadThemeDetail(theme) {
    if (!theme) {
        showThemeDetailError();
        return;
    }

    currentTheme = theme;

    try {
        showThemeDetailLoading();
        
        const response = await apiRequest(`/api/themes/${encodeURIComponent(theme)}`);
        
        if (response.success && response.data) {
            hideThemeDetailLoading();
            displayThemeDetail(response);
            showThemeDetailContent();
        } else {
            console.error('테마 상세정보 API 오류:', response.message);
            showThemeDetailError();
        }
        
    } catch (error) {
        console.error('테마 상세정보 로드 실패:', error);
        showThemeDetailError();
        showToast('테마 정보를 불러오는 중 오류가 발생했습니다.', 'error');
    }
}

// 테마 상세정보 표시
function displayThemeDetail(response) {
    // 페이지 제목 업데이트
    document.getElementById('pageTitle').textContent = `${response.theme} ETF`;
    document.getElementById('currentTheme').textContent = response.theme;
    document.getElementById('themeTitle').textContent = response.theme;
    document.getElementById('etfCount').textContent = response.count;
    
    // ETF 데이터 저장
    allEtfs = response.data || [];
    filteredEtfs = [...allEtfs];
    
    if (allEtfs.length > 0) {
        renderEtfList();
        hideElement('noEtfsFound');
    } else {
        showElement('noEtfsFound');
        hideElement('etfList');
    }
}

// ETF 목록 렌더링
function renderEtfList() {
    const container = document.getElementById('etfList');
    
    if (filteredEtfs.length === 0) {
        container.innerHTML = `
            <div class="col-12 text-center py-4">
                <i class="fas fa-filter fa-3x text-muted mb-3"></i>
                <h5 class="text-muted">필터 조건에 맞는 ETF가 없습니다</h5>
                <p class="text-muted">다른 필터를 선택해보세요</p>
            </div>
        `;
        return;
    }
    
    let html = '';
    filteredEtfs.forEach(etf => {
        const categoryClass = getCategoryClass(etf.category);
        const directionClass = getDirectionClass(etf.priceDirection);
        
        html += `
            <div class="col-lg-6 col-xl-4 mb-4">
                <div class="card etf-card h-100">
                    <div class="card-body">
                        <div class="d-flex justify-content-between align-items-start mb-3">
                            <h6 class="card-title mb-0 flex-grow-1">
                                <a href="/etf/${etf.isinCd}" class="text-decoration-none">${etf.itmsNm || 'ETF명'}</a>
                            </h6>
                            <span class="badge ms-2 ${directionClass}">
                                ${etf.priceDirection || '보합'}
                            </span>
                        </div>
                        
                        <div class="row mb-3">
                            <div class="col-6">
                                <div class="text-center p-2 bg-light rounded">
                                    <div class="text-muted small">현재가</div>
                                    <div class="fw-bold">${formatNumber(etf.closePrice)}원</div>
                                </div>
                            </div>
                            <div class="col-6">
                                <div class="text-center p-2 bg-light rounded">
                                    <div class="text-muted small">등락률</div>
                                    <div class="fw-bold change-rate" data-flt-rt="${etf.fltRt || 0}">
                                        ${etf.fltRt ? etf.fltRt + '%' : '0.00%'}
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <div class="row mb-3">
                            <div class="col-4">
                                <div class="text-center">
                                    <div class="text-muted small">NAV</div>
                                    <div class="fw-bold small">${etf.nav ? formatNumber(etf.nav) : '-'}</div>
                                </div>
                            </div>
                            <div class="col-4">
                                <div class="text-center">
                                    <div class="text-muted small">거래량</div>
                                    <div class="fw-bold small">${etf.tradeVolume ? formatNumber(etf.tradeVolume) : '-'}</div>
                                </div>
                            </div>
                            <div class="col-4">
                                <div class="text-center">
                                    <div class="text-muted small">시가총액</div>
                                    <div class="fw-bold small">${etf.marketTotalAmt ? formatNumber(etf.marketTotalAmt / 100000000) + '억원' : '-'}</div>
                                </div>
                            </div>
                        </div>
                        
                        ${etf.baseIndexName ? `
                            <div class="row">
                                <div class="col-12">
                                    <div class="bg-light p-2 rounded">
                                        <div class="text-muted small">기초지수</div>
                                        <div class="small">${etf.baseIndexName}</div>
                                    </div>
                                </div>
                            </div>
                        ` : ''}
                    </div>
                    
                    <div class="card-footer bg-transparent">
                        <a href="/etf/${etf.isinCd}" class="btn btn-outline-primary btn-sm w-100">
                            <i class="fas fa-info-circle me-1"></i>
                            상세보기
                        </a>
                    </div>
                </div>
            </div>
        `;
    });
    
    container.innerHTML = html;
    
    // 등락률 색상 적용
    container.querySelectorAll('.change-rate').forEach(element => {
        const fltRt = parseFloat(element.getAttribute('data-flt-rt'));
        if (!isNaN(fltRt)) {
            applyPriceColor(element, fltRt);
        }
    });
}

// 방향 클래스 가져오기
function getDirectionClass(direction) {
    switch(direction) {
        case '상승': return 'bg-danger';
        case '하락': return 'bg-primary';
        case '보합': return 'bg-secondary';
        default: return 'bg-secondary';
    }
}

// ETF 필터링
function filterEtfs(filterType) {
    currentFilter = filterType;
    
    // 버튼 상태 업데이트
    document.querySelectorAll('#filterGroup .btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
    
    // 필터 적용
    switch(filterType) {
        case 'all':
            filteredEtfs = [...allEtfs];
            break;
        case 'rising':
            filteredEtfs = allEtfs.filter(etf => etf.priceDirection === '상승');
            break;
        case 'falling':
            filteredEtfs = allEtfs.filter(etf => etf.priceDirection === '하락');
            break;
        case 'neutral':
            filteredEtfs = allEtfs.filter(etf => etf.priceDirection === '보합');
            break;
        default:
            filteredEtfs = [...allEtfs];
    }
    
    // 현재 정렬 방식으로 재정렬
    applySorting();
    renderEtfList();
}

// ETF 정렬
function sortEtfs(sortType) {
    currentSort = sortType;
    
    // 버튼 상태 업데이트
    document.querySelectorAll('#sortGroup .btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
    
    applySorting();
    renderEtfList();
}

// 정렬 적용
function applySorting() {
    switch(currentSort) {
        case 'name':
            filteredEtfs.sort((a, b) => (a.itmsNm || '').localeCompare(b.itmsNm || ''));
            break;
        case 'change':
            filteredEtfs.sort((a, b) => (b.fltRt || 0) - (a.fltRt || 0));
            break;
        case 'volume':
            filteredEtfs.sort((a, b) => (b.tradeVolume || 0) - (a.tradeVolume || 0));
            break;
    }
}

// UI 상태 관리 함수들
function showThemeDetailLoading() {
    showElement('themeDetailLoading');
    hideElement('themeDetailError');
    hideElement('themeDetailContent');
}

function hideThemeDetailLoading() {
    hideElement('themeDetailLoading');
}

function showThemeDetailError() {
    hideElement('themeDetailLoading');
    showElement('themeDetailError');
    hideElement('themeDetailContent');
}

function showThemeDetailContent() {
    hideElement('themeDetailLoading');
    hideElement('themeDetailError');
    showElement('themeDetailContent');
}

// 재시도 함수
function retryLoadThemeDetail() {
    if (currentTheme) {
        loadThemeDetail(currentTheme);
    }
}

// URL에서 테마 추출
function getThemeFromUrl() {
    const pathParts = window.location.pathname.split('/');
    const themesIndex = pathParts.indexOf('themes');
    if (themesIndex !== -1 && pathParts[themesIndex + 1]) {
        return decodeURIComponent(pathParts[themesIndex + 1]);
    }
    return null;
}

// 페이지 로드 시 실행
document.addEventListener('DOMContentLoaded', function() {
    const theme = getThemeFromUrl();
    
    if (theme) {
        loadThemeDetail(theme);
    } else {
        showThemeDetailError();
        showToast('잘못된 테마입니다.', 'error');
    }
    
    console.log('테마 상세정보 페이지 AJAX 초기화 완료');
});
