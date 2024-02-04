# config 
ARG IDIR
# development|production
ARG BMODE=development

# 01a - base image
FROM node:18-alpine AS base
ARG IDIR
# set PNPM_HOME and PATH for root user so corepack can be used
ENV PNPM_HOME="/pnpm" PATH="/pnpm:$PATH" TZ="Europe/Rome"
RUN apk add --no-cache tzdata sudo shadow git && \
    corepack enable && \
    pnpm install -g pm2 && \
    # cosi da far si che l'utente node del container abbia lo stesso id dell'utente bruni 
    # per il debug quando montiamo il filesystem del container con quello dell'host
    usermod -u 1001 node && groupmod -g 1001 node && \
    # per far si che node possa usare sudo senza password
    echo '%node ALL=(ALL) NOPASSWD: ALL' > /etc/sudoers.d/node
# from now on we will use the user node
USER node
# update PNPM_HOME for node user (store default in ${PNPM_HOME}/store)
ENV PNPM_HOME="/home/node/pnpm" 
# add node_modules executables to PATH
ENV PATH="/ws/${IDIR}/node_modules/.bin:$PNPM_HOME:$PATH"

# 02a - Install dependencies only when package.json changes
FROM base AS deps
ARG IDIR
ARG BMODE
ENV NODE_ENV=${BMODE}
WORKDIR /ws/${IDIR}
# Install dependencies based on the preferred package manager
COPY package.json ./
# comment --frozen-lockfile for first time
RUN --mount=type=cache,id=pnpm,target=/home/node/pnpm/store pnpm install --frozen-lockfile

# 03a - Rebuild the source code only when needed
FROM base AS builder
ARG IDIR
WORKDIR /ws/${IDIR}
COPY * .
COPY --from=deps ws/${IDIR}/node_modules ./node_modules
#RUN pnpm run build

# 04a - Production image, copy all the files and run next
FROM base AS runner
ARG IDIR
ARG BMODE
ENV NODE_ENV=${BMODE}
WORKDIR /ws/${IDIR}

LABEL org.opencontainers.image.authors="Bruni Emiliano <info@ebruni.it>"
LABEL org.opencontainers.image.version=1.0

COPY --from=builder ws/${IDIR}/. .
# comment this for first run
COPY --from=builder ws/${IDIR}/node_modules ./node_modules

CMD [""]
