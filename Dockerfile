# 4주차 — 멀티스테이지 빌드
# 빌드:  docker build -t word-app .
# 실행:  docker run --rm -p 8080:80 word-app          (단독: SPA 설정)
# compose 에서는 NGINX_CONF=nginx-proxy.conf 로 /api 프록시 설정을 넣습니다.

# ---- 1단계: builder — 여기서 빌드하고, 결과물(dist)만 남기고 버려집니다 ----
FROM node:20-alpine AS builder
WORKDIR /app

# 의존성 목록을 먼저 복사 → 소스만 바뀌면 npm ci 는 캐시(CACHED)로 건너뜀
COPY package.json package-lock.json ./
RUN npm ci
COPY . .

# VITE_* 는 빌드할 때 JS에 박히므로 반드시 "빌드 시점"에 넣어야 합니다 (-e 는 소용없음)
# 비워두면 상대경로 /api/... 로 요청 → nginx 프록시 뒤에서 CORS 없음
ARG VITE_API_URL=
ENV VITE_API_URL=$VITE_API_URL
RUN npm run build

# ---- 2단계: 실제 배포 이미지 — nginx + dist 만 (Node·node_modules·소스 없음) ----
FROM nginx:alpine
ARG NGINX_CONF=nginx-spa.conf
COPY --from=builder /app/dist/ /usr/share/nginx/html/
COPY ${NGINX_CONF} /etc/nginx/conf.d/default.conf
EXPOSE 80
