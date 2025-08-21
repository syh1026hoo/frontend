# ETF Stock Platform - Frontend

ETF 정보 제공 및 알림 시스템 웹 프론트엔드

## 🎨 현재 구현

**AJAX 기반 SPA (Single Page Application)** - Thymeleaf 서버사이드 렌더링에서 클라이언트사이드 렌더링으로 전환 완료

### 📱 주요 페이지

- **메인 대시보드** (`/`): ETF 시장 현황 및 통계 (실시간 차트 포함)
- **ETF 검색** (`/search`): 실시간 검색 및 필터링
- **ETF 상세** (`/etf/{종목코드}`): 상세 정보 및 관련 ETF 추천
- **테마별 ETF** (`/themes`): 카테고리별 ETF 분류
- **랭킹** (`/rankings`): 등락률, 거래량 순위
- **관심종목** (`/watchlist`): 사용자별 관심종목 관리
- **로그인** (`/login`): 사용자 인증

### 🔧 기술 스택

- **Frontend Architecture**: AJAX 기반 SPA
- **Template Base**: Thymeleaf (레이아웃 제공)
- **JavaScript**: Vanilla JS (ES6+) + AJAX
- **CSS Framework**: Bootstrap 5
- **Charts**: Chart.js
- **Icons**: Font Awesome
- **State Management**: SessionStorage, LocalStorage
- **API Communication**: Fetch API

### ⚡ 주요 기능

#### 1. 실시간 데이터 로딩
- 모든 페이지에서 AJAX를 통한 동적 데이터 로딩
- 로딩 상태 및 에러 처리
- 디바운스를 통한 검색 최적화

#### 2. 사용자 인터랙션
- 실시간 검색 (500ms 디바운스)
- 토스트 알림 시스템
- 반응형 UI/UX

#### 3. 상태 관리
- 세션 기반 인증 상태 관리
- 로컬/세션 스토리지 활용
- URL 파라미터 동기화

## 📁 현재 파일 구조

```
frontend/
├── src/main/resources/
│   ├── templates/           # Thymeleaf 템플릿 (레이아웃)
│   │   ├── layout.html      # 공통 레이아웃
│   │   ├── simple-dashboard.html
│   │   ├── etf-detail.html
│   │   ├── search.html
│   │   ├── themes.html
│   │   ├── theme-detail.html
│   │   ├── rankings.html
│   │   ├── watchlist.html
│   │   └── login.html
│   └── static/js/           # AJAX JavaScript 모듈
│       ├── common.js        # 공통 유틸리티
│       ├── dashboard.js     # 대시보드 로직
│       ├── search.js        # 검색 기능
│       ├── etf-detail.js    # ETF 상세정보
│       ├── themes.js        # 테마별 ETF
│       ├── theme-detail.js  # 테마 상세
│       ├── rankings.js      # 랭킹 페이지
│       ├── watchlist.js     # 관심종목
│       └── login.js         # 로그인
├── package.json
└── README.md
```

## 🔄 아키텍처 개요

### AJAX 기반 하이브리드 아키텍처

1. **서버사이드**: Thymeleaf가 기본 HTML 구조와 레이아웃 제공
2. **클라이언트사이드**: JavaScript가 동적 콘텐츠 로딩 및 상호작용 처리
3. **API 통신**: RESTful API를 통한 JSON 데이터 교환

### 📡 API 엔드포인트

```javascript
// 주요 API 엔드포인트
const API_ENDPOINTS = {
  dashboard: '/api/dashboard',
  search: '/api/search?keyword={keyword}',
  etfDetail: '/api/etf/{isinCd}',
  themes: '/api/themes',
  themeDetail: '/api/themes/{themeId}',
  rankings: '/api/rankings?type={type}',
  watchlist: '/api/watchlist',
  login: '/api/auth/login'
};
```

## 🚀 빠른 시작

### 개발 환경 설정

```bash
# 프로젝트 클론
git clone [repository-url]
cd etfstock/frontend

# 의존성 설치 (Node.js 환경인 경우)
npm install

# 개발 서버 시작 (백엔드와 함께)
# Spring Boot 애플리케이션 실행 필요
```

### 주요 스크립트

```bash
# 개발 모드 실행
npm run dev

# 프로덕션 빌드
npm run build

# 린트 검사
npm run lint

# 타입 체크
npm run type-check
```

## 📱 JavaScript 모듈 구조

### common.js - 공통 유틸리티
```javascript
// 숫자 포맷팅, API 요청, 토스트 알림, 스토리지 관리
- formatNumber()
- apiRequest()
- showToast()
- Storage, SessionStorage
- debounce(), throttle()
```

### dashboard.js - 대시보드
```javascript
// 시장 현황, 차트, 랭킹 데이터 로딩
- loadDashboardData()
- updateMarketStats()
- updateChart()
```

