#!/usr/bin/env bash
set -euo pipefail
source "$(dirname "$0")/../utils.sh"

registry_login "$REGISTRY" "$K8S_NS"
image_build_push "$IMAGE:$(ci_build_tag)" latest
