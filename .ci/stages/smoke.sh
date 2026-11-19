#!/usr/bin/env bash
set -euo pipefail
source "$(dirname "$0")/../utils.sh"
kube_setup

want="${IMAGE}:$(ci_build_tag)"
got="$(kubectl get "deployment/$DEPLOYMENT" --namespace="$K8S_NS" -o jsonpath="{.spec.template.spec.containers[?(@.name==\"$CONTAINER\")].image}")"
[[ "$got" == "$want" ]] || die "deployment runs $got, expected $want"

log "checking $PUBLIC_URL"
html="$(curl -fsS --retry 5 --retry-delay 3 --retry-all-errors "$PUBLIC_URL/?cb=$(date +%s)")" || die "$PUBLIC_URL is not serving"
grep -q 'legacy-score-import.js' <<<"$html" || die "score-import script is not injected"
curl -fsS -o /dev/null "$PUBLIC_URL/scripts/legacy-score-import.js" || die "score-import script is missing"
