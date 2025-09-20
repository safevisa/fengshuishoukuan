# 使用官方Node.js运行时作为基础镜像
FROM node:18-alpine

# 安装pnpm
RUN npm install -g pnpm

WORKDIR /app

# 复制package文件
COPY package.json pnpm-lock.yaml ./

# 安装依赖
RUN pnpm install --frozen-lockfile

# 复制源代码
COPY . .

# 构建应用
RUN pnpm run build

# 创建上传目录
RUN mkdir -p uploads

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

# 启动应用
CMD ["pnpm", "start"]
