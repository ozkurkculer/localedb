#!/usr/bin/env bash
# Smoke test of a deployed Worker (CI: .github/workflows/deploy-cloudflare.yml; also after a manual deploy).
#
#   scripts/cloudflare-smoke.sh https://localedb.boraa-durna.workers.dev [BUILD_ID]
#
# With BUILD_ID (the deployed `.next/BUILD_ID`), first waits until the Worker serves that build on
# several consecutive requests: right after a deploy some requests still reach the previous version
# for a few minutes. Then checks a handful of URLs (status, Location, x-opennext-cache, noindex) and
# one /api/export request. Prints a Markdown table; exits 1 if any check fails.
set -uo pipefail

BASE="${1:?usage: cloudflare-smoke.sh BASE_URL [BUILD_ID]}"
BASE="${BASE%/}"
BUILD_ID="${2:-}"
WAIT_SECONDS="${SMOKE_WAIT_SECONDS:-480}"
STABLE_HITS=3
POLL=20

failed=0
rows=()

if [[ -n "$BUILD_ID" ]]; then
    start=$SECONDS
    hits=0
    while (( hits < STABLE_HITS )); do
        if curl -sf --max-time 30 "$BASE/about" | grep -qF "$BUILD_ID"; then
            hits=$((hits + 1))
        else
            hits=0
        fi
        if (( SECONDS - start > WAIT_SECONDS )); then
            echo "Build $BUILD_ID not served after ${WAIT_SECONDS}s" >&2
            rows+=("| \`/about\` | build \`$BUILD_ID\` served | not after ${WAIT_SECONDS}s | ❌ |")
            failed=1
            break
        fi
        (( hits < STABLE_HITS )) && sleep "$POLL"
    done
    (( failed == 0 )) && rows+=("| \`/about\` | build \`$BUILD_ID\` served | after $((SECONDS - start))s | ✅ |")
fi

# check PATH EXPECTED_STATUS [HEADER=VALUE] — HEADER is matched case-insensitively, VALUE as a substring.
check() {
    local path="$1" want="$2" header="${3:-}"
    local headers status got ok=1
    headers=$(curl -s --max-time 60 -o /dev/null -D - "$BASE$path" | tr -d '\r')
    status=$(awk 'NR == 1 { print $2 }' <<<"$headers")
    got="$status"
    [[ "$status" == "$want" ]] || ok=0
    if [[ -n "$header" ]]; then
        local name="${header%%=*}" value="${header#*=}" actual
        actual=$(awk -v h="$(tr '[:upper:]' '[:lower:]' <<<"$name")" -F': ' 'tolower($1) == h { print $2; exit }' <<<"$headers")
        got="$got, $name: ${actual:-—}"
        [[ "$actual" == *"$value"* ]] || ok=0
    fi
    record "\`$path\`" "$want${header:+, $header}" "$got" "$ok"
}

record() {
    local mark="✅"
    (( $4 )) || { mark="❌"; failed=1; }
    rows+=("| $1 | $2 | $3 | $mark |")
}

check / 200
check /ar 200
check /tr/countries/TR 200 x-opennext-cache=HIT
check /countries/US 200 x-opennext-cache=HIT
check /regions/north-america 200 x-opennext-cache=HIT
check /api 307 location=/docs
check /nope-smoke 404
check /_data/countries/US.json 200 x-robots-tag=noindex

export_body=$(mktemp)
export_status=$(curl -s --max-time 60 -o "$export_body" -w '%{http_code} %{content_type}' -X POST \
    -H 'content-type: application/json' \
    --data '{"dataset":"countries","entities":["US","TR"],"fields":["currency"],"format":"csv"}' \
    "$BASE/api/export")
ok=0
[[ "$export_status" == "200 text/csv"* ]] && grep -q '^USD,840,' "$export_body" && grep -q '^TRY,949,' "$export_body" && ok=1
# shellcheck disable=SC2016 # backticks are Markdown
record '`POST /api/export` (csv, US+TR)' '200 text/csv, USD + TRY rows' "$export_status, $(grep -c "" "$export_body") lines" "$ok"
rm -f "$export_body"

echo "| URL | Expected | Got | |"
echo "|---|---|---|---|"
printf '%s\n' "${rows[@]}"
exit "$failed"
