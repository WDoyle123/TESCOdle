#!/usr/bin/env bash
source "$CI_LIB"
declare -F registry_login >/dev/null || die "this bash-ci worker has no registry_login: redeploy it"

readonly REGISTRY="registry.registry.svc.cluster.local:5000"
readonly IMAGE="${REGISTRY}/tescodle-legacy"
readonly K8S_NS="tescodle"
readonly DEPLOYMENT="tescodle-legacy"
readonly CONTAINER="legacy"
readonly PUBLIC_URL="https://legacy.tescodle.com"

ci_build_tag() { echo "ci-${CI_COMMIT_SHA:0:12}"; }
