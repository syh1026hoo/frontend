/**
 * ETF 상세정보 페이지 AJAX 기능
 * ETF 상세 데이터 로딩 및 표시
 */

let currentEtfIsinCd = '';

// ETF 상세정보 로드
async function loadEtfDetail(isinCd) {
    if (!isinCd) {
        showEtfDetailError();
        return;
    }

    currentEtfIsinCd = isinCd;

    try {
        showEtfDetailLoading();
        
        const response = await apiRequest(`/api/etf/${encodeURIComponent(isinCd)}`);
        
        if (response.success && response.data) {
            hideEtfDetailLoading();
            displayEtfDetail(response.data);
            showEtfDetailContent();
        } else {
            console.error('ETF 상세정보 API 오류:', response.message);
            showEtfDetailError();
        }
        
    } catch (error) {
        console.error('ETF 상세정보 로드 실패:', error);
        showEtfDetailError();
        showToast('ETF 상세정보를 불러오는 중 오류가 발생했습니다.', 'error');
    }
}

// ETF 상세정보 표시
function displayEtfDetail(etf) {
    // 페이지 제목 업데이트
    document.getElementById('pageTitle').textContent = `${etf.itmsNm || 'ETF'} - ETF 상세정보`;
    
    // 기본 정보 업데이트
    document.getElementById('etfName').textContent = etf.itmsNm || 'ETF명 (정보 없음)';
    document.getElementById('etfCode').textContent = etf.srtnCd || '코드 없음';
    document.getElementById('etfIsin').textContent = etf.isinCd || '정보 없음';
    
    // 카테고리 배지 업데이트
    const categoryElement = document.getElementById('etfCategory');
    if (etf.category) {
        categoryElement.textContent = etf.category;
        categoryElement.className = `badge fs-6 ${getCategoryClass(etf.category)}`;
    } else {
        categoryElement.textContent = '카테고리 없음';
        categoryElement.className = 'badge bg-secondary fs-6';
    }
    
    // 데이터 검증 경고 표시
    if (!etf.closePrice || etf.closePrice <= 0) {
        showElement('dataWarning');
    } else {
        hideElement('dataWarning');
    }
    
    // 가격 정보 업데이트
    updatePriceInfo(etf);
    
    // 기본 정보 업데이트
    updateBasicInfo(etf);
    
    // 거래 정보 업데이트
    updateTradeInfo(etf);
    
    // 관련 ETF 버튼 업데이트
    updateRelatedEtfButtons(etf);
}

// 가격 정보 업데이트
function updatePriceInfo(etf) {
    // 현재가
    document.getElementById('closePrice').textContent = etf.closePrice ? 
        formatNumber(etf.closePrice) + '원' : '정보 없음';
    
    // 등락률
    const fltRtElement = document.getElementById('fltRt');
    fltRtElement.textContent = etf.fltRt ? etf.fltRt + '%' : '정보 없음';
    if (etf.fltRt) {
        applyPriceColor(fltRtElement, etf.fltRt);
    }
    
    // NAV
    document.getElementById('nav').textContent = etf.nav ? 
        formatNumber(etf.nav) : '-';
    
    // 전일대비
    const vsElement = document.getElementById('vs');
    vsElement.textContent = etf.vs ? etf.vs + '원' : '-';
    if (etf.vs) {
        applyPriceColor(vsElement, etf.vs);
    }
    
    // 시가총액
    document.getElementById('marketTotalAmt').textContent = etf.marketTotalAmt ? 
        formatNumber(etf.marketTotalAmt / 100000000) + '억원' : '-';
    
    // 순자산총액
    document.getElementById('netAssetTotalAmt').textContent = etf.netAssetTotalAmt ? 
        formatNumber(etf.netAssetTotalAmt / 100000000) + '억원' : '-';
}

// 기본 정보 업데이트
function updateBasicInfo(etf) {
    // 기준일자
    document.getElementById('baseDate').textContent = etf.baseDate || '2024-01-01';
    
    // 기초지수
    if (etf.baseIndexName) {
        document.getElementById('baseIndexName').textContent = etf.baseIndexName;
        showElement('baseIndexContainer');
    } else {
        hideElement('baseIndexContainer');
    }
    
    // 기초지수 종가
    if (etf.baseIndexClosePrice && etf.baseIndexClosePrice > 0) {
        document.getElementById('baseIndexClosePrice').textContent = formatNumber(etf.baseIndexClosePrice);
        showElement('baseIndexClosePriceContainer');
    } else {
        hideElement('baseIndexClosePriceContainer');
    }
    
    // 상장주식수
    if (etf.stLstgCnt && etf.stLstgCnt > 0) {
        document.getElementById('stLstgCnt').textContent = formatNumber(etf.stLstgCnt) + '주';
        showElement('stLstgCntContainer');
    } else {
        hideElement('stLstgCntContainer');
    }
}

