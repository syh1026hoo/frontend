/**
 * 관심종목 페이지 JavaScript
 * 관심종목 관리, 인기 ETF 표시, 통계 등
 */

// 현재 사용자 정보 (세션스토리지에서 가져옴)
let currentUser = null;

// 로그인 상태 확인
function checkLoginStatus() {
    const isLoggedIn = sessionStorage.getItem('isLoggedIn');
    const user = JSON.parse(sessionStorage.getItem('user') || '{}');
    
    if (isLoggedIn !== 'true' || !user.id) {
        showToast('로그인이 필요합니다.', 'warning');
        setTimeout(() => {
            window.location.href = '/login';
        }, 2000);
        return false;
    }
    
    currentUser = user;
    return true;
}

// 페이지 로드 시 초기화
document.addEventListener('DOMContentLoaded', function() {
    if (checkLoginStatus()) {
        loadUserInfo();
        loadWatchlist();
        loadStatistics();
        loadPopularEtfs(); // 인기 ETF 자동 로드
    }
});

// 사용자 정보 로드
async function loadUserInfo() {
    try {
        const response = await fetch(`/api/users/${currentUser.id}`);
        const data = await response.json();
        
        if (data.success) {
            document.getElementById('username').textContent = data.user.username;
            document.getElementById('email').textContent = data.user.email;
            document.getElementById('watchlistCount').textContent = data.user.watchListCount || 0;
        }
    } catch (error) {
        console.error('사용자 정보 로드 실패:', error);
    }
}

// 관심종목 목록 로드
async function loadWatchlist() {
    try {
        const response = await fetch(`/api/watchlist?userId=${currentUser.id}&includeEtfInfo=true`);
        const data = await response.json();
        
        if (data.success) {
            displayWatchlist(data.data);
        } else {
            showToast('관심종목 로드 실패: ' + data.message, 'error');
        }
    } catch (error) {
        console.error('관심종목 로드 실패:', error);
        showToast('관심종목을 불러오는 중 오류가 발생했습니다.', 'error');
    }
}

// 전체 통계 로드
async function loadStatistics() {
    try {
        const response = await fetch('/api/watchlist/statistics');
        const data = await response.json();
        
        if (data.success) {
            const stats = data.statistics;
            document.getElementById('totalUsers').textContent = stats.totalUsers || 0;
            document.getElementById('totalEtfs').textContent = stats.totalEtfs || 0;
            document.getElementById('totalWatchlists').textContent = stats.totalWatchLists || 0;
        }
    } catch (error) {
        console.error('통계 로드 실패:', error);
        // 오류 시 기본값 표시
        document.getElementById('totalUsers').textContent = '0';
        document.getElementById('totalEtfs').textContent = '0';
        document.getElementById('totalWatchlists').textContent = '0';
    }
}

// 관심종목 표시
function displayWatchlist(watchlistData) {
    const container = document.getElementById('watchlistContainer');
    
    if (!watchlistData || watchlistData.length === 0) {
        container.innerHTML = `
            <div class="col-12 text-center py-5">
                <i class="fas fa-heart-broken text-muted" style="font-size: 3rem;"></i>
                <h4 class="text-muted mt-3">관심종목이 없습니다</h4>
                <p class="text-muted">ETF 검색이나 랭킹에서 관심종목을 추가해보세요!</p>
                <a href="/search" class="btn btn-primary">
                    <i class="fas fa-search me-2"></i>ETF 검색하기
                </a>
            </div>
        `;
        return;
    }

    let html = '';
    watchlistData.forEach(item => {
        const etf = item.etfInfo || {};
        const changeClass = getChangeClass(etf.fltRt);
        
        html += `
            <div class="col-lg-6 col-xl-4 mb-4">
                <div class="card watchlist-card h-100">
                    <div class="card-body">
                        <div class="d-flex justify-content-between align-items-start mb-3">
                            <h6 class="card-title mb-0">
                                <a href="/etf/${etf.isinCd}" class="text-decoration-none">${etf.itmsNm || 'ETF명'}</a>
                            </h6>
                            <button class="btn btn-link btn-sm p-0 btn-heart" onclick="removeFromWatchlist('${item.id}')">
                                <i class="fas fa-heart"></i>
                            </button>
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
                                    <div class="fw-bold ${changeClass}">${etf.fltRt || 0}%</div>
                                </div>
                            </div>
                        </div>
                        
                        <div class="row mb-3">
                            <div class="col-4">
                                <div class="text-center">
                                    <div class="text-muted small">NAV</div>
                                    <div class="small">${formatNumber(etf.nav)}</div>
                                </div>
                            </div>
                            <div class="col-4">
                                <div class="text-center">
                                    <div class="text-muted small">거래량</div>
                                    <div class="small">${formatNumber(etf.tradeVolume)}</div>
                                </div>
                            </div>
                            <div class="col-4">
                                <div class="text-center">
                                    <div class="text-muted small">시가총액</div>
                                    <div class="small">${formatNumber(etf.marketTotalAmt / 100000000)}억</div>
                                </div>
                            </div>
                        </div>
                        
                        ${item.memo ? `
                            <div class="mt-2">
                                <div class="text-muted small">메모</div>
                                <div class="small bg-light p-2 rounded">${item.memo}</div>
                            </div>
                        ` : ''}
                        
                        <div class="text-muted small mt-2">
                            추가일: ${new Date(item.createdAt).toLocaleDateString()}
                        </div>
                    </div>
                </div>
            </div>
        `;
    });
    
    container.innerHTML = html;
}

