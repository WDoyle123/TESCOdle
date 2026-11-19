#!/usr/bin/env bash
ci_stage test    ./stages/test.sh
ci_stage build   ./stages/build.sh   --needs test   --timeout 600
ci_stage deploy  ./stages/deploy.sh  --needs build  --timeout 300
ci_stage smoke   ./stages/smoke.sh   --needs deploy --timeout 120