// 거래 정보 업데이트
function updateTradeInfo(etf) {
    // 거래량
    document.getElementById('tradeVolume').textContent = etf.tradeVolume ? 
        formatNumber(etf.tradeVolume) : '-';
    
    // 거래대금
    document.getElementById('tradePrice').textContent = etf.tradePrice ? 
        formatNumber(etf.tradePrice / 100000000) : '-';
    
    // 시가
    document.getElementById('openPrice').textContent = etf.openPrice ? 
        formatNumber(etf.openPrice) : '-';
    
    // 고가
    document.getElementById('highPrice').textContent = etf.highPrice ? 
        formatNumber(etf.highPrice) : '-';
    
    // 저가
    document.getElementById('lowPrice').textContent = etf.lowPrice ? 
        formatNumber(etf.lowPrice) : '-';
    
    // 가격 상태
    const priceDirectionElement = document.getElementById('priceDirection');
    priceDirectionElement.textContent = etf.priceDirection || '보합';
    if (etf.fltRt) {
        applyPriceColor(priceDirectionElement, etf.fltRt);
    }
}

// 관련 ETF 버튼 업데이트
function updateRelatedEtfButtons(etf) {
    const sameCategoryBtn = document.getElementById('sameCategoryBtn');
    const sameIndexBtn = document.getElementById('sameIndexBtn');
    
    // 같은 카테고리 ETF 버튼
    if (etf.category) {
        sameCategoryBtn.innerHTML = `
            <a href="/search?keyword=${encodeURIComponent(etf.category)}" class="btn btn-outline-primary w-100">
                <i class="fas fa-tag me-2"></i>
                같은 카테고리 ETF
                <span class="badge bg-primary ms-2">${etf.category}</span>
            </a>
        `;
    } else {
        sameCategoryBtn.innerHTML = `
            <button class="btn btn-outline-secondary w-100" disabled>
                <i class="fas fa-tag me-2"></i>
                같은 카테고리 ETF
                <span class="badge bg-secondary ms-2">정보 없음</span>
            </button>
        `;
    }
    
    // 같은 지수 ETF 버튼
    if (etf.baseIndexName) {
        const indexKeyword = etf.baseIndexName.substring(0, 10); // 처음 10글자만
        sameIndexBtn.innerHTML = `
            <a href="/search?keyword=${encodeURIComponent(indexKeyword)}" class="btn btn-outline-success w-100">
                <i class="fas fa-chart-line me-2"></i>
                같은 지수 ETF
            </a>
        `;
    } else {
        sameIndexBtn.innerHTML = `
            <button class="btn btn-outline-secondary w-100" disabled>
                <i class="fas fa-chart-line me-2"></i>
                같은 지수 ETF
            </button>
        `;
    }
}

// UI 상태 관리 함수들
function showEtfDetailLoading() {
    showElement('etfDetailLoading');
    hideElement('etfDetailError');
    hideElement('etfDetailContent');
}

function hideEtfDetailLoading() {
    hideElement('etfDetailLoading');
}

function showEtfDetailError() {
    hideElement('etfDetailLoading');
    showElement('etfDetailError');
    hideElement('etfDetailContent');
}

function showEtfDetailContent() {
    hideElement('etfDetailLoading');
    hideElement('etfDetailError');
    showElement('etfDetailContent');
}

// 재시도 함수
function retryLoadEtfDetail() {
    if (currentEtfIsinCd) {
        loadEtfDetail(currentEtfIsinCd);
    }
}

// URL에서 ISIN 코드 추출
function getIsinFromUrl() {
    const pathParts = window.location.pathname.split('/');
    const etfIndex = pathParts.indexOf('etf');
    if (etfIndex !== -1 && pathParts[etfIndex + 1]) {
        return decodeURIComponent(pathParts[etfIndex + 1]);
    }
    return null;
}

// 페이지 로드 시 실행
document.addEventListener('DOMContentLoaded', function() {
    const isinCd = getIsinFromUrl();
    
    if (isinCd) {
        loadEtfDetail(isinCd);
    } else {
        showEtfDetailError();
        showToast('잘못된 ETF 코드입니다.', 'error');
    }
    
    console.log('ETF 상세정보 페이지 AJAX 초기화 완료');
});
