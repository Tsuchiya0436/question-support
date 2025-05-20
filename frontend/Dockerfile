# ベースイメージは node:18 の slim 版で十分
FROM node:18-slim

# 非 root ユーザーを用意
RUN useradd -m appuser
USER appuser

WORKDIR /app

# 依存解決に必要なのは package.json と lock のみ
COPY --chown=appuser:appuser package*.json ./
RUN npm ci --ignore-scripts   # クリーン＆再現性重視

# 以降のソースはボリュームで上書きされるため COPY 不要
EXPOSE 3000
CMD ["npm", "start"]
