# 나만의 단어장 — 배포

## 로컬 실행

```sh
docker compose up --build     # http://localhost:8080
docker compose down           # 정리
```

Node를 설치하거나 `npm run build` 를 직접 할 필요가 없습니다. 빌드는 컨테이너 안에서 일어납니다.

단독 실행(API 없이 화면만):

```sh
docker build -t word-app .
docker run --rm -p 8080:80 word-app
```

## 구조

```
브라우저 ──▶ web (nginx :80 → 내 컴퓨터 :8080)
              ├─ /        → dist/ 정적 파일 (SPA fallback)
              └─ /api/    → mini-api:3001 (리버스 프록시)
                             mini-api — 외부에 포트 미노출
```

- **web**: Vite 빌드 → nginx (멀티스테이지, 약 63MB)
- **mini-api**: Node 20 미니 API (포트 3001, `ports` 가 없어서 바깥에서 직접 접근 불가)

## 왜 이렇게 했나

- **멀티스테이지 빌드** — 1단계(`node:20-alpine`)에서 `npm ci && npm run build`, 2단계(`nginx:alpine`)에는 `dist/` 만 복사.
  누가 빌드해도 같은 결과가 나오고(“내 컴퓨터에선 되는데” 방지), 최종 이미지에 Node·node_modules·소스코드가 남지 않습니다.
- **package.json 먼저 COPY** — Docker 레이어 캐시 덕분에 소스만 고치면 `npm ci` 가 `CACHED` 로 건너뛰어집니다.
- **API 주소는 build arg 로 주입** — `VITE_*` 는 빌드 시점에 JS 코드에 박히기 때문에, `docker run -e` 로는 바뀌지 않습니다.
  환경마다 `docker build --build-arg VITE_API_URL=...` 로 이미지를 따로 만듭니다.
- **SPA fallback (`try_files ... /index.html`)** — `/about` 같은 클라이언트 라우트를 새로고침해도 404가 나지 않습니다.
- **`/api` 는 nginx 리버스 프록시** — 브라우저가 보는 출처가 `localhost:8080` 하나라서 CORS가 발생하지 않습니다.
- **mini-api 에 ports 없음** — 컨테이너끼리는 서비스 이름(`mini-api`)으로 통신하므로 외부에 열 필요가 없습니다. 입구는 nginx 하나.
- **healthcheck + `condition: service_healthy`** — API가 준비된 뒤에 nginx가 시작되어 `host not found in upstream` 에러를 막습니다.

## 이 프로젝트에 Next.js를 쓰지 않은 이유

이 앱은 CSR(Vite)입니다. `curl http://localhost:8080` 으로 받은 HTML에는 단어가 0개이고, 화면은 브라우저의 JS가 그립니다.

| 기준 | 이 앱 | 판단 |
|---|---|---|
| 검색 노출(SEO)이 중요한가 | 개인 단어장 — 검색될 필요 없음 | CSR 로 충분 |
| 첫 화면 속도 | 번들이 작음(gzip 수십 KB) | 문제 없음 |
| 운영 비용 | 정적 파일 + nginx 만 있으면 됨 | CSR 이 가장 저렴 |
| 서버 프로세스 | 필요 없음 (SSR은 Node 서버가 항상 떠 있어야 함) | CSR 이 단순 |

상품 페이지처럼 검색 노출과 첫 화면 속도가 중요해지면 Next.js(SSR/SSG)를 고려하겠습니다.
