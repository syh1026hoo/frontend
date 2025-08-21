/**
 * ETF 검색 페이지 AJAX 기능
 * 실시간 검색 및 결과 표시
 */

let lastSearchKeyword = '';

// 검색 실행
async function performSearch(keyword) {
    if (!keyword || keyword.trim().length === 0) {
        showToast('검색어를 입력해주세요.', 'warning');
        return;
    }

    keyword = keyword.trim();
    lastSearchKeyword = keyword;

    try {
        // UI 상태 업데이트
        showSearchResults();
        showSearchLoading();
        hideRecommendations();
        
        // 검색 키워드 표시
        document.getElementById('searchKeywordDisplay').textContent = keyword;
        
        // URL 업데이트
        updateUrl({ keyword: keyword });
        
        // API 호출
        const response = await apiRequest(`/api/search?keyword=${encodeURIComponent(keyword)}`);
        
        if (response.success) {
            hideSearchLoading();
            
            if (response.data && response.data.length > 0) {
                displaySearchResults(response.data);
                document.getElementById('resultCount').textContent = response.count;
                
                // 더 많은 결과 알림
                if (response.count >= 20) {
                    showElement('moreResults');
                } else {
                    hideElement('moreResults');
                }
            } else {
                showNoResults();
            }
        } else {
            hideSearchLoading();
            showSearchError();
            console.error('검색 API 오류:', response.message);
        }
        
    } catch (error) {
        console.error('검색 실패:', error);
        hideSearchLoading();
        showSearchError();
        showToast('검색 중 오류가 발생했습니다.', 'error');
    }
}

// 검색 결과 표시
function displaySearchResults(etfs) {
    const container = document.getElementById('searchResults');
    let html = '';
    
    etfs.forEach(etf => {
        const categoryClass = getCategoryClass(etf.category);
        
        html += `
            <div class="col-lg-6 col-xl-4 mb-3">
                <div class="card etf-card h-100">
                    <div class="card-body">
                        <div class="d-flex justify-content-between align-items-start mb-2">
                            <h6 class="card-title mb-0">
                                <a href="/etf/${etf.isinCd}" class="text-decoration-none">${etf.itmsNm || 'ETF명'}</a>
                            </h6>
                            <span class="badge ${categoryClass}">${etf.category || '기타'}</span>
                        </div>
                        
                        <div class="row">
                            <div class="col-6">
                                <small class="text-muted">종목코드</small>
                                <div class="fw-bold">${etf.srtnCd || '-'}</div>
                            </div>
                            <div class="col-6">
                                <small class="text-muted">현재가</small>
                                <div class="fw-bold">${formatNumber(etf.closePrice)}원</div>
                            </div>
                        </div>
                        
                        <div class="row mt-2">
                            <div class="col-6">
                                <small class="text-muted">등락률</small>
                                <div class="fw-bold price-change" data-flt-rt="${etf.fltRt}">${etf.fltRt ? etf.fltRt + '%' : '0.00%'}</div>
                            </div>
                            <div class="col-6">
                                <small class="text-muted">NAV</small>
                                <div class="fw-bold">${etf.nav ? formatNumber(etf.nav) : '-'}</div>
                            </div>
                        </div>
                        
                        ${etf.baseIndexName ? `
                            <div class="mt-2">
                                <small class="text-muted">기초지수</small>
                                <div class="small">${etf.baseIndexName}</div>
                            </div>
                        ` : ''}
                        
                        ${etf.tradeVolume && etf.tradeVolume > 0 ? `
                            <div class="row mt-2">
                                <div class="col-6">
                                    <small class="text-muted">거래량</small>
                                    <div class="small">${formatNumber(etf.tradeVolume)}</div>
                                </div>
                                <div class="col-6">
                                    <small class="text-muted">거래대금</small>
                                    <div class="small">${etf.tradePrice ? formatNumber(etf.tradePrice / 100000000) + '억원' : '-'}</div>
                                </div>
                            </div>
                        ` : ''}
                    </div>
                    <div class="card-footer bg-transparent">
                        <a href="/etf/${etf.isinCd}" class="btn btn-sm btn-outline-primary w-100">
                            <i class="fas fa-info-circle me-1"></i>
                            상세보기
                        </a>
                    </div>
                </div>
            </div>
        `;
    });
    
    container.innerHTML = html;
    showElement('searchResults');
    
    // 등락률 색상 적용
    document.querySelectorAll('.price-change').forEach(element => {
        const fltRt = parseFloat(element.getAttribute('data-flt-rt'));
        if (!isNaN(fltRt)) {
            applyPriceColor(element, fltRt);
        }
    });
}

// 검색 키워드로 검색 (추천 검색어 클릭 시)
function searchKeyword(keyword) {
    document.getElementById('searchInput').value = keyword;
    performSearch(keyword);
}

// 검색 재시도
function retrySearch() {
    if (lastSearchKeyword) {
        performSearch(lastSearchKeyword);
    }
}

// UI 상태 관리 함수들
function showSearchResults() {
    showElement('searchResultsContainer');
}

function hideSearchResults() {
    hideElement('searchResultsContainer');
}

function showSearchLoading() {
    showElement('searchLoading');
    hideElement('noResults');
    hideElement('searchResults');
    hideElement('searchError');
    hideElement('moreResults');
}

function hideSearchLoading() {
    hideElement('searchLoading');
}

function showNoResults() {
    hideElement('searchLoading');
    showElement('noResults');
    hideElement('searchResults');
    hideElement('searchError');
    hideElement('moreResults');
    document.getElementById('resultCount').textContent = '0';
}

function showSearchError() {
    hideElement('searchLoading');
    hideElement('noResults');
    hideElement('searchResults');
    showElement('searchError');
    hideElement('moreResults');
}

function showRecommendations() {
    showElement('recommendationSection');
}

function hideRecommendations() {
    hideElement('recommendationSection');
}

// 검색 폼 초기화
function resetSearch() {
    document.getElementById('searchInput').value = '';
    hideSearchResults();
    showRecommendations();
    updateUrl({ keyword: null });
    lastSearchKeyword = '';
}

// 페이지 로드 시 실행
document.addEventListener('DOMContentLoaded', function() {
    // 검색 폼 이벤트 리스너
    const searchForm = document.getElementById('searchForm');
    const searchInput = document.getElementById('searchInput');
    
    searchForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const keyword = searchInput.value.trim();
        if (keyword) {
            performSearch(keyword);
        }
    });
    
    // 엔터키 검색
    searchInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            const keyword = this.value.trim();
            if (keyword) {
                performSearch(keyword);
            }
        }
    });
    
    // URL 파라미터에서 검색어 확인
    const urlKeyword = getUrlParameter('keyword');
    if (urlKeyword) {
        searchInput.value = urlKeyword;
        performSearch(urlKeyword);
    } else {
        showRecommendations();
    }
    
    // 검색 입력 실시간 변화 감지 (디바운스 적용)
    const debouncedSearch = debounce(function(keyword) {
        if (keyword.length >= 2) {
            performSearch(keyword);
        } else if (keyword.length === 0) {
            resetSearch();
        }
    }, 500);
    
    searchInput.addEventListener('input', function() {
        const keyword = this.value.trim();
        debouncedSearch(keyword);
    });
    
    console.log('검색 페이지 AJAX 초기화 완료');
});
