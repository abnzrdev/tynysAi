#!/usr/bin/env bash
# ============================================================
#  start-cc.sh
#  Pre-flight check + launch Claude Code
# ============================================================

RED='\033[0;31m'; GREEN='\033[0;32m'
YELLOW='\033[1;33m'; BOLD='\033[1m'; NC='\033[0m'

ok()   { echo -e "${GREEN}[✓]${NC} $*"; }
fail() { echo -e "${RED}[✗]${NC} $*"; }
warn() { echo -e "${YELLOW}[!]${NC} $*"; }
step() { echo -e "\n${BOLD}$*${NC}"; }

OLLAMA_HOST="http://localhost:11434"
MODEL="qwen3-coder"
NVM_DIR="${HOME}/.nvm"

# ---- Step 1: Load nvm + bashrc -----------------------------
step "1. Loading environment..."
[ -s "${NVM_DIR}/nvm.sh" ] && \. "${NVM_DIR}/nvm.sh"
source "${HOME}/.bashrc" 2>/dev/null || true

# ---- Step 2: Check + fix env vars -------------------------
step "2. Checking environment variables..."

fix_env() {
    local key="$1" val="$2"
    if [[ -z "${!key:-}" ]]; then
        warn "${key} not set — fixing now"
        export "${key}=${val}"
        # Persist it
        sed -i "/^export ${key}=/d" ~/.bashrc
        echo "export ${key}=${val}" >> ~/.bashrc
        ok "${key} set to: ${val}"
    else
        ok "${key} = ${!key}"
    fi
}

fix_env "ANTHROPIC_BASE_URL"   "http://localhost:11434"
fix_env "ANTHROPIC_API_KEY"    "ollama"
fix_env "ANTHROPIC_AUTH_TOKEN" "ollama"
fix_env "OLLAMA_API_BASE"      "http://localhost:11434"

# ---- Step 3: Check Ollama API reachable --------------------
step "3. Checking Ollama API..."

if curl -sf "${OLLAMA_HOST}/api/tags" &>/dev/null; then
    ok "Ollama API is running at ${OLLAMA_HOST}"
else
    fail "Ollama API not reachable at ${OLLAMA_HOST}"
    echo ""
    echo "  Possible fixes:"
    echo "  a) Ollama may not be running — ask your admin to start it"
    echo "  b) Try: curl -v ${OLLAMA_HOST}/api/tags"
    echo "  c) Check if port changed: ss -tlnp | grep 11434"
    exit 1
fi

# ---- Step 4: Check model is available ----------------------
step "4. Checking model: ${MODEL}..."

MODEL_EXISTS=$(curl -sf "${OLLAMA_HOST}/api/tags" | \
    python3 -c "import sys,json; models=[m['name'] for m in json.load(sys.stdin).get('models',[])]; print('yes' if any('${MODEL}' in m for m in models) else 'no')" 2>/dev/null)

if [[ "$MODEL_EXISTS" == "yes" ]]; then
    ok "Model ${MODEL} is ready"
else
    warn "Model ${MODEL} not found — pulling now..."
    curl -s -X POST "${OLLAMA_HOST}/api/pull" \
        -H "Content-Type: application/json" \
        -d "{\"model\": \"${MODEL}\"}" | \
        python3 -c "
import sys, json
for line in sys.stdin:
    try:
        d = json.loads(line.strip())
        s = d.get('status','')
        t = d.get('total',0)
        c = d.get('completed',0)
        print(f'\r  {s}: {int(c/t*100)}%' if t>0 else f'  {s}', end='', flush=True)
    except: pass
print()
"
    ok "Model pulled"
fi

# ---- Step 5: Check claude command --------------------------
step "5. Checking claude command..."

if command -v claude &>/dev/null; then
    ok "claude found: $(claude --version 2>/dev/null | head -1)"
else
    fail "claude command not found"
    echo ""
    echo "  Fix: npm install -g @anthropic-ai/claude-code"
    echo "  Then: source ~/.bashrc"
    exit 1
fi

# ---- All good — launch ------------------------------------
echo ""
echo -e "${GREEN}${BOLD}All checks passed! Starting Claude Code...${NC}"
echo -e "  Model:   ${MODEL}"
echo -e "  Ollama:  ${OLLAMA_HOST}"
echo ""

claude --model "$MODEL"
