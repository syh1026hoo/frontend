/**
 * ETF 랭킹 페이지 AJAX 기능
 * 실시간 랭킹 데이터 로딩 및 표시
 */

// 전역 변수
let currentRankingType = 'gainers';

// 버튼 상태 업데이트
function updateButtonStates(activeType) {
    // 모든 버튼을 outline 상태로 초기화
    document.querySelectorAll('.btn-group .btn').forEach(btn => {
        btn.className = btn.className.replace('btn-danger', 'btn-outline-danger')
                                       .replace('btn-primary', 'btn-outline-primary')
                                       .replace('btn-success', 'btn-outline-success')
                                       .replace('btn-warning', 'btn-outline-warning')
                                       .replace('btn-info', 'btn-outline-info');
    });
    
    // 활성 버튼 상태 설정
    const activeBtn = document.getElementById(`btn-${activeType}`);
    if (activeBtn) {
        switch(activeType) {
            case 'gainers':
                activeBtn.className = activeBtn.className.replace('btn-outline-danger', 'btn-danger');
                break;
            case 'losers':
                activeBtn.className = activeBtn.className.replace('btn-outline-primary', 'btn-primary');
                break;
            case 'volume':
                activeBtn.className = activeBtn.className.replace('btn-outline-success', 'btn-success');
                break;
            case 'amount':
                activeBtn.className = activeBtn.className.replace('btn-outline-warning', 'btn-warning');
                break;
            case 'asset':
                activeBtn.className = activeBtn.className.replace('btn-outline-info', 'btn-info');
                break;
        }
    }
}

// 컨테이너 표시/숨김 함수
function showContainer(containerId) {
    ['loadingContainer', 'tableContainer', 'errorContainer', 'noDataContainer'].forEach(id => {
        document.getElementById(id).style.display = 'none';
    });
    document.getElementById(containerId).style.display = 'block';
}

// 테이블 헤더 업데이트
function updateTableHeader(type) {
    const typeColumn = document.getElementById('typeColumn');
    switch(type) {
        case 'gainers':
        case 'losers':
            typeColumn.textContent = '등락률';
            break;
        case 'volume':
            typeColumn.textContent = '거래량';
            break;
        case 'amount':
            typeColumn.textContent = '거래대금';
            break;
        case 'asset':
            typeColumn.textContent = '순자산총액';
            break;
    }
}

// 랭킹 데이터 로드
async function loadRankings(type) {
    try {
        currentRankingType = type;
        showContainer('loadingContainer');
        updateButtonStates(type);
        updateTableHeader(type);
        
        const response = await fetch(`/api/rankings?type=${type}`);
        const data = await response.json();
        
        if (data.success) {
            document.getElementById('pageTitle').textContent = data.title;
            document.getElementById('pageHeaderTitle').textContent = data.title;
            document.getElementById('cardTitle').textContent = data.title;
            document.getElementById('etfCount').textContent = `${data.count}개`;
            
            if (data.data && data.data.length > 0) {
                renderEtfTable(data.data, type);
                showContainer('tableContainer');
            } else {
                showContainer('noDataContainer');
            }
        } else {
            console.error('API 오류:', data.message);
            showContainer('errorContainer');
        }
        
    } catch (error) {
        console.error('랭킹 로드 실패:', error);
        showContainer('errorContainer');
    }
}

// ETF 테이블 렌더링
function renderEtfTable(etfs, type) {
    const tbody = document.getElementById('etfTableBody');
    let html = '';
    
    etfs.forEach((etf, index) => {
        const rankClass = index < 3 ? 'bg-warning' : 'bg-secondary';
        const categoryClass = getCategoryClass(etf.category);
        
        html += `
            <tr class="align-middle">
                <td>
                    <span class="badge fs-6 ${rankClass}">${index + 1}</span>
                </td>
                <td>
                    <div>
                        <a href="/etf/${etf.isinCd}" class="text-decoration-none fw-bold">${etf.itmsNm || 'ETF명'}</a>
                        ${etf.baseIndexName ? `<div class="small text-muted">${etf.baseIndexName}</div>` : ''}
                    </div>
                </td>
                <td class="text-muted">${etf.srtnCd || '-'}</td>
                <td class="text-end fw-bold">${formatNumber(etf.closePrice)}원</td>
                <td class="text-end fw-bold" id="typeValue-${index}">${getTypeValue(etf, type)}</td>
                <td class="text-end">${formatNumber(etf.nav)}</td>
                <td>
                    <span class="badge ${categoryClass}">${etf.category || '기타'}</span>
                </td>
            </tr>
        `;
    });
    
    tbody.innerHTML = html;
    
    // 등락률 색상 적용
    if (type === 'gainers' || type === 'losers') {
        etfs.forEach((etf, index) => {
            const element = document.getElementById(`typeValue-${index}`);
            if (element && etf.fltRt !== null) {
                applyPriceColor(element, etf.fltRt);
            }
        });
    }
}

// 타입별 값 가져오기
function getTypeValue(etf, type) {
    switch(type) {
        case 'gainers':
        case 'losers':
            return etf.fltRt !== null ? `${etf.fltRt}%` : '-';
        case 'volume':
            return etf.tradeVolume !== null ? formatNumber(etf.tradeVolume) : '-';
        case 'amount':
            return etf.tradePrice !== null ? `${formatNumber(etf.tradePrice / 100000000)}억원` : '-';
        case 'asset':
            return etf.netAssetTotalAmt !== null ? `${formatNumber(etf.netAssetTotalAmt / 100000000)}억원` : '-';
        default:
            return '-';
    }
}

// getCategoryClass는 common.js에서 가져옴

// 재시도 함수
function retryLoadRankings() {
    loadRankings(currentRankingType);
}

// 인증 상태 관리
function checkAuthStatus() {
    const isLoggedIn = sessionStorage.getItem('isLoggedIn');
    const user = JSON.parse(sessionStorage.getItem('user') || '{}');
    
    const authButtons = document.getElementById('authButtons');
    const userMenu = document.getElementById('userMenu');
    const watchlistNav = document.getElementById('watchlistNav');
    const userDisplayName = document.getElementById('userDisplayName');
    
    if (isLoggedIn === 'true' && user.id) {
        authButtons.style.display = 'none';
        userMenu.style.display = 'block';
        watchlistNav.style.display = 'block';
        userDisplayName.textContent = user.fullName || user.username;
    } else {
        authButtons.style.display = 'block';
        userMenu.style.display = 'none';
        watchlistNav.style.display = 'none';
    }
}

// 로그아웃
function logout() {
    sessionStorage.removeItem('isLoggedIn');
    sessionStorage.removeItem('user');
    window.location.href = '/';
}

// 페이지 로드 시 실행
document.addEventListener('DOMContentLoaded', function() {
    checkAuthStatus();
    
    // URL 파라미터에서 타입 확인
    const urlParams = new URLSearchParams(window.location.search);
    const type = urlParams.get('type') || 'gainers';
    
    // 기본 랭킹 로드
    loadRankings(type);
});