// 등락률에 따른 CSS 클래스 반환
function getChangeClass(fltRt) {
    if (!fltRt) return 'price-neutral';
    return fltRt > 0 ? 'price-up' : fltRt < 0 ? 'price-down' : 'price-neutral';
}

// 숫자 포맷팅
function formatNumber(num) {
    if (!num) return '0';
    return Number(num).toLocaleString('ko-KR');
}

// 관심종목에서 제거
async function removeFromWatchlist(watchlistId) {
    if (!confirm('관심종목에서 제거하시겠습니까?')) {
        return;
    }

    try {
        const response = await fetch(`/api/watchlist/${watchlistId}`, {
            method: 'DELETE'
        });

        const data = await response.json();
        
        if (data.success) {
            showToast('관심종목에서 제거되었습니다.', 'success');
            loadWatchlist(); // 목록 새로고침
            loadUserInfo(); // 사용자 정보 새로고침
        } else {
            showToast('제거 실패: ' + data.message, 'error');
        }
    } catch (error) {
        console.error('관심종목 제거 실패:', error);
        showToast('관심종목 제거 중 오류가 발생했습니다.', 'error');
    }
}

// 관심종목 목록 새로고침
async function refreshWatchlist() {
    await loadWatchlist();
    await loadPopularEtfs();
    showToast('목록이 새로고침되었습니다.', 'success');
}

// 인기 ETF 로드
async function loadPopularEtfs() {
    try {
        const response = await fetch('/api/watchlist/popular?limit=5');
        const data = await response.json();
        
        if (data && data.length > 0) {
            displayPopularEtfs(data);
        } else {
            document.getElementById('popularEtfsContainer').innerHTML = `
                <div class="col-12 text-center py-3 text-muted">
                    <i class="fas fa-info-circle me-2"></i>
                    인기 ETF 데이터가 없습니다
                </div>
            `;
        }
    } catch (error) {
        console.error('인기 ETF 로드 실패:', error);
        document.getElementById('popularEtfsContainer').innerHTML = `
            <div class="col-12 text-center py-3 text-danger">
                <i class="fas fa-exclamation-triangle me-2"></i>
                인기 ETF를 불러오는 중 오류가 발생했습니다
            </div>
        `;
    }
}

// 인기 ETF 표시
function displayPopularEtfs(popularEtfs) {
    const container = document.getElementById('popularEtfsContainer');
    let html = '';
    popularEtfs.forEach((etf, index) => {
        const rankClass = index < 3 ? 'text-warning' : 'text-muted';
        const rankIcon = index < 3 ? 'fas fa-crown' : 'fas fa-hashtag';
        
        html += `
            <div class="col-md-6 col-lg-4 mb-3">
                <div class="card h-100 border-warning">
                    <div class="card-body text-center">
                        <div class="mb-2">
                            <span class="badge bg-warning text-dark fs-6">
                                <i class="${rankIcon} me-1"></i>${index + 1}위
                            </span>
                        </div>
                        <h6 class="card-title mb-2">${etf.etfName || 'ETF명'}</h6>
                        <p class="text-muted small mb-2">${etf.isinCd || '코드'}</p>
                        <div class="d-flex justify-content-center align-items-center">
                            <span class="text-danger me-2">
                                <i class="fas fa-heart"></i>
                            </span>
                            <span class="fw-bold">${etf.likeCount || 0}명이 관심</span>
                        </div>
                        <button class="btn btn-sm btn-outline-primary mt-2" onclick="addToWatchlistFromPopular('${etf.isinCd}')">
                            <i class="fas fa-plus me-1"></i>관심종목 추가
                        </button>
                    </div>
                </div>
            </div>
        `;
    });
    container.innerHTML = html;
}

// 인기 ETF에서 관심종목 추가
async function addToWatchlistFromPopular(isinCd) {
    if (!currentUser) {
        showToast('로그인이 필요합니다.', 'warning');
        return;
    }

    try {
        const response = await fetch('/api/watchlist', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: `userId=${currentUser.id}&isinCd=${isinCd}&memo=인기 ETF에서 추가`
        });

        const data = await response.json();
        
        if (data.success) {
            showToast('관심종목에 추가되었습니다!', 'success');
            loadWatchlist(); // 관심종목 목록 새로고침
            loadUserInfo(); // 사용자 정보 새로고침
        } else {
            showToast('추가 실패: ' + data.message, 'error');
        }
    } catch (error) {
        console.error('관심종목 추가 실패:', error);
        showToast('관심종목 추가 중 오류가 발생했습니다.', 'error');
    }
}

// Toast 메시지 표시
function showToast(message, type = 'info') {
    const toastContainer = document.querySelector('.toast-container');
    const toastId = 'toast-' + Date.now();
    
    const bgClass = type === 'success' ? 'bg-success' : type === 'error' ? 'bg-danger' : 'bg-info';
    
    const toastHtml = `
        <div id="${toastId}" class="toast align-items-center text-white ${bgClass} border-0" role="alert">
            <div class="d-flex">
                <div class="toast-body">${message}</div>
                <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
            </div>
        </div>
    `;
    
    toastContainer.insertAdjacentHTML('beforeend', toastHtml);
    
    const toastElement = document.getElementById(toastId);
    const toast = new bootstrap.Toast(toastElement);
    toast.show();
    
    // 토스트가 숨겨진 후 DOM에서 제거
    toastElement.addEventListener('hidden.bs.toast', () => {
        toastElement.remove();
    });
}
