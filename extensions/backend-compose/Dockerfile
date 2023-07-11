# syntax=docker/dockerfile:1.4

FROM node:16.16-alpine AS development

# Set working directory
WORKDIR /usr/src/app

# Install dependencies based on the preferred package manager
COPY package.json yarn.lock* package-lock.json* pnpm-lock.yaml* ./
RUN \
    if [ -f yarn.lock ]; then yarn --frozen-lockfile; \
    elif [ -f package-lock.json ]; then npm ci; \
    elif [ -f pnpm-lock.yaml ]; then yarn global add pnpm && pnpm i; \
    # Allow install without lockfile, so example works even without Node.js installed locally
    else echo "Warning: Lockfile not found. It is recommended to commit lockfiles to version control." && yarn install; \
    fi


RUN npm cache clean --force

RUN npm install --frozen-lockfile

# Copy the rest of the files
COPY . .

CMD [ "npm", "run", "dev" ]

FROM node:16.16-alpine AS build

# Set working directory
WORKDIR /usr/src/app

# Install dependencies to use npm
COPY --chown=node:node package.json package-lock.json ./
COPY --chown=node:node --from=development /usr/src/app/node_modules node_modules

# Copy the rest of the files
COPY --chown=node:node . .

# Run the build command to build the app
RUN npm run build

# Set the NODE_ENV to production
ENV NODE_ENV=production

# Install production dependencies and clean up the cache
RUN npm ci

# Use the node user from the image as the user to run the app
USER node

FROM node:16.16-alpine AS production

# Set working directory
WORKDIR /usr/src/app

# Copy the bundled code from the build stage to the production image
COPY --chown=node:node --from=build /usr/src/app/dist dist
COPY --chown=node:node --from=build /usr/src/app/node_modules node_modules

# Use the node user from the image as the user to run the app
USER node

# Start the server using the production build
CMD [ "node", "dist/main.js" ]
