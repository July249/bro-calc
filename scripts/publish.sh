#!/bin/bash

# 현재 버전 가져오기
current_version=$(node -p "require('./package.json').version")

# 버전 업데이트 타입 (patch, minor, major)
update_type=${1:-patch}

# 새 버전 계산
new_version=$(npm version $update_type --no-git-tag-version)

echo "🚀 버전 업데이트: $current_version -> $new_version"

# 빌드
echo "📦 빌드 중..."
npm run build

# 변경사항 커밋
git add .
git commit -m "chore: bump version to $new_version"

# 태그 생성
git tag "v$new_version"

# npm 배포
echo "📤 npm 배포 중..."
npm publish

# 변경사항 푸시
echo "📤 git 푸시 중..."
git push origin main
git push origin "v$new_version"

echo "✅ 배포 완료! 버전: $new_version" 