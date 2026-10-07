# 수학경시 오답노트 PWA

## 포함 기능
- 수학경시 기출문제 풀이
- 객관식 답안 선택 및 정답 확인
- 오답 자동 저장
- 오답노트에서 다시 풀기
- 학습 통계/정답률
- localStorage 기반 학습 데이터 저장
- PWA 설치(홈 화면 추가)
- Service Worker 오프라인 캐시

## GitHub Pages 배포
1. 이 폴더 전체를 GitHub 저장소에 업로드합니다.
2. GitHub 저장소 → Settings → Pages
3. Source를 GitHub Actions 또는 Deploy from branch로 설정합니다.
4. branch 방식이면 `main` / `/ (root)`를 선택합니다.
5. HTTPS 주소로 접속하면 브라우저에서 설치할 수 있습니다.

## 주의
- 브라우저에서 `file://`로 index.html을 직접 열면 Service Worker가 작동하지 않습니다.
- GitHub Pages, Netlify, Vercel 등 HTTPS 웹서버에 올려야 PWA 설치/오프라인 캐시가 정상 작동합니다.
- 현재 `data/questions.json`에는 테스트용 샘플 문제가 들어 있습니다. 실제 경시대회 기출문제는 저작권 및 사용 허가를 확인한 뒤 추가하세요.
