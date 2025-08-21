# ETF Stock Platform - Frontend

ETF 정보 제공 및 알림 시스템 웹 프론트엔드

## 🎨 현재 구현 (Thymeleaf)

Spring Boot + Thymeleaf 기반 서버사이드 렌더링 웹 애플리케이션

### 📱 주요 페이지

- **메인 대시보드** (`/`): ETF 시장 현황 및 통계
- **ETF 검색** (`/search`): 종목명, 카테고리별 검색
- **ETF 상세** (`/etf/{종목코드}`): 상세 정보 + 알림 설정
- **관심종목** (`/watchlist`): 사용자별 관심종목 관리
- **알림 관리** (`/alerts`): 가격 알림 조회/관리
- **랭킹** (`/rankings`): 등락률, 거래량 순위

### 🔧 기술 스택

- **Template Engine**: Thymeleaf
- **CSS Framework**: Bootstrap 5
- **JavaScript**: jQuery + AJAX
- **Icons**: Font Awesome
- **Charts**: Chart.js (준비됨)

## 🚀 Next.js 마이그레이션 계획

### 📋 마이그레이션 우선순위

1. **1단계** (핵심 기능)
   - ETF 목록/검색 페이지
   - ETF 상세 페이지
   - 알림 설정 기능

2. **2단계** (관리 기능)
   - 관심종목 관리
   - 알림 내역 조회
   - 사용자 대시보드

3. **3단계** (고급 기능)
   - 실시간 알림 (WebSocket/SSE)
   - 차트 및 시각화
   - PWA + 푸시 알림

### 🛠 권장 기술 스택

```json
{
  "framework": "Next.js 14",
  "language": "TypeScript",
  "styling": "Tailwind CSS",
  "state": "Zustand",
  "api": "SWR/TanStack Query",
  "ui": "Radix UI + Shadcn/ui",
  "charts": "Recharts"
}
```

### 📡 API 연동

기존 백엔드 API를 그대로 활용:

```typescript
// API 클라이언트 예시
const api = {
  etf: {
    list: () => fetch('/api/etf').then(r => r.json()),
    detail: (isinCd: string) => fetch(`/api/etf/${isinCd}`).then(r => r.json())
  },
  alerts: {
    create: (condition: AlertCondition) => 
      fetch('/api/alerts/conditions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(condition)
      })
  }
};
```

## 📁 현재 파일 구조

```
frontend/
├── src/main/resources/
│   ├── templates/           # Thymeleaf 템플릿
│   │   ├── dashboard.html
│   │   ├── etf-detail.html
│   │   ├── search.html
│   │   └── ...
│   └── static/              # 정적 파일 (CSS, JS, 이미지)
└── README.md
```

## 🎯 Next.js 프로젝트 구조 (계획)

```
frontend/
├── src/
│   ├── app/                 # App Router
│   │   ├── page.tsx         # 메인 대시보드
│   │   ├── etf/
│   │   │   ├── page.tsx     # ETF 목록
│   │   │   └── [isinCd]/page.tsx  # ETF 상세
│   │   └── alerts/page.tsx  # 알림 관리
│   ├── components/          # 재사용 컴포넌트
│   ├── lib/                 # 유틸리티
│   └── types/               # TypeScript 타입
├── package.json
└── next.config.js
```

## 🚀 빠른 시작 (Next.js)

```bash
# Next.js 프로젝트 생성
npx create-next-app@latest etf-frontend --typescript --tailwind --app

# 의존성 설치
npm install zustand swr @radix-ui/react-dialog

# 개발 서버 시작
npm run dev
```

## 📱 주요 컴포넌트 (계획)

- `EtfCard`: ETF 정보 카드
- `AlertModal`: 알림 설정 모달  
- `PriceChart`: 가격 차트
- `AlertNotification`: 알림 표시
- `SearchFilter`: 검색 필터
