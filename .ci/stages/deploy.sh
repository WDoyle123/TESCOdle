#!/usr/bin/env bash
set -euo pipefail
source "$(dirname "$0")/../utils.sh"
kube_setup

ref="${IMAGE}:$(ci_build_tag)"
kubectl get "deployment/$DEPLOYMENT" --namespace="$K8S_NS" >/dev/null \
  || die "deployment/$DEPLOYMENT is missing: deploy tescodle-2.0 first"

log "rolling $DEPLOYMENT to $ref"
kubectl patch "deployment/$DEPLOYMENT" --namespace="$K8S_NS" --type=strategic -p "$(jq -cn --arg c "$CONTAINER" --arg i "$ref" \
  '{spec:{template:{spec:{imagePullSecrets:[{name:"regcred"}],containers:[{name:$c,image:$i}]}}}}')"
kube_rollout "$K8S_NS" "$DEPLOYMENT"