### search.js - 검색 기능
```javascript
// 실시간 검색, 결과 표시
- performSearch()
- displaySearchResults()
- 디바운스 적용 (500ms)
```

### etf-detail.js - ETF 상세
```javascript
// ETF 상세정보, 관련 ETF 추천
- loadEtfDetail()
- displayEtfDetail()
- updateRelatedEtfButtons()
```

## 🎯 개발 방향성

### 완료된 마이그레이션
✅ Thymeleaf SSR → AJAX SPA 전환  
✅ 모듈화된 JavaScript 구조  
✅ 실시간 데이터 로딩  
✅ 사용자 인터랙션 개선  
✅ 상태 관리 시스템  

### 향후 개선 계획
🔄 TypeScript 도입  
🔄 Webpack/Vite 빌드 시스템  
🔄 컴포넌트 기반 구조  
🔄 테스팅 프레임워크  
🔄 PWA 기능

## 🛠️ 개발 가이드

### 새로운 페이지 추가 방법

1. **Thymeleaf 템플릿 생성**
   ```html
   <!-- src/main/resources/templates/new-page.html -->
   <!DOCTYPE html>
   <html lang="ko" xmlns:th="http://www.thymeleaf.org"
         th:replace="~{layout :: layout(~{::title}, ~{::main})}">
   <head>
       <title>새 페이지</title>
   </head>
   <body>
       <main>
           <!-- 페이지 콘텐츠 -->
           <div id="pageContent">
               <div id="loadingState">로딩 중...</div>
               <div id="contentArea" style="display: none;">
                   <!-- 동적 콘텐츠가 여기에 표시됩니다 -->
               </div>
           </div>
       </main>
       <script src="/js/new-page.js"></script>
   </body>
   </html>
   ```

2. **JavaScript 모듈 생성**
   ```javascript
   // src/main/resources/static/js/new-page.js
   
   // 페이지 데이터 로드
   async function loadPageData() {
       try {
           showElement('loadingState');
           hideElement('contentArea');
           
           const response = await apiRequest('/api/new-page');
           
           if (response.success) {
               displayPageContent(response.data);
               showElement('contentArea');
           } else {
               showToast('데이터 로드 실패', 'error');
           }
       } catch (error) {
           console.error('페이지 로드 실패:', error);
           showToast('오류가 발생했습니다', 'error');
       } finally {
           hideElement('loadingState');
       }
   }
   
   // 페이지 콘텐츠 표시
   function displayPageContent(data) {
       // DOM 업데이트 로직
   }
   
   // 페이지 로드 시 실행
   document.addEventListener('DOMContentLoaded', function() {
       loadPageData();
   });
   ```

### 공통 패턴

#### 1. API 호출 패턴
```javascript
// 표준 API 호출 방식
async function callAPI(endpoint, options = {}) {
    try {
        const response = await apiRequest(endpoint, options);
        if (response.success) {
            return response.data;
        } else {
            throw new Error(response.message);
        }
    } catch (error) {
        console.error('API 호출 실패:', error);
        showToast('요청 처리 중 오류가 발생했습니다', 'error');
        throw error;
    }
}
```

#### 2. 로딩 상태 관리
```javascript
// 로딩 상태 표시 패턴
function showLoading(containerId) {
    showElement(containerId + 'Loading');
    hideElement(containerId + 'Content');
    hideElement(containerId + 'Error');
}

function showContent(containerId) {
    hideElement(containerId + 'Loading');
    showElement(containerId + 'Content');
    hideElement(containerId + 'Error');
}

function showError(containerId) {
    hideElement(containerId + 'Loading');
    hideElement(containerId + 'Content');
    showElement(containerId + 'Error');
}
```

#### 3. 이벤트 처리
```javascript
// 디바운스된 검색 예시
const debouncedSearch = debounce(function(keyword) {
    if (keyword.length >= 2) {
        performSearch(keyword);
    }
}, 500);

document.getElementById('searchInput').addEventListener('input', function() {
    debouncedSearch(this.value.trim());
});
```

## 📊 성능 최적화

### 구현된 최적화 기법

1. **디바운스**: 검색 입력 최적화 (500ms)
2. **로딩 상태**: 사용자 경험 개선
3. **에러 처리**: 견고한 에러 핸들링
4. **스토리지 활용**: 세션/로컬 스토리지 최적화
5. **모듈화**: 코드 분리 및 재사용성

### 권장 사항

- API 응답 시간이 긴 경우 스켈레톤 UI 적용
- 이미지 지연 로딩 구현
- 브라우저 캐싱 활용
- 중복 API 호출 방지

## 🔒 보안 고려사항

- XSS 방지: 사용자 입력 검증 및 이스케이프
- CSRF 토큰 사용
- API 엔드포인트 인증/인가
- 민감 정보 로컬 스토리지 저장 금지
