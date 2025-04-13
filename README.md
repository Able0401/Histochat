# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript and enable type-aware lint rules. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

# Histochat Comparison

이 프로젝트는 두 가지 버전의 Histochat (Baseline과 Advanced)을 한 화면에서 동시에 비교할 수 있는 애플리케이션입니다.

## 기능

- 두 개의 Histochat 인스턴스를 나란히 표시하여 비교 가능
- 왼쪽에는 Baseline Histochat, 오른쪽에는 Advanced Histochat 배치
- 각각 다른 대화 인물 설정 가능
- 독립적인 채팅 입력 및 대화 흐름

## 시작하기

1. 저장소 클론
   ```
   git clone https://github.com/yourusername/Histochat.git
   cd Histochat
   ```

2. 의존성 설치
   ```
   npm install
   ```

3. 환경 변수 설정
   ```
   cp .env.example .env
   ```
   `.env` 파일을 열고 필요한 API 키 설정

4. 개발 서버 실행
   ```
   npm run dev
   ```

5. 브라우저에서 `http://localhost:5173` 접속

## 사용 방법

1. 시작 화면에서 왼쪽 Histochat 대화 인물과 오른쪽 Histochat 대화 인물을 설정
2. 사용자 이름을 입력하고 '입장' 버튼 클릭
3. 두 개의 채팅창이 표시되며, 각각 독립적으로 대화 가능
4. 각 채팅창은 해당 버전의 Histochat 알고리즘을 사용

## 개발 정보

- React와 Vite를 사용하여 개발
- GPT-4o API를 활용한 대화 생성
- Firebase Firestore를 사용한 대화 데이터 관리
